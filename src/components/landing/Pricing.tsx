import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for trying out Paw Link",
    features: [
      "Up to 5 dog profiles",
      "Basic health records",
      "1 kennel profile",
      "Community support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Breeder",
    price: "$24",
    period: "/month",
    description: "Everything a serious breeder needs",
    features: [
      "Unlimited dog profiles",
      "Full health & vaccination records",
      "Breeding history & litters",
      "Public storefront",
      "Marketplace listings",
      "Custom fields & themes",
      "Priority support",
    ],
    cta: "Start Breeder Plan",
    highlight: true,
  },
  {
    name: "Kennel Pro",
    price: "$59",
    period: "/month",
    description: "For multi-kennel operations",
    features: [
      "Everything in Breeder",
      "Multiple kennels",
      "Team management",
      "Advanced analytics",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            Simple pricing
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 text-balance sm:text-display-md">
            Plans that grow with your kennel
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Start free and upgrade when you're ready. No hidden fees, cancel
            anytime.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-200 ${
                plan.highlight
                  ? "bg-neutral-900 text-white shadow-card lg:-translate-y-4 lg:scale-105"
                  : "bg-white shadow-soft ring-1 ring-neutral-100"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <h3 className={`text-lg font-semibold ${plan.highlight ? "text-white" : "text-neutral-900"}`}>
                {plan.name}
              </h3>
              <p className={`mt-1 text-sm ${plan.highlight ? "text-neutral-300" : "text-neutral-500"}`}>
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-neutral-900"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlight ? "text-neutral-400" : "text-neutral-500"}`}>
                  {plan.period}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        plan.highlight ? "bg-primary-500/20" : "bg-primary-50"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 text-primary-500" strokeWidth={3} />
                    </span>
                    <span className={`text-sm ${plan.highlight ? "text-neutral-200" : "text-neutral-700"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`mt-8 w-full ${
                  plan.highlight ? "btn-primary" : "btn-secondary"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
