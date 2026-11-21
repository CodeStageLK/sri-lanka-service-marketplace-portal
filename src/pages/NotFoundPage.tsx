import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-primary">Page not found</h1>
      <Link className="mt-6 inline-block text-primary underline" to="/search">Return to marketplace search</Link>
    </main>
  );
}
