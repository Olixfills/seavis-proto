export type StageStatus = 'pending' | 'pass' | 'fail';

export interface CandidateStages {
  registration: StageStatus;
  aptitude: StageStatus;
  medical: StageStatus;
  run: StageStatus;
  certificate: StageStatus;
  interview: StageStatus;
}

export interface Candidate {
  id: string; // Document ID
  candidateId: string; // e.g. NNBTS36-2024-00125
  fullName: string;
  dob: string;
  gender: string;
  state: string;
  lga: string;
  nin: string;
  photoUrl: string;
  chestNumber: string;
  batch: string;
  centre: string;
  currentPhase: string;
  stages: CandidateStages;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  candidateId: string;
  stage: string;
  action: StageStatus;
  officerId: string;
  officerName: string;
  location: string;
  timestamp: number;
}
