import React from 'react';
import { FileText, Image, FolderOpen, Upload } from 'lucide-react';
import { Button } from '@/components/ui';
const files = [
  { name:'Job Description Template.docx', type:'doc', size:'24 KB', modified:'Apr 28' },
  { name:'Interview Scorecard.pdf', type:'pdf', size:'128 KB', modified:'Apr 25' },
  { name:'Offer Letter Template.docx', type:'doc', size:'32 KB', modified:'Apr 20' },
  { name:'Company Culture Deck.pptx', type:'ppt', size:'2.4 MB', modified:'Apr 15' },
];
export default function FilesPage() {
  return (
    <div style={{ padding:'var(--spacing-8)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'var(--spacing-6)' }}>
        <h1 style={{ fontSize:'var(--text-2xl)', fontWeight:'var(--weight-bold)' }}>Files & Templates</h1>
        <Button variant="primary" icon={Upload}>Upload</Button>
      </div>
      <div className="table-container">
        <table className="table"><thead><tr><th>Name</th><th>Size</th><th>Modified</th></tr></thead><tbody>
          {files.map((f) => (
            <tr key={f.name}><td style={{ display:'flex', alignItems:'center', gap:8 }}><FileText size={16} style={{ color:'var(--color-primary)' }} />{f.name}</td><td>{f.size}</td><td>{f.modified}</td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}
