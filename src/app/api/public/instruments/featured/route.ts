import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const instruments = await payload.find({
      collection: 'instruments',
      depth: 1,
      where: { isFeatured: { equals: true } },
      limit: 6,
      sort: '-dateMade',
    })

    return NextResponse.json({ instruments: instruments.docs })
  } catch (error) {
    console.error('Featured instruments error:', error)
    return NextResponse.json({ instruments: [] }, { status: 500 })
  }
}
