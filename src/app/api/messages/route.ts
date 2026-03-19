import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const postSchema = z.object({
  content:     z.string().min(1).max(4000),
  workspaceId: z.string().cuid(),
  replyToId:   z.string().cuid().optional(),
});

// GET /api/messages?workspaceId=xxx&cursor=xxx&limit=50
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const cursor      = searchParams.get("cursor");
  const limit       = Math.min(Number(searchParams.get("limit") ?? "50"), 100);

  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  // Verify membership
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where:   { workspaceId, deleted: false },
    include: { user: { select: { id: true, name: true, image: true, color: true } } },
    orderBy: { createdAt: "desc" },
    take:    limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  // Return oldest-first for display
  return NextResponse.json({ messages: messages.reverse(), nextCursor: messages[0]?.id ?? null });
}

// POST /api/messages
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { content, workspaceId, replyToId } = parsed.data;

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data:    { content, workspaceId, userId: session.user.id, replyToId },
      include: { user: { select: { id: true, name: true, image: true, color: true } } },
    }),
    prisma.activity.create({
      data: { workspaceId, userId: session.user.id, type: "MESSAGE_SENT" },
    }),
  ]);

  return NextResponse.json(message, { status: 201 });
}
