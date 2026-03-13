import { useState, useMemo } from 'react';
import { students, type Student, getGradeLevelLabel } from '../data/students';
import { useAuth } from '../contexts/AuthContext';

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
  const [mainTab, setMainTab] = useState<MainTab>('advisory');
  const [subTab, setSubTab] = useState<SubTab>('students');
  const [semester, setSemester] = useState<Semester>('2nd');
  const [activeQuarter, setActiveQuarter] = useState<Quarter>('Q3');
  const [studentSearch, setStudentSearch] = useState('');
  const [sexFilter, setSexFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, string>>({});

  // Get advisory section info from user
  const advisorySection = user?.advisorySection ?? 'Diamond';
  const advisoryGradeLevel = user?.advisoryGradeLevel ?? '10';
  const isSHS = parseInt(advisoryGradeLevel) >= 11;

  // Get the strand for SHS
  const sectionStrand = isSHS ? 'ABM' : null; // Default for demo

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
        s.lrn.includes(studentSearch);
      const matchesSex = sexFilter === 'all' || s.sex === sexFilter;
      return matchesSearch && matchesSex;
    });
  }, [advisoryStudents, studentSearch, sexFilter]);

  const maleStudents = filteredStudents.filter(s => s.sex === 'Male');
  const femaleStudents = filteredStudents.filter(s => s.sex === 'Female');

  // Compute GPA from report cards
  const getStudentGPA = (s: Student): number | null => {
    const rc = s.reportCards[s.reportCards.length - 1];
    return rc?.generalAverage ?? null;
  };

  // Class stats
  const gpas = advisoryStudents.map(getStudentGPA).filter((g): g is number => g !== null);
  const classAverage = gpas.length > 0 ? Math.round(gpas.reduce((a, b) => a + b, 0) / gpas.length) : 0;
  const highestGPA = gpas.length > 0 ? Math.max(...gpas) : 0;
  const lowestGPA = gpas.length > 0 ? Math.min(...gpas) : 0;
  const withHonors = advisoryStudents.filter(s => {
    const gpa = getStudentGPA(s);
    return gpa !== null && gpa >= 90;
  });
  const needsSupport = advisoryStudents.filter(s => {
    const gpa = getStudentGPA(s);
    return gpa !== null && gpa < 75;
  });

  // Honor roll sorted by GPA
  const honorRoll = [...withHonors].sort((a, b) => (getStudentGPA(b) ?? 0) - (getStudentGPA(a) ?? 0));

  // Subjects for gradesheet
  const gradesheetSubjects = getSubjectsForStrand(sectionStrand);

  // Generate grade for a student/subject/quarter
  const getGrade = (studentId: string, subjectIdx: number, quarter: string): number | null => {
    const hash = (studentId + subjectIdx + quarter).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = ((hash * 16807) % 2147483647) / 2147483647;
    if (quarter === 'Q4' && semester === '2nd' && activeQuarter === 'Q3') return null; // Q4 not yet available
    if (quarter === 'Final' && activeQuarter !== 'Final') return null;
    return Math.round(65 + r * 35);
  };

  const gradeColor = (g: number | null): string => {
    if (g === null) return 'var(--text-faint)';
    if (g >= 90) return '#4ade80';
    if (g >= 75) return 'var(--text-primary)';
    return '#f87171';
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
          {/* Advisory header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="mono-tag px-2 py-0.5 border border-[#fbbf24]/30 text-[#fbbf24]">Advisory</span>
                <span className="mono-tag px-2 py-0.5 border" style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-quaternary)' }}>S.Y. 2024-2025</span>
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
            </div>
            <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="mono-tag block mb-1" style={{ color: 'var(--text-quaternary)' }}>Class Average</span>
              <span className="text-3xl font-light">{classAverage}</span>
            </div>
            <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="mono-tag block mb-1" style={{ color: 'var(--text-quaternary)' }}>With Honors</span>
              <span className="text-3xl font-light text-[#4ade80]">{withHonors.length}</span>
            </div>
            <div className="border p-4" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="mono-tag block mb-1" style={{ color: 'var(--text-quaternary)' }}>Needs Support</span>
              <span className="text-3xl font-light text-[#f87171]">{needsSupport.length}</span>
            </div>
          </div>

          {/* Honor Roll */}
          {honorRoll.length > 0 && (
            <div className="border p-5 mb-6" style={{ borderColor: 'var(--border-primary)', borderLeftWidth: '3px', borderLeftColor: '#fbbf24' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Academic Honor Roll</span>
                <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>Students with honors based on overall academic performance</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="mono-tag px-2 py-0.5 border border-[#fbbf24]/30 text-[#fbbf24]">With Honors</span>
                <span className="mono-tag" style={{ color: 'var(--text-tertiary)' }}>{honorRoll.length}</span>
                <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>90-94% General Average</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {honorRoll.slice(0, 8).map((s, rank) => {
                  const gpa = getStudentGPA(s);
                  return (
                    <div key={s.id} className="border p-3 flex items-center gap-3 relative overflow-hidden transition-colors" style={{
                      borderColor: rank < 3 ? '#fbbf24' + '44' : 'var(--border-primary)',
                      background: rank < 3 ? 'rgba(251,191,36,0.04)' : 'transparent',
                    }}
                    onClick={() => onViewStudent?.(s)}
                    >
                      <div className="w-8 h-8 border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-input)' }}>
                        <img src={s.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-opacity)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-light truncate block" style={{ color: 'var(--text-primary)' }}>
                          {s.lastName}, {s.firstName}
                        </span>
                        <span className="mono-tag" style={{ color: '#4ade80' }}>GPA: {gpa}</span>
                      </div>
                      <span className="text-2xl font-extralight" style={{ color: rank < 3 ? '#fbbf24' : 'var(--text-ghost)', opacity: 0.5 }}>
                        {rank + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
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
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-light">Enrolled Students</h4>
                <div className="flex items-center gap-3">
                  <input type="text" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search students..."
                    className="px-3 py-1.5 text-xs outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif", width: '200px' }} />
                </div>
              </div>

              {/* Males */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="mono-tag text-[#60a5fa]">MALE ({maleStudents.length})</span>
                </div>
                {maleStudents.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between py-3 px-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono w-6" style={{ color: 'var(--text-faint)' }}>{i + 1}</span>
                      <div className="w-7 h-7 border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                        <img src={s.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-row-opacity)' }} />
                      </div>
                      <span className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>{s.lastName}, {s.firstName}</span>
                      <span className="mono-tag px-1.5 py-0.5 border border-[#60a5fa]/30 text-[#60a5fa]">Male</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="mono-tag" style={{ color: 'var(--text-quaternary)' }} onClick={() => onViewStudent?.(s)}>Grade Slip</button>
                      <button className="mono-tag" style={{ color: 'var(--text-quaternary)' }} onClick={() => onViewStudent?.(s)}>Report Card</button>
                      <button className="mono-tag" style={{ color: 'var(--text-quaternary)' }} onClick={() => onViewStudent?.(s)}>SF10</button>
                      <button className="mono-tag" style={{ color: 'var(--text-quaternary)' }} onClick={() => onViewStudent?.(s)}>Records</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Females */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="mono-tag text-[#f472b6]">FEMALE ({femaleStudents.length})</span>
                </div>
                {femaleStudents.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between py-3 px-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono w-6" style={{ color: 'var(--text-faint)' }}>{i + 1}</span>
                      <div className="w-7 h-7 border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                        <img src={s.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-row-opacity)' }} />
                      </div>
                      <span className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>{s.lastName}, {s.firstName}</span>
                      <span className="mono-tag px-1.5 py-0.5 border border-[#f472b6]/30 text-[#f472b6]">Female</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="mono-tag" style={{ color: 'var(--text-quaternary)' }} onClick={() => onViewStudent?.(s)}>Grade Slip</button>
                      <button className="mono-tag" style={{ color: 'var(--text-quaternary)' }} onClick={() => onViewStudent?.(s)}>Report Card</button>
                      <button className="mono-tag" style={{ color: 'var(--text-quaternary)' }} onClick={() => onViewStudent?.(s)}>SF10</button>
                      <button className="mono-tag" style={{ color: 'var(--text-quaternary)' }} onClick={() => onViewStudent?.(s)}>Records</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== GRADESHEETS SUB-TAB ===== */}
          {subTab === 'gradesheets' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-base font-light mb-1">{sectionStrand ? `${sectionStrand} ` : ''}{advisorySection} <span className="mono-tag ml-2" style={{ color: 'var(--text-quaternary)' }}>{isSHS ? 'SHS' : 'JHS'}</span></h4>
                  <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>Grade Sheet Management</span>
                </div>
                <button className="mono-tag px-4 py-2 border transition-all" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-tertiary)' }}>Export Excel</button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-1">MALE</span>
                  <span className="text-xl font-light">{maleStudents.length} <span className="text-xs" style={{ color: 'var(--text-faint)' }}>students</span></span>
                </div>
                <div className="border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-1">FEMALE</span>
                  <span className="text-xl font-light">{femaleStudents.length} <span className="text-xs" style={{ color: 'var(--text-faint)' }}>students</span></span>
                </div>
                <div className="border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-1">HIGHEST GPA</span>
                  <span className="text-xl font-light text-[#4ade80]">{highestGPA}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-faint)' }}>LOWEST</span>
                  <span className="text-xl font-light text-[#f87171] ml-1">{lowestGPA}</span>
                </div>
                <div className="border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="mono-tag block mb-1">CLASS PERFORMANCE</span>
                  <div className="h-2 rounded-full overflow-hidden mt-1" style={{ background: 'var(--border-primary)' }}>
                    <div className="h-full rounded-full" style={{ width: `${passingRate}%`, background: '#4ade80' }} />
                  </div>
                  <span className="mono-tag mt-1 block" style={{ color: 'var(--text-quaternary)' }}>{passingRate}% Passing Rate</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 mb-4">
                <input type="text" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students..."
                  className="px-3 py-1.5 text-xs outline-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif", width: '200px' }} />
                <div className="flex items-center gap-1">
                  {(['all', 'Male', 'Female'] as const).map((f) => (
                    <button key={f} onClick={() => setSexFilter(f)} className="mono-tag px-2.5 py-1 border transition-all" style={{
                      borderColor: sexFilter === f ? 'var(--border-active)' : 'var(--border-primary)',
                      color: sexFilter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>{f === 'all' ? 'All' : f === 'Male' ? 'Boys' : 'Girls'}</button>
                  ))}
                </div>
              </div>

              {/* Grade table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th className="text-left p-2 sticky left-0" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)', minWidth: '180px' }}>
                        <span className="mono-tag">LEARNER NAME</span>
                      </th>
                      {gradesheetSubjects.map((subj) => (
                        <th key={subj} colSpan={3} className="text-center p-2" style={{ borderBottom: '1px solid var(--border-primary)', minWidth: '120px' }}>
                          <span className="mono-tag truncate block" title={subj}>{subj.length > 18 ? subj.slice(0, 16) + '...' : subj}</span>
                          <div className="flex justify-center gap-3 mt-1">
                            <span className="mono-tag" style={{ color: 'var(--text-faint)', fontSize: '8px' }}>Q3</span>
                            <span className="mono-tag" style={{ color: 'var(--text-faint)', fontSize: '8px' }}>Q4</span>
                            <span className="mono-tag" style={{ color: 'var(--text-faint)', fontSize: '8px' }}>FINAL</span>
                          </div>
                        </th>
                      ))}
                      <th className="text-center p-2" style={{ borderBottom: '1px solid var(--border-primary)', minWidth: '60px' }}>
                        <span className="mono-tag">GPA</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Male header */}
                    <tr>
                      <td colSpan={gradesheetSubjects.length * 3 + 2} className="p-2 pt-4">
                        <span className="mono-tag text-[#60a5fa]">MALE STUDENTS ({maleStudents.length})</span>
                      </td>
                    </tr>
                    {maleStudents.map((s) => {
                      const gpa = getStudentGPA(s);
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                          <td className="p-2 sticky left-0" style={{ background: 'var(--bg-primary)' }}>
                            <span className="text-xs font-light" style={{ color: 'var(--text-primary)' }}>{s.lastName}, {s.firstName}</span>
                          </td>
                          {gradesheetSubjects.map((_, si) => (
                            ['Q3', 'Q4', 'Final'].map((q) => {
                              const g = getGrade(s.id, si, q);
                              return (
                                <td key={`${si}-${q}`} className="text-center p-1">
                                  <span style={{ color: gradeColor(g), fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{g ?? '-'}</span>
                                </td>
                              );
                            })
                          ))}
                          <td className="text-center p-2">
                            <span className="font-mono font-semibold" style={{ color: gradeColor(gpa) }}>{gpa ?? '-'}</span>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Female header */}
                    <tr>
                      <td colSpan={gradesheetSubjects.length * 3 + 2} className="p-2 pt-4">
                        <span className="mono-tag text-[#f472b6]">FEMALE STUDENTS ({femaleStudents.length})</span>
                      </td>
                    </tr>
                    {femaleStudents.map((s) => {
                      const gpa = getStudentGPA(s);
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                          <td className="p-2 sticky left-0" style={{ background: 'var(--bg-primary)' }}>
                            <span className="text-xs font-light" style={{ color: 'var(--text-primary)' }}>{s.lastName}, {s.firstName}</span>
                          </td>
                          {gradesheetSubjects.map((_, si) => (
                            ['Q3', 'Q4', 'Final'].map((q) => {
                              const g = getGrade(s.id, si, q);
                              return (
                                <td key={`${si}-${q}`} className="text-center p-1">
                                  <span style={{ color: gradeColor(g), fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{g ?? '-'}</span>
                                </td>
                              );
                            })
                          ))}
                          <td className="text-center p-2">
                            <span className="font-mono font-semibold" style={{ color: gradeColor(gpa) }}>{gpa ?? '-'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
