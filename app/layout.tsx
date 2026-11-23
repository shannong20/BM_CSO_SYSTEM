import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/client/context/AuthContext';
import { AuthGuard } from '@/client/components/AuthGuard';

export const metadata: Metadata = {
  title: 'CSOTrack - SP Accredited CSO Registry (2025-2028)',
  description:
    'Official Civil Society Organization (CSO) Registry and Accreditation Portal for the Province of La Union, Sangguniang Panlalawigan (Term 2025-2028).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F9FA] text-gray-900 flex">
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
