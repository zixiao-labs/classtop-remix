import type { ScheduleWithCourse } from '../../types/database';
import { courseColors } from '../../lib/constants';

interface CourseCardProps {
  course: ScheduleWithCourse;
  top: number;
  height: number;
  onClick: () => void;
}

export default function CourseCard({ course, top, height, onClick }: CourseCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '2px',
        right: '2px',
        top: `${top}px`,
        height: `${height}px`,
        borderRadius: '8px',
        padding: '8px',
        backgroundColor: course.color || courseColors[0],
        opacity: 0.9,
        color: 'white',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        (e.currentTarget as HTMLElement).style.zIndex = '10';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
        (e.currentTarget as HTMLElement).style.zIndex = '';
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {course.course_name}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.95, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {course.location || ''}
      </div>
      {height > 50 && (
        <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px' }}>
          {course.start_time}-{course.end_time}
        </div>
      )}
    </div>
  );
}
