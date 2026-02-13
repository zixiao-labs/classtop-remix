import { Card, TextField } from 'chen-the-dawnstreak';
import { useSettings } from '../../contexts/SettingsContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { weekApi } from '../../lib/ipc-client';

export default function SemesterSettings() {
  const { settings, setSetting } = useSettings();
  const { currentWeek, setCurrentWeek } = useSchedule();

  const handleDateChange = async (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    await setSetting('semester_start_date', value);
    if (value) {
      const result = await weekApi.setSemesterStart(value);
      if (result.success && result.calculated_week) {
        setCurrentWeek(result.calculated_week);
      }
    }
  };

  const handleTotalWeeksChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (value && parseInt(value) > 0) {
      setSetting('total_weeks', value);
    }
  };

  return (
    <Card variant="outlined" style={{ padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>学期设置</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <TextField
          label="学期开始日期"
          type="date"
          value={settings.semester_start_date || ''}
          onChange={handleDateChange}
        />
        <TextField
          label="总周数"
          type="number"
          value={settings.total_weeks || '20'}
          min={1}
          max={30}
          onChange={handleTotalWeeksChange}
        />
        <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>
          当前周数：第 {currentWeek} 周
          {settings.semester_start_date ? ' (自动计算)' : ' (手动)'}
        </p>
      </div>
    </Card>
  );
}
