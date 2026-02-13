import { Card, Switch, SegmentedButtonGroup, SegmentedButton } from 'chen-the-dawnstreak';
import { useSettings } from '../../contexts/SettingsContext';

export default function NotificationSettings() {
  const { settings, setSetting } = useSettings();

  const enabled = settings.notification_enabled !== 'false';
  const soundEnabled = settings.notification_sound !== 'false';

  return (
    <Card variant="outlined" style={{ padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>通知</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Notification toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>课前提醒</span>
          <Switch
            checked={enabled}
            onChange={() => setSetting('notification_enabled', enabled ? 'false' : 'true')}
          />
        </div>

        {/* Minutes before */}
        {enabled && (
          <div>
            <label style={{ fontSize: '14px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>提前提醒时间</label>
            <SegmentedButtonGroup
              value={settings.notification_minutes || '10'}
              selects="single"
              onChange={(e: Event) => {
                const target = e.target as HTMLElement & { value?: string };
                if (target.value) setSetting('notification_minutes', target.value);
              }}
            >
              <SegmentedButton value="5">5分钟</SegmentedButton>
              <SegmentedButton value="10">10分钟</SegmentedButton>
              <SegmentedButton value="15">15分钟</SegmentedButton>
              <SegmentedButton value="30">30分钟</SegmentedButton>
            </SegmentedButtonGroup>
          </div>
        )}

        {/* Sound toggle */}
        {enabled && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>提示音</span>
            <Switch
              checked={soundEnabled}
              onChange={() => setSetting('notification_sound', soundEnabled ? 'false' : 'true')}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
