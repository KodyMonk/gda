import { cookies } from "next/headers"
import { createHash } from "crypto"

const COOKIE_NAME = "reddit_admin_auth"

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error("ADMIN_PASSWORD missing")
  return password
}

export async function isAdminAuthenticated() {

  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value

  if (!cookieValue) return false

  return cookieValue === hashValue(getAdminPassword())
}

export async function setAdminAuthCookie() {

  const cookieStore = await cookies()

  cookieStore.set(
    COOKIE_NAME,
    hashValue(getAdminPassword()),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    }
  )
}

export function verifyAdminPassword(input: string) {
  return input === getAdminPassword()
}