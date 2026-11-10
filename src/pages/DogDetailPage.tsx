import { useEffect, useState, useRef, type FormEvent } from "react";
import { Plus, Trash2, Star, Upload, X, Loader as Loader2, Camera, Stethoscope, Baby, PawPrint, Pencil, ArrowLeft, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Syringe, Pill, Activity, Calendar, Video } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchDog,
  fetchDogPhotos,
  uploadDogPhoto,
  setPrimaryPhoto,
  deleteDogPhoto,
  fetchDogVideos,
  uploadDogVideo,
  deleteDogVideo,
  fetchHealthRecords,
  createHealthRecord,
  deleteHealthRecord,
  fetchBreedingRecords,
  createBreedingRecord,
  deleteBreedingRecord,
} from "../lib/api";
import { LoadingState, ErrorState, EmptyState, ConfirmDialog } from "../components/ui/States";
import type { Dog, DogPhoto, DogVideo, HealthRecord, BreedingRecord, HealthRecordType, BreedingRecordType } from "../types/database";

function calculateAge(dob: string | null): string {
  if (!dob) return "Unknown";
  const birth = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;
  if (totalMonths < 0) return "Unknown";
  if (totalMonths < 12) return `${totalMonths} months`;
  return `${years} yr ${months} mo`;
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

type Tab = "overview" | "photos" | "videos" | "health" | "breeding";

const healthTypeLabels: Record<HealthRecordType, string> = {
  vaccination: "Vaccination",
  medication: "Medication",
  illness: "Illness",
  vet_visit: "Vet Visit",
  test_result: "Test Result",
  allergy: "Allergy",
  deworming: "Deworming",
  weight: "Weight",
  other: "Other",
};

const healthTypeIcons: Record<HealthRecordType, typeof Syringe> = {
  vaccination: Syringe,
  medication: Pill,
  illness: Activity,
  vet_visit: Stethoscope,
  test_result: Activity,
  allergy: AlertCircle,
  deworming: Pill,
  weight: Activity,
  other: Stethoscope,
};

export function DogDetailPage() {
  const { dogId } = useParams<{ dogId: string }>();
  const [dog, setDog] = useState<Dog | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dogId) return;
    (async () => {
      try {
        const d = await fetchDog(dogId);
        if (!d) {
          setError("Dog not found.");
          return;
        }
        setDog(d);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dog");
      } finally {
        setLoading(false);
      }
    })();
  }, [dogId]);

  if (loading) return <LoadingState message="Loading dog profile..." />;
  if (error) return <ErrorState message={error} />;
  if (!dog) return <ErrorState message="Dog not found." />;

  const tabs: { id: Tab; label: string; icon: typeof PawPrint }[] = [
    { id: "overview", label: "Overview", icon: PawPrint },
    { id: "photos", label: "Photos", icon: Camera },
    { id: "videos", label: "Videos", icon: Video },
    { id: "health", label: "Health", icon: Stethoscope },
    { id: "breeding", label: "Breeding", icon: Baby },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/dogs" className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 truncate">{dog.name}</h1>
          <p className="mt-0.5 text-sm text-neutral-500 truncate">
            {dog.call_name ? `"${dog.call_name}" · ` : ""}{dog.breed}{dog.sex ? ` · ${dog.sex}` : ""} · {calculateAge(dog.date_of_birth)}
          </p>
        </div>
        <Link to={`/app/dogs/${dog.id}/edit`} className="btn-secondary">
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab dog={dog} />}
      {activeTab === "photos" && dogId && <PhotosTab dogId={dogId} />}
      {activeTab === "videos" && dogId && <VideosTab dogId={dogId} />}
      {activeTab === "health" && dogId && <HealthTab dogId={dogId} />}
      {activeTab === "breeding" && dogId && <BreedingTab dogId={dogId} />}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 py-2 border-b border-neutral-50 last:border-0">
      <dt className="w-40 shrink-0 text-sm text-neutral-500">{label}</dt>
      <dd className="text-sm text-neutral-900">{value || "—"}</dd>
    </div>
  );
}

