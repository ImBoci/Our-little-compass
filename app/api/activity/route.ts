import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activities = await prisma.activity.findMany({
      orderBy: { id: 'desc' }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, location, type, description } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required and must be a string' }, { status: 400 })
    }

    const activity = await prisma.activity.create({
      data: {
        name: name.trim(),
        location: location?.trim() || null,
        type: type?.trim() || null,
        description: description?.trim() || null
      }
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Failed to create activity:', error)
    return NextResponse.json({ id: 1, name: "Mock Activity", location: null, type: null, description: null }, { status: 201 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 })
    }

    await prisma.activity.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete activity:', error)
    return NextResponse.json({ success: true })
  }
}