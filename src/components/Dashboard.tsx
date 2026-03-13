import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import { students } from '../data/students';
import { faculty } from '../data/faculty';
import { subjectOfferings } from '../data/subjects';

interface Props {
  onNavigate: (view: 'students' | 'faculty' | 'subjects') => void;
}

// Simulated news/announcements
const announcements = [
  { id: 1, title: 'Enrollment for S.Y. 2025-2026 is now open', date: '2025-03-10', tag: 'REGISTRAR', color: '#4ade80' },
  { id: 2, title: 'Faculty evaluation forms due by March 15', date: '2025-03-08', tag: 'ADMIN', color: '#60a5fa' },
  { id: 3, title: 'Quarterly grades submission deadline extended', date: '2025-03-05', tag: 'ACADEMIC', color: '#fbbf24' },
  { id: 4, title: 'PTA General Assembly scheduled for March 20', date: '2025-03-03', tag: 'EVENTS', color: '#c084fc' },
  { id: 5, title: 'Student scholarship applications now accepted', date: '2025-03-01', tag: 'FINANCE', color: '#4ade80' },
  { id: 6, title: 'Science Fair registration closes March 12', date: '2025-02-28', tag: 'EVENTS', color: '#c084fc' },
];

// Simulated schedule for today (for teachers/advisers)
const todaySchedule = [
  { time: '7:00 - 8:00', subject: 'General Mathematics', section: 'G10 - Diamond', room: 'Room 201' },
  { time: '8:00 - 9:00', subject: 'Pre-Calculus', section: 'G11 - Emerald (STEM)', room: 'Room 301' },
  { time: '9:00 - 10:00', subject: 'Statistics & Probability', section: 'G11 - Ruby (ABM)', room: 'Room 302' },
  { time: '10:00 - 11:00', subject: 'General Mathematics', section: 'G10 - Sapphire', room: 'Room 201' },
  { time: '1:00 - 2:00', subject: 'Basic Calculus', section: 'G12 - Amethyst (STEM)', room: 'Lab 1' },
  { time: '2:00 - 3:00', subject: 'Advisory Period', section: 'G10 - Diamond', room: 'Room 201' },
];

