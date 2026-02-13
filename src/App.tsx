import { Routes, Route } from 'react-router';
import { HashRouter } from 'react-router';
import { SettingsProvider } from './contexts/SettingsContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import StatisticsPage from './pages/StatisticsPage';
import './App.css';

function App() {
  return (
    <HashRouter>
      <SettingsProvider>
        <ScheduleProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </ScheduleProvider>
      </SettingsProvider>
    </HashRouter>
  );
}

export default App;
