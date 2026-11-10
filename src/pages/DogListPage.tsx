import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Plus, Search, LayoutGrid, List, Heart, Store, Archive } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchKennel, fetchDogs } from "../lib/api";
import { LoadingState, ErrorState, EmptyState, PageHeader } from "../components/ui/States";
import type { Kennel, Dog } from "../types/database";

type SortField = "name" | "created_at" | "date_of_birth";
type ViewMode = "grid" | "list";

function calculateAge(dob: string | null): string {
  if (!dob) return "Unknown";
  const birth = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;
  if (totalMonths < 0) return "Unknown";
  if (totalMonths < 12) return `${totalMonths} mo`;
  return `${years} yr`;
}

export function DogListPage() {
  const { user } = useAuth();
  const [kennel, setKennel] = useState<Kennel | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sexFilter, setSexFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [saleFilter, setSaleFilter] = useState<string>("all");
  const [breedingFilter, setBreedingFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const k = await fetchKennel(user.id);
        if (k) {
          setKennel(k);
          const d = await fetchDogs(k.id);
          setDogs(d);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dogs");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const filteredDogs = useMemo(() => {
    let result = [...dogs];

    if (!showArchived) {
      result = result.filter((d) => !d.is_archived);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.call_name?.toLowerCase().includes(q) ?? false) ||
          d.breed.toLowerCase().includes(q) ||
          (d.microchip_number?.includes(q) ?? false) ||
          (d.registration_number?.includes(q) ?? false)
      );
    }

    if (sexFilter !== "all") {
      result = result.filter((d) => d.sex === sexFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((d) => (d.status ?? "active") === statusFilter);
    }
    if (saleFilter === "yes") {
      result = result.filter((d) => d.available_for_sale);
    } else if (saleFilter === "no") {
      result = result.filter((d) => !d.available_for_sale);
    }
    if (breedingFilter === "yes") {
      result = result.filter((d) => d.available_for_breeding);
    } else if (breedingFilter === "no") {
      result = result.filter((d) => !d.available_for_breeding);
    }

    result.sort((a, b) => {
      switch (sortField) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date_of_birth":
          if (!a.date_of_birth) return 1;
          if (!b.date_of_birth) return -1;
          return new Date(a.date_of_birth).getTime() - new Date(b.date_of_birth).getTime();
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [dogs, search, sexFilter, statusFilter, saleFilter, breedingFilter, sortField, showArchived]);

  if (loading) return <LoadingState message="Loading your dogs..." />;
  if (error) return <ErrorState message={error} />;
  if (!kennel) {
    return (
      <EmptyState
        icon={PawPrint}
        title="No kennel set up"
        description="Create a kennel first before adding dogs."
        action={<Link to="/app" className="btn-primary">Set up kennel</Link>}
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="My Dogs"
        subtitle={`${dogs.length} ${dogs.length === 1 ? "dog" : "dogs"} in ${kennel.name}`}
        action={
          <Link to="/app/dogs/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Dog
          </Link>
        }
      />

      {/* Filters bar */}
      <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-neutral-100">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, breed, microchip..."
              className="input-field pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sexFilter}
              onChange={(e) => setSexFilter(e.target.value)}
              className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-neutral-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Sexes</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-neutral-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deceased">Deceased</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-neutral-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="created_at">Newest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="date_of_birth">Age (Youngest)</option>
            </select>

            <div className="flex items-center rounded-xl ring-1 ring-inset ring-neutral-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-l-xl px-3 py-2.5 transition-colors ${
                  viewMode === "grid" ? "bg-primary-50 text-primary-600" : "text-neutral-400 hover:text-neutral-700"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-r-xl px-3 py-2.5 transition-colors ${
                  viewMode === "list" ? "bg-primary-50 text-primary-600" : "text-neutral-400 hover:text-neutral-700"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary filters */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[
            { label: "For Sale", value: saleFilter, setter: setSaleFilter, yes: "yes", no: "no" },
            { label: "For Breeding", value: breedingFilter, setter: setBreedingFilter, yes: "yes", no: "no" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-1">
              <span className="text-xs font-medium text-neutral-500">{f.label}:</span>
              <button
                onClick={() => f.setter(f.value === f.yes ? "all" : f.yes)}
                className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                  f.value === f.yes ? "bg-success-50 text-success-600" : "text-neutral-400 hover:bg-neutral-100"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => f.setter(f.value === f.no ? "all" : f.no)}
                className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                  f.value === f.no ? "bg-neutral-100 text-neutral-600" : "text-neutral-400 hover:bg-neutral-100"
                }`}
              >
                No
              </button>
            </div>
          ))}
          <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            Show archived
          </label>
        </div>
      </div>

      {/* Results */}
      {filteredDogs.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title={dogs.length === 0 ? "No dogs yet" : "No dogs match your filters"}
          description={
            dogs.length === 0
              ? "Add your first dog to start building your kennel records."
              : "Try adjusting your search or filters."
          }
          action={
            dogs.length === 0 ? (
              <Link to="/app/dogs/new" className="btn-primary">
                <Plus className="h-4 w-4" />
                Add Your First Dog
              </Link>
            ) : undefined
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-neutral-100">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Name</th>
                <th className="hidden px-4 py-3 sm:table-cell">Breed</th>
                <th className="hidden px-4 py-3 md:table-cell">Age</th>
                <th className="hidden px-4 py-3 lg:table-cell">Status</th>
                <th className="px-4 py-3">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredDogs.map((dog) => (
                <tr key={dog.id} className="transition-colors hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link to={`/app/dogs/${dog.id}`} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                        {dog.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">{dog.name}</p>
                        {dog.call_name && <p className="truncate text-xs text-neutral-500">"{dog.call_name}"</p>}
                      </div>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="text-sm text-neutral-600">{dog.breed}</span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-sm text-neutral-600">{calculateAge(dog.date_of_birth)}</span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      dog.status === "active" ? "bg-success-50 text-success-600" :
                      dog.status === "deceased" ? "bg-neutral-100 text-neutral-500" :
                      "bg-neutral-100 text-neutral-600"
                    }`}>
                      {dog.status ?? "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {dog.available_for_sale && (
                        <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600">Sale</span>
                      )}
                      {dog.available_for_breeding && (
                        <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-600">Breeding</span>
                      )}
                      {dog.is_archived && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                          <Archive className="inline h-3 w-3" /> Archived
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DogCard({ dog }: { dog: Dog }) {
  return (
    <Link
      to={`/app/dogs/${dog.id}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-neutral-100 transition-all duration-200 hover:shadow-card hover:-translate-y-1"
    >
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        {dog.profile_photo_url ? (
          <img src={dog.profile_photo_url} alt={dog.name} className="h-full w-full object-cover" />
        ) : (
          <PawPrint className="h-12 w-12 text-primary-300" />
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {dog.available_for_sale && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-success-600 backdrop-blur">
              <Store className="inline h-3 w-3" /> For Sale
            </span>
          )}
          {dog.available_for_breeding && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-accent-600 backdrop-blur">
              <Heart className="inline h-3 w-3" /> Breeding
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900">{dog.name}</h3>
        {dog.call_name && <p className="text-xs text-neutral-500">"{dog.call_name}"</p>}
        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
          <span>{dog.breed}</span>
          {dog.sex && <span>&middot; {dog.sex}</span>}
          <span>&middot; {calculateAge(dog.date_of_birth)}</span>
        </div>
      </div>
    </Link>
  );
}
