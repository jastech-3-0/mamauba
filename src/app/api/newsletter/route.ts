import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) return NextResponse.json({ error: "email requerido" }, { status: 400 });
    const sub = await db.subscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    return NextResponse.json({ ok: true, id: sub.id });
  } catch (e) {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
