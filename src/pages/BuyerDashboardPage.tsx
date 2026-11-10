import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Star, MapPin, MessageSquare, Mail, Phone, ExternalLink,
  Loader as Loader2, Heart, ShoppingBag,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchBreeders, fetchConversations, upsertBreederRating } from "../lib/api";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/States";
import type { BreederWithRating, Conversation } from "../types/database";

export function BuyerDashboardPage() {
  const { user } = useAuth();
  const [breeders, setBreeders] = useState<BreederWithRating[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedBreeder, setSelectedBreeder] = useState<BreederWithRating | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [breedersData, convs] = await Promise.all([
          fetchBreeders(),
          fetchConversations(user.id),
        ]);
        setBreeders(breedersData);
        setConversations(convs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const filtered = breeders.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.full_name?.toLowerCase().includes(q) ||
      b.bio?.toLowerCase().includes(q) ||
      b.location?.toLowerCase().includes(q) ||
      b.kennel?.name?.toLowerCase().includes(q)
    );
  });

  if (loading) return <LoadingState message="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Browse Breeders</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Find reputable breeders, read reviews, and start a conversation.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{breeders.length}</p>
              <p className="text-xs text-neutral-500">Breeders</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{conversations.length}</p>
              <p className="text-xs text-neutral-500">Conversations</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {breeders.filter((b) => b.rating_count > 0).length}
              </p>
              <p className="text-xs text-neutral-500">Rated Breeders</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {breeders.filter((b) => b.kennel).length}
              </p>
              <p className="text-xs text-neutral-500">With Storefront</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
          placeholder="Search by breeder name, location, or kennel..."
        />
      </div>

      {/* Breeder grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={search ? "No breeders found" : "No breeders yet"}
          description={search ? "Try a different search term." : "Breeders will appear here once they join Paw Link."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((breeder) => (
            <BreederCard key={breeder.id} breeder={breeder} onContact={() => setSelectedBreeder(breeder)} />
          ))}
        </div>
      )}

      {selectedBreeder && (
        <ContactBreederModal
          breeder={selectedBreeder}
          buyerId={user?.id ?? ""}
          onClose={() => setSelectedBreeder(null)}
          onRated={() => {
            setSelectedBreeder(null);
            (async () => {
              const data = await fetchBreeders();
              setBreeders(data);
            })();
          }}
        />
      )}
    </div>
  );
}

function StarRating({ value, size = "sm" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-6 w-6" };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${star <= Math.round(value) ? "fill-accent-400 text-accent-400" : "text-neutral-300"}`}
        />
      ))}
    </div>
  );
}

function BreederCard({ breeder, onContact }: { breeder: BreederWithRating; onContact: () => void }) {
  const initials = (breeder.full_name || "B").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-lg font-semibold text-primary-700">
          {breeder.avatar_url ? (
            <img src={breeder.avatar_url} alt={breeder.full_name ?? "Breeder"} className="h-12 w-12 rounded-xl object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-neutral-900">{breeder.full_name ?? "Breeder"}</h3>
          {breeder.kennel?.name && <p className="truncate text-xs text-primary-600">{breeder.kennel.name}</p>}
          {breeder.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
              <MapPin className="h-3 w-3" /> {breeder.location}
            </p>
          )}
        </div>
      </div>

      {breeder.bio && <p className="text-sm text-neutral-600 line-clamp-2">{breeder.bio}</p>}

      <div className="flex items-center gap-2">
        {breeder.rating_count > 0 ? (
          <>
            <StarRating value={breeder.avg_rating} />
            <span className="text-xs font-medium text-neutral-700">{breeder.avg_rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-400">({breeder.rating_count})</span>
          </>
        ) : (
          <span className="text-xs text-neutral-400">No ratings yet</span>
        )}
      </div>

      <button onClick={onContact} className="btn-primary w-full">
        <MessageSquare className="h-4 w-4" />
        Contact Breeder
      </button>
    </div>
  );
}

function ContactBreederModal({
  breeder, buyerId, onClose, onRated,
}: {
  breeder: BreederWithRating;
  buyerId: string;
  onClose: () => void;
  onRated: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRate() {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await upsertBreederRating(breeder.id, buyerId, rating, review);
      onRated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rating");
      setSaving(false);
    }
  }

  const contactPhone = breeder.kennel?.phone;
  const contactEmail = breeder.kennel?.email;
  const externalLink = breeder.kennel?.external_link || breeder.kennel?.website;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-card">
        <div className="border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Contact {breeder.full_name ?? "Breeder"}</h2>
          {breeder.kennel?.name && <p className="text-sm text-primary-600">{breeder.kennel.name}</p>}
        </div>

        <div className="space-y-5 px-6 py-4">
          {/* In-app messaging */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">In-app messaging</h3>
            <p className="mt-1 text-xs text-neutral-500">Start a conversation and share photos & videos.</p>
            <Link to={`/app/messages/new?breeder=${breeder.id}`} className="btn-primary mt-2 w-full">
              <MessageSquare className="h-4 w-4" />
              Message in-app
            </Link>
          </div>

          {/* External contact */}
          {(contactPhone || contactEmail || externalLink) && (
            <div className="border-t border-neutral-100 pt-4">
              <h3 className="text-sm font-semibold text-neutral-900">Contact outside the app</h3>
              <div className="mt-2 space-y-2">
                {contactPhone && (
                  <a href={`tel:${contactPhone}`} className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors">
                    <Phone className="h-4 w-4 text-primary-600" /> {contactPhone}
                  </a>
                )}
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors">
                    <Mail className="h-4 w-4 text-primary-600" /> {contactEmail}
                  </a>
                )}
                {externalLink && (
                  <a href={externalLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors">
                    <ExternalLink className="h-4 w-4 text-primary-600" /> Visit website
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="border-t border-neutral-100 pt-4">
            <h3 className="text-sm font-semibold text-neutral-900">Rate this breeder</h3>
            <p className="mt-1 text-xs text-neutral-500">Share your experience to help other buyers.</p>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star className={`h-6 w-6 transition-colors ${(hoverRating || rating) >= star ? "fill-accent-400 text-accent-400" : "text-neutral-300 hover:text-accent-300"}`} />
                </button>
              ))}
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="input-field mt-3 min-h-[60px] resize-y"
              placeholder="Write a review (optional)..."
            />
            {error && <p className="mt-2 text-sm text-error-600">{error}</p>}
            <button onClick={handleRate} disabled={saving} className="btn-secondary mt-3 w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Rating"}
            </button>
          </div>
        </div>

        <div className="border-t border-neutral-100 px-6 py-3">
          <button onClick={onClose} className="btn-ghost w-full">Close</button>
        </div>
      </div>
    </div>
  );
}
