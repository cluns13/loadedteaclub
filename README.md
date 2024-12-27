# Tea Finder Next

## Project Overview
Discover and connect with local Loaded Tea Clubs, powered by Next.js and modern web technologies.

## Tech Stack
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- MongoDB
- Redis
- NextAuth
- Prisma ORM

## Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB database
- Redis instance
- Google Maps API Key

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/tea-finder-next.git
cd tea-finder-next
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file with the following variables:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_MAPS_API_KEY`
- `REDIS_URL`
- Other necessary API keys

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

## Deployment
- Recommended: Vercel
- Alternative: Netlify, DigitalOcean

## Scripts
- `npm run dev`: Start development server
- `npm run build`: Production build
- `npm run start`: Start production server
- `npm run lint`: Run linter

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License
