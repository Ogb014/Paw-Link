import {
  PawPrint,
  ClipboardList,
  Stethoscope,
  Baby,
  Camera,
  LayoutGrid,
  Store,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: PawPrint,
    title: "Comprehensive Dog Profiles",
    description:
      "Create unlimited, detailed profiles for every dog — breed, color, measurements, microchip, registration, and more.",
  },
  {
    icon: Camera,
    title: "Photo Management",
    description:
      "Upload and organize multiple photos per dog. Remove or reorder images anytime with our built-in gallery.",
  },
  {
    icon: Stethoscope,
    title: "Health & Medical Records",
    description:
      "Track vaccinations, medications, and veterinary visits. Never miss a booster or checkup with timeline views.",
  },
  {
    icon: Baby,
    title: "Breeding & Litter Management",
    description:
      "Record breeding pairings, manage litters from birth to adoption, and track lineage across generations.",
  },
  {
    icon: LayoutGrid,
    title: "Customizable Dashboards",
    description:
      "Arrange your kennel overview your way. Custom fields, themes, and layouts that match your workflow.",
  },
  {
    icon: Store,
    title: "Public Breeder Storefronts",
    description:
      "Publish a beautiful public profile page showcasing your kennel, your dogs, and your breeding philosophy.",
  },
  {
    icon: ClipboardList,
    title: "Marketplace Listings",
    description:
      "List available dogs and breeding services. Buyers can browse, save searches, and send enquiries directly.",
  },
  {
    icon: Bell,
    title: "Saved Searches & Alerts",
    description:
      "Buyers save breed or location searches and get notified when matching dogs become available.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            Everything you need
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 text-balance sm:text-display-md">
            One platform for your entire kennel
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            From puppy records to marketplace listings, Paw Link handles every
            aspect of breeding management with the care and precision your dogs
            deserve.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl bg-white p-6 shadow-soft ring-1 ring-neutral-100 transition-all duration-200 hover:shadow-card hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                {title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
