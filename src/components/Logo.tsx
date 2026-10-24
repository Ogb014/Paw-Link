import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";

export function Logo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-soft">
        <PawPrint className="h-5 w-5 text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className="font-display text-xl font-bold tracking-tight text-neutral-900">
          Paw<span className="text-primary-600">Link</span>
        </span>
      )}
    </Link>
  );
}
