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
      name: 'scale',
      type: 'text',
      label: 'Scale',
      admin: {
        description: 'e.g., D Kurd, C# Annaziska',
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
      name: 'material',
      type: 'select',
      options: [
        { label: 'Stainless Steel', value: 'stainless-steel' },
        { label: 'Nitrided', value: 'nitrided' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        position: 'sidebar',
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
        description: 'Price in Tomans (optional)',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'available',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Sold', value: 'sold' },
        { label: 'Reserved', value: 'reserved' },
      ],
      admin: {
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
  ],
}
