import 'mdui/mdui.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

// TopBarApp will be created in Phase 6, placeholder for now
function TopBarPlaceholder() {
  return <div>TopBar Loading...</div>;
}

// Dynamically import when ready
const TopBarAppModule = import('./topbar/TopBarApp').catch(() => null);

function TopBarEntry() {
  const [TopBarApp, setTopBarApp] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    TopBarAppModule.then(mod => {
      if (mod) setTopBarApp(() => mod.default);
    });
  }, []);

  if (TopBarApp) return <TopBarApp />;
  return <TopBarPlaceholder />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TopBarEntry />
  </React.StrictMode>
);
