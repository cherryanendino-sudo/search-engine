import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { students, type Student, getGradeLevelLabel } from '../data/students';
import { useAuth, type AdvisorySection } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

type MainTab = 'loads' | 'advisory';
type SubTab = 'students' | 'gradesheets' | 'attendance';
type Semester = '1st' | '2nd';
type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Final';

// Generate attendance data seeded by student
function getAttendanceForDate(studentId: string, date: string): 'present' | 'absent' | 'late' | 'excused' | null {
  const hash = (studentId + date).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = ((hash * 16807) % 2147483647) / 2147483647;
  if (r > 0.15) return 'present';
  if (r > 0.08) return 'late';
  if (r > 0.03) return 'excused';
  return 'absent';
}

// Get subjects for gradesheet based on strand
function getSubjectsForStrand(strand: string | null): string[] {
  const core = ['Pagbasa at Pagsusuri', 'Understanding Culture', 'Pagsusulat sa Filipino', 'Fundamentals of Acc.', 'Organization & Ma.', 'Practical Research 1', 'Reading and Writing', 'Statistics and Proba.'];
  if (strand === 'STEM') return ['Pre-Calculus', 'General Biology', 'General Chemistry', 'General Physics', ...core.slice(0, 4)];
  if (strand === 'ABM') return ['Applied Economics', 'Business Ethics', 'Business Math', 'Fundamentals of ABM', ...core.slice(0, 4)];
  if (strand === 'HUMSS') return ['Creative Writing', 'Philippine Politics', 'Trends & Networks', 'Community Engagement', ...core.slice(0, 4)];
  return core;
}

interface Props {
  onViewStudent?: (student: Student) => void;
}

