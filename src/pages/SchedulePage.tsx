import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Fab, Select, MenuItem, Dialog } from 'chen-the-dawnstreak';
import { useWebComponentEvent } from '../lib/use-web-component-event';
import { useSchedule } from '../contexts/ScheduleContext';
import { scheduleApi } from '../lib/ipc-client';
import { generateWeekOptions, groupScheduleByDay, getTodayWeekday } from '../lib/schedule-utils';
import { weekDays } from '../lib/constants';
import ScheduleGrid from '../components/schedule/ScheduleGrid';
import CourseDialog from '../components/schedule/CourseDialog';
import type { ScheduleWithCourse } from '../types/database';

export default function SchedulePage() {
  const { currentWeek, setCurrentWeek, refreshKey, triggerRefresh } = useSchedule();
  const [groupedSchedule, setGroupedSchedule] = useState<Record<number, ScheduleWithCourse[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'clone'>('add');
  const [selectedEntry, setSelectedEntry] = useState<ScheduleWithCourse | null>(null);
  const [detailEntry, setDetailEntry] = useState<ScheduleWithCourse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const weekOptions = generateWeekOptions(20);
  const todayWeekday = getTodayWeekday();

  const weekSelectRef = useRef<HTMLElement>(null);
  const refreshBtnRef = useRef<HTMLElement>(null);
  const fabRef = useRef<HTMLElement>(null);

  const loadSchedule = useCallback(async () => {
    const data = await scheduleApi.list(currentWeek);
    setGroupedSchedule(groupScheduleByDay(data));
  }, [currentWeek]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule, refreshKey]);

  // 使用 ref + addEventListener 绑定事件
  useWebComponentEvent(weekSelectRef, 'change', (e: Event) => {
    const target = e.target as HTMLElement & { value?: string };
    if (target.value) {
      setCurrentWeek(parseInt(target.value));
    }
  });

  useWebComponentEvent(refreshBtnRef, 'click', () => {
    loadSchedule();
  });

  useWebComponentEvent(fabRef, 'click', () => {
    setDialogMode('add');
    setSelectedEntry(null);
    setDialogOpen(true);
  });

  const handleCourseClick = (entry: ScheduleWithCourse) => {
    setDetailEntry(entry);
    setDetailOpen(true);
  };

  const handleEdit = () => {
    if (detailEntry) {
      setDialogMode('edit');
      setSelectedEntry(detailEntry);
      setDetailOpen(false);
      setDialogOpen(true);
    }
  };

  const handleClone = () => {
    if (detailEntry) {
      setDialogMode('clone');
      setSelectedEntry(detailEntry);
      setDetailOpen(false);
      setDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (detailEntry) {
      await scheduleApi.delete(detailEntry.id);
      setDetailOpen(false);
      triggerRefresh();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEntry(null);
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setSelectedEntry(null);
    triggerRefresh();
  };

  return (
    <div style={{ padding: '20px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>课程表</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Select
            ref={weekSelectRef}
            value={String(currentWeek)}
            style={{ width: '140px' }}
          >
            {weekOptions.map(opt => (
              <MenuItem key={opt.value} value={String(opt.value)}>{opt.label}</MenuItem>
            ))}
          </Select>
          <Button ref={refreshBtnRef} variant="tonal" icon="refresh">刷新</Button>
        </div>
      </div>

      <ScheduleGrid
        groupedSchedule={groupedSchedule}
        todayWeekday={todayWeekday}
        onCourseClick={handleCourseClick}
      />

      <Fab
        ref={fabRef}
        icon="add"
        style={{ position: 'fixed', right: '24px', bottom: '100px' }}
      />

      <CourseDialog
        open={dialogOpen}
        mode={dialogMode}
        entry={selectedEntry}
        currentWeek={currentWeek}
        onClose={handleDialogClose}
        onSaved={handleSaved}
      />

      {/* Detail Dialog */}
      {detailEntry && (
        <DetailDialog
          open={detailOpen}
          entry={detailEntry}
          onClose={() => setDetailOpen(false)}
          onEdit={handleEdit}
          onClone={handleClone}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function DetailDialog({ open, entry, onClose, onEdit, onClone, onDelete }: {
  open: boolean;
  entry: ScheduleWithCourse;
  onClose: () => void;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLElement>(null);
  const editBtnRef = useRef<HTMLElement>(null);
  const cloneBtnRef = useRef<HTMLElement>(null);
  const deleteBtnRef = useRef<HTMLElement>(null);

  useWebComponentEvent(dialogRef, 'close', onClose);
  useWebComponentEvent(closeBtnRef, 'click', onClose);
  useWebComponentEvent(editBtnRef, 'click', onEdit);
  useWebComponentEvent(cloneBtnRef, 'click', onClone);
  useWebComponentEvent(deleteBtnRef, 'click', onDelete);

  return (
    <Dialog
      ref={dialogRef}
      open={open}
      headline={entry.course_name}
      closeOnOverlayClick
      closeOnEsc
    >
      <div style={{ padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
          <span>教师：{entry.teacher || '未设置'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
          <span>地点：{entry.location || '未设置'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
          <span>时间：{weekDays[entry.day_of_week - 1]} {entry.start_time}-{entry.end_time}</span>
        </div>
        {entry.weeks && entry.weeks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
            <span>周数：第 {entry.weeks.join(', ')} 周</span>
          </div>
        )}
        {entry.note && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
            <span>备注：{entry.note}</span>
          </div>
        )}
      </div>
      <Button ref={closeBtnRef} slot="action" variant="text">关闭</Button>
      <Button ref={editBtnRef} slot="action" variant="text">编辑</Button>
      <Button ref={cloneBtnRef} slot="action" variant="text">克隆</Button>
      <Button ref={deleteBtnRef} slot="action" variant="text">删除</Button>
    </Dialog>
  );
}
