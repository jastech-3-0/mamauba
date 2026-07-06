import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const movements = await db.movement.findMany({
    orderBy: { date: "desc" },
    take: 20,
  });
  return NextResponse.json({
    movements: movements.map((m) => ({
      ...m,
      date: m.date.toISOString(),
    })),
  });
}
