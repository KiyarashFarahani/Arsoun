import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')

    const where: Where = { isDisplayed: { equals: true } }

    if (categorySlug) {
      const categoryResult = await payload.find({
        collection: 'categories',
        where: { slug: { equals: categorySlug } },
        limit: 1,
      })

      if (categoryResult.docs.length === 0) {
        return NextResponse.json({ instruments: [] })
      }

      const categoryId = categoryResult.docs[0].id
      where.and = [{ category: { equals: categoryId } }, { isDisplayed: { equals: true } }]
    }

    const instruments = await payload.find({
      collection: 'instruments',
      depth: 1,
      where,
      sort: '-dateMade',
    })

    return NextResponse.json({ instruments: instruments.docs })
  } catch (error) {
    console.error('Instruments error:', error)
    return NextResponse.json({ instruments: [] }, { status: 500 })
  }
}
