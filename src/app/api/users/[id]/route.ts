import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if ((session.user as any).role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();
    const updateData: any = {};

    if (typeof data.is_active === "boolean") {
      updateData.is_active = data.is_active;
    }

    if (data.role_id) {
      updateData.role_id = data.role_id;
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: { role: true, employee: true }
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      role: user.role.name,
      role_id: user.role_id,
      employee: user.employee ? { id: user.employee.id, name: user.employee.name } : null
    });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
