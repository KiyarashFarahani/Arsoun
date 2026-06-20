# Arsoun Soundsculptures

## Project Goal

Build a product showcase website for Arsoun Soundsculptures, a handpan maker brand based in Bandar-E Anzali, Iran. The site presents product lines (Steel, Nitride, Stone, Custom), allows customers to look up their instrument's specifications by serial number, and provides contact information for orders.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15.x |
| CMS | Payload CMS | 3.x |
| Database | PostgreSQL | 16 |
| Styling | Tailwind CSS | 4 |
| Animations | Framer Motion | 12.x |
| Language | TypeScript | 5.x |

## Architecture

```
Nginx (SSL termination, static files)
  └── Docker Compose
       ├── App (Next.js 15 standalone)
       │   ├── Payload Admin (/admin)
       │   ├── Frontend (/, /products, /lookup)
       │   └── API Routes (/api/*)
       └── PostgreSQL 16
```

## Data Models

1. **Users** - Admin-only accounts for Payload CMS panel (email/password auth)
2. **Categories** - Product lines: Steel, Nitride, Stone, Custom (with descriptions and images)
3. **Instruments** - Individual handpans with serial numbers, specs, and images
4. **Media** - File uploads for product images and assets

### Instrument Fields
- `serialNumber` (text, unique) - Unique identifier for each handpan
- `title` (text) - Display name
- `category` (relationship → categories) - Product line
- `scale` (text) - Musical scale (e.g., D Kurd, C# Annaziska)
- `numberOfNotes` (number) - Count of tone fields
- `notes` (text) - Individual note names
- `material` (select) - stainless-steel / nitrided / custom
- `diameter` (text) - e.g., "53 cm"
- `weight` (text) - e.g., "4.5 kg"
- `thickness` (text) - e.g., "1 mm"
- `dateMade` (date) - Manufacturing date
- `description` (richText) - Lexical rich text for detailed specs
- `images` (array of uploads) - Multiple product photos
- `price` (number) - Price in Tomans (optional, for reference)
- `status` (select) - available / sold / reserved
- `isFeatured` (checkbox) - Show on homepage

## Routes

### Public
- `/` - Landing page (hero, featured products, about, CTA)
- `/products` - All product categories
- `/products/[slug]` - Products in a category (e.g., /products/steel)
- `/instruments/[serialNumber]` - Individual instrument detail
- `/lookup` - Serial number lookup form
- `/contact` - Contact page (Instagram, WhatsApp, phone)

### Admin (Payload)
- `/admin` - Payload CMS admin panel

### API
- `/api/public/categories` - List all product categories
- `/api/public/instruments` - List instruments (filterable by category)
- `/api/public/instruments/featured` - Featured instruments for homepage
- `/api/public/instruments/[serialNumber]` - Instrument detail by serial number
- `/api/public/lookup?serial=XXX` - Serial number lookup

## Serial Number Lookup Flow

1. User enters serial number on `/lookup` page
2. Frontend calls `GET /api/public/lookup?serial=XXX`
3. API queries Instruments collection by serialNumber
4. Returns instrument specs or 404 error
5. Displays full specifications: scale, notes, material, diameter, weight, date, images

## Key Conventions

- `@/*` alias maps to `./src/*`
- Payload collections in `src/collections/`
- PostgreSQL via `@payloadcms/db-postgres` (Drizzle ORM under the hood)
- Prices in Tomans (Iranian currency)
- RTL layout for Persian UI
- Lexical rich text for instrument descriptions
- Framer Motion for page transitions and animations
- Custom Persian fonts: Siavash (headings), Vazirmatn (body)
