import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('@/components/HomePage'));

export const metadata = {
  title: 'Discover Local Loaded Tea Clubs',
  description: 'Find, join, and earn rewards at your local Loaded Tea Clubs',
}

export default function Page() {
  return <HomePage />;
}
