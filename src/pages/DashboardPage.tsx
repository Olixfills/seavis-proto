import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Candidate } from '../lib/types';
import { Scan, UserPlus, Users } from 'lucide-react';

export function DashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCandidates(snap.docs.map(d => ({ id: d.id, ...d.data() } as Candidate)));
    });
    return () => unsub();
  }, []);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif text-navy font-bold flex items-center gap-2">
          <Users size={24} /> Admin Dashboard
        </h2>
        <div className="flex gap-4">
          <Link to="/scan" className="px-4 py-2 bg-navy text-white rounded hover:bg-navy-light flex items-center gap-2 text-sm">
            <Scan size={16} /> Scan QR
          </Link>
          <Link to="/register" className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 flex items-center gap-2 text-sm">
            <UserPlus size={16} /> Register
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-300 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="military-table w-full text-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Batch</th>
                <th>Phase</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-slate-500">No candidates found</td></tr>
              ) : (
                candidates.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="font-mono text-xs">{c.candidateId}</td>
                    <td className="font-semibold">{c.fullName}</td>
                    <td>{c.batch}</td>
                    <td>{c.currentPhase}</td>
                    <td>
                      <Link to={`/verify/${c.id}`} className="text-navy hover:underline text-xs font-bold">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
