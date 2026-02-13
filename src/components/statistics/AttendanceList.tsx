import { List, ListItem } from 'chen-the-dawnstreak';
import type { AttendanceRecord } from '../../types/database';

interface AttendanceListProps {
  records: AttendanceRecord[];
}

export default function AttendanceList({ records }: AttendanceListProps) {
  if (records.length === 0) {
    return <p style={{ opacity: 0.5, textAlign: 'center' }}>暂无出勤记录</p>;
  }

  return (
    <List>
      {records.map(record => (
        <ListItem
          key={record.id}
          icon={record.attended ? 'check_circle' : 'cancel'}
          headline={record.course_name}
          description={`${record.date} ${record.start_time}-${record.end_time}${record.notes ? ` | ${record.notes}` : ''}`}
        />
      ))}
    </List>
  );
}
