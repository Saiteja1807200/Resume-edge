import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
        <Link href="/" className="mt-6 inline-block text-primary hover:underline font-medium">
          Back to home
        </Link>
      </div>
    </div>
  );
}
