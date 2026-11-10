import { useEffect, useState, type FormEvent } from "react";
import {
  Save, Loader as Loader2, Store, Palette, Share2,
  Phone, Mail, Globe, Facebook, Instagram, Youtube,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchKennel, updateKennel } from "../lib/api";
import { LoadingState, ErrorState } from "../components/ui/States";
import type { Kennel } from "../types/database";

const presetThemes = [
  { name: "Forest", primary: "#0d9459", secondary: "#0d9488" },
  { name: "Ocean", primary: "#0284c7", secondary: "#0e7490" },
  { name: "Sunset", primary: "#ea580c", secondary: "#db2777" },
  { name: "Royal", primary: "#4f46e5", secondary: "#7c3aed" },
  { name: "Amber", primary: "#d97706", secondary: "#0d9488" },
  { name: "Crimson", primary: "#dc2626", secondary: "#0f766e" },
];

function SettingsSection({ title, icon: Icon, children }: { title: string; icon: typeof Store; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const [kennel, setKennel] = useState<Kennel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");

  const [themePrimary, setThemePrimary] = useState("#0d9459");
  const [themeSecondary, setThemeSecondary] = useState("#0d9488");
  const [themeFont, setThemeFont] = useState("Inter");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const k = await fetchKennel(user.id);
        if (k) {
          setKennel(k);
          setName(k.name);
          setDescription(k.description ?? "");
          setLocation(k.location ?? "");
          setWebsite(k.website ?? "");
          setPhone(k.phone ?? "");
          setEmail(k.email ?? "");
          setExternalLink(k.external_link ?? "");
          setIsPublic(k.is_public);
          setSocialFacebook(k.social_facebook ?? "");
          setSocialInstagram(k.social_instagram ?? "");
          setSocialTwitter(k.social_twitter ?? "");
          setSocialYoutube(k.social_youtube ?? "");
          setSocialTiktok(k.social_tiktok ?? "");
          setThemePrimary(k.theme_primary_color ?? "#0d9459");
          setThemeSecondary(k.theme_secondary_color ?? "#0d9488");
          setThemeFont(k.theme_font ?? "Inter");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!kennel) return;
    setSaving(true);
    setError(null);
    setSavedMessage(false);

    try {
      const updated = await updateKennel(kennel.id, {
        name: name.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        website: website.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        external_link: externalLink.trim() || null,
        is_public: isPublic,
        social_facebook: socialFacebook.trim() || null,
        social_instagram: socialInstagram.trim() || null,
        social_twitter: socialTwitter.trim() || null,
        social_youtube: socialYoutube.trim() || null,
        social_tiktok: socialTiktok.trim() || null,
        theme_primary_color: themePrimary,
        theme_secondary_color: themeSecondary,
        theme_font: themeFont,
      });
      setKennel(updated);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Loading settings..." />;
  if (error && !kennel) return <ErrorState message={error} />;
  if (!kennel) {
    return (
      <div className="card max-w-md">
        <h2 className="text-lg font-semibold text-neutral-900">No kennel found</h2>
        <p className="mt-1 text-sm text-neutral-500">Create a kennel first from your dashboard to access settings.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Customize your kennel profile, contact info, and storefront appearance.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 ring-1 ring-error-100">
          {error}
        </div>
      )}
      {savedMessage && (
        <div className="rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700 ring-1 ring-success-100">
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <SettingsSection title="Kennel Profile" icon={Store}>
          <div>
            <label className="label">Kennel Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g., Greenfield Kennels" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Tell buyers about your kennel..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" placeholder="City, State" />
            </div>
            <div>
              <label className="label">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" placeholder="https://yourkennel.com" />
            </div>
          </div>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-4 py-3 cursor-pointer">
            <div>
              <span className="text-sm font-medium text-neutral-800">Public Storefront</span>
              <p className="text-xs text-neutral-500">Allow buyers to find your kennel on the marketplace</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isPublic ? "bg-primary-600" : "bg-neutral-300"}`}
              role="switch"
              aria-checked={isPublic}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </label>
        </SettingsSection>

        <SettingsSection title="Contact Information" icon={Phone}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-neutral-400" /> Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="e.g., +1 555 123 4567" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-neutral-400" /> Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="e.g., contact@greenfieldkennels.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="label flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-neutral-400" /> External Link</label>
              <input type="url" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} className="input-field" placeholder="https://additional-link.com" />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Social Media" icon={Share2}>
          <p className="text-sm text-neutral-500">Connect your social media accounts so buyers can follow and verify your kennel.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label flex items-center gap-1.5"><Facebook className="h-3.5 w-3.5 text-neutral-400" /> Facebook</label>
              <input type="url" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} className="input-field" placeholder="https://facebook.com/yourkennel" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Instagram className="h-3.5 w-3.5 text-neutral-400" /> Instagram</label>
              <input type="url" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} className="input-field" placeholder="https://instagram.com/yourkennel" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Share2 className="h-3.5 w-3.5 text-neutral-400" /> Twitter / X</label>
              <input type="url" value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} className="input-field" placeholder="https://twitter.com/yourkennel" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Youtube className="h-3.5 w-3.5 text-neutral-400" /> YouTube</label>
              <input type="url" value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} className="input-field" placeholder="https://youtube.com/@yourkennel" />
            </div>
            <div className="sm:col-span-2">
              <label className="label flex items-center gap-1.5"><Share2 className="h-3.5 w-3.5 text-neutral-400" /> TikTok</label>
              <input type="url" value={socialTiktok} onChange={(e) => setSocialTiktok(e.target.value)} className="input-field" placeholder="https://tiktok.com/@yourkennel" />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Theme Customization" icon={Palette}>
          <p className="text-sm text-neutral-500">Choose colors and a font that reflect your kennel's brand. Buyers will see these on your public storefront.</p>
          <div>
            <label className="label">Preset Themes</label>
            <div className="flex flex-wrap gap-3">
              {presetThemes.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => { setThemePrimary(theme.primary); setThemeSecondary(theme.secondary); }}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 transition-all ${
                    themePrimary === theme.primary && themeSecondary === theme.secondary
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex -space-x-1">
                    <span className="h-5 w-5 rounded-full ring-2 ring-white" style={{ backgroundColor: theme.primary }} />
                    <span className="h-5 w-5 rounded-full ring-2 ring-white" style={{ backgroundColor: theme.secondary }} />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themePrimary}
                  onChange={(e) => setThemePrimary(e.target.value)}
                  className="h-11 w-16 cursor-pointer rounded-lg border border-neutral-200"
                />
                <input type="text" value={themePrimary} onChange={(e) => setThemePrimary(e.target.value)} className="input-field" placeholder="#0d9459" />
              </div>
            </div>
            <div>
              <label className="label">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeSecondary}
                  onChange={(e) => setThemeSecondary(e.target.value)}
                  className="h-11 w-16 cursor-pointer rounded-lg border border-neutral-200"
                />
                <input type="text" value={themeSecondary} onChange={(e) => setThemeSecondary(e.target.value)} className="input-field" placeholder="#0d9488" />
              </div>
            </div>
          </div>
          <div>
            <label className="label">Storefront Font</label>
            <select value={themeFont} onChange={(e) => setThemeFont(e.target.value)} className="input-field">
              <option value="Inter">Inter (Modern, Clean)</option>
              <option value="Fraunces">Fraunces (Elegant, Serif)</option>
              <option value="Georgia">Georgia (Classic, Serif)</option>
              <option value="system-ui">System UI (Default)</option>
            </select>
          </div>
          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="mb-3 text-xs font-medium text-neutral-500">Preview</p>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ backgroundColor: themePrimary }}>
                <Store className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900" style={{ fontFamily: themeFont }}>{name || "Your Kennel"}</p>
                <p className="text-xs text-neutral-500">{location || "Location not set"}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: themePrimary }}>Primary</span>
                <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: themeSecondary }}>Secondary</span>
              </div>
            </div>
          </div>
        </SettingsSection>

        <div className="flex items-center justify-end gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
