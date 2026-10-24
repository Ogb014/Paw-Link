import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 px-8 py-16 sm:px-16 sm:py-20">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-white text-balance sm:text-display-md">
              Give your dogs the platform they deserve
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Join thousands of responsible breeders managing their kennels with
              Paw Link. Free to start — upgrade when you grow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-primary-700 shadow-soft transition-all duration-200 hover:bg-primary-50 active:scale-[0.98]"
              >
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600/50 px-6 py-3.5 text-base font-semibold text-white ring-1 ring-inset ring-primary-400/30 transition-all duration-200 hover:bg-primary-600/70 active:scale-[0.98]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