export function Dashboard({ onNavigate }: Props) {
  const { user, hasRole, hasAnyRole } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll('.dash-anim');
    gsap.fromTo(items,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }
    );
  }, []);

  // Stats
  const enrolledStudents = students.filter(s => s.status === 'enrolled').length;
  const activeFaculty = faculty.filter(f => f.status === 'active').length;
  const totalOfferings = subjectOfferings.length;
  const totalSections = new Set(subjectOfferings.map(s => `${s.gradeLevel}-${s.section}`)).size;

  const isTeacherOrAdviser = hasAnyRole(['subject_teacher', 'adviser']);
  const isRegistrar = hasRole('registrar');
  const isFinance = hasRole('finance');

  // Get role badges
  const roleBadges = user?.roles.map(r => {
    switch (r) {
      case 'finance': return { label: 'FINANCE', color: '#4ade80' };
      case 'registrar': return { label: 'REGISTRAR', color: '#60a5fa' };
      case 'adviser': return { label: 'ADVISER', color: '#fbbf24' };
      case 'subject_teacher': return { label: 'TEACHER', color: '#c084fc' };
      default: return { label: String(r).toUpperCase(), color: '#888' };
    }
  }) ?? [];

  return (
    <div ref={containerRef}>
      {/* Welcome header */}
      <div className="dash-anim mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-2">
              Welcome back, {user?.displayName}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              {roleBadges.map((badge) => (
                <span key={badge.label} className="mono-tag px-2 py-0.5 border" style={{ color: badge.color, borderColor: badge.color + '44' }}>
                  {badge.label}
                </span>
              ))}
              <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>|</span>
              <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dash-anim grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button onClick={() => onNavigate('students')} className="border p-5 text-left transition-all group" style={{ borderColor: 'var(--border-primary)' }}>
          <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>ENROLLED STUDENTS</span>
          <span className="text-3xl font-light block">{enrolledStudents}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>of {students.length} total</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="var(--text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        <button onClick={() => onNavigate('faculty')} className="border p-5 text-left transition-all group" style={{ borderColor: 'var(--border-primary)' }}>
          <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>ACTIVE FACULTY</span>
          <span className="text-3xl font-light block">{activeFaculty}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>of {faculty.length} total</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="var(--text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        <button onClick={() => onNavigate('subjects')} className="border p-5 text-left transition-all group" style={{ borderColor: 'var(--border-primary)' }}>
          <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>SUBJECT OFFERINGS</span>
          <span className="text-3xl font-light block">{totalOfferings}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{totalSections} sections</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="var(--text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        <div className="border p-5" style={{ borderColor: 'var(--border-primary)' }}>
          <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>SCHOOL YEAR</span>
          <span className="text-3xl font-light block">2024</span>
          <span className="mono-tag mt-2 block" style={{ color: 'var(--text-faint)' }}>- 2025 (3rd Quarter)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Schedule (for teachers/advisers) */}
        {isTeacherOrAdviser && (
          <div className="lg:col-span-2 dash-anim">
            <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                  <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Today's Schedule</span>
                </div>
                <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                </span>
              </div>
              <div className="space-y-1">
                {todaySchedule.map((slot, i) => {
                  const isNow = i === 2; // Simulate "current" class
                  return (
                    <div key={i} className="flex items-center gap-4 py-3 px-3 transition-colors" style={{
                      borderLeft: isNow ? '2px solid #4ade80' : '2px solid transparent',
                      background: isNow ? 'rgba(74,222,128,0.04)' : 'transparent',
                    }}>
                      <span className="text-xs font-mono w-24 flex-shrink-0" style={{ color: isNow ? '#4ade80' : 'var(--text-quaternary)' }}>
                        {slot.time}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-light block" style={{ color: isNow ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {slot.subject}
                        </span>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{slot.section}</span>
                          <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{slot.room}</span>
                        </div>
                      </div>
                      {isNow && (
                        <span className="mono-tag px-2 py-0.5 border border-[#4ade80]/30 text-[#4ade80]">NOW</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Teaching Load Summary (for teachers) */}
        {isTeacherOrAdviser && (
          <div className="dash-anim">
            <div className="border p-6 h-full" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>My Teaching Load</span>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="mono-tag block mb-1">Subjects</span>
                  <span className="text-2xl font-light">6</span>
                </div>
                <div>
                  <span className="mono-tag block mb-1">Sections</span>
                  <span className="text-2xl font-light">5</span>
                </div>
                <div>
                  <span className="mono-tag block mb-1">Total Students</span>
                  <span className="text-2xl font-light">187</span>
                </div>
                {user?.advisorySection && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <span className="mono-tag block mb-1">Advisory Class</span>
                    <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>
                      Grade {user.advisoryGradeLevel} - {user.advisorySection}
                    </span>
                    <span className="mono-tag block mt-1" style={{ color: 'var(--text-faint)' }}>38 students</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Registrar Quick Actions */}
        {isRegistrar && !isTeacherOrAdviser && (
          <div className="lg:col-span-2 dash-anim">
            <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Registrar Overview</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>PENDING ENROLLMENT</span>
                  <span className="text-2xl font-light">{students.filter(s => s.status === 'not-enrolled').length}</span>
                </div>
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>TRANSFERRED</span>
                  <span className="text-2xl font-light">{students.filter(s => s.status === 'transferred').length}</span>
                </div>
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>GRADUATED</span>
                  <span className="text-2xl font-light">{students.filter(s => s.status === 'graduated').length}</span>
                </div>
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>DOCS PENDING</span>
                  <span className="text-2xl font-light">
                    {students.reduce((acc, s) => acc + s.documents.filter(d => d.status === 'pending').length, 0)}
                  </span>
                </div>
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>DOCS MISSING</span>
                  <span className="text-2xl font-light text-[#f87171]">
                    {students.reduce((acc, s) => acc + s.documents.filter(d => d.status === 'missing').length, 0)}
                  </span>
                </div>
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>FACULTY ON LEAVE</span>
                  <span className="text-2xl font-light text-[#fbbf24]">{faculty.filter(f => f.status === 'on-leave').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Finance Quick View */}
        {isFinance && !isTeacherOrAdviser && !isRegistrar && (
          <div className="lg:col-span-2 dash-anim">
            <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Finance Overview</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>ENROLLED (BILLABLE)</span>
                  <span className="text-2xl font-light">{enrolledStudents}</span>
                </div>
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>ACTIVE FACULTY</span>
                  <span className="text-2xl font-light">{activeFaculty}</span>
                </div>
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>TOTAL SECTIONS</span>
                  <span className="text-2xl font-light">{totalSections}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registrar/Finance: also show quick actions when combined with teacher role */}
        {(isRegistrar || isFinance) && isTeacherOrAdviser && (
          <div className="lg:col-span-3 dash-anim">
            <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>
                  {isRegistrar ? 'Registrar' : 'Finance'} Quick Stats
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>PENDING ENROLLMENT</span>
                  <span className="text-2xl font-light">{students.filter(s => s.status === 'not-enrolled').length}</span>
                </div>
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>DOCS PENDING</span>
                  <span className="text-2xl font-light">
                    {students.reduce((acc, s) => acc + s.documents.filter(d => d.status === 'pending').length, 0)}
                  </span>
                </div>
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>GRADUATED</span>
                  <span className="text-2xl font-light">{students.filter(s => s.status === 'graduated').length}</span>
                </div>
                <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-2" style={{ color: 'var(--text-quaternary)' }}>ON LEAVE</span>
                  <span className="text-2xl font-light text-[#fbbf24]">{faculty.filter(f => f.status === 'on-leave').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* News Feed / Announcements */}
      <div className="dash-anim mb-8">
        <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
              <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Announcements</span>
            </div>
            <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{announcements.length} updates</span>
          </div>
          <div className="space-y-1">
            {announcements.map((item) => (
              <div key={item.id} className="flex items-start gap-4 py-3 px-3 transition-colors" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <span className="mono-tag px-2 py-0.5 border flex-shrink-0 mt-0.5" style={{ color: item.color, borderColor: item.color + '33' }}>
                  {item.tag}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-light block" style={{ color: 'var(--text-secondary)' }}>
                    {item.title}
                  </span>
                </div>
                <span className="mono-tag flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation / Search Entry Points */}
      <div className="dash-anim mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
          <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Quick Access</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('students')}
            className="border p-5 text-left transition-all group"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="var(--text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-base font-light block mb-1">Student Records</span>
            <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>Search and manage student information</span>
          </button>

          <button
            onClick={() => onNavigate('faculty')}
            className="border p-5 text-left transition-all group"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="var(--text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-base font-light block mb-1">Faculty Directory</span>
            <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>View faculty profiles and teaching loads</span>
          </button>

          <button
            onClick={() => onNavigate('subjects')}
            className="border p-5 text-left transition-all group"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="var(--text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-base font-light block mb-1">Subject Offerings</span>
            <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>Browse schedules and class offerings</span>
          </button>
        </div>
      </div>

      {/* Enrollment by Grade Level (visual) */}
      <div className="dash-anim mb-8">
        <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
            <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Enrollment Distribution</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {['K','1','2','3','4','5','6','7','8','9','10','11','12'].map((gl) => {
              const count = students.filter(s => s.gradeLevel === gl && s.status === 'enrolled').length;
              const maxCount = 15; // approximate max per grade
              const height = Math.max(8, (count / maxCount) * 100);
              return (
                <div key={gl} className="flex-1 flex flex-col items-center gap-1">
                  <span className="mono-tag" style={{ color: 'var(--text-faint)', fontSize: '8px' }}>{count}</span>
                  <div className="w-full rounded-sm transition-all" style={{ height: `${height}%`, background: count > 0 ? 'var(--gpa-fill)' : 'var(--border-primary)', opacity: count > 0 ? 0.6 : 0.2 }} />
                  <span className="mono-tag" style={{ color: 'var(--text-quaternary)', fontSize: '8px' }}>{gl === 'K' ? 'K' : `G${gl}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
