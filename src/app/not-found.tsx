import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ocean-950">
      <div className="text-center max-w-md mx-auto px-6">
        <p className="text-reef-500 text-meta font-medium mb-4">404</p>
        <h1 className="font-display text-4xl text-sand-50 mb-4">Page not found</h1>
        <p className="text-sand-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-reef-500 hover:bg-reef-400 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
