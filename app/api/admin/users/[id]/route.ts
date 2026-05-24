export async function PATCH(request: NextRequest, context: any) {
  const { params } = context

  console.log("PATCH HIT")
  console.log("PARAMS:", params)

  const body = await request.json()
  console.log("BODY:", body)

  return NextResponse.json({ ok: true })
}