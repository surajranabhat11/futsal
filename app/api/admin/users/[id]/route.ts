export async function PATCH(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { params } = context
  const id = params.id

  const { role } = await request.json()

  const client = await clientPromise
  const db = client.db("test")

  await db.collection("users").updateOne(
    { _id: new ObjectId(id) },
    { $set: { role } }
  )

  return NextResponse.json({ success: true })
}