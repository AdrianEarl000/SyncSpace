/**
 * SyncSpace — Custom HTTP Server
 * Combines Next.js with Socket.IO for real-time features.
 * Run with: node server.js (dev) or NODE_ENV=production node server.js (prod)
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ─── In-memory presence state ─────────────────────────────────────────────────
// workspaceId → Map<socketId, UserPresence>
const presenceMap = new Map();

// workspaceId → Map<userId, timeoutId>  (auto-clear typing)
const typingMap = new Map();

function getWorkspaceUsers(workspaceId) {
  return Array.from(presenceMap.get(workspaceId)?.values() || []);
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Server error:", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // ─── Socket.IO setup ──────────────────────────────────────────────────────
  const io = new Server(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ── Join workspace ────────────────────────────────────────────────────
    socket.on("workspace:join", ({ workspaceId, user }) => {
      socket.join(`ws:${workspaceId}`);
      socket.data = { workspaceId, user };

      if (!presenceMap.has(workspaceId)) {
        presenceMap.set(workspaceId, new Map());
      }

      presenceMap.get(workspaceId).set(socket.id, {
        socketId: socket.id,
        userId: user.id,
        name: user.name,
        image: user.image,
        color: user.color,
        joinedAt: Date.now(),
      });

      // Broadcast updated presence list
      io.to(`ws:${workspaceId}`).emit("presence:sync", getWorkspaceUsers(workspaceId));

      // Notify others
      socket.to(`ws:${workspaceId}`).emit("presence:joined", { user });

      console.log(`[Socket] ${user.name} joined workspace ${workspaceId}`);
    });

    // ── Leave workspace ───────────────────────────────────────────────────
    socket.on("workspace:leave", ({ workspaceId }) => {
      cleanupSocket(socket, workspaceId, io);
    });

    // ── Chat: send message ────────────────────────────────────────────────
    socket.on("chat:message", (message) => {
      const { workspaceId } = socket.data;
      if (!workspaceId) return;
      // Broadcast to everyone including sender (optimistic ack)
      io.to(`ws:${workspaceId}`).emit("chat:message", {
        ...message,
        _ts: Date.now(),
      });
    });

    // ── Chat: typing ──────────────────────────────────────────────────────
    socket.on("chat:typing:start", ({ workspaceId, user }) => {
      socket.to(`ws:${workspaceId}`).emit("chat:typing", {
        userId: user.id,
        name: user.name,
        isTyping: true,
      });

      // Auto-stop typing after 3 seconds
      const key = `${workspaceId}:${user.id}`;
      clearTimeout(typingMap.get(key));
      typingMap.set(
        key,
        setTimeout(() => {
          socket.to(`ws:${workspaceId}`).emit("chat:typing", {
            userId: user.id,
            name: user.name,
            isTyping: false,
          });
          typingMap.delete(key);
        }, 3000)
      );
    });

    socket.on("chat:typing:stop", ({ workspaceId, user }) => {
      socket.to(`ws:${workspaceId}`).emit("chat:typing", {
        userId: user.id,
        name: user.name,
        isTyping: false,
      });
      const key = `${workspaceId}:${user.id}`;
      clearTimeout(typingMap.get(key));
      typingMap.delete(key);
    });

    // ── Cursors ───────────────────────────────────────────────────────────
    socket.on("cursor:move", ({ workspaceId, x, y }) => {
      const { user } = socket.data;
      if (!user) return;
      socket.to(`ws:${workspaceId}`).emit("cursor:update", {
        userId: user.id,
        name: user.name,
        color: user.color,
        x,
        y,
      });
    });

    socket.on("cursor:leave", ({ workspaceId }) => {
      const { user } = socket.data;
      if (!user) return;
      socket.to(`ws:${workspaceId}`).emit("cursor:remove", { userId: user.id });
    });

    // ── Whiteboard ────────────────────────────────────────────────────────
    socket.on("wb:stroke:begin", ({ workspaceId, stroke }) => {
      socket.to(`ws:${workspaceId}`).emit("wb:stroke:begin", stroke);
    });

    socket.on("wb:stroke:point", ({ workspaceId, strokeId, point }) => {
      socket.to(`ws:${workspaceId}`).emit("wb:stroke:point", { strokeId, point });
    });

    socket.on("wb:stroke:end", ({ workspaceId, strokeId }) => {
      socket.to(`ws:${workspaceId}`).emit("wb:stroke:end", { strokeId });
    });

    socket.on("wb:stroke:undo", ({ workspaceId, strokeId }) => {
      io.to(`ws:${workspaceId}`).emit("wb:stroke:undo", { strokeId });
    });

    socket.on("wb:clear", ({ workspaceId }) => {
      io.to(`ws:${workspaceId}`).emit("wb:clear");
    });

    // ── Activity feed ─────────────────────────────────────────────────────
    socket.on("activity:push", ({ workspaceId, activity }) => {
      socket.to(`ws:${workspaceId}`).emit("activity:new", activity);
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const { workspaceId } = socket.data || {};
      if (workspaceId) cleanupSocket(socket, workspaceId, io);
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  function cleanupSocket(socket, workspaceId, io) {
    socket.leave(`ws:${workspaceId}`);
    const wsMap = presenceMap.get(workspaceId);
    if (wsMap) {
      wsMap.delete(socket.id);
      if (wsMap.size === 0) presenceMap.delete(workspaceId);
      io.to(`ws:${workspaceId}`).emit("presence:sync", getWorkspaceUsers(workspaceId));
    }
    const { user } = socket.data || {};
    if (user) {
      socket.to(`ws:${workspaceId}`).emit("presence:left", { user });
      socket.to(`ws:${workspaceId}`).emit("cursor:remove", { userId: user.id });
    }
  }

  httpServer.listen(port, () => {
    console.log(`\n🚀 SyncSpace running → http://${hostname}:${port}\n`);
  });
});
