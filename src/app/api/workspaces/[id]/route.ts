import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ✅ 1. Update the interface to expect a Promise
interface Params { params: Promise<{ id: string }> }

const updateSchema = z.object({
  name:        z.string().min(1).max(60).optional(),
  description: z.string().max(300).optional(),
  color:       z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon:        z.string().max(4).optional(),
});

// GET /api/workspaces/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  // ✅ 2. Await the params before using them
  const { id } = await params;
  
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: id, // 👈 Updated here
      members: { some: { userId: session.user.id } },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true, color: true } } },
      },
      _count: { select: { messages: true, members: true } },
    },
  });

  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(workspace);
}

// PATCH /api/workspaces/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  // ✅ 3. Await the params
  const { id } = await params;
  
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only owner/admin can update
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: id, userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } }, // 👈 Updated here
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const workspace = await prisma.workspace.update({
    where: { id: id }, // 👈 Updated here
    data: { ...parsed.data, updatedAt: new Date() },
  });

  return NextResponse.json(workspace);
}

// DELETE /api/workspaces/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  // ✅ 4. Await the params
  const { id } = await params;
  
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: id, userId: session.user.id, role: "OWNER" }, // 👈 Updated here
  });
  if (!member) return NextResponse.json({ error: "Only owner can delete" }, { status: 403 });

  await prisma.workspace.delete({ where: { id: id } }); // 👈 Updated here
  return NextResponse.json({ ok: true });
}
