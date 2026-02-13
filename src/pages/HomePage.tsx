import { useRef } from 'react';
import { Card } from 'chen-the-dawnstreak';
import { useNavigate } from 'react-router';
import { useWebComponentEvent } from '../lib/use-web-component-event';
import { useSchedule } from '../contexts/ScheduleContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentWeek } = useSchedule();

  const scheduleCardRef = useRef<HTMLElement>(null);
  const statsCardRef = useRef<HTMLElement>(null);
  const settingsCardRef = useRef<HTMLElement>(null);

  useWebComponentEvent(scheduleCardRef, 'click', () => navigate('/schedule'));
  useWebComponentEvent(statsCardRef, 'click', () => navigate('/statistics'));
  useWebComponentEvent(settingsCardRef, 'click', () => navigate('/settings'));

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>ClassTop</h1>
      <p style={{ marginBottom: '2rem', opacity: 0.7 }}>课堂课表管理桌面应用</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Card ref={scheduleCardRef} clickable style={{ padding: '1.5rem' }}>
          <h3>课程表</h3>
          <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>当前第 {currentWeek} 周</p>
        </Card>

        <Card ref={statsCardRef} clickable style={{ padding: '1.5rem' }}>
          <h3>统计</h3>
          <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>查看课程分析和出勤记录</p>
        </Card>

        <Card ref={settingsCardRef} clickable style={{ padding: '1.5rem' }}>
          <h3>设置</h3>
          <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>外观、学期、通知设置</p>
        </Card>
      </div>
    </div>
  );
}
