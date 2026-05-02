import React from 'react';
import EmployeeCard from '@/components/people/EmployeeCard';
const employees = [
  { id:1, name:'John Smith', role:'Engineering Manager', department:'Engineering' },
  { id:2, name:'Lisa Wong', role:'Senior Designer', department:'Design' },
  { id:3, name:'Mike Johnson', role:'Product Manager', department:'Product' },
  { id:4, name:'Anna Lee', role:'HR Business Partner', department:'HR' },
  { id:5, name:'David Kim', role:'Full Stack Developer', department:'Engineering' },
  { id:6, name:'Rachel Green', role:'Marketing Lead', department:'Marketing' },
];
export default function PeoplePage() {
  return (
    <div className="people-page">
      <div className="people-header"><h1 style={{ fontSize:'var(--text-2xl)', fontWeight:'var(--weight-bold)' }}>People</h1></div>
      <div className="people-grid">{employees.map((e) => <EmployeeCard key={e.id} employee={e} />)}</div>
    </div>
  );
}
