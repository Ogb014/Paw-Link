import { useEffect, useState, type FormEvent } from "react";
import { Baby, Plus, Trash2, X, CircleAlert as AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchKennel, fetchDogs, fetchLitters, createLitter, deleteLitter } from "../lib/api";
import { LoadingState, ErrorState, EmptyState, ConfirmDialog, PageHeader } from "../components/ui/States";
import type { Kennel, Dog, Litter } from "../types/database";

export function LittersPage() {
  const { user } = useAuth();
  const [kennel, setKennel] = useState<Kennel | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Litter | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const k = await fetchKennel(user.id);
        if (!k) {
          setError("No kennel found.");
          setLoading(false);
          return;
        }
        setKennel(k);
        const [d, l] = await Promise.all([fetchDogs(k.id), fetchLitters(k.id)]);
        setDogs(d);
        setLitters(l);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load litters");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function loadLitters() {
    if (!kennel) return;
    const l = await fetchLitters(kennel.id);
    setLitters(l);
  }

  async function handleCreate(data: Partial<Litter>) {
    if (!kennel) return;
    try {
      await createLitter({ ...data, kennel_id: kennel.id });
      setShowForm(false);
      await loadLitters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create litter");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteLitter(deleteTarget.id);
      setDeleteTarget(null);
      await loadLitters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete litter");
    }
  }

  if (loading) return <LoadingState message="Loading litters..." />;
  if (error && !kennel) return <ErrorState message={error} />;
  if (!kennel) return <ErrorState message="No kennel found." />;

  const femaleDogs = dogs.filter((d) => d.sex === "female" && !d.is_archived);
  const maleDogs = dogs.filter((d) => d.sex === "male" && !d.is_archived);

  function getDogName(id: string | null): string {
    if (!id) return "Unknown";
    return dogs.find((d) => d.id === id)?.name ?? "Unknown";
  }

  return (
    <div className="animate-fade-in space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 ring-1 ring-error-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <PageHeader
        title="Litters"
        subtitle={`${litters.length} ${litters.length === 1 ? "litter" : "litters"} in ${kennel.name}`}
        action={
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Litter
          </button>
        }
      />

      {showForm && (
        <LitterForm
          femaleDogs={femaleDogs}
          maleDogs={maleDogs}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {litters.length === 0 && !showForm ? (
        <EmptyState
          icon={Baby}
          title="No litters yet"
          description="Create litter records to track breedings, births, and puppy counts."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Add First Litter
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {litters.map((litter) => (
            <div key={litter.id} className="card">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-900">{litter.name || "Unnamed Litter"}</h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    Sire: {getDogName(litter.sire_id)} · Dam: {getDogName(litter.dam_id)}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteTarget(litter)}
                  className="shrink-0 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-neutral-50 px-3 py-2">
                  <p className="text-xs text-neutral-500">Puppies Born</p>
                  <p className="text-lg font-bold text-neutral-900">{litter.puppies_born}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 px-3 py-2">
                  <p className="text-xs text-neutral-500">Current Count</p>
                  <p className="text-lg font-bold text-neutral-900">{litter.puppies_alive}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-neutral-500">
                {litter.mating_date && <p>Mating: {new Date(litter.mating_date).toLocaleDateString()}</p>}
                {litter.birth_date && <p>Birth: {new Date(litter.birth_date).toLocaleDateString()}</p>}
                {litter.notes && <p className="text-neutral-600">{litter.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Litter"
        message="Are you sure you want to delete this litter record? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function LitterForm({
  femaleDogs,
  maleDogs,
  onSubmit,
  onCancel,
}: {
  femaleDogs: Dog[];
  maleDogs: Dog[];
  onSubmit: (data: Partial<Litter>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [damId, setDamId] = useState("");
  const [sireId, setSireId] = useState("");
  const [matingDate, setMatingDate] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [puppiesBorn, setPuppiesBorn] = useState("");
  const [puppiesAlive, setPuppiesAlive] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name.trim() || null,
      dam_id: damId || null,
      sire_id: sireId || null,
      mating_date: matingDate || null,
      birth_date: birthDate || null,
      puppies_born: puppiesBorn ? parseInt(puppiesBorn) : 0,
      puppies_alive: puppiesAlive ? parseInt(puppiesAlive) : 0,
      notes: notes.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">New Litter</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Litter Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g., Spring 2026 Litter" />
        </div>
        <div>
          <label className="label">Dam (Mother)</label>
          <select value={damId} onChange={(e) => setDamId(e.target.value)} className="input-field">
            <option value="">Select dam...</option>
            {femaleDogs.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Sire (Father)</label>
          <select value={sireId} onChange={(e) => setSireId(e.target.value)} className="input-field">
            <option value="">Select sire...</option>
            {maleDogs.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Mating Date</label>
          <input type="date" value={matingDate} onChange={(e) => setMatingDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label">Birth Date</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label">Puppies Born</label>
          <input type="number" min="0" value={puppiesBorn} onChange={(e) => setPuppiesBorn(e.target.value)} className="input-field" placeholder="0" />
        </div>
        <div>
          <label className="label">Current Puppy Count</label>
          <input type="number" min="0" value={puppiesAlive} onChange={(e) => setPuppiesAlive(e.target.value)} className="input-field" placeholder="0" />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Birth details, complications, observations..." />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Create Litter</button>
      </div>
    </form>
  );
}
