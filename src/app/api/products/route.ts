import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");

  try {
    const products = await prisma.product.findMany({
      where: categoryId ? { category_id: categoryId } : undefined,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (!["Admin", "Manager"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    if (!data.name || !data.category_id) {
      return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
    }

    // Auto-generate SKU
    const count = await prisma.product.count();
    const sku = `SRV-${String(count + 1).padStart(4, '0')}`;

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        sku: sku,
        category_id: data.category_id,
        cost_price: data.cost_price || 0,
        selling_price: data.selling_price,
        tax_class: data.tax_class || "Standard",
        stock_quantity: data.stock_quantity || 0,
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
