import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(roles);
  } catch (error) {
    console.error("GET /api/roles error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
