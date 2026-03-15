import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  getConfiguredRedditThreads,
  saveConfiguredRedditThreads
} from "@/lib/thread-store"

export async function GET() {

  const allowed = await isAdminAuthenticated()

  if (!allowed) {
    return NextResponse.json(
      { error:"Unauthorized" },
      { status:401 }
    )
  }

  const threads = await getConfiguredRedditThreads()

  return NextResponse.json({ threads })
}

export async function POST(req: NextRequest) {

  const allowed = await isAdminAuthenticated()

  if (!allowed) {
    return NextResponse.json(
      { error:"Unauthorized" },
      { status:401 }
    )
  }

  const body = await req.json()

  const saved = await saveConfiguredRedditThreads(body)

  return NextResponse.json({ threads:saved })
}