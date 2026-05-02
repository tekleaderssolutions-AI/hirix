import React from 'react';
import StatCard from '@/components/reports/StatCard';
import HiringFunnel from '@/components/reports/HiringFunnel';
import AiInsightCard from '@/components/reports/AiInsightCard';
import { Users, TrendingUp, Clock, Target } from 'lucide-react';
export default function ReportsOverviewPage() {
  return (
    <div className="reports-page">
      <div className="reports-header"><h1 style={{ fontSize:'var(--text-2xl)', fontWeight:'var(--weight-bold)' }}>Reports Overview</h1></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'var(--spacing-4)', marginBottom:'var(--spacing-8)' }}>
        <StatCard label="Total Hires" value="32" change={15} icon={Users} />
        <StatCard label="Offer Acceptance" value="78%" change={5} icon={TrendingUp} />
        <StatCard label="Avg Time-to-Hire" value="18d" change={-12} icon={Clock} />
        <StatCard label="Quality Score" value="4.2/5" change={3} icon={Target} />
      </div>
      <div className="reports-grid">
        <div className="card" style={{ padding:'var(--spacing-6)' }}><h3 style={{ fontWeight:'var(--weight-semibold)', marginBottom:'var(--spacing-4)' }}>Hiring Funnel</h3><HiringFunnel data={[{label:'Applied',value:1240},{label:'Screened',value:856},{label:'Interview',value:342},{label:'Offer',value:47},{label:'Hired',value:32}]} /></div>
        <AiInsightCard title="Hiring Trend" insight="Your hiring velocity has increased by 23% this quarter. Engineering roles are filling 2x faster than Q1." />
      </div>
    </div>
  );
}
