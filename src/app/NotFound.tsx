import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <section className="py-10 text-center">
      <h2 className="text-xl font-bold">Page not found</h2>
      <p className="mt-2 text-baboo-900/80">That page does not exist.</p>
      <Link to="/" className="mt-4 inline-block inline-flex min-h-11 items-center font-bold text-baboo-600 underline">
        Back to home
      </Link>
    </section>
  );
}
