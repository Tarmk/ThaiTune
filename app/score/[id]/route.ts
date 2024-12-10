import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  
  // Replace this with your actual database query
  const score = {
    id: id,
    name: "Song 1",
    author: "Composer 1",
  }

  return NextResponse.json(score)
}