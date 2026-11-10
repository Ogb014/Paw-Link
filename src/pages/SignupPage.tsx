import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, CircleAlert as AlertCircle, Loader as Loader2, Check, PawPrint } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { K9Dog } from "../components/K9Dog";
import type { UserRole } from "../types/database";

const roles: { value: UserRole; label: string; description: string; emoji: string }[] = [
  { value: "breeder", label: "Breeder", description: "I manage a kennel and want to list dogs", emoji: "🏠" },
  { value: "buyer", label: "Buyer", description: "I'm looking for a dog to bring home", emoji: "🐕" },
];

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("breeder");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, role, fullName);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate("/app");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Animated K9 panel */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 lg:flex">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-10 top-16 text-white">
            <PawPrint className="h-12 w-12 animate-paw-walk" style={{ animationDelay: "0.5s" }} />
          </div>
          <div className="absolute left-16 top-1/2 text-white">
            <PawPrint className="h-10 w-10 animate-paw-walk" style={{ animationDelay: "1.5s" }} />
          </div>
          <div className="absolute right-1/4 bottom-20 text-white">
            <PawPrint className="h-14 w-14 animate-paw-walk" style={{ animationDelay: "2.5s" }} />
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-white">
          <K9Dog size={180} />
          <h2 className="mt-8 font-display text-3xl font-bold">Join the pack!</h2>
          <p className="mt-2 max-w-xs text-center text-primary-100">
            Create your account and start connecting with dog breeders and buyers today.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-gradient-to-b from-primary-50/30 to-white px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:hidden">
            <K9Dog size={90} />
          </div>

          <div className="text-center">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-bold tracking-tight text-neutral-900">
                Paw<span className="text-primary-600">Link</span>
              </span>
            </Link>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Free to start — no credit card required
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 ring-1 ring-error-100">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="label">I am a...</label>
              <div className="grid grid-cols-1 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                      role === r.value
                        ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{r.emoji}</span>
                      <div>
                        <p className={`text-sm font-semibold ${role === r.value ? "text-primary-900" : "text-neutral-800"}`}>
                          {r.label}
                        </p>
                        <p className="text-xs text-neutral-500">{r.description}</p>
                      </div>
                    </div>
                    {role === r.value && (
                      <Check className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="label">Full name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
