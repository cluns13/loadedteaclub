import { SignupForm } from '@/components/auth/SignupForm';
import { LiquidBackground } from '@/components/LiquidBackground';

export default function SignupPage() {
  return (
    <div className="min-h-[100svh] relative">
      <LiquidBackground />
      
      <div className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              Join TeaFinder to discover or list loaded tea shops
            </p>
          </div>

          <SignupForm />
        </div>
      </div>
    </div>
  );
}
