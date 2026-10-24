import { Check, Dog, ShoppingBag, Wrench } from "lucide-react";

const roles = [
  {
    icon: Dog,
    name: "Breeders",
    tagline: "Run your kennel like a pro",
    features: [
      "Unlimited dog records and photos",
      "Full health, vaccination & vet visit logs",
      "Breeding history and litter tracking",
      "Public storefront with custom branding",
      "Marketplace listings with enquiries",
    ],
    accent: "primary",
  },
  {
    icon: ShoppingBag,
    name: "Buyers",
    tagline: "Find your perfect companion",
    features: [
      "Browse verified breeder storefronts",
      "Search by breed, location, and traits",
      "Save searches and get new-listing alerts",
      "View full health and lineage records",
      "Send direct enquiries to breeders",
    ],
    accent: "secondary",
  },
  {
    icon: Wrench,
    name: "Service Seekers",
    tagline: "Connect with the right breeder",
    features: [
      "Find studs and breeding services",
      "Review breeder reputations and history",
      "Compare service offerings",
      "Direct messaging with providers",
      "Track your enquiries in one place",
    ],
    accent: "accent",
  },
];

const accentMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: "bg-primary-50", text: "text-primary-600", ring: "ring-primary-100" },
  secondary: { bg: "bg-secondary-50", text: "text-secondary-600", ring: "ring-secondary-100" },
  accent: { bg: "bg-accent-50", text: "text-accent-600", ring: "ring-accent-100" },
};

export function ForBreeders() {
  return (
    <section id="breeders" className="bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            Built for everyone
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 text-balance sm:text-display-md">
            A role for every dog lover
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Whether you're managing a kennel, searching for your next family
            member, or seeking breeding services, Paw Link adapts to you.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {roles.map(({ icon: Icon, name, tagline, features, accent }) => {
            const c = accentMap[accent];
            return (
              <div
                key={name}
                className={`rounded-3xl bg-white p-8 shadow-card ring-1 ${c.ring}`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${c.bg}`}>
                  <Icon className={`h-7 w-7 ${c.text}`} />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-neutral-900">{name}</h3>
                <p className="mt-1 text-sm text-neutral-500">{tagline}</p>

                <ul className="mt-6 space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${c.bg}`}>
                        <Check className={`h-3.5 w-3.5 ${c.text}`} strokeWidth={3} />
                      </span>
                      <span className="text-sm text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
