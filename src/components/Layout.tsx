import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <header className="w-full bg-[#0A1C3F] text-white shadow-md print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="Nigerian Navy Logo"
              className="h-14 w-auto drop-shadow-md"
            />
          </Link>

          <div className="flex-1 text-center flex flex-col items-center justify-center">
            <h1 className="text-4xl font-serif font-bold tracking-wider text-white leading-none">
              NN-SEAVIS
            </h1>
            <p className="text-[13px] text-slate-200 tracking-wide mt-1">
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
      <div className="hidden print:flex w-full items-center justify-between py-6 border-b-2 border-navy mb-6">
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Nigerian Navy Logo"
            className="h-16 w-auto mr-4"
          />
        </div>
        <div className="flex-1 text-center pr-16">
          <h1 className="text-3xl font-serif font-bold text-navy mb-1">
            NN-SEAVIS
          </h1>
          <p className="text-sm text-slate-700">
            Secure Enrollment & Applicant Verification Information System
          </p>
        </div>
      </div>

      <main className="w-full max-w-5xl mx-auto px-4 py-8 flex-1">
        {children}
      </main>

      <footer className="w-full text-center py-6 text-xs text-slate-500 border-t border-slate-200 mt-auto print:mt-10">
        NN-SEAVIS | Nigerian Navy Recruitment Digital Verification System Prototype
      </footer>
    </div>
  );
}
