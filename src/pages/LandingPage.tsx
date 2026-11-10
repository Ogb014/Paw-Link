import { Link } from "react-router-dom";
import { PawPrint, ArrowRight, Shield, Heart, Star } from "lucide-react";
import { K9Dog } from "../components/K9Dog";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-soft">
            <PawPrint className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-neutral-900">
            Paw<span className="text-primary-600">Link</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">Sign In</Link>
          <Link to="/signup" className="btn-primary">Get Started</Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <K9Dog size={140} />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl font-display">
            Where breeders and dog lovers connect
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-600">
            Paw Link is a marketplace and kennel management platform for dog breeders and buyers.
            Browse reputable breeders, message directly, and manage your kennel — all in one place.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="btn-primary w-full sm:w-auto">
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary w-full sm:w-auto">
              I already have an account
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">Verified Breeders</h3>
              <p className="text-xs text-neutral-500">Browse breeders with ratings and reviews from real buyers</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-accent-600">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">Kennel Management</h3>
              <p className="text-xs text-neutral-500">Track dogs, health records, litters, photos and videos</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-600">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">Direct Messaging</h3>
              <p className="text-xs text-neutral-500">Chat with breeders, share photos and videos in-app</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-100 px-6 py-6 text-center">
        <p className="text-xs text-neutral-400">Paw Link — Connecting responsible breeders with loving homes.</p>
      </footer>
    </div>
  );
}
