import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const patient = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      sales: {
        orderBy: { date: "desc" }
      }
    }
  });

  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  return NextResponse.json(patient);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (!["Admin", "Manager", "Cashier"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    const updatedPatient = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      }
    });

    return NextResponse.json(updatedPatient);
  } catch (error: any) {
    console.error("PUT /api/patients/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
