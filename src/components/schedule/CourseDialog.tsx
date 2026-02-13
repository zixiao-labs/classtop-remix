import { useState, useEffect, useRef } from 'react';
import { Dialog, TextField, Select, MenuItem, Button } from 'chen-the-dawnstreak';
import { useWebComponentEvent } from '../../hooks/useWebComponentEvent';
import { courseApi, scheduleApi } from '../../lib/ipc-client';
import { courseColors, weekDays } from '../../lib/constants';
import { parseWeeksInput, formatWeeksForInput } from '../../lib/schedule-utils';
import type { ScheduleWithCourse } from '../../types/database';

interface CourseDialogProps {
  open: boolean;
  mode: 'add' | 'edit' | 'clone';
  entry: ScheduleWithCourse | null;
  currentWeek: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function CourseDialog({ open, mode, entry, onClose, onSaved }: CourseDialogProps) {
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState(courseColors[0]);
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:50');
  const [weeksInput, setWeeksInput] = useState('1-16');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Refs for web component event binding (mdui recommended approach for React)
  const dialogRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLElement>(null);
  const teacherRef = useRef<HTMLElement>(null);
  const locationRef = useRef<HTMLElement>(null);
  const dayRef = useRef<HTMLElement>(null);
  const startTimeRef = useRef<HTMLElement>(null);
  const endTimeRef = useRef<HTMLElement>(null);
  const weeksRef = useRef<HTMLElement>(null);
  const noteRef = useRef<HTMLElement>(null);
  const saveBtnRef = useRef<HTMLElement>(null);
  const cancelBtnRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && entry) {
      setName(entry.course_name);
      setTeacher(entry.teacher || '');
      setLocation(entry.location || '');
      setColor(entry.color || courseColors[0]);
      setDayOfWeek(String(entry.day_of_week));
      setStartTime(entry.start_time);
      setEndTime(entry.end_time);
      setWeeksInput(entry.weeks ? formatWeeksForInput(entry.weeks) : '1-16');
      setNote(entry.note || '');
    } else if (mode === 'clone' && entry) {
      setName(`${entry.course_name} (副本)`);
      setTeacher(entry.teacher || '');
      setLocation(entry.location || '');
      setColor(courseColors[Math.floor(Math.random() * courseColors.length)]);
      setDayOfWeek(String(entry.day_of_week));
      setStartTime(entry.start_time);
      setEndTime(entry.end_time);
      setWeeksInput(entry.weeks ? formatWeeksForInput(entry.weeks) : '1-16');
      setNote(entry.note || '');
    } else {
      setName('');
      setTeacher('');
      setLocation('');
      setColor(courseColors[Math.floor(Math.random() * courseColors.length)]);
      setDayOfWeek('1');
      setStartTime('08:00');
      setEndTime('09:50');
      setWeeksInput('1-16');
      setNote('');
    }
    setError('');
  }, [open, mode, entry]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('课程名称不能为空');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const weeks = parseWeeksInput(weeksInput);

      if (mode === 'edit' && entry) {
        await courseApi.update({ id: entry.course_id, name, teacher, location, color });
        await scheduleApi.delete(entry.id);
        await scheduleApi.add({
          course_id: entry.course_id,
          day_of_week: parseInt(dayOfWeek),
          start_time: startTime,
          end_time: endTime,
          weeks,
          note,
        });
      } else {
        const course = await courseApi.add({ name, teacher, location, color });
        await scheduleApi.add({
          course_id: course.id,
          day_of_week: parseInt(dayOfWeek),
          start_time: startTime,
          end_time: endTime,
          weeks,
          note,
        });
      }
      onSaved();
    } catch (err) {
      console.error('Save failed:', err);
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  // Event bindings via ref + addEventListener (bypasses chen-the-dawnstreak issues)
  useWebComponentEvent(dialogRef, 'close', (e: Event) => {
    if ((e.target as HTMLElement).tagName === 'MDUI-DIALOG') {
      onClose();
    }
  });
  useWebComponentEvent(nameRef, 'input', (e: Event) => {
    setName((e.target as HTMLElement & { value: string }).value);
  });
  useWebComponentEvent(teacherRef, 'input', (e: Event) => {
    setTeacher((e.target as HTMLElement & { value: string }).value);
  });
  useWebComponentEvent(locationRef, 'input', (e: Event) => {
    setLocation((e.target as HTMLElement & { value: string }).value);
  });
  useWebComponentEvent(dayRef, 'change', (e: Event) => {
    setDayOfWeek((e.target as HTMLElement & { value: string }).value);
  });
  useWebComponentEvent(startTimeRef, 'input', (e: Event) => {
    setStartTime((e.target as HTMLElement & { value: string }).value);
  });
  useWebComponentEvent(endTimeRef, 'input', (e: Event) => {
    setEndTime((e.target as HTMLElement & { value: string }).value);
  });
  useWebComponentEvent(weeksRef, 'input', (e: Event) => {
    setWeeksInput((e.target as HTMLElement & { value: string }).value);
  });
  useWebComponentEvent(noteRef, 'input', (e: Event) => {
    setNote((e.target as HTMLElement & { value: string }).value);
  });
  useWebComponentEvent(saveBtnRef, 'click', () => { handleSave(); });
  useWebComponentEvent(cancelBtnRef, 'click', () => { onClose(); });

  const titles: Record<string, string> = { add: '添加课程', edit: '编辑课程', clone: '克隆课程' };

  return (
    <Dialog
      ref={dialogRef}
      open={open}
      headline={titles[mode]}
      closeOnOverlayClick
      closeOnEsc
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
        <TextField ref={nameRef} label="课程名称" value={name} helper="必填" />
        <TextField ref={teacherRef} label="教师" value={teacher} />
        <TextField ref={locationRef} label="上课地点" value={location} />

        {/* Color picker */}
        <div>
          <label style={{ fontSize: '14px', opacity: 0.7 }}>课程颜色</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {courseColors.map(c => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  cursor: 'pointer',
                  border: color === c ? '2px solid var(--mdui-color-primary, #6750A4)' : '2px solid transparent',
                  transform: color === c ? 'scale(1.1)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        <Select ref={dayRef} label="星期" value={dayOfWeek}>
          {weekDays.map((day, index) => (
            <MenuItem key={index} value={String(index + 1)}>{day}</MenuItem>
          ))}
        </Select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <TextField ref={startTimeRef} label="开始时间" type="time" value={startTime} />
          <TextField ref={endTimeRef} label="结束时间" type="time" value={endTime} />
        </div>

        <TextField ref={weeksRef} label="上课周数" value={weeksInput} helper="例如: 1-8,10,12-16" />
        <TextField ref={noteRef} label="备注" value={note} />
        {error && (
          <div style={{ color: 'var(--mdui-color-error, #B3261E)', fontSize: '14px' }}>
            {error}
          </div>
        )}
      </div>

      <Button ref={cancelBtnRef} slot="action" variant="text">取消</Button>
      <Button ref={saveBtnRef} slot="action" variant="tonal" loading={saving}>
        {mode === 'edit' ? '更新' : '保存'}
      </Button>
    </Dialog>
  );
}
