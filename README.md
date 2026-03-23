# Music Website

A modern music platform built with Next.js that allows composers to share and discover music with interactive visualizations.

## Features

- 🎵 Upload and stream music tracks
- 🎨 Real-time audio visualizations (Waveform, Bars, Circular, Nebula)
- 👤 User profiles and composer pages
- 🔍 Search functionality
- 🎧 Built-in music player
- 📱 Responsive design
- 🔐 Authentication with Supabase

## Tech Stack

- **Framework:** Next.js 16.2 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Storage:** AWS S3
- **AI:** OpenAI (embeddings for search)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- A Supabase account
- An AWS S3 bucket
- A Web3Forms account (for contact form)
- An OpenAI API key (optional, for search features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Blackjax-Studio/voxelbeat.git
cd voxelbeat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials (see Configuration section below).

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_postgres_connection_string

# AWS S3
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_REGION=us-east-1
S3_BUCKET=your_bucket_name

# App
APP_BASE_URL=http://localhost:3000

# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key

# Web3Forms (for contact form)
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your_web3forms_access_key

# Application Branding
NEXT_PUBLIC_COMPANY_NAME="Blackjax, LLC"
NEXT_PUBLIC_APP_NAME="VoxelBeat"
NEXT_PUBLIC_CONTACT_EMAIL="contact@blackjaxstudio.com"
NEXT_PUBLIC_COPYRIGHT_YEAR="2026"
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/              # Next.js app router pages and API routes
├── components/       # React components
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and configurations
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
