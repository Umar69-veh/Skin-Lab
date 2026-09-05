import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import dayjs from "dayjs";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await requireRole(["Admin", "Manager", "Doctor"]); // Doctors might need dashboard access too, but mostly Admin/Manager

    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();
    const thirtyDaysAgo = dayjs().subtract(30, "days").startOf("day").toDate();

    // 1. Today's Revenue
    const todaySales = await prisma.sale.aggregate({
      _sum: { grand_total: true },
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });
    const todayRevenue = todaySales._sum.grand_total || 0;

    // 2. Patients Treated Today
    const patientsTodayQuery = await prisma.sale.findMany({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: { customer_id: true },
      distinct: ['customer_id']
    });
    const patientsTreatedToday = patientsTodayQuery.length;

    // 3. Active/Pending Dues
    const activeDuesSales = await prisma.sale.findMany({
      where: {
        payment_status: { in: ["DUE", "PARTIAL"] }
      },
      select: { grand_total: true, paid_amount: true }
    });
    const activeDues = activeDuesSales.reduce((acc, sale) => acc + (sale.grand_total - (sale.paid_amount || 0)), 0);

    // 4. Revenue Trend (last 30 days)
    const recentSales = await prisma.sale.findMany({
      where: {
        date: { gte: thirtyDaysAgo }
      },
      select: { date: true, grand_total: true }
    });

    const revenueMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = dayjs().subtract(i, "days").format("MMM DD");
      revenueMap[d] = 0;
    }
    
    recentSales.forEach(sale => {
      const d = dayjs(sale.date).format("MMM DD");
      if (revenueMap[d] !== undefined) {
        revenueMap[d] += sale.grand_total;
      }
    });

    const revenueTrend = Object.keys(revenueMap).map(date => ({
      date,
      revenue: revenueMap[date]
    }));

    // 5. Top Treatments (last 30 days)
    const recentItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          date: { gte: thirtyDaysAgo }
        }
      },
      include: {
        product: true
      }
    });

    const treatmentsMap: Record<string, { name: string, count: number, revenue: number }> = {};
    recentItems.forEach(item => {
      if (!item.product) return;
      const pid = item.product_id;
      if (!treatmentsMap[pid]) {
        treatmentsMap[pid] = { name: item.product.name, count: 0, revenue: 0 };
      }
      treatmentsMap[pid].count += item.quantity;
      treatmentsMap[pid].revenue += item.total_price;
    });

    const topTreatments = Object.values(treatmentsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 6. Recent Transactions
    const recentTransactions = await prisma.sale.findMany({
      take: 10,
      orderBy: { date: "desc" },
      include: {
        customer: { select: { name: true, phone: true } },
        doctor: { select: { name: true } },
        user: { select: { email: true } },
        items: { include: { product: true } }
      }
    });

    return NextResponse.json({
      todayRevenue,
      patientsTreatedToday,
      activeDues,
      revenueTrend,
      topTreatments,
      recentTransactions
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
