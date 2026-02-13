import { useRef, useCallback } from 'react';
import { Card, SegmentedButtonGroup, SegmentedButton, Slider, TextField } from 'chen-the-dawnstreak';
import { useSettings } from '../../contexts/SettingsContext';
import { courseColors } from '../../lib/constants';

export default function AppearanceSettings() {
  const { settings, setSetting } = useSettings();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const debouncedSet = useCallback((key: string, value: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setSetting(key, value);
    }, 300);
  }, [setSetting]);

  return (
    <Card variant="outlined" style={{ padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>外观</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Theme mode */}
        <div>
          <label style={{ fontSize: '14px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>主题模式</label>
          <SegmentedButtonGroup
            value={settings.theme_mode || 'auto'}
            selects="single"
            onChange={(e: Event) => {
              const target = e.target as HTMLElement & { value?: string };
              if (target.value) setSetting('theme_mode', target.value);
            }}
          >
            <SegmentedButton value="auto">自动</SegmentedButton>
            <SegmentedButton value="light">浅色</SegmentedButton>
            <SegmentedButton value="dark">深色</SegmentedButton>
          </SegmentedButtonGroup>
        </div>

        {/* Theme color */}
        <div>
          <label style={{ fontSize: '14px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>主题色</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {courseColors.map(c => (
              <div
                key={c}
                onClick={() => setSetting('theme_color', c)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  cursor: 'pointer',
                  border: settings.theme_color === c ? '3px solid currentColor' : '2px solid transparent',
                  transform: settings.theme_color === c ? 'scale(1.15)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            ))}
            <TextField
              style={{ width: '120px' }}
              label="自定义"
              value={settings.theme_color || '#4ECDC4'}
              onInput={(e: Event) => {
                const val = (e.target as HTMLInputElement).value;
                if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                  debouncedSet('theme_color', val);
                }
              }}
            />
          </div>
        </div>

        {/* Font size */}
        <div>
          <label style={{ fontSize: '14px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
            字体大小: {settings.font_size || '16'}px
          </label>
          <Slider
            min={12}
            max={24}
            step={1}
            value={parseInt(settings.font_size || '16')}
            onChange={(e: Event) => {
              const target = e.target as HTMLElement & { value?: number };
              if (target.value !== undefined) debouncedSet('font_size', String(target.value));
            }}
          />
        </div>

        {/* TopBar height */}
        <div>
          <label style={{ fontSize: '14px', opacity: 0.7, display: 'block', marginBottom: '8px' }}>
            TopBar 高度: {settings.topbar_height || '3'}rem
          </label>
          <Slider
            min={2}
            max={5}
            step={0.5}
            value={parseFloat(settings.topbar_height || '3')}
            onChange={(e: Event) => {
              const target = e.target as HTMLElement & { value?: number };
              if (target.value !== undefined) debouncedSet('topbar_height', String(target.value));
            }}
          />
        </div>
      </div>
    </Card>
  );
}
