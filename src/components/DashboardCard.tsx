import React from 'react';

interface DashboardCardProps {
  label: string;
  title: string;
  body: string;
  status: React.ReactNode;
  cta: string;
  href?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ label, title, body, status, cta, href = "#" }) => {
  return (
    <a href={href} className="dashboard-card">
      <span className="card-label label">{label}</span>
      <h3 className="card-title serif italic">{title}</h3>
      <p className="card-body">{body}</p>
      <div className="card-status">
        {status}
      </div>
      <span className="card-cta">{cta}</span>
    </a>
  );
};

export default DashboardCard;
