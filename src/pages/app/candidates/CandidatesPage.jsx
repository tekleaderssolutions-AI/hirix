import React from 'react';
import CandidateTable from '@/components/candidates/CandidateTable';
const mockCandidates = [
  { id:1, name:'Sarah Chen', email:'sarah@email.com', jobTitle:'Senior Engineer', stage:'interview', aiScore:92, appliedDate:'Apr 28' },
  { id:2, name:'James Wilson', email:'james@email.com', jobTitle:'Product Designer', stage:'screening', aiScore:85, appliedDate:'Apr 25' },
  { id:3, name:'Emily Ross', email:'emily@email.com', jobTitle:'ML Engineer', stage:'assessment', aiScore:78, appliedDate:'Apr 22' },
  { id:4, name:'Alex Kumar', email:'alex@email.com', jobTitle:'DevOps', stage:'applied', aiScore:65, appliedDate:'Apr 20' },
  { id:5, name:'Maria Garcia', email:'maria@email.com', jobTitle:'PM', stage:'offer', aiScore:88, appliedDate:'Apr 18' },
];
export default function CandidatesPage() {
  return (
    <div className="candidates-page">
      <div className="candidates-header">
        <div><h1 style={{ fontSize:'var(--text-2xl)', fontWeight:'var(--weight-bold)' }}>Candidates</h1><p style={{ color:'var(--color-text-muted)', fontSize:'var(--text-sm)', marginTop:4 }}>Global candidate database</p></div>
      </div>
      <CandidateTable candidates={mockCandidates} />
    </div>
  );
}
