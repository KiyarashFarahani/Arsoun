# Arsoun - Online Course Platform

A modern online course-selling platform built with Next.js 15, Payload CMS 3.x, and Persian/Farsi UI. Features OTP-based authentication, Zarinpal payment integration, and a beautiful RTL interface.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3-green)](https://payloadcms.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)

## Features

- Persian/Farsi RTL interface with custom fonts
- OTP-based phone authentication (sms.ir)
- Course catalog with categories
- Student dashboard with progress tracking
- Video player with lesson progress
- Zarinpal payment gateway integration
- Payload CMS admin panel
- Docker deployment ready

## Prerequisites

- **Node.js 22 LTS** (recommended)
- **Docker & Docker Compose** (for PostgreSQL and Redis)
- **pnpm or npm**

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
# Start PostgreSQL and Redis
cd docker
docker compose up -d
cd ..

# Verify services are running
docker compose -f docker/docker-compose.yml ps
```

This starts:
- PostgreSQL on port `5432`
- Redis on port `6379`

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

# Redis
REDIS_URL=redis://localhost:6379

# Payload CMS (generate a random 32+ character string)
PAYLOAD_SECRET=your-random-32-char-secret-here

# sms.ir (get from https://sms.ir)
SMSIR_API_KEY=your-smsir-api-key
SMSIR_LINE_NUMBER=30007732000000
SMSIR_TEMPLATE_ID=12345

# Zarinpal (get from https://zarinpal.com)
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_SANDBOX=true

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-random-32-char-secret-here
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
3. Use the OTP flow to log in (requires valid sms.ir credentials)

## Project Structure

```
Arsoun/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (frontend)/         # Public pages (landing, courses, auth)
│   │   ├── (dashboard)/        # Student dashboard (protected)
│   │   ├── (payload)/          # Payload CMS admin
│   │   └── api/                # API routes
│   ├── collections/            # Payload CMS collections
│   ├── components/             # React components
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   └── data/                   # Mock data
├── docker/                     # Docker configuration
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── nginx.conf
├── public/                     # Static assets
│   ├── fonts/                  # Custom fonts
│   └── images/                 # Images and logos
└── .opencode/                  # AI assistant skills
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
| `REDIS_URL` | Redis connection string | Yes |
| `PAYLOAD_SECRET` | Payload CMS secret (32+ chars) | Yes |
| `SMSIR_API_KEY` | sms.ir API key | Yes |
| `SMSIR_LINE_NUMBER` | sms.ir line number | Yes |
| `SMSIR_TEMPLATE_ID` | sms.ir OTP template ID | Yes |
| `ZARINPAL_MERCHANT_ID` | Zarinpal merchant ID | Yes |
| `ZARINPAL_SANDBOX` | Use Zarinpal sandbox mode | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `JWT_SECRET` | JWT secret (32+ chars) | Yes |

## Deployment

### Docker Production Build

```bash
# Build the Docker image
docker build -f docker/Dockerfile -t arsoun .

# Run with docker compose
cd docker
docker compose -f docker-compose.prod.yml up -d
```

### VPS Deployment

1. Set up a VPS with Docker installed
2. Clone the repository
3. Configure `.env` with production values
4. Set up SSL certificates (Let's Encrypt)
5. Configure Nginx with the provided `nginx.conf`
6. Run `docker compose up -d`

## License

MIT
