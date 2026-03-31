import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="text-blue-600 dark:text-blue-400 underline underline-offset-4 hover:opacity-80"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
