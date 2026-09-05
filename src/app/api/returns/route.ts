import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireRole } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    await requireRole(["Admin", "Manager"]);
    const returns = await prisma.returnSale.findMany({
      orderBy: { date: "desc" },
      include: {
        sale: {
          include: {
            customer: true,
          }
        },
        items: {
          include: {
            sale_item: {
              include: {
                product: true
              }
            }
          }
        }
      },
    });
    return NextResponse.json(returns);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch returns" }, { status: 500 });
  }
}
