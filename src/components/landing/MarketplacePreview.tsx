import { Link } from "react-router-dom";
import { MapPin, Heart, ChevronRight } from "lucide-react";

const breeds = [
  { name: "Golden Retriever", location: "Colorado, US", price: "$2,500", image: "https://images.pexels.com/photos/11106504/pexels-photo-11106504.jpeg?auto=compress&cs=tinysrgb&h=400&w=400" },
  { name: "French Bulldog", location: "Austin, TX", price: "$3,200", image: "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&h=400&w=400" },
  { name: "Labrador Puppy", location: "Portland, OR", price: "$1,800", image: "https://images.pexels.com/photos/2017802/pexels-photo-2017802.jpeg?auto=compress&cs=tinysrgb&h=400&w=400" },
  { name: "German Shepherd", location: "Denver, CO", price: "$2,000", image: "https://images.pexels.com/photos/3336021/pexels-photo-3336021.jpeg?auto=compress&cs=tinysrgb&h=400&w=400" },
];

export function MarketplacePreview() {
  return (
    <section id="marketplace" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
              Marketplace
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 text-balance sm:text-display-md">
              Discover dogs from trusted breeders
            </h2>
          </div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Browse all listings
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {breeds.map((dog) => (
            <div
              key={dog.name}
              className="group overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-neutral-100 transition-all duration-200 hover:shadow-card hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={dog.image}
                  alt={dog.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <button className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-400 backdrop-blur transition-colors hover:text-error-500">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-neutral-900">{dog.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {dog.location}
                </div>
                <p className="mt-2 text-lg font-bold text-primary-600">{dog.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
