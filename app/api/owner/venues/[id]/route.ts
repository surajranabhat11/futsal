export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session?.user?.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id ?? request.nextUrl.pathname.split("/").pop()

  await dbConnect()
  const deleted = await Venue.findOneAndDelete({ _id: id, createdBy: session.user.id })

  if (!deleted) {
    return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}