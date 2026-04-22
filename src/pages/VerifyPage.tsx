import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Section, FieldTable, FieldRow } from '../components/ui';
import { doc, onSnapshot, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Candidate, StageStatus } from '../lib/types';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const STAGE_ORDER = ['registration', 'aptitude', 'medical', 'run', 'certificate', 'interview'] as const;
const STAGE_LABELS: Record<string, string> = {
  registration: 'Online Registration',
  aptitude: 'Aptitude Test',
  medical: 'Medical Fitness',
  run: '3.2KM Run',
  certificate: 'Certificate Screening',
  interview: 'Interview'
};

function StatusBadge({ status }: { status: StageStatus }) {
  if (status === 'pass') {
    return <span className="flex items-center gap-2 text-green-700 font-bold"><CheckCircle size={16} /> PASS</span>;
  }
  if (status === 'fail') {
    return <span className="flex items-center gap-2 text-red-600 font-bold"><AlertCircle size={16} /> FAIL</span>;
  }
  return <span className="flex items-center gap-2 text-amber-600 font-bold"><Clock size={16} /> PENDING</span>;
}

export function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // For a simple app, we just simulate auth state for the officer updating UI
  const [isOfficer, setIsOfficer] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'candidates', id), (docSnap) => {
      if (docSnap.exists()) {
        setCandidate({ id: docSnap.id, ...docSnap.data() } as Candidate);
      } else {
        setError('Candidate not found or invalid QR code.');
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('Error fetching candidate data.');
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleStageUpdate = async (stageKey: keyof Candidate['stages'], newStatus: StageStatus) => {
    if (!candidate) return;
    try {
      const newStages = { ...candidate.stages, [stageKey]: newStatus };
      
      // Determine new current phase based on the last passed stage
      let currentPhase = 'Online Registration';
      for (const st of STAGE_ORDER) {
        if (newStages[st] === 'pass') {
          currentPhase = STAGE_LABELS[st] + ' (Cleared)';
        } else if (newStages[st] === 'pending') {
          currentPhase = STAGE_LABELS[st];
          break;
        } else {
           currentPhase = STAGE_LABELS[st] + ' (Failed)';
           break;
        }
      }

      await updateDoc(doc(db, 'candidates', candidate.id), {
        stages: newStages,
        currentPhase
      });

      // Audit Log
      await addDoc(collection(db, 'logs'), {
        candidateId: candidate.candidateId,
        stage: stageKey,
        action: newStatus,
        officerId: 'officer-1', // Mocked ID
        officerName: 'Auth Officer', // Mocked Name
        location: 'Verification Centre',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Failed to update stage', err);
      alert('Failed to update stage.');
    }
  };

  if (loading) return <Layout><div className="text-center py-20 text-navy">Loading Verification Data...</div></Layout>;
  if (error || !candidate) return <Layout><div className="text-center py-20 text-red-600 font-bold">{error}</div></Layout>;

  return (
    <Layout>
      {/* Officer Auth Toggle (Mock for demo) */}
      <div className="mb-4 text-right print:hidden">
        <label className="text-sm text-slate-500 flex items-center justify-end gap-2">
          <input type="checkbox" checked={isOfficer} onChange={(e) => setIsOfficer(e.target.checked)} />
          Enable Officer Mode (Update Stages)
        </label>
      </div>

      <Section title="Candidate Identification">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="w-full md:w-1/4 flex-shrink-0">
            <div className="border border-slate-300 p-2 bg-slate-50">
              <img src={candidate.photoUrl || 'https://via.placeholder.com/150'} alt="Candidate" className="w-full h-auto object-cover border border-slate-200" />
            </div>
          </div>
          <div className="w-full md:w-3/4">
            <FieldTable>
              <FieldRow label="Full Name" value={candidate.fullName} />
              <FieldRow label="Date of Birth" value={candidate.dob} />
              <FieldRow label="Gender" value={candidate.gender} />
              <FieldRow label="State / LGA" value={`${candidate.state} / ${candidate.lga}`} />
              <FieldRow label="Candidate ID" value={candidate.candidateId} />
              <FieldRow label="Chest Number" value={candidate.chestNumber} />
              <FieldRow label="NIN" value={candidate.nin} />
            </FieldTable>
          </div>
        </div>
      </Section>

      <Section title="Recruitment Details">
        <FieldTable>
          <FieldRow label="Batch" value={`NNBTS Batch ${candidate.batch}`} />
          <FieldRow label="Centre" value={candidate.centre} />
          <FieldRow label="Current Phase" value={candidate.currentPhase} />
        </FieldTable>
      </Section>

      <Section title="Screening Status">
        <FieldTable>
          {STAGE_ORDER.slice(1).map((stage, idx) => {
            const status = candidate.stages[stage];
            const prevStageStatus = candidate.stages[STAGE_ORDER[idx]]; // Previous stage
            // Stage is disabled if previous stage is not PASS, or if ANY stage is FAIL
            const hasFailedAny = Object.values(candidate.stages).includes('fail');
            const isDisabled = prevStageStatus !== 'pass' || (hasFailedAny && status === 'pending');

            return (
              <FieldRow key={stage} label={STAGE_LABELS[stage]}>
                {isOfficer && !isDisabled ? (
                  <select 
                    value={status} 
                    onChange={(e) => handleStageUpdate(stage, e.target.value as StageStatus)}
                    className="military-input max-w-xs font-bold"
                    style={{
                      color: status === 'pass' ? '#15803d' : status === 'fail' ? '#dc2626' : '#d97706'
                    }}
                  >
                    <option value="pending">⏳ PENDING</option>
                    <option value="pass">✅ PASS</option>
                    <option value="fail">❌ FAIL</option>
                  </select>
                ) : (
                  <div className={isDisabled && status === 'pending' ? 'opacity-50' : ''}>
                    <StatusBadge status={status} />
                  </div>
                )}
              </FieldRow>
            );
          })}
        </FieldTable>
      </Section>
    </Layout>
  );
}
