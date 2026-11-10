import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint, Baby, Calendar, TrendingUp,
  Plus, Settings, X, Loader as Loader2,
  Store, MessageSquare, Eye, DollarSign,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  fetchKennel, createKennel, fetchDogs, fetchLitters, fetchUpcomingCare, fetchConversations,
  fetchDashboardConfig, saveDashboardConfig,
} from "../lib/api";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/States";
import type { Kennel, Dog, Litter, HealthRecord, Conversation, DashboardWidget } from "../types/database";

const widgetDefinitions: { type: string; label: string; icon: typeof PawPrint; description: string }[] = [
  { type: "stats", label: "Kennel Stats", icon: TrendingUp, description: "Total dogs, for sale, for breeding" },
  { type: "upcoming_care", label: "Upcoming Care", icon: Calendar, description: "Health items due soon" },
  { type: "recent_dogs", label: "Recent Dogs", icon: PawPrint, description: "Recently added dogs" },
  { type: "litters", label: "Active Litters", icon: Baby, description: "Current litters overview" },
  { type: "messages", label: "Messages", icon: MessageSquare, description: "Recent conversations" },
  { type: "storefront", label: "Storefront Preview", icon: Store, description: "How buyers see your kennel" },
];

const defaultWidgets: DashboardWidget[] = [
  { id: "w1", type: "stats", visible: true, order: 0 },
  { id: "w2", type: "upcoming_care", visible: true, order: 1 },
  { id: "w3", type: "recent_dogs", visible: true, order: 2 },
  { id: "w4", type: "litters", visible: true, order: 3 },
  { id: "w5", type: "messages", visible: true, order: 4 },
  { id: "w6", type: "storefront", visible: true, order: 5 },
];

