import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Layout } from '../components/Layout';
import { Section } from '../components/ui';
import { Camera, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ScanPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Prevent multiple initializations
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 10,
      rememberLastUsedCamera: true,
      supportedScanTypes: [0] // Camera only
    }, false);

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        console.log('QR Scanned:', decodedText);
        
        // Success: Try to parse ID
        let id = '';
        try {
          if (decodedText.startsWith('http')) {
            const url = new URL(decodedText);
            const parts = url.pathname.split('/');
            id = parts[parts.length - 1];
          } else {
            id = decodedText;
          }

          if (id && id.length > 5) {
            scanner.clear().then(() => {
              navigate(`/verify/${id}`);
            }).catch(err => {
              console.error('Failed to clear scanner', err);
              navigate(`/verify/${id}`);
            });
          } else {
            setError('Invalid QR code format.');
          }
        } catch (e) {
          setError('Could not process the scanned QR code.');
        }
      },
      (errorMessage) => {
        // Most errors are "QR code not found" which we ignore
        if (errorMessage.includes('NotFound')) return;
        // console.warn(errorMessage);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Cleanup error:', err));
        scannerRef.current = null;
      }
    };
  }, [navigate]);

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-navy" />
          </Link>
          <h2 className="text-2xl font-serif text-navy font-bold flex items-center gap-2">
            <Camera size={24} /> QR Verification
          </h2>
        </div>

        <Section title="Scan Candidate QR Code">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
            <div id="reader" className="w-full overflow-hidden"></div>
          </div>
          
          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-600 text-center px-4">
              Center the candidate's QR code in the scanning box above.
            </p>
            
            <div className="border-t border-slate-100 pt-4">
              <div className="text-xs text-slate-400 text-center uppercase tracking-wider font-bold">
                Verification Guidelines
              </div>
              <ul className="mt-2 text-xs text-slate-500 space-y-1 px-4">
                <li>• Ensure adequate lighting for the camera</li>
                <li>• Keep the QR code flat and steady</li>
                <li>• Scan official NNBTS generated codes only</li>
              </ul>
            </div>
          </div>
        </Section>
      </div>
    </Layout>
  );
}

