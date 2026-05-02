import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export default function CalendarPage() {
  return (
    <div style={{ padding:'var(--spacing-8)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'var(--spacing-6)' }}>
        <h1 style={{ fontSize:'var(--text-2xl)', fontWeight:'var(--weight-bold)' }}>Calendar</h1>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--spacing-3)' }}>
          <Button variant="ghost" size="sm" icon={ChevronLeft} />
          <span style={{ fontWeight:'var(--weight-semibold)' }}>May 2026</span>
          <Button variant="ghost" size="sm" icon={ChevronRight} />
        </div>
      </div>
      <div className="card" style={{ padding:'var(--spacing-4)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1 }}>
          {days.map((d) => <div key={d} style={{ padding:'var(--spacing-2)', textAlign:'center', fontSize:'var(--text-xs)', fontWeight:'var(--weight-semibold)', color:'var(--color-text-muted)' }}>{d}</div>)}
          {Array.from({length:35}).map((_,i) => (
            <div key={i} style={{ padding:'var(--spacing-3)', minHeight:80, border:'1px solid var(--color-border-light)', borderRadius:'var(--radius-sm)', fontSize:'var(--text-sm)', color: i < 4 ? 'var(--color-text-hint)' : 'var(--color-text-secondary)' }}>
              {((i - 3) > 0 && (i - 3) <= 31) ? i - 3 : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
