import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - APIMarketplace Pro',
  description: 'Sign in or create an account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-accent-900 to-primary-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            APIMarketplace Pro
          </h1>
          <p className="text-primary-200">
            Enterprise API Marketplace & Governance
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">{children}</div>
      </div>
    </div>
  );
}
