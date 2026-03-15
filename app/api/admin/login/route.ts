import { NextRequest, NextResponse } from "next/server"
import { setAdminAuthCookie, verifyAdminPassword } from "@/lib/admin-auth"

export async function POST(req: NextRequest) {

  const body = await req.json()

  if (!verifyAdminPassword(body.password)) {

    return NextResponse.json(
      { ok:false },
      { status:401 }
    )
  }

  await setAdminAuthCookie()

  return NextResponse.json({ ok:true })
}