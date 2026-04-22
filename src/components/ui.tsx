import type { ReactNode } from 'react';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6 bg-white border border-slate-300 rounded-sm overflow-hidden shadow-sm">
      <div className="bg-white border-b-2 border-navy px-4 py-2">
        <h2 className="text-lg font-bold text-navy tracking-wide">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export function FieldRow({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center border-b border-slate-200 last:border-b-0 py-2 sm:py-0">
      <div className="sm:w-1/3 px-2 sm:px-4 py-1 sm:py-3 font-semibold text-slate-800 text-sm bg-slate-50/50">
        {label}
      </div>
      <div className="sm:w-2/3 px-2 sm:px-4 py-1 sm:py-3 text-sm text-slate-900 border-l-0 sm:border-l border-slate-200">
        {children || value}
      </div>
    </div>
  );
}

export function FieldTable({ children }: { children: ReactNode }) {
  return (
    <div className="border border-slate-300 rounded-sm overflow-hidden">
      {children}
    </div>
  );
}
