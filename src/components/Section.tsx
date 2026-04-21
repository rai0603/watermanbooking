import type { ReactNode } from "react";

interface SectionProps {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ step, title, description, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ocean-600 text-sm font-bold text-white">
          {step}
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}
