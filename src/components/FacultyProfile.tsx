import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import type { Faculty } from '../data/faculty';

type Tab = 'overview' | 'load' | 'schedule';

interface Props {
  faculty: Faculty | null;
  onClose: () => void;
}

const statusColor = (s: Faculty['status']) => {
  switch (s) {
    case 'active': return '#4ade80';
    case 'on-leave': return '#fbbf24';
    case 'resigned': return '#f87171';
    case 'retired': return '#60a5fa';
    default: return '#555';
  }
};

export function FacultyProfile({ faculty, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const overlayRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!faculty) return;
    setActiveTab('overview');

    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
      .fromTo(profileRef.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
        '-=0.3'
      )
      .fromTo(
        contentRef.current?.querySelectorAll('.anim-item') || [],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'power3.out' },
        '-=0.4'
      );

    return () => { tl.kill(); };
  }, [faculty]);

  useEffect(() => {
    if (!tabContentRef.current) return;
    const items = tabContentRef.current.querySelectorAll('.tab-anim');
    gsap.fromTo(items,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.03, ease: 'power3.out' }
    );
  }, [activeTab]);

  const handleClose = useCallback(() => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(contentRef.current?.querySelectorAll('.anim-item') || [],
      { y: -30, opacity: 0, duration: 0.2, stagger: 0.02, ease: 'power2.in' }
    )
    .to(profileRef.current, { yPercent: 100, opacity: 0, duration: 0.6, ease: 'power3.in' }, '-=0.1')
    .to(overlayRef.current, { opacity: 0, duration: 0.3 }, '-=0.3');
  }, [onClose]);

  if (!faculty) return null;

  const sc = statusColor(faculty.status);
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'load', label: 'Teaching Load' },
    { key: 'schedule', label: 'Schedule' },
  ];

  const totalStudents = faculty.teachingLoad.reduce((a, b) => a + b.studentCount, 0);
  const uniqueSections = new Set(faculty.teachingLoad.map(l => `${l.gradeLevel}-${l.section}`)).size;

  // Build schedule grid
  const days = ['MWF', 'TTh'];
  const timeSlots = ['7:00', '8:00', '9:00', '10:00', '11:00', '1:00', '2:00', '3:00'];

  return (
    <div className="fixed inset-0 z-50">
      <div ref={overlayRef} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
      <div ref={profileRef} className="absolute inset-0 md:inset-4 lg:inset-6 border overflow-hidden flex flex-col" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Top bar */}
        <div ref={contentRef}>
          <div className="anim-item flex items-center justify-between px-6 md:px-10 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="flex items-center gap-4">
              <button onClick={handleClose} className="w-9 h-9 border flex items-center justify-center transition-all" style={{ borderColor: 'var(--border-secondary)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10 2L4 7L10 12" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc }} />
                <span className="mono-tag" style={{ color: sc }}>
                  {faculty.status.replace('-', ' ')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>FACULTY PROFILE</span>
              <div className="w-px h-3" style={{ background: 'var(--border-secondary)' }} />
              <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{faculty.employeeId}</span>
            </div>
          </div>

          {/* Profile header */}
          <div className="anim-item px-6 md:px-10 py-6 md:py-8" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 border overflow-hidden relative" style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-input)' }}>
                  <img src={faculty.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-opacity)' }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-3">
                  <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-none">
                    {faculty.title} {faculty.firstName}
                  </h2>
                  <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-none" style={{ color: 'var(--text-muted)' }}>
                    {faculty.middleName.charAt(0)}. {faculty.lastName} {faculty.suffix}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="mono-tag" style={{ color: 'var(--text-tertiary)' }}>{faculty.department}</span>
                  <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>|</span>
                  <span className="mono-tag" style={{ color: 'var(--text-tertiary)' }}>{faculty.position}</span>
                  {faculty.advisorySection && (
                    <>
                      <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>|</span>
                      <span className="mono-tag" style={{ color: 'var(--text-tertiary)' }}>Adviser: G{faculty.advisoryGradeLevel} - {faculty.advisorySection}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-6">
                <div className="text-center">
                  <span className="mono-tag block mb-1">SUBJECTS</span>
                  <span className="text-2xl font-light">{faculty.teachingLoad.length}</span>
                </div>
                <div className="w-px h-10" style={{ background: 'var(--border-primary)' }} />
                <div className="text-center">
                  <span className="mono-tag block mb-1">SECTIONS</span>
                  <span className="text-2xl font-light">{uniqueSections}</span>
                </div>
                <div className="w-px h-10" style={{ background: 'var(--border-primary)' }} />
                <div className="text-center">
                  <span className="mono-tag block mb-1">STUDENTS</span>
                  <span className="text-2xl font-light">{totalStudents}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="anim-item px-6 md:px-10 overflow-x-auto scrollbar-hide" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="flex gap-0 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative px-5 py-3.5 mono-tag transition-all duration-300"
                  style={{ color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'var(--text-primary)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div ref={tabContentRef} className="flex-1 overflow-y-auto px-6 md:px-10 py-6 md:py-8">
          
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 tab-anim">
                  <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Personal Information</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                      {([
                        ['Full Name', `${faculty.title} ${faculty.firstName} ${faculty.middleName} ${faculty.lastName} ${faculty.suffix}`],
                        ['Sex', faculty.sex],
                        ['Date of Birth', new Date(faculty.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                        ['Age', `${faculty.age} years old`],
                        ['Employee ID', faculty.employeeId],
                        ['Date Hired', new Date(faculty.dateHired).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                      ] as [string, string][]).map(([label, value]) => (
                        <div key={label}>
                          <span className="mono-tag block mb-1.5">{label}</span>
                          <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="tab-anim">
                  <div className="border p-6 h-full" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Contact</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="mono-tag block mb-1.5">Email</span>
                        <span className="text-sm font-mono break-all" style={{ color: 'var(--text-tertiary)' }}>{faculty.email}</span>
                      </div>
                      <div>
                        <span className="mono-tag block mb-1.5">Phone</span>
                        <span className="text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>{faculty.phone}</span>
                      </div>
                      <div>
                        <span className="mono-tag block mb-1.5">Address</span>
                        <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{faculty.address}, {faculty.city}, {faculty.province}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 tab-anim">
                  <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Professional Information</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                      {([
                        ['Department', faculty.department],
                        ['Specialization', faculty.specialization],
                        ['Position', faculty.position],
                        ['Status', faculty.status.replace('-', ' ').toUpperCase()],
                        ['Advisory', faculty.advisorySection ? `Grade ${faculty.advisoryGradeLevel} - ${faculty.advisorySection}` : 'None'],
                      ] as [string, string][]).map(([label, value]) => (
                        <div key={label}>
                          <span className="mono-tag block mb-1.5">{label}</span>
                          <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="tab-anim">
                  <div className="border p-6 h-full" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Load Summary</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="mono-tag block mb-1.5">Total Subjects</span>
                        <span className="text-lg font-light">{faculty.teachingLoad.length}</span>
                      </div>
                      <div>
                        <span className="mono-tag block mb-1.5">Total Students</span>
                        <span className="text-lg font-light">{totalStudents}</span>
                      </div>
                      <div>
                        <span className="mono-tag block mb-1.5">Sections Handled</span>
                        <span className="text-lg font-light">{uniqueSections}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEACHING LOAD */}
          {activeTab === 'load' && (
            <div className="max-w-6xl">
              <div className="tab-anim flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                  <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Teaching Load -- S.Y. 2024-2025</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{faculty.teachingLoad.length} subjects</span>
                  <div className="w-px h-3" style={{ background: 'var(--border-secondary)' }} />
                  <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{totalStudents} total students</span>
                </div>
              </div>

              {/* Header */}
              <div className="tab-anim hidden md:grid grid-cols-12 gap-4 px-4 py-3 mb-1" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <div className="col-span-1"><span className="mono-tag">Code</span></div>
                <div className="col-span-3"><span className="mono-tag">Subject</span></div>
                <div className="col-span-1"><span className="mono-tag">Grade</span></div>
                <div className="col-span-2"><span className="mono-tag">Section</span></div>
                <div className="col-span-2"><span className="mono-tag">Schedule</span></div>
                <div className="col-span-1"><span className="mono-tag">Room</span></div>
                <div className="col-span-2 text-right"><span className="mono-tag">Students</span></div>
              </div>

              {faculty.teachingLoad.map((load, i) => (
                <div key={i} className="tab-anim group">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 transition-colors relative" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <div className="absolute left-0 top-0 w-[2px] h-full scale-y-0 group-hover:scale-y-100 transition-transform origin-top" style={{ background: 'var(--text-primary)' }} />
                    <div className="col-span-1">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{load.subjectCode}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{load.subjectName}</span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>G{load.gradeLevel}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-light" style={{ color: 'var(--text-tertiary)' }}>{load.section}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{load.schedule}</span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{load.room}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>{load.studentCount}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="tab-anim mt-6 border p-5 flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="mono-tag block mb-1">Total Subjects</span>
                    <span className="text-xl font-light">{faculty.teachingLoad.length}</span>
                  </div>
                  <div className="w-px h-8" style={{ background: 'var(--border-primary)' }} />
                  <div>
                    <span className="mono-tag block mb-1">Total Students</span>
                    <span className="text-xl font-light">{totalStudents}</span>
                  </div>
                  <div className="w-px h-8" style={{ background: 'var(--border-primary)' }} />
                  <div>
                    <span className="mono-tag block mb-1">Sections</span>
                    <span className="text-xl font-light">{uniqueSections}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: sc }} />
                  <span className="mono-tag" style={{ color: sc }}>{faculty.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="max-w-6xl">
              <div className="tab-anim flex items-center gap-3 mb-6">
                <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Weekly Schedule</span>
              </div>

              <div className="tab-anim border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
                {/* Schedule header */}
                <div className="grid grid-cols-3 md:grid-cols-3" style={{ background: 'var(--bg-card)' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)', borderRight: '1px solid var(--border-primary)' }}>
                    <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Time</span>
                  </div>
                  {days.map((day) => (
                    <div key={day} className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>{day}</span>
                    </div>
                  ))}
                </div>

                {/* Schedule rows */}
                {timeSlots.map((time) => {
                  const mwfLoads = faculty.teachingLoad.filter(l => l.schedule.startsWith('MWF') && l.schedule.includes(time));
                  const tthLoads = faculty.teachingLoad.filter(l => l.schedule.startsWith('TTh') && l.schedule.includes(time));

                  return (
                    <div key={time} className="grid grid-cols-3 md:grid-cols-3">
                      <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border-primary)', borderRight: '1px solid var(--border-primary)' }}>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{time}</span>
                      </div>
                      {[mwfLoads, tthLoads].map((loads, di) => (
                        <div key={di} className="px-3 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                          {loads.map((load, li) => (
                            <div key={li} className="border p-2 mb-1 last:mb-0" style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-tertiary)' }}>
                              <span className="text-xs font-light block" style={{ color: 'var(--text-secondary)' }}>{load.subjectName}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>G{load.gradeLevel}-{load.section}</span>
                                <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{load.room}</span>
                              </div>
                            </div>
                          ))}
                          {loads.length === 0 && (
                            <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>--</span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 md:px-10 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <span className="mono-tag" style={{ color: 'var(--text-invisible)' }}>UNIVERS.EDU -- FACULTY INFORMATION SYSTEM</span>
          <span className="mono-tag" style={{ color: 'var(--text-invisible)' }}>S.Y. 2024-2025</span>
        </div>
      </div>
    </div>
  );
}
