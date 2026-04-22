import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Section, FieldTable, FieldRow, TripleFieldRow } from '../components/ui';
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
  const [officerId, setOfficerId] = useState('');
  const [isVerifiedOfficer, setIsVerifiedOfficer] = useState(false);

  useEffect(() => {
    if (candidate) {
      document.title = `seavis-candidate-biodata-${candidate.candidateId}`;
    } else {
      document.title = "SEAVIS | Verification";
    }
    return () => { document.title = "SEAVIS"; }
  }, [candidate]);

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
    if (!officerId.trim()) {
      alert("Please enter your Officer ID before updating a stage.");
      return;
    }

    try {
      const newStages = { ...candidate.stages, [stageKey]: newStatus };
      const newStageUpdates = {
        ...(candidate.stageUpdates || {}),
        [stageKey]: { officerId: officerId.trim(), timestamp: Date.now() }
      };
      
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
        stageUpdates: newStageUpdates,
        currentPhase
      });

      // Audit Log
      await addDoc(collection(db, 'logs'), {
        candidateId: candidate.candidateId,
        stage: stageKey,
        action: newStatus,
        officerId: officerId.trim(),
        officerName: 'Auth Officer', // Mocked Name
        location: 'Verification Centre',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Failed to update stage', err);
      alert('Failed to update stage.');
    }
  };
  
  const handleCredentialToggle = async (credKey: keyof NonNullable<Candidate['credentialsVerified']>) => {
    if (!candidate || !isOfficer) return;
    try {
      const newCreds = {
        ssce: false,
        trade: false,
        qualification: false,
        ...(candidate.credentialsVerified || {}),
        [credKey]: !(candidate.credentialsVerified?.[credKey])
      };
      await updateDoc(doc(db, 'candidates', candidate.id), {
        credentialsVerified: newCreds
      });
    } catch (err) {
      console.error('Failed to update credential', err);
    }
  };

  if (loading) return <Layout><div className="text-center py-20 text-navy">Loading Verification Data...</div></Layout>;
  if (error || !candidate) return <Layout><div className="text-center py-20 text-red-600 font-bold">{error}</div></Layout>;

  return (
    <Layout>
      {/* Officer Auth Toggle (Mock for demo) */}
      <div className="mb-4 text-right print:hidden flex flex-col items-end gap-2">
        <label className="text-sm text-slate-500 flex items-center justify-end gap-2 cursor-pointer">
          <input type="checkbox" checked={isOfficer} onChange={(e) => {
            setIsOfficer(e.target.checked);
            if (!e.target.checked) {
              setIsVerifiedOfficer(false);
              setOfficerId('');
            }
          }} />
          Enable Officer Mode
        </label>
        {isOfficer && (
          <div className="flex gap-2 items-center">
            <input 
              type="text" 
              placeholder="Enter Officer ID (e.g. NN/1234)" 
              className={`military-input max-w-xs text-sm py-1 ${isVerifiedOfficer ? 'bg-slate-100' : ''}`}
              value={officerId}
              disabled={isVerifiedOfficer}
              onChange={e => setOfficerId(e.target.value.toUpperCase())}
            />
            {!isVerifiedOfficer ? (
              <button 
                onClick={() => {
                  if (officerId.trim()) setIsVerifiedOfficer(true);
                  else alert("Please enter Officer ID");
                }}
                className="bg-navy text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-navy-light transition-colors"
              >
                Start Verification
              </button>
            ) : (
              <button 
                onClick={() => setIsVerifiedOfficer(false)}
                className="text-navy text-[10px] underline"
              >
                Change ID
              </button>
            )}
          </div>
        )}
      </div>

      <Section title="Candidate Identification">
        <div className="flex flex-col md:flex-row print:flex-row gap-4 p-4 print:p-2">
          <div className="w-full md:w-1/4 print:w-1/4 flex-shrink-0">
            <div className="border border-slate-300 p-2 bg-slate-50">
              <img src={candidate.photoUrl || 'https://via.placeholder.com/150'} alt="Candidate" className="w-full h-auto object-cover border border-slate-200" />
            </div>
          </div>
          <div className="w-full md:w-3/4 print:w-3/4">
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

      <Section title="Credential Summary">
        <FieldTable>
          {/* Header Row */}
          <div className="hidden sm:flex print:flex border-b-2 border-slate-200 bg-slate-100 font-bold text-[10px] uppercase tracking-wider text-slate-600">
            <div className="w-1/4 px-4 py-2">Credential Type</div>
            <div className="w-2/4 px-4 py-2 border-l border-slate-200">Candidate Data</div>
            <div className="w-1/4 px-4 py-2 border-l border-slate-200">Verification Status</div>
          </div>
          
          <TripleFieldRow label="SSCE Result" value={candidate.ssce}>
             <div className="flex items-center gap-2">
               <input 
                 type="checkbox" 
                 checked={candidate.credentialsVerified?.ssce || false} 
                 onChange={() => handleCredentialToggle('ssce')}
                 disabled={!isVerifiedOfficer || candidate.stages.registration === 'pass'}
                 className="w-4 h-4 cursor-pointer accent-navy"
               />
               <span className={`text-[10px] font-bold uppercase tracking-tight ${candidate.credentialsVerified?.ssce ? 'text-green-600' : 'text-amber-600'}`}>
                 {candidate.credentialsVerified?.ssce ? '✓ Verified' : '⚠ Not Verified'}
               </span>
             </div>
          </TripleFieldRow>
          
          <TripleFieldRow label="Trade" value={candidate.trade}>
             <div className="flex items-center gap-2">
               <input 
                 type="checkbox" 
                 checked={candidate.credentialsVerified?.trade || false} 
                 onChange={() => handleCredentialToggle('trade')}
                 disabled={!isVerifiedOfficer || candidate.stages.registration === 'pass'}
                 className="w-4 h-4 cursor-pointer accent-navy"
               />
               <span className={`text-[10px] font-bold uppercase tracking-tight ${candidate.credentialsVerified?.trade ? 'text-green-600' : 'text-amber-600'}`}>
                 {candidate.credentialsVerified?.trade ? '✓ Verified' : '⚠ Not Verified'}
               </span>
             </div>
          </TripleFieldRow>
          
          <TripleFieldRow label="Qualification" value={candidate.qualification}>
             <div className="flex items-center gap-2">
               <input 
                 type="checkbox" 
                 checked={candidate.credentialsVerified?.qualification || false} 
                 onChange={() => handleCredentialToggle('qualification')}
                 disabled={!isVerifiedOfficer || candidate.stages.registration === 'pass'}
                 className="w-4 h-4 cursor-pointer accent-navy"
               />
               <span className={`text-[10px] font-bold uppercase tracking-tight ${candidate.credentialsVerified?.qualification ? 'text-green-600' : 'text-amber-600'}`}>
                 {candidate.credentialsVerified?.qualification ? '✓ Verified' : '⚠ Not Verified'}
               </span>
             </div>
          </TripleFieldRow>
          
          <FieldRow label="Registration Status">
             <div className="flex flex-col">
                {isVerifiedOfficer && candidate.stages.registration === 'pending' ? (
                  <div className="space-y-2">
                    <select 
                      value={candidate.stages.registration} 
                      onChange={(e) => handleStageUpdate('registration', e.target.value as StageStatus)}
                      disabled={!(candidate.credentialsVerified?.ssce && candidate.credentialsVerified?.trade && candidate.credentialsVerified?.qualification)}
                      className="military-input max-w-xs font-bold text-[#d97706] disabled:opacity-50 disabled:bg-slate-100"
                    >
                      <option value="pending">⏳ PENDING</option>
                      <option value="pass">✅ PASS</option>
                      <option value="fail">❌ FAIL</option>
                    </select>
                    {!(candidate.credentialsVerified?.ssce && candidate.credentialsVerified?.trade && candidate.credentialsVerified?.qualification) && (
                      <p className="text-[10px] text-red-500 font-bold italic">
                        * Verify all certificates above to enable registration pass
                      </p>
                    )}
                  </div>
                ) : (
                  <StatusBadge status={candidate.stages.registration} />
                )}
                {candidate.stages.registration !== 'pending' && candidate.stageUpdates?.registration && (
                  <span className="text-xs text-slate-500 mt-1 print:text-[10px]">
                    By {candidate.stageUpdates.registration.officerId} on {new Date(candidate.stageUpdates.registration.timestamp).toLocaleString()}
                  </span>
                )}
             </div>
          </FieldRow>
        </FieldTable>
      </Section>

      <Section title="Screening Status">
        <FieldTable>
          {STAGE_ORDER.slice(1).map((stage, idx) => {
            const status = candidate.stages[stage];
            const prevStageStatus = candidate.stages[STAGE_ORDER[idx]]; // Since we sliced at 1, idx 0 is 'aptitude', prev is 'registration'
            // Stage is disabled if previous stage is not PASS, or if ANY stage is FAIL, or if it's already updated
            const hasFailedAny = Object.values(candidate.stages).includes('fail');
            const isAlreadySet = status !== 'pending';
            const isDisabled = isAlreadySet || prevStageStatus !== 'pass' || (hasFailedAny && status === 'pending');

            return (
              <FieldRow key={stage} label={STAGE_LABELS[stage]}>
                <div className="flex flex-col">
                  {isVerifiedOfficer && !isAlreadySet && !isDisabled ? (
                    <select 
                      value={status} 
                      onChange={(e) => handleStageUpdate(stage, e.target.value as StageStatus)}
                      className="military-input max-w-xs font-bold text-[#d97706]"
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
                  {status !== 'pending' && candidate.stageUpdates?.[stage] && (
                    <span className="text-xs text-slate-500 mt-1 print:text-[10px]">
                      By {candidate.stageUpdates[stage].officerId} on {new Date(candidate.stageUpdates[stage].timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
              </FieldRow>
            );
          })}
        </FieldTable>
      </Section>
    </Layout>
  );
}
