import type { CollectionConfig } from 'payload'

export const Instruments: CollectionConfig = {
  slug: 'instruments',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'serialNumber',
      type: 'text',
      required: true,
      unique: true,
      label: 'Serial Number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'numberOfNotes',
      type: 'number',
      label: 'Number of Notes',
      min: 0,
    },
    {
      name: 'notes',
      type: 'text',
      label: 'Notes',
      admin: {
        description: 'Individual note names, comma-separated',
      },
    },
    {
      name: 'diameter',
      type: 'text',
      admin: {
        description: 'e.g., 53 cm',
        position: 'sidebar',
      },
    },
    {
      name: 'weight',
      type: 'text',
      admin: {
        description: 'e.g., 4.5 kg',
        position: 'sidebar',
      },
    },
    {
      name: 'thickness',
      type: 'text',
      admin: {
        description: 'e.g., 1 mm',
        position: 'sidebar',
      },
    },
    {
      name: 'dateMade',
      type: 'date',
      label: 'Date Made',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Product photos',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      admin: {
        description: 'Price in $ (optional)',
        position: 'sidebar',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show on homepage',
      },
    },
    {
      name: 'isDisplayed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Show this instrument on the website (category pages, listings). Unchecked = lookup-only.',
      },
    },
  ],
}