function OverviewTab({ dog }: { dog: Dog }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-900">Identification</h2>
          <dl className="mt-3">
            <InfoRow label="Registered Name" value={dog.name} />
            <InfoRow label="Call Name" value={dog.call_name} />
            <InfoRow label="Breed" value={dog.breed_secondary ? `${dog.breed} / ${dog.breed_secondary}` : dog.breed} />
            <InfoRow label="Sex" value={dog.sex} />
            <InfoRow label="Date of Birth" value={dog.date_of_birth ? new Date(dog.date_of_birth).toLocaleDateString() : null} />
            <InfoRow label="Estimated Age" value={dog.estimated_age} />
            <InfoRow label="Coat Colour" value={dog.color} />
            <InfoRow label="Markings" value={dog.markings} />
            <InfoRow label="Weight" value={dog.weight_kg ? `${dog.weight_kg} kg` : null} />
            <InfoRow label="Height" value={dog.height_cm ? `${dog.height_cm} cm` : null} />
          </dl>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-neutral-900">Status</h2>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Status</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  dog.status === "active" ? "bg-success-50 text-success-600" :
                  dog.status === "deceased" ? "bg-neutral-100 text-neutral-500" :
                  "bg-neutral-100 text-neutral-600"
                }`}>
                  {dog.status ?? "active"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Available for Sale</span>
                <span className={`text-sm font-medium ${dog.available_for_sale ? "text-success-600" : "text-neutral-400"}`}>
                  {dog.available_for_sale ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Available for Breeding</span>
                <span className={`text-sm font-medium ${dog.available_for_breeding ? "text-accent-600" : "text-neutral-400"}`}>
                  {dog.available_for_breeding ? "Yes" : "No"}
                </span>
              </div>
              {dog.sale_price != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Sale Price</span>
                  <span className="text-sm font-semibold text-neutral-900">${dog.sale_price}</span>
                </div>
              )}
              {dog.breeding_fee != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Breeding Fee</span>
                  <span className="text-sm font-semibold text-neutral-900">${dog.breeding_fee}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Public Profile</span>
                <span className={`text-sm font-medium ${dog.is_public ? "text-primary-600" : "text-neutral-400"}`}>
                  {dog.is_public ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-neutral-900">Registration</h2>
            <dl className="mt-3">
              <InfoRow label="Microchip" value={dog.microchip_number} />
              <InfoRow label="Reg. Number" value={dog.registration_number} />
            </dl>
          </div>
        </div>
      </div>

      {(dog.bio || dog.temperament_notes || dog.training_notes || dog.socialisation_notes || dog.pedigree_info || dog.acquisition_source || dog.internal_notes) && (
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900">Background & Notes</h2>
          <dl className="mt-3">
            {dog.bio && <InfoRow label="Bio" value={dog.bio} />}
            {dog.pedigree_info && <InfoRow label="Pedigree" value={dog.pedigree_info} />}
            {dog.acquisition_date && <InfoRow label="Acquired" value={new Date(dog.acquisition_date).toLocaleDateString()} />}
            {dog.acquisition_source && <InfoRow label="Source" value={dog.acquisition_source} />}
            {dog.temperament_notes && <InfoRow label="Temperament" value={dog.temperament_notes} />}
            {dog.training_notes && <InfoRow label="Training" value={dog.training_notes} />}
            {dog.socialisation_notes && <InfoRow label="Socialisation" value={dog.socialisation_notes} />}
            {dog.internal_notes && <InfoRow label="Internal Notes" value={dog.internal_notes} />}
          </dl>
        </div>
      )}
    </div>
  );
}

function PhotosTab({ dogId }: { dogId: string }) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<DogPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DogPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPhotos();
  }, [dogId]);

  async function loadPhotos() {
    try {
      const p = await fetchDogPhotos(dogId);
      setPhotos(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !user) return;

    const validFiles = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError("Each file must be under 5MB.");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setError(null);
    setUploading(true);

    try {
      for (const file of validFiles) {
        await uploadDogPhoto(user.id, dogId, file);
      }
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSetPrimary(photoId: string) {
    try {
      await setPrimaryPhoto(dogId, photoId);
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set primary photo");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDogPhoto(deleteTarget);
      setDeleteTarget(null);
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    }
  }

  if (loading) return <LoadingState message="Loading photos..." />;

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 ring-1 ring-error-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          id="photo-upload"
        />
        <label htmlFor="photo-upload" className="btn-primary cursor-pointer">
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Photos
            </>
          )}
        </label>
        <span className="text-sm text-neutral-400">JPG, PNG, WebP up to 5MB each</span>
      </div>

      {photos.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No photos yet"
          description="Upload photos to build a gallery for this dog. The first photo or your selected primary photo will be used as the profile image."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-neutral-100"
            >
              <img
                src={photo.url}
                alt="Dog photo"
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-neutral-900/0 opacity-0 transition-all duration-200 group-hover:bg-neutral-900/40 group-hover:opacity-100">
                {!photo.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(photo.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-soft transition-colors hover:bg-primary-50 hover:text-primary-600"
                    title="Set as primary"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(photo)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-soft transition-colors hover:bg-error-50 hover:text-error-600"
                  title="Delete photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {photo.is_primary && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary-600 px-2.5 py-1 text-xs font-medium text-white">
                  <Star className="h-3 w-3 fill-white" />
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function VideosTab({ dogId }: { dogId: string }) {
  const { user } = useAuth();
  const [videos, setVideos] = useState<DogVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DogVideo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVideos();
  }, [dogId]);

  async function loadVideos() {
    try {
      const v = await fetchDogVideos(dogId);
      setVideos(v);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !user) return;

    const validFiles = Array.from(files).filter((f) => {
      if (!f.type.startsWith("video/")) {
        setError("Only video files are allowed.");
        return false;
      }
      if (f.size > 50 * 1024 * 1024) {
        setError("Each video must be under 50MB.");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setError(null);
    setUploading(true);

    try {
      for (const file of validFiles) {
        await uploadDogVideo(user.id, dogId, file);
      }
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDogVideo(deleteTarget);
      setDeleteTarget(null);
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete video");
    }
  }

  if (loading) return <LoadingState message="Loading videos..." />;

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 ring-1 ring-error-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          id="video-upload"
        />
        <label htmlFor="video-upload" className="btn-primary cursor-pointer">
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Videos
            </>
          )}
        </label>
        <span className="text-sm text-neutral-400">
          MP4, WebM up to 50MB each · {videos.length} video{videos.length !== 1 ? "s" : ""} uploaded
        </span>
      </div>

      {videos.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No videos yet"
          description="Upload videos to showcase this dog's personality and movement. You can add up to 3 or more videos per dog."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-neutral-100"
            >
              <video
                src={video.url}
                controls
                className="aspect-video w-full object-cover"
              />
              {video.title && (
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-neutral-700">{video.title}</p>
                </div>
              )}
              <button
                onClick={() => setDeleteTarget(video)}
                className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-soft opacity-0 transition-all duration-200 hover:bg-error-50 hover:text-error-600 group-hover:opacity-100"
                title="Delete video"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Video"
        message="Are you sure you want to delete this video? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function HealthTab({ dogId }: { dogId: string }) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HealthRecord | null>(null);

  useEffect(() => {
    loadRecords();
  }, [dogId]);

  async function loadRecords() {
    try {
      const r = await fetchHealthRecords(dogId);
      setRecords(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load health records");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: Partial<HealthRecord> & { record_type: string; title: string }) {
    try {
      await createHealthRecord({ ...data, dog_id: dogId });
      setShowForm(false);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add record");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteHealthRecord(deleteTarget.id);
      setDeleteTarget(null);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
    }
  }

  if (loading) return <LoadingState message="Loading health records..." />;

  const upcoming = records.filter((r) => r.next_due_date && !isOverdue(r.next_due_date));
  const overdue = records.filter((r) => r.next_due_date && isOverdue(r.next_due_date));
  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 ring-1 ring-error-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Health Records</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Record
        </button>
      </div>

      {overdue.length > 0 && (
        <div className="rounded-xl bg-error-50 px-4 py-3 ring-1 ring-error-100">
          <div className="flex items-center gap-2 text-sm font-medium text-error-700">
            <AlertCircle className="h-4 w-4" />
            {overdue.length} overdue {overdue.length === 1 ? "item" : "items"}
          </div>
          <div className="mt-2 space-y-1">
            {overdue.map((r) => (
              <p key={r.id} className="text-xs text-error-600">
                {r.title} — was due {new Date(r.next_due_date!).toLocaleDateString()}
              </p>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="rounded-xl bg-primary-50 px-4 py-3 ring-1 ring-primary-100">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
            <Calendar className="h-4 w-4" />
            {upcoming.length} upcoming {upcoming.length === 1 ? "item" : "items"}
          </div>
          <div className="mt-2 space-y-1">
            {upcoming.map((r) => (
              <p key={r.id} className="text-xs text-primary-600">
                {r.title} — due {new Date(r.next_due_date!).toLocaleDateString()}
              </p>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <HealthRecordForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {sorted.length === 0 && !showForm ? (
        <EmptyState
          icon={Stethoscope}
          title="No health records"
          description="Track vaccinations, medications, vet visits, and more for this dog."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Add First Record
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((record) => {
            const Icon = healthTypeIcons[record.record_type] ?? Stethoscope;
            return (
              <div key={record.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-neutral-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-900">{record.title}</p>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                      {healthTypeLabels[record.record_type]}
                    </span>
                    {record.is_resolved && (
                      <span className="flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600">
                        <CheckCircle className="h-3 w-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {new Date(record.date).toLocaleDateString()}
                    {record.veterinarian ? ` · ${record.veterinarian}` : ""}
                    {record.next_due_date ? ` · Next due: ${new Date(record.next_due_date).toLocaleDateString()}` : ""}
                  </p>
                  {record.details && <p className="mt-1 text-sm text-neutral-600">{record.details}</p>}
                  {record.dosage && <p className="mt-0.5 text-xs text-neutral-500">Dosage: {record.dosage}</p>}
                  {record.result && <p className="mt-0.5 text-xs text-neutral-500">Result: {record.result}</p>}
                </div>
                <button
                  onClick={() => setDeleteTarget(record)}
                  className="shrink-0 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Record"
        message="Are you sure you want to delete this health record? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function HealthRecordForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Partial<HealthRecord> & { record_type: string; title: string }) => void;
  onCancel: () => void;
}) {
  const [recordType, setRecordType] = useState<HealthRecordType>("vaccination");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [nextDueDate, setNextDueDate] = useState("");
  const [veterinarian, setVeterinarian] = useState("");
  const [details, setDetails] = useState("");
  const [dosage, setDosage] = useState("");
  const [result, setResult] = useState("");
  const [isResolved, setIsResolved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      record_type: recordType,
      title: title.trim(),
      date,
      next_due_date: nextDueDate || null,
      veterinarian: veterinarian.trim() || null,
      details: details.trim() || null,
      dosage: dosage.trim() || null,
      result: result.trim() || null,
      is_resolved: isResolved,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">New Health Record</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Record Type</label>
          <select value={recordType} onChange={(e) => setRecordType(e.target.value as HealthRecordType)} className="input-field">
            {Object.entries(healthTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Title *</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g., Rabies Vaccination" />
        </div>
        <div>
          <label className="label">Date *</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label">Next Due Date</label>
          <input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label">Veterinarian</label>
          <input type="text" value={veterinarian} onChange={(e) => setVeterinarian(e.target.value)} className="input-field" placeholder="Dr. Smith" />
        </div>
        <div>
          <label className="label">Dosage</label>
          <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} className="input-field" placeholder="e.g., 1 tablet twice daily" />
        </div>
      </div>
      <div>
        <label className="label">Details / Notes</label>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Symptoms, diagnosis, instructions..." />
      </div>
      <div>
        <label className="label">Result</label>
        <input type="text" value={result} onChange={(e) => setResult(e.target.value)} className="input-field" placeholder="Test result or outcome" />
      </div>
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" checked={isResolved} onChange={(e) => setIsResolved(e.target.checked)} className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
        Mark as resolved
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Save Record</button>
      </div>
    </form>
  );
}

function BreedingTab({ dogId }: { dogId: string }) {
  const [records, setRecords] = useState<BreedingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BreedingRecord | null>(null);

  useEffect(() => {
    loadRecords();
  }, [dogId]);

  async function loadRecords() {
    try {
      const r = await fetchBreedingRecords(dogId);
      setRecords(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load breeding records");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: Partial<BreedingRecord> & { record_type: string }) {
    try {
      await createBreedingRecord({ ...data, dog_id: dogId });
      setShowForm(false);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add record");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteBreedingRecord(deleteTarget.id);
      setDeleteTarget(null);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
    }
  }

  if (loading) return <LoadingState message="Loading breeding records..." />;

  const statusLabels: Record<string, string> = {
    observed: "Observed",
    planned: "Planned",
    mated: "Mated",
    confirmed_pregnant: "Confirmed Pregnant",
    whelped: "Whelped",
    unsuccessful: "Unsuccessful",
  };

  const statusColors: Record<string, string> = {
    observed: "bg-neutral-100 text-neutral-600",
    planned: "bg-primary-50 text-primary-600",
    mated: "bg-accent-50 text-accent-600",
    confirmed_pregnant: "bg-success-50 text-success-600",
    whelped: "bg-success-50 text-success-600",
    unsuccessful: "bg-error-50 text-error-600",
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 ring-1 ring-error-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Breeding History</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Record
        </button>
      </div>

      {showForm && (
        <BreedingRecordForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {records.length === 0 && !showForm ? (
        <EmptyState
          icon={Baby}
          title="No breeding records"
          description="Track heat cycles, matings, and pregnancies for this dog."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Add First Record
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div key={record.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-neutral-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <Baby className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-neutral-900 capitalize">
                    {record.record_type.replace("_", " ")}
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[record.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {statusLabels[record.status] ?? record.status}
                  </span>
                  {record.veterinary_confirmation && (
                    <span className="flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600">
                      <CheckCircle className="h-3 w-3" /> Vet Confirmed
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {new Date(record.record_date).toLocaleDateString()}
                  {record.expected_whelping_date ? ` · Expected whelping: ${new Date(record.expected_whelping_date).toLocaleDateString()}` : ""}
                  {record.actual_whelping_date ? ` · Whelped: ${new Date(record.actual_whelping_date).toLocaleDateString()}` : ""}
                </p>
                {record.notes && <p className="mt-1 text-sm text-neutral-600">{record.notes}</p>}
              </div>
              <button
                onClick={() => setDeleteTarget(record)}
                className="shrink-0 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Record"
        message="Are you sure you want to delete this breeding record? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function BreedingRecordForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Partial<BreedingRecord> & { record_type: string }) => void;
  onCancel: () => void;
}) {
  const [recordType, setRecordType] = useState<BreedingRecordType>("heat_cycle");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("observed");
  const [expectedWhelping, setExpectedWhelping] = useState("");
  const [actualWhelping, setActualWhelping] = useState("");
  const [vetConfirmed, setVetConfirmed] = useState(false);
  const [notes, setNotes] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      record_type: recordType,
      record_date: recordDate,
      status: status as BreedingRecord["status"],
      expected_whelping_date: expectedWhelping || null,
      actual_whelping_date: actualWhelping || null,
      veterinary_confirmation: vetConfirmed,
      notes: notes.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">New Breeding Record</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Record Type</label>
          <select value={recordType} onChange={(e) => setRecordType(e.target.value as BreedingRecordType)} className="input-field">
            <option value="heat_cycle">Heat Cycle</option>
            <option value="mating">Mating</option>
            <option value="pregnancy">Pregnancy</option>
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" required value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
            <option value="observed">Observed</option>
            <option value="planned">Planned</option>
            <option value="mated">Mated</option>
            <option value="confirmed_pregnant">Confirmed Pregnant</option>
            <option value="whelped">Whelped</option>
            <option value="unsuccessful">Unsuccessful</option>
          </select>
        </div>
        <div>
          <label className="label">Expected Whelping Date</label>
          <input type="date" value={expectedWhelping} onChange={(e) => setExpectedWhelping(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label">Actual Whelping Date</label>
          <input type="date" value={actualWhelping} onChange={(e) => setActualWhelping(e.target.value)} className="input-field" />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Stud info, observations, complications..." />
      </div>
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" checked={vetConfirmed} onChange={(e) => setVetConfirmed(e.target.checked)} className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
        Veterinarian confirmed
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Save Record</button>
      </div>
    </form>
  );
}
