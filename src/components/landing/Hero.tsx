import { Link } from "react-router-dom";
import { ArrowRight, Shield, Heart, Search } from "lucide-react";

const heroImage =
  "https://images.pexels.com/photos/11106504/pexels-photo-11106504.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50/60 via-white to-white" />
      <div className="absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-primary-100/40 blur-3xl" />
      <div className="absolute top-40 -left-20 -z-10 h-72 w-72 rounded-full bg-secondary-100/30 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 ring-1 ring-primary-100">
              <Heart className="h-4 w-4" />
              Trusted by responsible breeders worldwide
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-neutral-900 text-balance sm:text-display-md lg:text-display-lg">
              Where breeders and dog lovers{" "}
              <span className="text-primary-600">connect</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-neutral-600 leading-relaxed">
              Paw Link is the all-in-one platform for managing your kennel,
              showcasing your dogs, and connecting with verified buyers. Track
              health records, breeding history, and litters — all in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary text-base">
                Start Free Today
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#features" className="btn-secondary text-base">
                Explore Features
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6">
              {[
                { icon: Shield, label: "Verified Breeders" },
                { icon: Search, label: "Smart Search" },
                { icon: Heart, label: "Animal First" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-neutral-500">
                  <Icon className="h-4 w-4 text-primary-500" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in-scale">
            <div className="relative rounded-4xl overflow-hidden shadow-card ring-1 ring-neutral-200">
              <img
                src={heroImage}
                alt="Happy golden retriever dog lying on lush green grass"
                className="h-[400px] w-full object-cover sm:h-[500px]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/20 to-transparent" />
            </div>

            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-white p-4 shadow-card ring-1 ring-neutral-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-50">
                  <Shield className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Health Verified</p>
                  <p className="text-xs text-neutral-500">Full medical records</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-neutral-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50">
                  <Heart className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">2,400+ Dogs</p>
                  <p className="text-xs text-neutral-500">On the platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
