import { Link } from "react-router-dom";
import { PawPrint, Store, Heart, Search, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/database";

const roleConfig: Record<UserRole, { greeting: string; actions: { icon: typeof PawPrint; label: string; to: string; description: string }[] }> = {
  breeder: {
    greeting: "Manage your kennel and dogs",
    actions: [
      { icon: PawPrint, label: "Add a Dog", to: "/app/dogs", description: "Create a new dog profile" },
      { icon: Store, label: "Edit Storefront", to: "/app/storefront", description: "Update your public breeder page" },
      { icon: Heart, label: "View Listings", to: "/app", description: "See your marketplace listings" },
    ],
  },
  buyer: {
    greeting: "Find your perfect companion",
    actions: [
      { icon: Search, label: "Browse Marketplace", to: "/app", description: "Search for available dogs" },
      { icon: Heart, label: "Saved Searches", to: "/app", description: "Manage your saved searches" },
    ],
  },
  service_seeker: {
    greeting: "Connect with breeders and services",
    actions: [
      { icon: Search, label: "Find Services", to: "/app", description: "Browse breeding service providers" },
      { icon: Heart, label: "My Enquiries", to: "/app", description: "Track your enquiries" },
    ],
  },
};

export function DashboardPage() {
  const { profile } = useAuth();
  const role = profile?.role ?? "breeder";
  const config = roleConfig[role];

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Welcome, {firstName}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{config.greeting}</p>
      </div>

      {/* Quick stats placeholder */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Dogs", value: "—" },
          { label: "Listings", value: "—" },
          { label: "Enquiries", value: "—" },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Quick Actions</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.actions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-neutral-100 transition-all duration-200 hover:shadow-card hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                <action.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-neutral-900">{action.label}</p>
                <p className="text-sm text-neutral-500">{action.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-300 transition-colors group-hover:text-primary-500" />
            </Link>
          ))}
        </div>
      </div>

      {/* Getting started */}
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
          <Plus className="h-7 w-7 text-primary-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-neutral-900">
          {role === "breeder" ? "Add your first dog to get started" : "Start exploring the marketplace"}
        </h3>
        <p className="mt-2 text-sm text-neutral-500">
          {role === "breeder"
            ? "Create a detailed profile for each dog with photos, health records, and more."
            : "Browse listings from verified breeders and save your favorite searches."}
        </p>
        <Link to={role === "breeder" ? "/app/dogs" : "/app"} className="btn-primary mt-5">
          {role === "breeder" ? "Add a Dog" : "Browse Now"}
        </Link>
      </div>
    </div>
  );
}
