import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, CircleAlert as AlertCircle, Loader as Loader2, PawPrint } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { K9Dog } from "../components/K9Dog";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate(from);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Animated K9 panel */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 lg:flex">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-20 text-white">
            <PawPrint className="h-12 w-12 animate-paw-walk" style={{ animationDelay: "0s" }} />
          </div>
          <div className="absolute right-20 top-40 text-white">
            <PawPrint className="h-10 w-10 animate-paw-walk" style={{ animationDelay: "1s" }} />
          </div>
          <div className="absolute left-1/3 bottom-32 text-white">
            <PawPrint className="h-14 w-14 animate-paw-walk" style={{ animationDelay: "2s" }} />
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-white">
          <K9Dog size={180} />
          <h2 className="mt-8 font-display text-3xl font-bold">Welcome back!</h2>
          <p className="mt-2 max-w-xs text-center text-primary-100">
            Your furry friends are waiting. Sign in to manage your kennel or browse breeders.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-gradient-to-b from-primary-50/30 to-white px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <K9Dog size={100} />
          </div>

          <div className="text-center">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-bold tracking-tight text-neutral-900">
                Paw<span className="text-primary-600">Link</span>
              </span>
            </Link>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900">
              Sign In
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Welcome back — let's get you to your dashboard
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
