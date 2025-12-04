import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-6 border-b">
        <div className="text-2xl font-bold">RealEstatePlatform</div>
        <nav className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-24 text-center">
        <h1 className="text-5xl font-bold mb-6">
          List Your Property With Ease
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          The modern platform for real estate listings. Create, manage, and track your property listings in one place.
        </p>
        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="text-lg px-8">
              View Demo
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
