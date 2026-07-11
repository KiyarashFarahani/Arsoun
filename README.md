# Arsoun Soundsculptures

A product showcase website for Arsoun Soundsculptures, a handpan maker brand based in Bandar-E Anzali, Iran. Built with Next.js 15, Payload CMS 3.x, and a Persian/RTL interface. The site presents product lines, allows customers to look up their instrument's specifications by serial number, and provides contact information for orders.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3-green)](https://payloadcms.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-ff00cc)](https://www.framer.com/motion/)

## Features

- Persian/Farsi RTL interface with custom fonts (Siavash, Vazirmatn, Editorial Pro)
- Product category showcase: Steel, Nitride, Stone, Custom
- Serial number lookup for instrument specifications
- Featured instruments on the homepage
- Instrument detail pages with specs, images, and rich text descriptions
- Contact page with Instagram, WhatsApp, and phone links
- Payload CMS admin panel for managing categories and instruments
- Framer Motion page transitions and scroll animations
- Docker deployment ready

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
Nginx (SSL termination, static files, /uploads)
  └── Docker Compose
       ├── App (Next.js 15 standalone)
       │   ├── Payload Admin (/admin)
       │   ├── Frontend (/, /products, /lookup, /contact)
       │   └── API Routes (/api/*)
       └── PostgreSQL 16
```

## Data Models

1. **Users** - Admin-only accounts for the Payload CMS panel (email/password auth)
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

### Admin

- `/admin` - Payload CMS admin panel

### API

- `GET /api/public/categories` - List all product categories
- `GET /api/public/instruments` - List instruments (filterable by category)
- `GET /api/public/instruments/featured` - Featured instruments for homepage
- `GET /api/public/instruments/[serialNumber]` - Instrument detail by serial number
- `GET /api/public/lookup?serial=XXX` - Serial number lookup

## Prerequisites

- **Node.js 22 LTS** (recommended)
- **Docker & Docker Compose** (for PostgreSQL)
- **npm** (the project uses `package-lock.json`)

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd Arsoun

# Install dependencies
npm install
```

### 2. Start Docker Services

```bash
# Start PostgreSQL
cd docker
docker compose up -d
cd ..

# Verify services are running
docker compose -f docker/docker-compose.yml ps
```

This starts PostgreSQL on port `5432`.

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and update these values:

```env
# Database (use the same values as in docker-compose.yml)
DATABASE_URL=postgresql://arsoun:changeme@localhost:5432/arsoun
DB_PASSWORD=changeme

# Payload CMS (generate a random 32+ character string)
PAYLOAD_SECRET=your-random-32-char-secret-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Migration

```bash
# Generate Payload types and run migration
npm run payload:generate
npm run payload:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at:

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### 6. Create Admin User

1. Navigate to `http://localhost:3000/admin`
2. Create your first admin user through the Payload CMS interface
3. Start adding categories and instruments

## Project Structure

```
Arsoun/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (frontend)/         # Public pages (home, products, lookup, contact)
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── products/       # Category listing and category detail
│   │   │   ├── instruments/    # Instrument detail by serial number
│   │   │   ├── lookup/         # Serial number lookup
│   │   │   └── contact/        # Contact page
│   │   ├── (payload)/          # Payload CMS admin
│   │   ├── api/                # API routes
│   │   │   ├── (payload)/      # Payload REST/GraphQL routes
│   │   │   └── public/         # Public API endpoints
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   └── not-found.tsx       # 404 page
│   ├── collections/            # Payload CMS collections
│   │   ├── Users.ts
│   │   ├── Categories.ts
│   │   ├── Instruments.ts
│   │   └── Media.ts
│   ├── components/             # React components
│   │   ├── Hero.tsx
│   │   ├── FeaturedCategories.tsx
│   │   ├── AboutBrand.tsx
│   │   ├── CTA.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── PageTransition.tsx
│   │   ├── SmoothScrollProvider.tsx
│   │   ├── ImageStack.tsx
│   │   └── AppWrapper.tsx
│   ├── payload.config.ts       # Payload CMS configuration
│   └── next.config.ts          # Next.js configuration
├── docker/                     # Docker configuration
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── nginx.conf
├── public/                     # Static assets
│   ├── fonts/                  # Custom Persian fonts
│   └── images/                 # Images and logos
└── .env.example                # Example environment variables
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run payload` | Run Payload CLI |
| `npm run payload:generate` | Generate Payload types and import map |
| `npm run payload:migrate` | Run database migrations |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DB_PASSWORD` | PostgreSQL password | Yes |
| `PAYLOAD_SECRET` | Payload CMS secret (32+ chars) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

## Serial Number Lookup Flow

1. User enters a serial number on `/lookup`
2. Frontend calls `GET /api/public/lookup?serial=XXX`
3. API queries the Instruments collection by `serialNumber`
4. Returns instrument specs or a 404 error
5. The result page displays full specifications: scale, notes, material, diameter, weight, date, images

## Deployment

### Docker Production Build

```bash
# Build the Docker image
docker build -f docker/Dockerfile -t arsoun .

# Run with docker compose
cd docker
docker compose up -d
```

### VPS Deployment

1. Set up a VPS with Docker installed
2. Clone the repository
3. Configure `.env` with production values
4. Set up SSL certificates (Let's Encrypt)
5. Configure Nginx with the provided `nginx.conf`
6. Update `server_name` and certificate paths in `nginx.conf`
7. Run `docker compose up -d`

## License

MIT
