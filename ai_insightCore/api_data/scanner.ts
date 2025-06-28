
import { NextRequest } from "next/server"
import { scanTokenActivity } from "@/routines/background-jobs/token-flow/solanaTokenActivityDetector"

export async function GET(req: NextRequest): Promise<Response> {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return new Response("Missing token", { status: 400 })
  }

  try {
    const result = await scanTokenActivity(token)
    return Response.json({ result })
  } catch (error) {
    console.error("Token scan failed:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
