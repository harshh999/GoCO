import { NextResponse } from "next/server"
import { getAdminDB } from "@/lib/firebaseAdmin"

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = getAdminDB()

  const ref = db.ref("test/connection")

  await ref.set({
    status: "ok",
    timestamp: Date.now()
  })

  const snapshot = await ref.once("value")

  return NextResponse.json({
    success: true,
    data: snapshot.val()
  })
}