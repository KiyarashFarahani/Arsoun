import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const instruments = await payload.find({
      collection: 'instruments',
      depth: 1,
      where: category ? { category: { equals: category } } : undefined,
      sort: '-dateMade',
    })

    return NextResponse.json({ instruments: instruments.docs })
  } catch (error) {
    console.error('Instruments error:', error)
    return NextResponse.json({ instruments: [] }, { status: 500 })
  }
}
