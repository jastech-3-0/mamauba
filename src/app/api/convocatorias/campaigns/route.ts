import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const campaigns = await db.campaign.findMany({
    orderBy: { raised: "desc" },
  });
  return NextResponse.json({ campaigns });
}
