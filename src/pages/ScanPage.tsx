import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Layout } from '../components/Layout';
import { Section } from '../components/ui';

export function ScanPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    }, false);

    scanner.render(
      (decodedText) => {
        scanner.clear();
        // The decoded text should be the URL: https://seavis.app/verify/ID
        // We will just extract the ID assuming it's the last part of the path
        try {
          const url = new URL(decodedText);
          const parts = url.pathname.split('/');
          const id = parts[parts.length - 1];
          if (id) {
            navigate(`/verify/${id}`);
          } else {
            setError('Invalid QR Code format.');
          }
        } catch (e) {
          // If it's not a URL, maybe it's just the ID?
          if (decodedText.length > 5) {
            navigate(`/verify/${decodedText}`);
          } else {
            setError('Could not read QR code.');
          }
        }
      },
      (_err) => {
        // console.warn(err);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [navigate]);

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Section title="Scan QR Code">
          {error && <div className="text-red-500 mb-4 text-center text-sm font-bold">{error}</div>}
          <div id="reader" className="w-full"></div>
          <p className="text-sm text-slate-500 text-center mt-4">
            Point your camera at the candidate's QR code.
          </p>
        </Section>
      </div>
    </Layout>
  );
}