export function BreederDashboardPage() {
  const { user } = useAuth();
  const [kennel, setKennel] = useState<Kennel | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [upcomingCare, setUpcomingCare] = useState<HealthRecord[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showKennelForm, setShowKennelForm] = useState(false);
  const [savingWidgets, setSavingWidgets] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [k, config] = await Promise.all([
          fetchKennel(user.id),
          fetchDashboardConfig(user.id),
        ]);
        setKennel(k);
        if (config?.widgets && config.widgets.length > 0) {
          setWidgets(config.widgets);
        }

        if (k) {
          const [d, l, care, convs] = await Promise.all([
            fetchDogs(k.id),
            fetchLitters(k.id),
            fetchUpcomingCare(k.id),
            fetchConversations(user.id),
          ]);
          setDogs(d);
          setLitters(l);
          setUpcomingCare(care);
          setConversations(convs);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function handleSaveWidgets() {
    if (!user) return;
    setSavingWidgets(true);
    try {
      await saveDashboardConfig(user.id, widgets);
      setShowCustomize(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save dashboard layout");
    } finally {
      setSavingWidgets(false);
    }
  }

  function toggleWidget(widgetId: string) {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
    );
  }

  function moveWidget(widgetId: string, direction: "up" | "down") {
    setWidgets((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((w) => w.id === widgetId);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      [sorted[idx].order, sorted[swapIdx].order] = [sorted[swapIdx].order, sorted[idx].order];
      return sorted;
    });
  }

  async function handleCreateKennel(name: string, location: string) {
    if (!user) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `kennel-${Date.now()}`;
    const k = await createKennel({ owner_id: user.id, name, slug, location: location || undefined });
    setKennel(k);
    setShowKennelForm(false);
    const [d, l] = await Promise.all([fetchDogs(k.id), fetchLitters(k.id)]);
    setDogs(d);
    setLitters(l);
  }

  if (loading) return <LoadingState message="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} />;

  if (!kennel) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Welcome to your breeder dashboard!</h1>
        {showKennelForm ? (
          <KennelSetupForm onSubmit={handleCreateKennel} onCancel={() => setShowKennelForm(false)} />
        ) : (
          <EmptyState
            icon={PawPrint}
            title="Set up your kennel"
            description="Create your kennel profile to start adding dogs, managing litters, and connecting with buyers."
            action={
              <button onClick={() => setShowKennelForm(true)} className="btn-primary">
                <Plus className="h-4 w-4" />
                Create Kennel
              </button>
            }
          />
        )}
      </div>
    );
  }

  const visibleWidgets = widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order);
  const forSale = dogs.filter((d) => d.available_for_sale && !d.is_archived);
  const forBreeding = dogs.filter((d) => d.available_for_breeding && !d.is_archived);
  const activeDogs = dogs.filter((d) => !d.is_archived);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{kennel.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {activeDogs.length} dogs · {forSale.length} for sale · {forBreeding.length} for breeding
          </p>
        </div>
        <button onClick={() => setShowCustomize(true)} className="btn-secondary">
          <Settings className="h-4 w-4" />
          Customize
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {visibleWidgets.map((widget) => {
          const def = widgetDefinitions.find((d) => d.type === widget.type);
          if (!def) return null;

          switch (widget.type) {
            case "stats":
              return (
                <div key={widget.id} className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <def.icon className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-neutral-900">Kennel Stats</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatBox label="Total Dogs" value={activeDogs.length} color="primary" />
                    <StatBox label="For Sale" value={forSale.length} color="success" />
                    <StatBox label="For Breeding" value={forBreeding.length} color="accent" />
                    <StatBox label="Litters" value={litters.length} color="secondary" />
                  </div>
                </div>
              );

            case "upcoming_care":
              return (
                <div key={widget.id} className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <def.icon className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-neutral-900">Upcoming Care</h2>
                  </div>
                  {upcomingCare.length === 0 ? (
                    <p className="text-sm text-neutral-400">No upcoming care items.</p>
                  ) : (
                    <div className="space-y-2">
                      {upcomingCare.slice(0, 5).map((r) => {
                        const overdue = r.next_due_date && new Date(r.next_due_date) < new Date();
                        return (
                          <div key={r.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                            <span className="text-sm font-medium text-neutral-700">{r.title}</span>
                            <span className={`text-xs ${overdue ? "text-error-600 font-semibold" : "text-neutral-500"}`}>
                              {r.next_due_date ? new Date(r.next_due_date).toLocaleDateString() : ""}
                              {overdue ? " · Overdue" : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );

            case "recent_dogs":
              return (
                <div key={widget.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <def.icon className="h-5 w-5 text-primary-600" />
                      <h2 className="text-lg font-semibold text-neutral-900">Recent Dogs</h2>
                    </div>
                    <Link to="/app/dogs" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
                  </div>
                  {dogs.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-neutral-400 mb-3">No dogs added yet.</p>
                      <Link to="/app/dogs/new" className="btn-primary">
                        <Plus className="h-4 w-4" />
                        Add Your First Dog
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dogs.slice(0, 4).map((dog) => (
                        <Link key={dog.id} to={`/app/dogs/${dog.id}`} className="flex items-center gap-3 rounded-lg bg-neutral-50 px-3 py-2 hover:bg-neutral-100 transition-colors">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                            <PawPrint className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-neutral-900">{dog.name}</p>
                            <p className="truncate text-xs text-neutral-500">{dog.breed}{dog.sex ? ` · ${dog.sex}` : ""}</p>
                          </div>
                          {dog.available_for_sale && <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600">For Sale</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );

            case "litters":
              return (
                <div key={widget.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <def.icon className="h-5 w-5 text-primary-600" />
                      <h2 className="text-lg font-semibold text-neutral-900">Active Litters</h2>
                    </div>
                    <Link to="/app/litters" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
                  </div>
                  {litters.length === 0 ? (
                    <p className="text-sm text-neutral-400">No litters recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {litters.slice(0, 3).map((litter) => (
                        <div key={litter.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-neutral-900">{litter.name || "Unnamed litter"}</p>
                            <p className="text-xs text-neutral-500">
                              {litter.puppies_born} born{litter.birth_date ? ` · ${new Date(litter.birth_date).toLocaleDateString()}` : ""}
                            </p>
                          </div>
                          <span className="rounded-full bg-secondary-50 px-2 py-0.5 text-xs font-medium text-secondary-600">
                            {litter.puppies_alive} alive
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );

            case "messages":
              return (
                <div key={widget.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <def.icon className="h-5 w-5 text-primary-600" />
                      <h2 className="text-lg font-semibold text-neutral-900">Messages</h2>
                    </div>
                    <Link to="/app/messages" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
                  </div>
                  {conversations.length === 0 ? (
                    <p className="text-sm text-neutral-400">No conversations yet. Buyers will appear here when they message you.</p>
                  ) : (
                    <div className="space-y-2">
                      {conversations.slice(0, 4).map((conv) => (
                        <Link key={conv.id} to={`/app/messages/${conv.id}`} className="flex items-center gap-3 rounded-lg bg-neutral-50 px-3 py-2 hover:bg-neutral-100 transition-colors">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-neutral-900">
                              {conv.buyer_id === user?.id ? "Buyer conversation" : "Buyer inquiry"}
                            </p>
                            <p className="truncate text-xs text-neutral-500">
                              {new Date(conv.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );

            case "storefront":
              return (
                <div key={widget.id} className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <def.icon className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-neutral-900">Storefront Preview</h2>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-primary-50 to-white p-4 ring-1 ring-primary-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
                        <Store className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{kennel.name}</p>
                        <p className="text-xs text-neutral-500">{kennel.location || "Location not set"}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-neutral-600">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {kennel.is_public ? "Public" : "Private"}</span>
                      <span className="flex items-center gap-1"><PawPrint className="h-3 w-3" /> {activeDogs.length} dogs</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {forSale.length} for sale</span>
                    </div>
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>

      {showCustomize && (
        <CustomizePanel
          widgets={widgets}
          onClose={() => setShowCustomize(false)}
          onToggle={toggleWidget}
          onMove={moveWidget}
          onSave={handleSaveWidgets}
          saving={savingWidgets}
        />
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: "primary" | "success" | "accent" | "secondary" }) {
  const colorClasses = {
    primary: "bg-primary-50 text-primary-700",
    success: "bg-success-50 text-success-700",
    accent: "bg-accent-50 text-accent-700",
    secondary: "bg-secondary-50 text-secondary-700",
  };
  return (
    <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}

function CustomizePanel({
  widgets, onClose, onToggle, onMove, onSave, saving,
}: {
  widgets: DashboardWidget[];
  onClose: () => void;
  onToggle: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onSave: () => void;
  saving: boolean;
}) {
  const sorted = [...widgets].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Customize Dashboard</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <p className="mb-4 text-sm text-neutral-500">Toggle widgets on or off and reorder them to fit your workflow.</p>
          <div className="space-y-2">
            {sorted.map((widget, idx) => {
              const def = widgetDefinitions.find((d) => d.type === widget.type);
              if (!def) return null;
              return (
                <div key={widget.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${widget.visible ? "border-primary-200 bg-primary-50/50" : "border-neutral-200 bg-neutral-50"}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${widget.visible ? "bg-primary-100 text-primary-600" : "bg-neutral-200 text-neutral-400"}`}>
                    <def.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900">{def.label}</p>
                    <p className="text-xs text-neutral-500">{def.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onMove(widget.id, "up")} disabled={idx === 0} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 disabled:pointer-events-none">
                      <span className="text-xs">▲</span>
                    </button>
                    <button onClick={() => onMove(widget.id, "down")} disabled={idx === sorted.length - 1} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 disabled:pointer-events-none">
                      <span className="text-xs">▼</span>
                    </button>
                  </div>
                  <button
                    onClick={() => onToggle(widget.id)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${widget.visible ? "bg-primary-600" : "bg-neutral-300"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${widget.visible ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Layout"}
          </button>
        </div>
      </div>
    </div>
  );
}

function KennelSetupForm({ onSubmit, onCancel }: { onSubmit: (name: string, location: string) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  return (
    <div className="card max-w-md">
      <h2 className="text-lg font-semibold text-neutral-900">Create your kennel</h2>
      <p className="mt-1 text-sm text-neutral-500">This is how buyers will see you on the marketplace.</p>
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSubmit(name.trim(), location.trim()); }} className="mt-4 space-y-4">
        <div>
          <label className="label">Kennel name *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g., Greenfield Kennels" />
        </div>
        <div>
          <label className="label">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" placeholder="City, State" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Create Kennel</button>
        </div>
      </form>
    </div>
  );
}


export { BreederDashboardPage }