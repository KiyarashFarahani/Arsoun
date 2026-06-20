import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const serial = searchParams.get('serial')

    if (!serial) {
      return NextResponse.json(
        { error: 'Serial number is required' },
        { status: 400 },
      )
    }

    const result = await payload.find({
      collection: 'instruments',
      depth: 2,
      where: { serialNumber: { equals: serial } },
      limit: 1,
    })

    if (result.docs.length === 0) {
      return NextResponse.json(
        { error: 'Instrument not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ instrument: result.docs[0] })
  } catch (error) {
    console.error('Lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
