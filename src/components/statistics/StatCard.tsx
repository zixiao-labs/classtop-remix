import { Card, Icon } from 'chen-the-dawnstreak';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card variant="outlined" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Icon name={icon} style={{ fontSize: '24px', opacity: 0.6 }} />
        <div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>{title}</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>{value}</div>
        </div>
      </div>
    </Card>
  );
}
