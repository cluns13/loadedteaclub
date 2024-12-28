# Loaded Tea Club

## Overview
Discover and connect with local Loaded Tea Clubs

## Prerequisites
- Node.js 20.x
- npm 
- MongoDB
- Vercel Account

## Local Development
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` with required environment variables
4. Run development server:
   ```bash
   npm run dev
   ```

## Deployment Preparation
### Environment Variables
Required environment variables:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `GOOGLE_MAPS_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel Dashboard
3. Configure production branch

## Key Scripts
- `npm run dev`: Start development server
- `npm run build`: Production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: TypeScript type checking

## Technologies
- Next.js 14
- React
- TypeScript
- MongoDB
- Prisma
- Tailwind CSS
- NextAuth

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request
