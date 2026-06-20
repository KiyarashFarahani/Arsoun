import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serialNumber: string }> },
) {
  try {
    const payload = await getPayload({ config })
    const { serialNumber } = await params

    const result = await payload.find({
      collection: 'instruments',
      depth: 2,
      where: { serialNumber: { equals: serialNumber } },
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
    console.error('Instrument detail error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
