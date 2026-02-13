import { generateTimeSlots, calculateCoursePosition } from '../../lib/schedule-utils';
import { weekDays, GRID_START_HOUR, GRID_END_HOUR, HOUR_HEIGHT } from '../../lib/constants';
import CourseCard from './CourseCard';
import type { ScheduleWithCourse } from '../../types/database';

interface ScheduleGridProps {
  groupedSchedule: Record<number, ScheduleWithCourse[]>;
  todayWeekday: number;
  onCourseClick: (entry: ScheduleWithCourse) => void;
}

const timeSlots = generateTimeSlots(GRID_START_HOUR, GRID_END_HOUR);
const gridHeight = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT;

export default function ScheduleGrid({ groupedSchedule, todayWeekday, onCourseClick }: ScheduleGridProps) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--mdui-color-surface, #fff)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      {/* Time axis */}
      <div style={{
        width: '60px',
        borderRight: '1px solid var(--mdui-color-surface-variant, #e0e0e0)',
        flexShrink: 0,
      }}>
        <div style={{ height: '50px', borderBottom: '1px solid var(--mdui-color-surface-variant, #e0e0e0)' }} />
        {timeSlots.map(slot => (
          <div key={slot.time} style={{
            height: `${HOUR_HEIGHT}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            opacity: 0.6,
            borderBottom: '1px solid rgba(0,0,0,0.05)',
          }}>
            {slot.label}
          </div>
        ))}
      </div>

      {/* Week columns */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Day headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          height: '50px',
          borderBottom: '1px solid var(--mdui-color-surface-variant, #e0e0e0)',
        }}>
          {weekDays.map((day, index) => (
            <div key={day} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              borderRight: index < 6 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              ...(index + 1 === todayWeekday ? {
                color: 'var(--mdui-color-primary, #6750A4)',
                background: 'rgba(103,80,164,0.08)',
              } : {}),
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Course grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          height: `${gridHeight}px`,
          position: 'relative',
        }}>
          {Array.from({ length: 7 }, (_, i) => i + 1).map(day => (
            <div key={day} style={{
              position: 'relative',
              borderRight: day < 7 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${HOUR_HEIGHT - 1}px, rgba(0,0,0,0.05) ${HOUR_HEIGHT - 1}px, rgba(0,0,0,0.05) ${HOUR_HEIGHT}px)`,
              ...(day === todayWeekday ? { backgroundColor: 'rgba(103,80,164,0.03)' } : {}),
            }}>
              {(groupedSchedule[day] || []).map(course => {
                const pos = calculateCoursePosition(course.start_time, course.end_time, GRID_START_HOUR, HOUR_HEIGHT);
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    top={pos.top}
                    height={pos.height}
                    onClick={() => onCourseClick(course)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