export function AdvisoryDashboard({ onViewStudent }: Props) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [mainTab, setMainTab] = useState<MainTab>('advisory');
  const [subTab, setSubTab] = useState<SubTab>('students');
  const [semester, setSemester] = useState<Semester>('2nd');
  const [activeQuarter, setActiveQuarter] = useState<Quarter>('Q3');
  const [studentSearch, setStudentSearch] = useState('');
  const [sexFilter, setSexFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<'name' | 'gpa' | 'lrn'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [gradesheetView, setGradesheetView] = useState<'compact' | 'detailed'>('compact');

  // Multiple advisory support
  const advisories: AdvisorySection[] = user?.advisories?.length
    ? user.advisories
    : user?.advisorySection && user?.advisoryGradeLevel
      ? [{ section: user.advisorySection, gradeLevel: user.advisoryGradeLevel }]
      : [{ section: 'Diamond', gradeLevel: '10' }];

  const [selectedAdvisoryIdx, setSelectedAdvisoryIdx] = useState(0);
  const currentAdvisory = advisories[selectedAdvisoryIdx] ?? advisories[0];

  const listContainerRef = useRef<HTMLDivElement>(null);
  const gradesheetContainerRef = useRef<HTMLDivElement>(null);

  // Get advisory section info from selected advisory
  const advisorySection = currentAdvisory.section;
  const advisoryGradeLevel = currentAdvisory.gradeLevel;
  const isSHS = parseInt(advisoryGradeLevel) >= 11;

  // Get the strand for SHS from advisory or infer
  const sectionStrand = currentAdvisory.strand ?? (isSHS ? 'ABM' : null);

  // Filter students in this advisory section
  const advisoryStudents = useMemo(() => {
    return students.filter(s =>
      s.section === advisorySection &&
      s.gradeLevel === advisoryGradeLevel &&
      s.status === 'enrolled'
    );
  }, [advisorySection, advisoryGradeLevel]);

  // Search/filter students
  const filteredStudents = useMemo(() => {
    return advisoryStudents.filter(s => {
      const matchesSearch = studentSearch === '' ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.lrn.includes(studentSearch) ||
        s.studentId.toLowerCase().includes(studentSearch.toLowerCase());
      const matchesSex = sexFilter === 'all' || s.sex === sexFilter;
      return matchesSearch && matchesSex;
    });
  }, [advisoryStudents, studentSearch, sexFilter]);

  // Compute GPA from report cards
  const getStudentGPA = useCallback((s: Student): number | null => {
    const rc = s.reportCards[s.reportCards.length - 1];
    return rc?.generalAverage ?? null;
  }, []);

  // Sorted students
  const sortedStudents = useMemo(() => {
    const sorted = [...filteredStudents].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
        const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
        return sortDir === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      if (sortBy === 'gpa') {
        const gpaA = getStudentGPA(a) ?? 0;
        const gpaB = getStudentGPA(b) ?? 0;
        return sortDir === 'asc' ? gpaA - gpaB : gpaB - gpaA;
      }
      if (sortBy === 'lrn') {
        return sortDir === 'asc' ? a.lrn.localeCompare(b.lrn) : b.lrn.localeCompare(a.lrn);
      }
      return 0;
    });
    return sorted;
  }, [filteredStudents, sortBy, sortDir, getStudentGPA]);

  const maleStudents = useMemo(() => sortedStudents.filter(s => s.sex === 'Male'), [sortedStudents]);
  const femaleStudents = useMemo(() => sortedStudents.filter(s => s.sex === 'Female'), [sortedStudents]);

  // Class stats
  const gpas = advisoryStudents.map(getStudentGPA).filter((g): g is number => g !== null);
  const classAverage = gpas.length > 0 ? Math.round(gpas.reduce((a, b) => a + b, 0) / gpas.length) : 0;
  const highestGPA = gpas.length > 0 ? Math.max(...gpas) : 0;
  const lowestGPA = gpas.length > 0 ? Math.min(...gpas) : 0;
  // Honor roll tiers (DepEd standard)
  const withHighestHonors = advisoryStudents.filter(s => {
    const gpa = getStudentGPA(s);
    return gpa !== null && gpa >= 98;
  });
  const withHighHonors = advisoryStudents.filter(s => {
    const gpa = getStudentGPA(s);
    return gpa !== null && gpa >= 95 && gpa < 98;
  });
  const withHonors = advisoryStudents.filter(s => {
    const gpa = getStudentGPA(s);
    return gpa !== null && gpa >= 90 && gpa < 95;
  });
  const allHonorStudents = advisoryStudents.filter(s => {
    const gpa = getStudentGPA(s);
    return gpa !== null && gpa >= 90;
  });
  const needsSupport = advisoryStudents.filter(s => {
    const gpa = getStudentGPA(s);
    return gpa !== null && gpa < 75;
  });

  // All honor students sorted by GPA
  const honorRoll = [...allHonorStudents].sort((a, b) => (getStudentGPA(b) ?? 0) - (getStudentGPA(a) ?? 0));

  const getHonorTier = (gpa: number | null): { label: string; color: string } | null => {
    if (gpa === null) return null;
    if (gpa >= 98) return { label: 'WITH HIGHEST HONORS', color: '#fbbf24' };
    if (gpa >= 95) return { label: 'WITH HIGH HONORS', color: '#60a5fa' };
    if (gpa >= 90) return { label: 'WITH HONORS', color: '#4ade80' };
    return null;
  };

  // Subjects for gradesheet
  const gradesheetSubjects = getSubjectsForStrand(sectionStrand);

  // Generate grade for a student/subject/quarter
  const getGrade = useCallback((studentId: string, subjectIdx: number, quarter: string): number | null => {
    const hash = (studentId + subjectIdx + quarter).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = ((hash * 16807) % 2147483647) / 2147483647;
    if (quarter === 'Q4' && semester === '2nd' && activeQuarter === 'Q3') return null;
    if (quarter === 'Final' && activeQuarter !== 'Final') return null;
    return Math.round(65 + r * 35);
  }, [semester, activeQuarter]);

  const gradeColor = (g: number | null): string => {
    if (g === null) return 'var(--text-faint)';
    if (g >= 90) return '#4ade80';
    if (g >= 75) return 'var(--text-primary)';
    return '#f87171';
  };

  const gradeBg = (g: number | null): string => {
    if (g === null) return 'transparent';
    if (g >= 90) return 'rgba(74,222,128,0.06)';
    if (g < 75) return 'rgba(248,113,113,0.06)';
    return 'transparent';
  };

  // Today's schedule for subject loads tab
  const teachingLoads = [
    { time: '7:00 - 8:00', subject: 'General Mathematics', section: `G${advisoryGradeLevel} - ${advisorySection}`, room: 'Room 201', students: advisoryStudents.length, isActive: false },
    { time: '8:00 - 9:00', subject: isSHS ? 'Pre-Calculus' : 'Mathematics', section: 'G11 - Emerald (STEM)', room: 'Room 301', students: 35, isActive: false },
    { time: '9:00 - 10:00', subject: isSHS ? 'Statistics & Probability' : 'Science', section: 'G11 - Ruby (ABM)', room: 'Room 302', students: 32, isActive: true },
    { time: '10:00 - 11:00', subject: 'General Mathematics', section: 'G10 - Sapphire', room: 'Room 201', students: 38, isActive: false },
    { time: '1:00 - 2:00', subject: isSHS ? 'Basic Calculus' : 'Mathematics', section: 'G12 - Amethyst (STEM)', room: 'Lab 1', students: 28, isActive: false },
    { time: '2:00 - 3:00', subject: 'Advisory Period', section: `G${advisoryGradeLevel} - ${advisorySection}`, room: 'Room 201', students: advisoryStudents.length, isActive: false },
  ];

  // Passing rate
  const passingStudents = advisoryStudents.filter(s => {
    const gpa = getStudentGPA(s);
    return gpa !== null && gpa >= 75;
  }).length;
  const passingRate = advisoryStudents.length > 0 ? Math.round((passingStudents / advisoryStudents.length) * 100) : 0;

  // Animate list items on mount/filter change
  useEffect(() => {
    if (!listContainerRef.current) return;
    const rows = listContainerRef.current.querySelectorAll('.student-list-row');
    if (rows.length === 0) return;
    gsap.fromTo(rows,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, stagger: 0.02, ease: 'power3.out', overwrite: true }
    );
  }, [filteredStudents, subTab, sexFilter, sortBy, sortDir]);

  // Animate gradesheet on mount
  useEffect(() => {
    if (!gradesheetContainerRef.current) return;
    const rows = gradesheetContainerRef.current.querySelectorAll('.gs-row');
    if (rows.length === 0) return;
    gsap.fromTo(rows,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, stagger: 0.015, ease: 'power3.out', overwrite: true }
    );
  }, [filteredStudents, subTab, activeQuarter, semester, sexFilter, gradesheetView]);

  // Row hover handler
  const handleRowHover = useCallback((el: HTMLElement | null, enter: boolean) => {
    if (!el) return;
    const nameColor = theme === 'dark' ? '#ffffff' : '#000000';
    const nameResetColor = theme === 'dark' ? '#e8e8e8' : '#1a1a1a';
    if (enter) {
      gsap.to(el, { x: 8, duration: 0.35, ease: 'power3.out' });
      gsap.to(el.querySelector('.list-indicator'), { scaleX: 1, duration: 0.35, ease: 'power3.out' });
      gsap.to(el.querySelector('.list-arrow'), { x: 0, opacity: 1, duration: 0.25, ease: 'power3.out' });
      gsap.to(el.querySelector('.list-name'), { color: nameColor, duration: 0.2 });
    } else {
      gsap.to(el, { x: 0, duration: 0.35, ease: 'power3.out' });
      gsap.to(el.querySelector('.list-indicator'), { scaleX: 0, duration: 0.25, ease: 'power3.in' });
      gsap.to(el.querySelector('.list-arrow'), { x: -8, opacity: 0, duration: 0.2 });
      gsap.to(el.querySelector('.list-name'), { color: nameResetColor, duration: 0.2 });
    }
  }, [theme]);

  // Sort toggle
  const toggleSort = (field: 'name' | 'gpa' | 'lrn') => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir(field === 'gpa' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ field }: { field: 'name' | 'gpa' | 'lrn' }) => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: sortBy === field ? 1 : 0.3 }}>
      <path d={sortBy === field && sortDir === 'desc' ? 'M2 3L5 7L8 3' : 'M2 7L5 3L8 7'} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // Compute subject averages for gradesheet
  const getSubjectAverage = useCallback((students: Student[], subjectIdx: number, quarter: string): number | null => {
    const grades = students.map(s => getGrade(s.id, subjectIdx, quarter)).filter((g): g is number => g !== null);
    if (grades.length === 0) return null;
    return Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);
  }, [getGrade]);

  // Student row for the listing
  const renderStudentRow = (s: Student, index: number, globalIndex: number) => {
    const gpa = getStudentGPA(s);
    const gpaWidth = gpa !== null ? Math.max(0, Math.min(100, ((gpa - 65) / 35) * 100)) : 0;

    return (
      <div
        key={s.id}
        className="student-list-row student-row py-4 px-2 grid grid-cols-12 gap-3 items-center relative"
        onMouseEnter={(e) => handleRowHover(e.currentTarget, true)}
        onMouseLeave={(e) => handleRowHover(e.currentTarget, false)}
        onClick={() => onViewStudent?.(s)}
      >
        {/* Left indicator bar */}
        <div className="list-indicator absolute left-0 top-0 w-[3px] h-full origin-top" style={{ transform: 'scaleX(0)', background: 'var(--text-primary)' }} />

        {/* Number */}
        <div className="col-span-1 flex items-center justify-center">
          <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{String(globalIndex).padStart(2, '0')}</span>
        </div>

        {/* Name + Avatar */}
        <div className="col-span-3 flex items-center gap-3">
          <div className="w-8 h-8 border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
            <img src={s.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-row-opacity)' }} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="list-name text-sm font-light truncate" style={{ color: 'var(--text-primary)' }}>
              {s.lastName}, {s.firstName}
            </span>
            <span className="mono-tag" style={{ color: s.sex === 'Male' ? '#60a5fa' : '#f472b6', fontSize: '8px' }}>
              {s.sex.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Student ID */}
        <div className="col-span-2 hidden md:block">
          <span className="text-xs font-mono tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.studentId}</span>
        </div>

        {/* LRN */}
        <div className="col-span-2 hidden lg:block">
          <span className="text-xs font-mono tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.lrn}</span>
        </div>

        {/* GPA with bar */}
        <div className="col-span-2 flex items-center gap-2">
          <div className="flex-1">
            <div className="gpa-bar w-full rounded-sm overflow-hidden" style={{ height: '3px' }}>
              <div className="gpa-fill rounded-sm" style={{
                width: `${gpaWidth}%`,
                background: gpa !== null ? (gpa >= 90 ? '#4ade80' : gpa >= 75 ? 'var(--gpa-fill)' : '#f87171') : 'transparent',
              }} />
            </div>
          </div>
          <span className="text-sm font-mono font-medium" style={{
            color: gpa !== null ? (gpa >= 90 ? '#4ade80' : gpa >= 75 ? 'var(--text-primary)' : '#f87171') : 'var(--text-faint)',
            minWidth: '28px',
            textAlign: 'right',
          }}>
            {gpa ?? '--'}
          </span>
        </div>

        {/* Actions + Arrow */}
        <div className="col-span-2 flex items-center justify-end gap-2">
          <div className="hidden md:flex items-center gap-1">
            <button className="mono-tag px-2 py-1 border transition-all hover:border-[var(--border-hover)]" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-quaternary)', fontSize: '8px' }} onClick={(e) => { e.stopPropagation(); onViewStudent?.(s); }}>
              GRADES
            </button>
            <button className="mono-tag px-2 py-1 border transition-all hover:border-[var(--border-hover)]" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-quaternary)', fontSize: '8px' }} onClick={(e) => { e.stopPropagation(); onViewStudent?.(s); }}>
              PROFILE
            </button>
          </div>
          <div className="list-arrow opacity-0 -translate-x-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="var(--text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Main tabs: Subject Loads | Advisory */}
      <div className="flex items-center gap-6 mb-6" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <button
          onClick={() => setMainTab('loads')}
          className="flex items-center gap-2 px-4 py-3 relative transition-colors"
          style={{ color: mainTab === 'loads' ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          <span className="mono-tag">Subject Loads</span>
          {mainTab === 'loads' && <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'var(--text-primary)' }} />}
        </button>
        <button
          onClick={() => setMainTab('advisory')}
          className="flex items-center gap-2 px-4 py-3 relative transition-colors"
          style={{ color: mainTab === 'advisory' ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
          <span className="mono-tag">Advisory</span>
          {mainTab === 'advisory' && <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'var(--text-primary)' }} />}
        </button>
      </div>

      {/* ==================== SUBJECT LOADS TAB ==================== */}
      {mainTab === 'loads' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
              <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Today's Teaching Schedule</span>
            </div>
            <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="space-y-2 mb-8">
            {teachingLoads.map((load, i) => (
              <div key={i} className="border p-4 flex items-center gap-6 transition-colors" style={{
                borderColor: load.isActive ? '#4ade80' : 'var(--border-primary)',
                borderLeftWidth: load.isActive ? '3px' : '1px',
                background: load.isActive ? 'rgba(74,222,128,0.04)' : 'transparent',
              }}>
                <span className="text-xs font-mono w-24 flex-shrink-0" style={{ color: load.isActive ? '#4ade80' : 'var(--text-quaternary)' }}>
                  {load.time}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>{load.subject}</span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{load.section}</span>
                    <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{load.room}</span>
                    <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{load.students} students</span>
                  </div>
                </div>
                {load.isActive && (
                  <div className="flex items-center gap-3">
                    <span className="mono-tag px-2 py-0.5 border border-[#4ade80]/30 text-[#4ade80]">ACTIVE NOW</span>
                    <button className="mono-tag px-3 py-1.5 border border-[#4ade80] text-[#4ade80] transition-all hover:bg-[#4ade80]/10">
                      CHECK ATTENDANCE
                    </button>
                  </div>
                )}
                {!load.isActive && (
                  <button className="mono-tag px-3 py-1.5 border transition-all" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-tertiary)' }}>
                    VIEW CLASS
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Load summary */}
          <div className="border p-5 flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-6">
              <div>
                <span className="mono-tag block mb-1">Total Subjects</span>
                <span className="text-xl font-light">{teachingLoads.length - 1}</span>
              </div>
              <div className="w-px h-8" style={{ background: 'var(--border-primary)' }} />
              <div>
                <span className="mono-tag block mb-1">Total Students</span>
                <span className="text-xl font-light">{teachingLoads.reduce((a, l) => a + l.students, 0)}</span>
              </div>
              <div className="w-px h-8" style={{ background: 'var(--border-primary)' }} />
              <div>
                <span className="mono-tag block mb-1">Advisory</span>
                <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>G{advisoryGradeLevel} - {advisorySection}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADVISORY TAB ==================== */}
      {mainTab === 'advisory' && (
        <div>
          {/* Advisory selector + header */}
          {advisories.length > 1 && (
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              <span className="mono-tag flex-shrink-0" style={{ color: 'var(--text-muted)' }}>ADVISORY</span>
              {advisories.map((adv, idx) => (
                <button
                  key={`${adv.section}-${adv.gradeLevel}`}
                  onClick={() => { setSelectedAdvisoryIdx(idx); setStudentSearch(''); setSexFilter('all'); }}
                  className="mono-tag px-3 py-1.5 border transition-all flex-shrink-0"
                  style={{
                    borderColor: selectedAdvisoryIdx === idx ? 'var(--border-active)' : 'var(--border-primary)',
                    color: selectedAdvisoryIdx === idx ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: selectedAdvisoryIdx === idx ? 'rgba(128,128,128,0.08)' : 'transparent',
                  }}
                >
                  G{adv.gradeLevel} - {adv.strand ? `${adv.strand} ` : ''}{adv.section}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="mono-tag px-2 py-0.5 border border-[#fbbf24]/30 text-[#fbbf24]">Advisory</span>
                <span className="mono-tag px-2 py-0.5 border" style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-quaternary)' }}>S.Y. 2024-2025</span>
                {advisories.length > 1 && (
                  <span className="mono-tag px-2 py-0.5 border" style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-faint)' }}>
                    {selectedAdvisoryIdx + 1} of {advisories.length} sections
                  </span>
                )}
              </div>
              <h3 className="text-xl font-light">{sectionStrand ? `${sectionStrand} ` : ''}{advisorySection}</h3>
              <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{getGradeLevelLabel(advisoryGradeLevel as any)}</span>
            </div>

            {/* Semester + Quarter selectors */}
            <div className="flex items-center gap-3">
              {isSHS && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setSemester('1st')} className="mono-tag px-3 py-1.5 border transition-all" style={{
                    borderColor: semester === '1st' ? 'var(--border-active)' : 'var(--border-primary)',
                    color: semester === '1st' ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: semester === '1st' ? 'rgba(128,128,128,0.06)' : 'transparent',
                  }}>First Semester</button>
                  <button onClick={() => setSemester('2nd')} className="mono-tag px-3 py-1.5 border transition-all" style={{
                    borderColor: semester === '2nd' ? '#4ade80' : 'var(--border-primary)',
                    color: semester === '2nd' ? '#4ade80' : 'var(--text-muted)',
                    background: semester === '2nd' ? 'rgba(74,222,128,0.06)' : 'transparent',
                  }}>Second Semester</button>
                </div>
              )}
              <div className="flex items-center gap-1">
                {(isSHS && semester === '2nd' ? ['Q3', 'Q4', 'Final'] as Quarter[] : ['Q1', 'Q2', 'Q3', 'Q4', 'Final'] as Quarter[]).map((q) => (
                  <button key={q} onClick={() => setActiveQuarter(q)} className="mono-tag px-2.5 py-1.5 border transition-all" style={{
                    borderColor: activeQuarter === q ? 'var(--border-active)' : 'var(--border-primary)',
                    color: activeQuarter === q ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: activeQuarter === q ? 'rgba(128,128,128,0.08)' : 'transparent',
                    borderRadius: '2px',
                  }}>{q}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="mono-tag block mb-1" style={{ color: 'var(--text-quaternary)' }}>Total Students</span>
              <span className="text-3xl font-light">{advisoryStudents.length}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="mono-tag" style={{ color: '#60a5fa', fontSize: '8px' }}>{advisoryStudents.filter(s => s.sex === 'Male').length}M</span>
                <span className="mono-tag" style={{ color: '#f472b6', fontSize: '8px' }}>{advisoryStudents.filter(s => s.sex === 'Female').length}F</span>
              </div>
            </div>
            <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="mono-tag block mb-1" style={{ color: 'var(--text-quaternary)' }}>Class Average</span>
              <span className="text-3xl font-light">{classAverage}</span>
              <div className="gpa-bar w-full mt-2 rounded-sm overflow-hidden" style={{ height: '3px' }}>
                <div className="gpa-fill rounded-sm" style={{ width: `${Math.max(0, ((classAverage - 65) / 35) * 100)}%` }} />
              </div>
            </div>
            <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="mono-tag block mb-1" style={{ color: 'var(--text-quaternary)' }}>Honor Students</span>
              <span className="text-3xl font-light text-[#4ade80]">{allHonorStudents.length}</span>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {withHighestHonors.length > 0 && <span className="mono-tag" style={{ color: '#fbbf24', fontSize: '8px' }}>{withHighestHonors.length} HH</span>}
                {withHighHonors.length > 0 && <span className="mono-tag" style={{ color: '#60a5fa', fontSize: '8px' }}>{withHighHonors.length} HI</span>}
                {withHonors.length > 0 && <span className="mono-tag" style={{ color: '#4ade80', fontSize: '8px' }}>{withHonors.length} H</span>}
              </div>
            </div>
            <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="mono-tag block mb-1" style={{ color: 'var(--text-quaternary)' }}>Needs Support</span>
              <span className="text-3xl font-light text-[#f87171]">{needsSupport.length}</span>
              <span className="mono-tag block mt-1" style={{ color: 'var(--text-faint)', fontSize: '8px' }}>{'GPA < 75'}</span>
            </div>
          </div>

          {/* Honor Roll -- Three-tier system */}
          {honorRoll.length > 0 && (
            <div className="border p-5 mb-6" style={{ borderColor: 'var(--border-primary)', borderLeftWidth: '3px', borderLeftColor: '#fbbf24' }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Academic Honor Roll</span>
                  <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{honorRoll.length} students with honors</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#fbbf24' }} />
                    <span className="mono-tag" style={{ color: 'var(--text-quaternary)', fontSize: '8px' }}>{'HIGHEST (98-100)'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#60a5fa' }} />
                    <span className="mono-tag" style={{ color: 'var(--text-quaternary)', fontSize: '8px' }}>{'HIGH (95-97)'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
                    <span className="mono-tag" style={{ color: 'var(--text-quaternary)', fontSize: '8px' }}>{'HONORS (90-94)'}</span>
                  </div>
                </div>
              </div>

              {/* With Highest Honors */}
              {withHighestHonors.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-3" style={{ background: '#fbbf24' }} />
                    <span className="mono-tag" style={{ color: '#fbbf24' }}>With Highest Honors</span>
                    <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{withHighestHonors.length}</span>
                    <span className="mono-tag" style={{ color: 'var(--text-ghost)' }}>{'98-100 GPA'}</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(251,191,36,0.15)' }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...withHighestHonors].sort((a, b) => (getStudentGPA(b) ?? 0) - (getStudentGPA(a) ?? 0)).map((s, rank) => {
                      const gpa = getStudentGPA(s);
                      return (
                        <div key={s.id} className="border p-3 flex items-center gap-3 relative overflow-hidden transition-colors" style={{
                          borderColor: '#fbbf2444',
                          background: 'rgba(251,191,36,0.04)',
                        }} onClick={() => onViewStudent?.(s)}>
                          <div className="w-8 h-8 border overflow-hidden flex-shrink-0" style={{ borderColor: '#fbbf2444', background: 'var(--bg-input)' }}>
                            <img src={s.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-opacity)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-light truncate block" style={{ color: 'var(--text-primary)' }}>
                              {s.lastName}, {s.firstName}
                            </span>
                            <span className="mono-tag" style={{ color: '#fbbf24' }}>GPA: {gpa}</span>
                          </div>
                          <span className="text-2xl font-extralight" style={{ color: '#fbbf24', opacity: 0.4 }}>{rank + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* With High Honors */}
              {withHighHonors.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-3" style={{ background: '#60a5fa' }} />
                    <span className="mono-tag" style={{ color: '#60a5fa' }}>With High Honors</span>
                    <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{withHighHonors.length}</span>
                    <span className="mono-tag" style={{ color: 'var(--text-ghost)' }}>{'95-97 GPA'}</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(96,165,250,0.15)' }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...withHighHonors].sort((a, b) => (getStudentGPA(b) ?? 0) - (getStudentGPA(a) ?? 0)).map((s, rank) => {
                      const gpa = getStudentGPA(s);
                      return (
                        <div key={s.id} className="border p-3 flex items-center gap-3 relative overflow-hidden transition-colors" style={{
                          borderColor: '#60a5fa44',
                          background: 'rgba(96,165,250,0.04)',
                        }} onClick={() => onViewStudent?.(s)}>
                          <div className="w-8 h-8 border overflow-hidden flex-shrink-0" style={{ borderColor: '#60a5fa44', background: 'var(--bg-input)' }}>
                            <img src={s.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-opacity)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-light truncate block" style={{ color: 'var(--text-primary)' }}>
                              {s.lastName}, {s.firstName}
                            </span>
                            <span className="mono-tag" style={{ color: '#60a5fa' }}>GPA: {gpa}</span>
                          </div>
                          <span className="text-2xl font-extralight" style={{ color: '#60a5fa', opacity: 0.4 }}>{rank + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* With Honors */}
              {withHonors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-3" style={{ background: '#4ade80' }} />
                    <span className="mono-tag" style={{ color: '#4ade80' }}>With Honors</span>
                    <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{withHonors.length}</span>
                    <span className="mono-tag" style={{ color: 'var(--text-ghost)' }}>{'90-94 GPA'}</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(74,222,128,0.15)' }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...withHonors].sort((a, b) => (getStudentGPA(b) ?? 0) - (getStudentGPA(a) ?? 0)).map((s, rank) => {
                      const gpa = getStudentGPA(s);
                      return (
                        <div key={s.id} className="border p-3 flex items-center gap-3 relative overflow-hidden transition-colors" style={{
                          borderColor: 'var(--border-primary)',
                          background: 'rgba(74,222,128,0.03)',
                        }} onClick={() => onViewStudent?.(s)}>
                          <div className="w-8 h-8 border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-input)' }}>
                            <img src={s.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-opacity)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-light truncate block" style={{ color: 'var(--text-primary)' }}>
                              {s.lastName}, {s.firstName}
                            </span>
                            <span className="mono-tag" style={{ color: '#4ade80' }}>GPA: {gpa}</span>
                          </div>
                          <span className="text-2xl font-extralight" style={{ color: 'var(--text-ghost)', opacity: 0.4 }}>{rank + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-tabs: Students | Gradesheets | Attendance */}
          <div className="flex items-center justify-center gap-6 mb-6" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            {([
              { key: 'students' as SubTab, label: 'Students', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' },
              { key: 'gradesheets' as SubTab, label: 'Gradesheets', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { key: 'attendance' as SubTab, label: 'Attendance', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
            ]).map((tab) => (
              <button key={tab.key} onClick={() => setSubTab(tab.key)}
                className="flex items-center gap-2 px-4 py-3 relative transition-colors"
                style={{ color: subTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={tab.icon} />
                </svg>
                <span className="mono-tag">{tab.label}</span>
                {subTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'var(--text-primary)' }} />}
              </button>
            ))}
          </div>

          {/* ===== STUDENTS SUB-TAB ===== */}
          {subTab === 'students' && (
            <div ref={listContainerRef}>
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <h4 className="text-base font-light">Enrolled Students</h4>
                  <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>
                    {filteredStudents.length} of {advisoryStudents.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="flex items-center gap-2 px-3 py-1.5 border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-faint)' }}>
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <input type="text" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search by name, LRN, ID..."
                      className="search-input text-xs w-[180px]" style={{ fontSize: '11px' }} />
                    {studentSearch && (
                      <button onClick={() => setStudentSearch('')} className="mono-tag transition-colors" style={{ color: 'var(--text-muted)', fontSize: '8px' }}>X</button>
                    )}
                  </div>

                  {/* Sex filter */}
                  <div className="flex items-center gap-1">
                    {(['all', 'Male', 'Female'] as const).map((f) => (
                      <button key={f} onClick={() => setSexFilter(f)} className="mono-tag px-2.5 py-1.5 border transition-all" style={{
                        borderColor: sexFilter === f ? 'var(--border-active)' : 'var(--border-primary)',
                        color: sexFilter === f ? (f === 'Male' ? '#60a5fa' : f === 'Female' ? '#f472b6' : 'var(--text-primary)') : 'var(--text-muted)',
                        background: sexFilter === f ? 'rgba(128,128,128,0.06)' : 'transparent',
                      }}>{f === 'all' ? 'ALL' : f === 'Male' ? 'MALE' : 'FEMALE'}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-12 gap-3 px-2 mb-2 pb-2" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                <div className="col-span-1 flex items-center justify-center">
                  <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>#</span>
                </div>
                <div className="col-span-3">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 mono-tag transition-colors" style={{ color: sortBy === 'name' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    NAME <SortIcon field="name" />
                  </button>
                </div>
                <div className="col-span-2 hidden md:block">
                  <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>STUDENT ID</span>
                </div>
                <div className="col-span-2 hidden lg:block">
                  <button onClick={() => toggleSort('lrn')} className="flex items-center gap-1.5 mono-tag transition-colors" style={{ color: sortBy === 'lrn' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    LRN <SortIcon field="lrn" />
                  </button>
                </div>
                <div className="col-span-2">
                  <button onClick={() => toggleSort('gpa')} className="flex items-center gap-1.5 mono-tag transition-colors" style={{ color: sortBy === 'gpa' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    GPA <SortIcon field="gpa" />
                  </button>
                </div>
                <div className="col-span-2 text-right">
                  <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>ACTIONS</span>
                </div>
              </div>

              {/* Male students section */}
              {(sexFilter === 'all' || sexFilter === 'Male') && maleStudents.length > 0 && (
                <>
                  <div className="flex items-center gap-3 px-2 py-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#60a5fa' }} />
                    <span className="mono-tag" style={{ color: '#60a5fa' }}>MALE ({maleStudents.length})</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(96,165,250,0.15)' }} />
                  </div>
                  {maleStudents.map((s, i) => renderStudentRow(s, i, i + 1))}
                </>
              )}

              {/* Female students section */}
              {(sexFilter === 'all' || sexFilter === 'Female') && femaleStudents.length > 0 && (
                <>
                  <div className="flex items-center gap-3 px-2 py-3 mt-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#f472b6' }} />
                    <span className="mono-tag" style={{ color: '#f472b6' }}>FEMALE ({femaleStudents.length})</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(244,114,182,0.15)' }} />
                  </div>
                  {femaleStudents.map((s, i) => renderStudentRow(s, i, maleStudents.length + i + 1))}
                </>
              )}

              {/* Empty state */}
              {filteredStudents.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-xl font-extralight mb-2" style={{ color: 'var(--text-faint)' }}>No students found</p>
                  <p className="mono-tag" style={{ color: 'var(--text-ghost)' }}>Try adjusting your search or filters</p>
                </div>
              )}

              {/* Summary footer */}
              {filteredStudents.length > 0 && (
                <div className="mt-6 border p-4 flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>Total:</span>
                      <span className="text-lg font-light">{filteredStudents.length}</span>
                    </div>
                    <div className="w-px h-4" style={{ background: 'var(--border-primary)' }} />
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#60a5fa' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{maleStudents.length} Male</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f472b6' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{femaleStudents.length} Female</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>Class Avg:</span>
                      <span className="text-sm font-mono font-medium" style={{ color: classAverage >= 90 ? '#4ade80' : classAverage >= 75 ? 'var(--text-primary)' : '#f87171' }}>{classAverage}</span>
                    </div>
                    <div className="w-px h-4" style={{ background: 'var(--border-primary)' }} />
                    <div className="flex items-center gap-2">
                      <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>Passing:</span>
                      <span className="text-sm font-mono" style={{ color: '#4ade80' }}>{passingRate}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== GRADESHEETS SUB-TAB ===== */}
          {subTab === 'gradesheets' && (
            <div ref={gradesheetContainerRef}>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                    <h4 className="text-base font-light">{sectionStrand ? `${sectionStrand} ` : ''}{advisorySection}</h4>
                    <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{isSHS ? 'SHS' : 'JHS'}</span>
                  </div>
                  <span className="mono-tag ml-4" style={{ color: 'var(--text-faint)' }}>Grade Sheet -- {gradesheetSubjects.length} subjects</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* View toggle */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => setGradesheetView('compact')} className="mono-tag px-2.5 py-1.5 border transition-all" style={{
                      borderColor: gradesheetView === 'compact' ? 'var(--border-active)' : 'var(--border-primary)',
                      color: gradesheetView === 'compact' ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>COMPACT</button>
                    <button onClick={() => setGradesheetView('detailed')} className="mono-tag px-2.5 py-1.5 border transition-all" style={{
                      borderColor: gradesheetView === 'detailed' ? 'var(--border-active)' : 'var(--border-primary)',
                      color: gradesheetView === 'detailed' ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>DETAILED</button>
                  </div>
                  <div className="w-px h-4" style={{ background: 'var(--border-primary)' }} />
                  <button className="mono-tag px-4 py-2 border transition-all hover:border-[var(--border-hover)]" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-tertiary)' }}>
                    <span className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      Export
                    </span>
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-1">MALE</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-light">{maleStudents.length}</span>
                    <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>students</span>
                  </div>
                </div>
                <div className="border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-1">FEMALE</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-light">{femaleStudents.length}</span>
                    <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>students</span>
                  </div>
                </div>
                <div className="border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-1">GPA RANGE</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-light text-[#4ade80]">{highestGPA}</span>
                    <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>--</span>
                    <span className="text-lg font-light text-[#f87171]">{lowestGPA}</span>
                  </div>
                </div>
                <div className="border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-1">CLASS PERFORMANCE</span>
                  <div className="h-2 rounded-sm overflow-hidden mt-1" style={{ background: 'var(--gpa-bar-bg)' }}>
                    <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${passingRate}%`, background: passingRate >= 80 ? '#4ade80' : passingRate >= 60 ? '#fbbf24' : '#f87171' }} />
                  </div>
                  <span className="mono-tag mt-1 block" style={{ color: 'var(--text-quaternary)' }}>{passingRate}% Passing Rate</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-faint)' }}>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input type="text" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search students..."
                    className="search-input text-xs w-[180px]" style={{ fontSize: '11px' }} />
                </div>
                <div className="flex items-center gap-1">
                  {(['all', 'Male', 'Female'] as const).map((f) => (
                    <button key={f} onClick={() => setSexFilter(f)} className="mono-tag px-2.5 py-1.5 border transition-all" style={{
                      borderColor: sexFilter === f ? 'var(--border-active)' : 'var(--border-primary)',
                      color: sexFilter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>{f === 'all' ? 'All' : f === 'Male' ? 'Boys' : 'Girls'}</button>
                  ))}
                </div>
              </div>

              {/* Grade table */}
              <div className="gs-table-wrapper overflow-x-auto border" style={{ borderColor: 'var(--border-primary)' }}>
                <table className="w-full text-xs" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    {/* Subject names row */}
                    <tr style={{ background: 'var(--bg-card)' }}>
                      <th className="text-left p-3 sticky left-0 z-10" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-primary)', borderRight: '1px solid var(--border-primary)', minWidth: '40px' }}>
                        <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>#</span>
                      </th>
                      <th className="text-left p-3 sticky left-[40px] z-10" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-primary)', borderRight: '1px solid var(--border-primary)', minWidth: '180px' }}>
                        <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>LEARNER NAME</span>
                      </th>
                      {gradesheetSubjects.map((subj, si) => (
                        <th key={subj} colSpan={gradesheetView === 'detailed' ? 3 : 1} className="text-center p-2" style={{ borderBottom: '1px solid var(--border-primary)', borderRight: si < gradesheetSubjects.length - 1 ? '1px solid var(--border-primary)' : 'none', minWidth: gradesheetView === 'detailed' ? '120px' : '60px' }}>
                          <span className="mono-tag truncate block" title={subj} style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>
                            {subj.length > (gradesheetView === 'detailed' ? 18 : 10) ? subj.slice(0, gradesheetView === 'detailed' ? 16 : 8) + '..' : subj}
                          </span>
                          {gradesheetView === 'detailed' && (
                            <div className="flex justify-center gap-2 mt-1">
                              <span className="mono-tag" style={{ color: 'var(--text-faint)', fontSize: '7px' }}>Q3</span>
                              <span className="mono-tag" style={{ color: 'var(--text-faint)', fontSize: '7px' }}>Q4</span>
                              <span className="mono-tag" style={{ color: 'var(--text-faint)', fontSize: '7px' }}>FIN</span>
                            </div>
                          )}
                        </th>
                      ))}
                      <th className="text-center p-2" style={{ borderBottom: '1px solid var(--border-primary)', borderLeft: '1px solid var(--border-primary)', minWidth: '65px' }}>
                        <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>GPA</span>
                      </th>
                      <th className="text-center p-2" style={{ borderBottom: '1px solid var(--border-primary)', minWidth: '55px' }}>
                        <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>RMK</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Male students section */}
                    {(sexFilter === 'all' || sexFilter === 'Male') && maleStudents.length > 0 && (
                      <>
                        <tr className="gs-row">
                          <td colSpan={(gradesheetView === 'detailed' ? gradesheetSubjects.length * 3 : gradesheetSubjects.length) + 4} className="p-2 pt-4" style={{ background: 'rgba(96,165,250,0.03)' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#60a5fa' }} />
                              <span className="mono-tag text-[#60a5fa]">MALE STUDENTS ({maleStudents.length})</span>
                              <div className="flex-1 h-px" style={{ background: 'rgba(96,165,250,0.1)' }} />
                            </div>
                          </td>
                        </tr>
                        {maleStudents.map((s, idx) => {
                          const gpa = getStudentGPA(s);
                          return (
                            <tr key={s.id} className="gs-row gs-data-row transition-colors" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                              <td className="p-2 text-center sticky left-0 z-10" style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
                                <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{idx + 1}</span>
                              </td>
                              <td className="p-2 sticky left-[40px] z-10" style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                                    <img src={s.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-row-opacity)' }} />
                                  </div>
                                  <span className="text-xs font-light truncate" style={{ color: 'var(--text-primary)' }}>{s.lastName}, {s.firstName}</span>
                                </div>
                              </td>
                              {gradesheetSubjects.map((_, si) => {
                                if (gradesheetView === 'detailed') {
                                  return ['Q3', 'Q4', 'Final'].map((q) => {
                                    const g = getGrade(s.id, si, q);
                                    return (
                                      <td key={`${si}-${q}`} className="text-center p-1 gs-grade-cell" style={{ background: gradeBg(g), borderBottom: '1px solid var(--border-primary)' }}>
                                        <span className="font-mono" style={{ color: gradeColor(g), fontSize: '11px' }}>{g ?? '-'}</span>
                                      </td>
                                    );
                                  });
                                } else {
                                  const g = getGrade(s.id, si, activeQuarter);
                                  return (
                                    <td key={si} className="text-center p-1 gs-grade-cell" style={{ background: gradeBg(g), borderBottom: '1px solid var(--border-primary)', borderRight: si < gradesheetSubjects.length - 1 ? '1px solid var(--border-primary)' : 'none' }}>
                                      <span className="font-mono" style={{ color: gradeColor(g), fontSize: '11px' }}>{g ?? '-'}</span>
                                    </td>
                                  );
                                }
                              })}
                              <td className="text-center p-2" style={{ borderLeft: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)', background: gradeBg(gpa) }}>
                                <span className="font-mono font-semibold" style={{ color: gradeColor(gpa), fontSize: '12px' }}>{gpa ?? '-'}</span>
                              </td>
                              <td className="text-center p-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                <span className="mono-tag" style={{ color: gpa !== null ? (gpa >= 75 ? '#4ade80' : '#f87171') : 'var(--text-faint)', fontSize: '8px' }}>
                                  {gpa !== null ? (gpa >= 75 ? 'PASS' : 'FAIL') : '--'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    )}

                    {/* Female students section */}
                    {(sexFilter === 'all' || sexFilter === 'Female') && femaleStudents.length > 0 && (
                      <>
                        <tr className="gs-row">
                          <td colSpan={(gradesheetView === 'detailed' ? gradesheetSubjects.length * 3 : gradesheetSubjects.length) + 4} className="p-2 pt-4" style={{ background: 'rgba(244,114,182,0.03)' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f472b6' }} />
                              <span className="mono-tag text-[#f472b6]">FEMALE STUDENTS ({femaleStudents.length})</span>
                              <div className="flex-1 h-px" style={{ background: 'rgba(244,114,182,0.1)' }} />
                            </div>
                          </td>
                        </tr>
                        {femaleStudents.map((s, idx) => {
                          const gpa = getStudentGPA(s);
                          return (
                            <tr key={s.id} className="gs-row gs-data-row transition-colors" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                              <td className="p-2 text-center sticky left-0 z-10" style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
                                <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{idx + 1}</span>
                              </td>
                              <td className="p-2 sticky left-[40px] z-10" style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                                    <img src={s.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-row-opacity)' }} />
                                  </div>
                                  <span className="text-xs font-light truncate" style={{ color: 'var(--text-primary)' }}>{s.lastName}, {s.firstName}</span>
                                </div>
                              </td>
                              {gradesheetSubjects.map((_, si) => {
                                if (gradesheetView === 'detailed') {
                                  return ['Q3', 'Q4', 'Final'].map((q) => {
                                    const g = getGrade(s.id, si, q);
                                    return (
                                      <td key={`${si}-${q}`} className="text-center p-1 gs-grade-cell" style={{ background: gradeBg(g), borderBottom: '1px solid var(--border-primary)' }}>
                                        <span className="font-mono" style={{ color: gradeColor(g), fontSize: '11px' }}>{g ?? '-'}</span>
                                      </td>
                                    );
                                  });
                                } else {
                                  const g = getGrade(s.id, si, activeQuarter);
                                  return (
                                    <td key={si} className="text-center p-1 gs-grade-cell" style={{ background: gradeBg(g), borderBottom: '1px solid var(--border-primary)', borderRight: si < gradesheetSubjects.length - 1 ? '1px solid var(--border-primary)' : 'none' }}>
                                      <span className="font-mono" style={{ color: gradeColor(g), fontSize: '11px' }}>{g ?? '-'}</span>
                                    </td>
                                  );
                                }
                              })}
                              <td className="text-center p-2" style={{ borderLeft: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)', background: gradeBg(gpa) }}>
                                <span className="font-mono font-semibold" style={{ color: gradeColor(gpa), fontSize: '12px' }}>{gpa ?? '-'}</span>
                              </td>
                              <td className="text-center p-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                <span className="mono-tag" style={{ color: gpa !== null ? (gpa >= 75 ? '#4ade80' : '#f87171') : 'var(--text-faint)', fontSize: '8px' }}>
                                  {gpa !== null ? (gpa >= 75 ? 'PASS' : 'FAIL') : '--'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    )}

                    {/* Subject averages footer */}
                    <tr className="gs-row" style={{ background: 'var(--bg-card)' }}>
                      <td className="p-2 sticky left-0 z-10" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-primary)', borderTop: '2px solid var(--border-tertiary)' }} />
                      <td className="p-2 sticky left-[40px] z-10" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-primary)', borderTop: '2px solid var(--border-tertiary)' }}>
                        <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>SUBJECT AVERAGE</span>
                      </td>
                      {gradesheetSubjects.map((_, si) => {
                        if (gradesheetView === 'detailed') {
                          return ['Q3', 'Q4', 'Final'].map((q) => {
                            const avg = getSubjectAverage(filteredStudents, si, q);
                            return (
                              <td key={`avg-${si}-${q}`} className="text-center p-1" style={{ borderTop: '2px solid var(--border-tertiary)' }}>
                                <span className="font-mono font-semibold" style={{ color: gradeColor(avg), fontSize: '10px' }}>{avg ?? '-'}</span>
                              </td>
                            );
                          });
                        } else {
                          const avg = getSubjectAverage(filteredStudents, si, activeQuarter);
                          return (
                            <td key={`avg-${si}`} className="text-center p-1" style={{ borderTop: '2px solid var(--border-tertiary)', borderRight: si < gradesheetSubjects.length - 1 ? '1px solid var(--border-primary)' : 'none' }}>
                              <span className="font-mono font-semibold" style={{ color: gradeColor(avg), fontSize: '10px' }}>{avg ?? '-'}</span>
                            </td>
                          );
                        }
                      })}
                      <td className="text-center p-2" style={{ borderTop: '2px solid var(--border-tertiary)', borderLeft: '1px solid var(--border-primary)' }}>
                        <span className="font-mono font-bold" style={{ color: 'var(--text-primary)', fontSize: '12px' }}>{classAverage || '-'}</span>
                      </td>
                      <td className="text-center p-2" style={{ borderTop: '2px solid var(--border-tertiary)' }}>
                        <span className="mono-tag" style={{ color: '#4ade80', fontSize: '8px' }}>{passingRate}%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-6 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(74,222,128,0.12)' }} />
                  <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>With Honors (90+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(248,113,113,0.12)' }} />
                  <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{'Below Passing (<75)'}</span>
                </div>
                <div className="flex-1" />
                <span className="mono-tag" style={{ color: 'var(--text-ghost)' }}>
                  {filteredStudents.length} students | {gradesheetSubjects.length} subjects | {activeQuarter}
                </span>
              </div>
            </div>
          )}

          {/* ===== ATTENDANCE SUB-TAB ===== */}
          {subTab === 'attendance' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-light mb-1">Class Attendance</h4>
                  <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>G{advisoryGradeLevel} - {advisorySection}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-1.5 text-xs outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontFamily: "'Space Mono', monospace" }} />
                </div>
              </div>

              {/* Attendance summary */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {(['present', 'late', 'excused', 'absent'] as const).map((status) => {
                  const count = advisoryStudents.filter(s => {
                    const override = attendanceOverrides[`${s.id}-${attendanceDate}`];
                    const actual = override ?? getAttendanceForDate(s.id, attendanceDate);
                    return actual === status;
                  }).length;
                  const colors: Record<string, string> = { present: '#4ade80', late: '#fbbf24', excused: '#60a5fa', absent: '#f87171' };
                  return (
                    <div key={status} className="border p-3 text-center" style={{ borderColor: 'var(--border-primary)' }}>
                      <span className="text-2xl font-light" style={{ color: colors[status] }}>{count}</span>
                      <span className="mono-tag block mt-1" style={{ color: colors[status] }}>{status.toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Student attendance list */}
              <div className="space-y-1">
                {advisoryStudents.map((s) => {
                  const overrideKey = `${s.id}-${attendanceDate}`;
                  const currentStatus = attendanceOverrides[overrideKey] ?? getAttendanceForDate(s.id, attendanceDate) ?? 'present';
                  const colors: Record<string, string> = { present: '#4ade80', late: '#fbbf24', excused: '#60a5fa', absent: '#f87171' };

                  return (
                    <div key={s.id} className="flex items-center justify-between py-3 px-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                          <img src={s.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-row-opacity)' }} />
                        </div>
                        <span className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>{s.lastName}, {s.firstName}</span>
                        <span className="mono-tag px-1.5 py-0.5 border" style={{
                          color: s.sex === 'Male' ? '#60a5fa' : '#f472b6',
                          borderColor: s.sex === 'Male' ? '#60a5fa33' : '#f472b633',
                        }}>{s.sex}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(['present', 'late', 'excused', 'absent'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => setAttendanceOverrides(prev => ({ ...prev, [overrideKey]: status }))}
                            className="mono-tag px-2.5 py-1 border transition-all"
                            style={{
                              borderColor: currentStatus === status ? colors[status] : 'var(--border-primary)',
                              color: currentStatus === status ? colors[status] : 'var(--text-faint)',
                              background: currentStatus === status ? colors[status] + '11' : 'transparent',
                            }}
                          >
                            {status === 'present' ? 'P' : status === 'late' ? 'L' : status === 'excused' ? 'E' : 'A'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
