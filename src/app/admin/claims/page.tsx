import { Metadata } from 'next';
import AdminClaimsList from '@/components/admin/AdminClaimsList';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';

export const metadata: Metadata = {
  title: 'Admin - Business Claims | Loaded Tea Finder',
  description: 'Review and manage business claims',
};

export default async function AdminClaimsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Business Claims</h1>
        <p className="text-gray-600">Review and manage business ownership claims</p>
      </div>
      
      <AdminClaimsList />
    </main>
  );
}
