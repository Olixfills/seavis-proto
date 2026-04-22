import type { ReactNode } from "react";
import { Printer, ShieldCheck } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <header className="w-full bg-navy text-white shadow-md print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Placeholder for Nigerian Navy Logo */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-navy shadow-inner">
              <ShieldCheck size={28} />
            </div>
          </div>

          <div className="flex-1 text-center">
            <h1 className="text-4xl font-serif font-bold tracking-wider mb-1 text-white">
              SEAVIS
            </h1>
            <p className="text-sm text-slate-200 tracking-wide">
              Secure Enrollment & Applicant Verification Information System
            </p>
          </div>

          <div className="flex items-center">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 border border-white/30 hover:bg-white/10 transition-colors px-4 py-2 rounded text-sm"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Print-only Header Header (simpler for paper) */}
      <div className="hidden print:block w-full text-center py-6 border-b-2 border-navy mb-6">
        <h1 className="text-3xl font-serif font-bold text-navy mb-1">SEAVIS</h1>
        <p className="text-sm text-slate-700">
          Secure Enrollment & Applicant Verification Information System
        </p>
      </div>

      <main className="w-full max-w-5xl mx-auto px-4 py-8 flex-1">
        {children}
      </main>

      <footer className="w-full text-center py-6 text-xs text-slate-500 border-t border-slate-200 mt-auto print:mt-10">
        SEAVIS | Nigerian Navy Recruitment Digital Verification System
      </footer>
    </div>
  );
}
