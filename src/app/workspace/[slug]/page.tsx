import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const workspace = await prisma.workspace.findUnique({ where: { slug: params.slug }, select: { name: true } });
  return { title: workspace?.name ?? "Workspace" };
}

export default async function WorkspacePage({ params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/auth/login?callbackUrl=/workspace/${params.slug}`);

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.slug },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true, color: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!workspace) notFound();

  const isMember = workspace.members.some((m) => m.userId === session.user.id);
  if (!isMember) redirect("/dashboard");

  // Fetch or create the primary whiteboard session
  let wbSession = await prisma.whiteboardSession.findFirst({
    where: { workspaceId: workspace.id },
    include: { strokes: { orderBy: { createdAt: "asc" } } },
  });
  if (!wbSession) {
    wbSession = await prisma.whiteboardSession.create({
      data: { workspaceId: workspace.id, name: `${workspace.name} Board` },
      include: { strokes: true },
    });
  }

  const [messages, activities] = await Promise.all([
    prisma.message.findMany({
      where:   { workspaceId: workspace.id, deleted: false },
      include: { user: { select: { id: true, name: true, image: true, color: true } } },
      orderBy: { createdAt: "asc" },
      take:    100,
    }),
    prisma.activity.findMany({
      where:   { workspaceId: workspace.id },
      include: { user: { select: { id: true, name: true, image: true, color: true } } },
      orderBy: { createdAt: "desc" },
      take:    50,
    }),
  ]);

  return (
    <WorkspaceShell
      workspace={{ ...workspace, createdAt: workspace.createdAt.toISOString(), updatedAt: workspace.updatedAt.toISOString() }}
      currentUser={{
        id:    session.user.id,
        name:  session.user.name  ?? null,
        image: session.user.image ?? null,
        email: session.user.email ?? null,
        color: session.user.color ?? "#6366F1",
      }}
      initialMessages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString(), editedAt: m.editedAt?.toISOString() ?? null }))}
      initialActivities={activities.map((a) => ({ ...a, createdAt: a.createdAt.toISOString(), metadata: a.metadata as Record<string, unknown> | null }))}
      wbSession={{
        id:      wbSession.id,
        name:    wbSession.name,
        strokes: wbSession.strokes.map((s) => ({
          id:     s.id,
          userId: s.userId,
          data:   s.data,
        })),
      }}
    />
  );
}
