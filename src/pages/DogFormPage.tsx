import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader as Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchKennel, fetchDog, createDog, updateDog } from "../lib/api";
import { LoadingState, ErrorState } from "../components/ui/States";
import type { Kennel, Dog, DogStatus } from "../types/database";

interface DogFormData {
  name: string;
  call_name: string;
  breed: string;
  breed_secondary: string;
  sex: string;
  date_of_birth: string;
  estimated_age: string;
  color: string;
  markings: string;
  weight_kg: string;
  height_cm: string;
  microchip_number: string;
  registration_number: string;
  pedigree_info: string;
  status: DogStatus;
  available_for_sale: boolean;
  available_for_breeding: boolean;
  sale_price: string;
  breeding_fee: string;
  is_public: boolean;
  bio: string;
  acquisition_date: string;
  acquisition_source: string;
  temperament_notes: string;
  training_notes: string;
  socialisation_notes: string;
  internal_notes: string;
}

const defaultForm: DogFormData = {
  name: "",
  call_name: "",
  breed: "",
  breed_secondary: "",
  sex: "",
  date_of_birth: "",
  estimated_age: "",
  color: "",
  markings: "",
  weight_kg: "",
  height_cm: "",
  microchip_number: "",
  registration_number: "",
  pedigree_info: "",
  status: "active",
  available_for_sale: false,
  available_for_breeding: false,
  sale_price: "",
  breeding_fee: "",
  is_public: true,
  bio: "",
  acquisition_date: "",
  acquisition_source: "",
  temperament_notes: "",
  training_notes: "",
  socialisation_notes: "",
  internal_notes: "",
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-4 py-3 cursor-pointer">
      <div>
        <span className="text-sm font-medium text-neutral-800">{label}</span>
        {description && <p className="text-xs text-neutral-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary-600" : "bg-neutral-300"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export function DogFormPage() {
  const { dogId } = useParams<{ dogId: string }>();
  const isEdit = Boolean(dogId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [kennel, setKennel] = useState<Kennel | null>(null);
  const [form, setForm] = useState<DogFormData>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const k = await fetchKennel(user.id);
        if (!k) {
          setError("No kennel found. Create a kennel first.");
          setLoading(false);
          return;
        }
        setKennel(k);

        if (dogId) {
          const dog = await fetchDog(dogId);
          if (dog) {
            setForm({
              name: dog.name,
              call_name: dog.call_name ?? "",
              breed: dog.breed,
              breed_secondary: dog.breed_secondary ?? "",
              sex: dog.sex ?? "",
              date_of_birth: dog.date_of_birth ?? "",
              estimated_age: dog.estimated_age ?? "",
              color: dog.color ?? "",
              markings: dog.markings ?? "",
              weight_kg: dog.weight_kg?.toString() ?? "",
              height_cm: dog.height_cm?.toString() ?? "",
              microchip_number: dog.microchip_number ?? "",
              registration_number: dog.registration_number ?? "",
              pedigree_info: dog.pedigree_info ?? "",
              status: (dog.status ?? "active") as DogStatus,
              available_for_sale: dog.available_for_sale,
              available_for_breeding: dog.available_for_breeding,
              sale_price: dog.sale_price?.toString() ?? "",
              breeding_fee: dog.breeding_fee?.toString() ?? "",
              is_public: dog.is_public,
              bio: dog.bio ?? "",
              acquisition_date: dog.acquisition_date ?? "",
              acquisition_source: dog.acquisition_source ?? "",
              temperament_notes: dog.temperament_notes ?? "",
              training_notes: dog.training_notes ?? "",
              socialisation_notes: dog.socialisation_notes ?? "",
              internal_notes: dog.internal_notes ?? "",
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, dogId]);

  function update<K extends keyof DogFormData>(key: K, value: DogFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!kennel) return;
    if (!form.name.trim() || !form.breed.trim()) {
      setError("Name and breed are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Partial<Dog> = {
      kennel_id: kennel.id,
      name: form.name.trim(),
      call_name: form.call_name.trim() || null,
      breed: form.breed.trim(),
      breed_secondary: form.breed_secondary.trim() || null,
      sex: (form.sex as "male" | "female") || null,
      date_of_birth: form.date_of_birth || null,
      estimated_age: form.estimated_age.trim() || null,
      color: form.color.trim() || null,
      markings: form.markings.trim() || null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      microchip_number: form.microchip_number.trim() || null,
      registration_number: form.registration_number.trim() || null,
      pedigree_info: form.pedigree_info.trim() || null,
      status: form.status,
      available_for_sale: form.available_for_sale,
      available_for_breeding: form.available_for_breeding,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      breeding_fee: form.breeding_fee ? parseFloat(form.breeding_fee) : null,
      is_public: form.is_public,
      bio: form.bio.trim() || null,
      acquisition_date: form.acquisition_date || null,
      acquisition_source: form.acquisition_source.trim() || null,
      temperament_notes: form.temperament_notes.trim() || null,
      training_notes: form.training_notes.trim() || null,
      socialisation_notes: form.socialisation_notes.trim() || null,
      internal_notes: form.internal_notes.trim() || null,
    };

    try {
      if (isEdit && dogId) {
        await updateDog(dogId, payload);
        navigate(`/app/dogs/${dogId}`);
      } else {
        const dog = await createDog(payload as Partial<Dog> & { kennel_id: string; name: string; breed: string });
        navigate(`/app/dogs/${dog.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save dog");
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Loading dog form..." />;
  if (error && !kennel) return <ErrorState message={error} />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to={isEdit ? `/app/dogs/${dogId}` : "/app/dogs"}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {isEdit ? "Edit Dog" : "Add New Dog"}
          </h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {isEdit ? "Update the dog's profile information" : "Register a new dog in your kennel"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 ring-1 ring-error-100">
            {error}
          </div>
        )}

        <FormSection title="Identification">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Registered Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="input-field"
                placeholder="Official registered name"
              />
            </div>
            <div>
              <label className="label">Call Name</label>
              <input
                type="text"
                value={form.call_name}
                onChange={(e) => update("call_name", e.target.value)}
                className="input-field"
                placeholder="Everyday name"
              />
            </div>
            <div>
              <label className="label">Breed *</label>
              <input
                type="text"
                required
                value={form.breed}
                onChange={(e) => update("breed", e.target.value)}
                className="input-field"
                placeholder="e.g., Labrador Retriever"
              />
            </div>
            <div>
              <label className="label">Secondary Breed (if mixed)</label>
              <input
                type="text"
                value={form.breed_secondary}
                onChange={(e) => update("breed_secondary", e.target.value)}
                className="input-field"
                placeholder="e.g., Poodle"
              />
            </div>
            <div>
              <label className="label">Sex</label>
              <select
                value={form.sex}
                onChange={(e) => update("sex", e.target.value)}
                className="input-field"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => update("date_of_birth", e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Estimated Age (if DOB unknown)</label>
              <input
                type="text"
                value={form.estimated_age}
                onChange={(e) => update("estimated_age", e.target.value)}
                className="input-field"
                placeholder="e.g., ~3 years"
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as DogStatus)}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deceased">Deceased</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection title="Physical Characteristics">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Coat Colour</label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => update("color", e.target.value)}
                className="input-field"
                placeholder="e.g., Golden"
              />
            </div>
            <div>
              <label className="label">Distinctive Markings</label>
              <input
                type="text"
                value={form.markings}
                onChange={(e) => update("markings", e.target.value)}
                className="input-field"
                placeholder="e.g., White blaze on chest"
              />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.weight_kg}
                onChange={(e) => update("weight_kg", e.target.value)}
                className="input-field"
                placeholder="e.g., 25.5"
              />
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={form.height_cm}
                onChange={(e) => update("height_cm", e.target.value)}
                className="input-field"
                placeholder="e.g., 58"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Identification & Registration">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Microchip Number</label>
              <input
                type="text"
                value={form.microchip_number}
                onChange={(e) => update("microchip_number", e.target.value)}
                className="input-field"
                placeholder="e.g., 985112003456789"
              />
            </div>
            <div>
              <label className="label">Registration Number</label>
              <input
                type="text"
                value={form.registration_number}
                onChange={(e) => update("registration_number", e.target.value)}
                className="input-field"
                placeholder="e.g., KC-12345"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Pedigree Information</label>
              <textarea
                value={form.pedigree_info}
                onChange={(e) => update("pedigree_info", e.target.value)}
                className="input-field min-h-[80px] resize-y"
                placeholder="Lineage, champion lines, certifications..."
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Ownership & Background">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Acquisition Date</label>
              <input
                type="date"
                value={form.acquisition_date}
                onChange={(e) => update("acquisition_date", e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Acquisition Source</label>
              <input
                type="text"
                value={form.acquisition_source}
                onChange={(e) => update("acquisition_source", e.target.value)}
                className="input-field"
                placeholder="e.g., Breeder name, rescue"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Temperament & Training">
          <div className="space-y-4">
            <div>
              <label className="label">Temperament Notes</label>
              <textarea
                value={form.temperament_notes}
                onChange={(e) => update("temperament_notes", e.target.value)}
                className="input-field min-h-[80px] resize-y"
                placeholder="Personality, behavior traits..."
              />
            </div>
            <div>
              <label className="label">Training Notes</label>
              <textarea
                value={form.training_notes}
                onChange={(e) => update("training_notes", e.target.value)}
                className="input-field min-h-[80px] resize-y"
                placeholder="Training level, commands known..."
              />
            </div>
            <div>
              <label className="label">Socialisation Notes</label>
              <textarea
                value={form.socialisation_notes}
                onChange={(e) => update("socialisation_notes", e.target.value)}
                className="input-field min-h-[80px] resize-y"
                placeholder="Socialization with dogs, people, environments..."
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Availability & Visibility">
          <div className="space-y-3">
            <Toggle
              label="Available for Sale"
              description="Mark this dog as available for purchase"
              checked={form.available_for_sale}
              onChange={(v) => update("available_for_sale", v)}
            />
            {form.available_for_sale && (
              <div className="pl-4">
                <label className="label">Sale Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.sale_price}
                  onChange={(e) => update("sale_price", e.target.value)}
                  className="input-field"
                  placeholder="e.g., 2500"
                />
              </div>
            )}
            <Toggle
              label="Available for Breeding"
              description="Mark this dog as available for breeding/stud services"
              checked={form.available_for_breeding}
              onChange={(v) => update("available_for_breeding", v)}
            />
            {form.available_for_breeding && (
              <div className="pl-4">
                <label className="label">Breeding/Stud Fee</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.breeding_fee}
                  onChange={(e) => update("breeding_fee", e.target.value)}
                  className="input-field"
                  placeholder="e.g., 1000"
                />
              </div>
            )}
            <Toggle
              label="Public Profile Visible"
              description="Allow this dog's profile to be viewed publicly"
              checked={form.is_public}
              onChange={(v) => update("is_public", v)}
            />
          </div>
        </FormSection>

        <FormSection title="Description & Notes">
          <div className="space-y-4">
            <div>
              <label className="label">Bio / Description</label>
              <textarea
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                className="input-field min-h-[100px] resize-y"
                placeholder="Public description of this dog..."
              />
            </div>
            <div>
              <label className="label">Internal Notes (private)</label>
              <textarea
                value={form.internal_notes}
                onChange={(e) => update("internal_notes", e.target.value)}
                className="input-field min-h-[80px] resize-y"
                placeholder="Private notes for your reference only..."
              />
            </div>
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3">
          <Link to={isEdit ? `/app/dogs/${dogId}` : "/app/dogs"} className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEdit ? "Save Changes" : "Create Dog"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
