import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          image: user.image,
          color: user.color,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id    = user.id;
        token.color = (user as { color?: string }).color ?? "#6366F1";
      }
      // Handle session updates (e.g. profile changes)
      if (trigger === "update" && session) {
        token.name  = session.name;
        token.image = session.image;
        token.color = session.color;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id    = token.id as string;
        session.user.color = token.color as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      // Auto-assign a unique color to new users
      if (isNewUser && user.id) {
        const colors = [
          "#6366F1","#22C55E","#F59E0B","#EF4444",
          "#3B82F6","#8B5CF6","#EC4899","#14B8A6",
        ];
        const count = await prisma.user.count();
        await prisma.user.update({
          where: { id: user.id },
          data: { color: colors[count % colors.length] },
        });
      }
    },
  },
});
