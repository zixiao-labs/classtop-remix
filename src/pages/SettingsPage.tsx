import SemesterSettings from '../components/settings/SemesterSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import NotificationSettings from '../components/settings/NotificationSettings';

export default function SettingsPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>设置</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <SemesterSettings />
        <AppearanceSettings />
        <NotificationSettings />
      </div>
    </div>
  );
}
