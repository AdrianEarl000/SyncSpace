import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  name:        z.string().min(1).max(60),
  description: z.string().max(300).optional(),
  color:       z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon:        z.string().max(4).optional(),
  isPublic:    z.boolean().optional(),
});

// GET /api/workspaces — list current user's workspaces
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, image: true, color: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { messages: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(workspaces);
}

// POST /api/workspaces — create workspace
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, description, color = "#6366F1", icon, isPublic = false } = parsed.data;
  const slug = slugify(name);

  const workspace = await prisma.workspace.create({
    data: {
      name, slug, description, color, icon, isPublic,
      createdBy: session.user.id,
      members: {
        create: { userId: session.user.id, role: "OWNER" },
      },
      activities: {
        create: { userId: session.user.id, type: "WORKSPACE_CREATED" },
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, image: true, color: true } },
        },
      },
      _count: { select: { messages: true, members: true } },
    },
  });

  return NextResponse.json(workspace, { status: 201 });
}
