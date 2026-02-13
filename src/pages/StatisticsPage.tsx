import { useState, useEffect } from 'react';
import { statsApi } from '../lib/ipc-client';
import StatCard from '../components/statistics/StatCard';
import AttendanceList from '../components/statistics/AttendanceList';
import type { Statistics, AttendanceRecord } from '../types/database';

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    statsApi.all().then(setStats);
    statsApi.attendanceHistory(undefined, 50).then(setAttendance);
  }, []);

  if (!stats) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>统计</h1>

      {/* Stat cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard title="课程总数" value={String(stats.total_courses)} icon="school" />
        <StatCard title="总课时" value={`${stats.total_hours}h`} icon="schedule" />
        <StatCard title="出勤率" value={`${stats.attendance_rate}%`} icon="check_circle" />
        <StatCard title="周均课时" value={`${stats.weekly_hours}h`} icon="trending_up" />
        <StatCard title="最忙日" value={stats.busiest_day} icon="event_busy" />
      </div>

      {/* Time distribution bar chart (pure CSS) */}
      {Object.keys(stats.time_distribution).length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>时段分布</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '120px' }}>
            {Object.entries(stats.time_distribution).map(([period, count]) => {
              const max = Math.max(...Object.values(stats.time_distribution));
              const heightPct = max > 0 ? (count / max) * 100 : 0;
              return (
                <div key={period} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '12px', marginBottom: '4px' }}>{count}</span>
                  <div style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    backgroundColor: 'var(--mdui-color-primary, #6750A4)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: count > 0 ? '4px' : '0',
                    transition: 'height 0.3s',
                  }} />
                  <span style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>{period}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attendance history */}
      <h3 style={{ marginBottom: '1rem' }}>出勤记录</h3>
      <AttendanceList records={attendance} />
    </div>
  );
}
