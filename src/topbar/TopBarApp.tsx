import { SettingsProvider } from '../contexts/SettingsContext';
import { ScheduleProvider } from '../contexts/ScheduleContext';
import Clock from './components/Clock';
import ScheduleProgress from './components/ScheduleProgress';
import './TopBarApp.css';

export default function TopBarApp() {
  return (
    <SettingsProvider>
      <ScheduleProvider>
        <div className="topbar-container">
          <div className="topbar-content">
            <div className="topbar-left">
              <ScheduleProgress />
            </div>
            <div className="topbar-center">
              <Clock />
            </div>
            <div className="topbar-right" />
          </div>
        </div>
      </ScheduleProvider>
    </SettingsProvider>
  );
}
