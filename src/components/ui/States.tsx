import type { ReactNode } from "react";
import { Loader as Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-sm text-neutral-500">{message}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="rounded-2xl bg-error-50 px-6 py-4 text-center ring-1 ring-error-100">
        <p className="text-sm font-medium text-error-700">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Loader2;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
        <Icon className="h-7 w-7 text-primary-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-card animate-fade-in-scale">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="mt-2 text-sm text-neutral-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-error-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:bg-error-700 active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
