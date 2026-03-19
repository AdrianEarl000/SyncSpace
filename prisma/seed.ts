import { PrismaClient, ActivityType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create or find your user account
  const adrian = await prisma.user.upsert({
    where: { email: "adrianearl3@gmail.com" },
    update: {},
    create: {
      email: "adrianearl3@gmail.com",
      name: "Adrian earl abade",
    },
  });

  // 2. Create a test workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "FlowBoard Dev Workspace",
      slug: "flowboard-dev",
      createdBy: adrian.id, 
    },
  });

  // 3. Link you to the workspace
  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: adrian.id,
    },
  });

  // 4. Generate some test activities using your Enums and JSON metadata
  await prisma.activity.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: adrian.id,
        type: ActivityType.WORKSPACE_CREATED,
        metadata: { text: "Created the initial workspace repository" }, 
      },
      {
        workspaceId: workspace.id,
        userId: adrian.id,
        type: ActivityType.WORKSPACE_UPDATED,
        metadata: { text: "Switched database from Supabase to Neon" },
      },
      {
        workspaceId: workspace.id,
        userId: adrian.id,
        type: ActivityType.FILE_UPLOADED,
        metadata: { text: "Configured local Clash Display and Satoshi fonts" },
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("👉 YOUR TEST WORKSPACE ID IS:", workspace.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });