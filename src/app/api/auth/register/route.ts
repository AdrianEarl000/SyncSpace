import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name:     z.string().min(2).max(50),
  email:    z.string().email(),
  password: z.string().min(8).max(100),
});

const USER_COLORS = [
  "#6366F1","#22C55E","#F59E0B","#EF4444",
  "#3B82F6","#8B5CF6","#EC4899","#14B8A6",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const count  = await prisma.user.count();
    const color  = USER_COLORS[count % USER_COLORS.length];

    const user = await prisma.user.create({
      data: { name, email, password: hashed, color },
      select: { id: true, name: true, email: true, color: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
