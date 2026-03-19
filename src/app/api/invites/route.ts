import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inviteSchema = z.object({
  email:       z.string().email(),
  workspaceId: z.string().cuid(),
});

// POST /api/invites — send invite
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { email, workspaceId } = parsed.data;

  // Must be owner or admin
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Check if user already a member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const alreadyMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: existingUser.id } },
    });
    if (alreadyMember) return NextResponse.json({ error: "User is already a member" }, { status: 409 });
  }

  // Create or refresh invite
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.workspaceInvite.upsert({
    where:  { token: (await prisma.workspaceInvite.findFirst({ where: { workspaceId, email } }))?.token ?? "none" },
    update: { token: crypto.randomUUID(), expiresAt, status: "PENDING" },
    create: { workspaceId, invitedBy: session.user.id, email, expiresAt },
  });

  await prisma.activity.create({
    data: { workspaceId, userId: session.user.id, type: "MEMBER_INVITED", metadata: { email } },
  });

  // In production: send email with invite link
  // await sendInviteEmail({ to: email, token: invite.token, workspaceName: workspace.name });

  return NextResponse.json({ token: invite.token, inviteUrl: `/invite/${invite.token}` }, { status: 201 });
}

// GET /api/invites?token=xxx — accept invite
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: { select: { id: true, name: true, slug: true, color: true } } },
  });

  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired invite" }, { status: 410 });
  }

  // Add to workspace
  await prisma.$transaction([
    prisma.workspaceMember.upsert({
      where:  { workspaceId_userId: { workspaceId: invite.workspaceId, userId: session.user.id } },
      create: { workspaceId: invite.workspaceId, userId: session.user.id, role: "MEMBER" },
      update: {},
    }),
    prisma.workspaceInvite.update({ where: { token }, data: { status: "ACCEPTED" } }),
    prisma.activity.create({
      data: { workspaceId: invite.workspaceId, userId: session.user.id, type: "USER_JOINED" },
    }),
  ]);

  return NextResponse.json({ workspace: invite.workspace });
}
