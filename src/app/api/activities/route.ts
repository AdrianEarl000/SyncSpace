import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const limit       = Math.min(Number(searchParams.get("limit") ?? "50"), 100);

  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const activities = await prisma.activity.findMany({
    where:   { workspaceId },
    include: { user: { select: { id: true, name: true, image: true, color: true } } },
    orderBy: { createdAt: "desc" },
    take:    limit,
  });

  return NextResponse.json(activities);
}
