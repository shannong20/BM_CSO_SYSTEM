import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#143C2C]/10 text-[#143C2C] mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3"
              />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Page Not Found
          </h1>

          <p className="text-sm text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143C2C] text-white text-sm font-semibold hover:bg-[#0E2B1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/directory"
              className="inline-flex min-h-10 items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-[#374151] text-sm font-semibold hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] transition-colors"
            >
              View CSO Directory
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}