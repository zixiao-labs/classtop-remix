import { Outlet, useLocation, useNavigate } from 'react-router';
import { NavigationBar, NavigationBarItem } from 'chen-the-dawnstreak';

const navItems = [
  { path: '/', label: '首页', icon: 'home' },
  { path: '/schedule', label: '课表', icon: 'calendar_month' },
  { path: '/statistics', label: '统计', icon: 'bar_chart' },
  { path: '/settings', label: '设置', icon: 'settings' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeItem = navItems.find(item => item.path === location.pathname);
  const activeValue = activeItem?.path ?? '/';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
      <NavigationBar
        value={activeValue}
        onChange={(e: Event) => {
          const target = e.target as HTMLElement & { value?: string };
          if (target.value) navigate(target.value);
        }}
      >
        {navItems.map((item) => (
          <NavigationBarItem
            key={item.path}
            value={item.path}
            icon={item.icon}
          >
            {item.label}
          </NavigationBarItem>
        ))}
      </NavigationBar>
    </div>
  );
}
