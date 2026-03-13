import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { students as initialStudents, allGradeLevels, getGradeLevelLabel, type Student } from './data/students';
import { StudentProfile } from './components/StudentProfile';
import { CustomCursor } from './components/CustomCursor';
import { LoginPage } from './components/LoginPage';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const statuses = ['all', 'enrolled', 'not-enrolled', 'graduated', 'transferred'] as const;

function Dashboard() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentsData, setStudentsData] = useState<Student[]>(initialStudents);
  const [isLoaded, setIsLoaded] = useState(false);

  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const heroRef = useRef<HTMLDivElement>(null);
  const titleCharsRef = useRef<HTMLSpanElement[]>([]);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filtered = useMemo(() => {
    return studentsData.filter((s) => {
      const fullName = `${s.firstName} ${s.middleName} ${s.lastName}`;
      const matchesQuery =
        query === '' ||
        fullName.toLowerCase().includes(query.toLowerCase()) ||
        s.section.toLowerCase().includes(query.toLowerCase()) ||
        s.studentId.toLowerCase().includes(query.toLowerCase()) ||
        s.lrn.includes(query) ||
        s.email.toLowerCase().includes(query.toLowerCase()) ||
        getGradeLevelLabel(s.gradeLevel).toLowerCase().includes(query.toLowerCase()) ||
        (s.strand && s.strand.toLowerCase().includes(query.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesGrade = gradeFilter === 'all' || s.gradeLevel === gradeFilter;

      return matchesQuery && matchesStatus && matchesGrade;
    });
  }, [query, statusFilter, gradeFilter, studentsData]);

  // Intro animation
  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => setIsLoaded(true),
    });

    tl.fromTo(
      titleCharsRef.current,
      { y: 120, opacity: 0, rotationX: -90 },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 1,
        stagger: 0.04,
        ease: 'power4.out',
      }
    )
      .fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(
        searchBoxRef.current,
        { y: 40, opacity: 0, scaleX: 0.8 },
        { y: 0, opacity: 1, scaleX: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo(
        filtersRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(
        counterRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        '-=0.3'
      );
  }, []);

  // Results animation
  useEffect(() => {
    if (!isLoaded) return;

    const visibleRows = rowRefs.current.filter(Boolean);
    if (visibleRows.length === 0) return;

    gsap.fromTo(
      visibleRows,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.03,
        ease: 'power3.out',
        overwrite: true,
      }
    );
  }, [filtered, isLoaded]);

  const handleRowHover = useCallback((el: HTMLDivElement | null, enter: boolean) => {
    if (!el) return;
    const nameColor = theme === 'dark' ? '#ffffff' : '#000000';
    const nameResetColor = theme === 'dark' ? '#e8e8e8' : '#1a1a1a';
    if (enter) {
      gsap.to(el, { x: 12, duration: 0.4, ease: 'power3.out' });
      gsap.to(el.querySelector('.row-indicator'), { scaleX: 1, duration: 0.4, ease: 'power3.out' });
      gsap.to(el.querySelector('.row-arrow'), { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' });
      gsap.to(el.querySelector('.row-name'), { color: nameColor, duration: 0.2 });
    } else {
      gsap.to(el, { x: 0, duration: 0.4, ease: 'power3.out' });
      gsap.to(el.querySelector('.row-indicator'), { scaleX: 0, duration: 0.3, ease: 'power3.in' });
      gsap.to(el.querySelector('.row-arrow'), { x: -10, opacity: 0, duration: 0.2 });
      gsap.to(el.querySelector('.row-name'), { color: nameResetColor, duration: 0.2 });
    }
  }, [theme]);

  const handleStudentUpdate = useCallback((updated: Student) => {
    setStudentsData((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedStudent(updated);
  }, []);

  const titleText = 'UNIVERS';

  const statusColor = (s: string) => {
    if (s === 'enrolled') return '#4ade80';
    if (s === 'graduated') return '#60a5fa';
    if (s === 'not-enrolled') return '#fbbf24';
    if (s === 'transferred') return '#c084fc';
    return '#f87171';
  };

  const statusLabel = (s: string) => {
    if (s === 'enrolled') return 'ENRL';
    if (s === 'graduated') return 'GRAD';
    if (s === 'not-enrolled') return 'N/E';
    if (s === 'transferred') return 'TRNF';
    return 'DROP';
  };

  return (
    <div className="noise-bg min-h-screen relative" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <CustomCursor />
      <div className="grid-lines" />

      {/* Floating top bar */}
      <nav className="fixed top-0 left-0 w-full z-40 px-8 md:px-14 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full pulse-slow" style={{ background: 'var(--text-primary)' }} />
          <span className="mono-tag" style={{ color: 'var(--text-tertiary)' }}>UNIVERS.EDU</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>STUDENT INFORMATION SYSTEM</span>
          <div className="w-px h-3" style={{ background: 'var(--border-tertiary)' }} />
          <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>K-12</span>
          <div className="w-px h-3" style={{ background: 'var(--border-tertiary)' }} />
          <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </span>
          <div className="w-px h-3" style={{ background: 'var(--border-tertiary)' }} />

          {/* User info + logout */}
          {user && (
            <div className="flex items-center gap-3">
              <span className="mono-tag" style={{ color: 'var(--text-tertiary)' }}>
                {user.displayName}
              </span>
              <button
                onClick={logout}
                className="mono-tag px-3 py-1 border transition-all hover:opacity-80"
                style={{
                  color: '#f87171',
                  borderColor: 'rgba(248,113,113,0.3)',
                }}
              >
                LOGOUT
              </button>
            </div>
          )}

          <ThemeToggle />
        </div>
      </nav>

      {/* Hero section */}
      <div ref={heroRef} className="relative z-10 pt-32 md:pt-40 px-8 md:px-14 lg:px-20">
        {/* Title */}
        <div className="overflow-hidden mb-4">
          <h1 className="text-[8vw] md:text-[6vw] lg:text-[5vw] font-light tracking-tighter leading-none flex">
            {titleText.split('').map((char, i) => (
              <span
                key={i}
                ref={(el) => {
                  if (el) titleCharsRef.current[i] = el;
                }}
                className="inline-block"
                style={{ fontWeight: i === 0 ? 300 : 200 }}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className="mb-12 md:mb-16 flex items-center gap-4">
          <div className="w-12 h-px" style={{ background: 'var(--border-tertiary)' }} />
          <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>
            K-12 Student Information System -- {studentsData.length} students registered
          </span>
        </div>

        {/* Search box */}
        <div ref={searchBoxRef} className="mb-8">
          <div className="pb-4 flex items-center gap-4 group" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            <div className="flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: 'var(--text-faint)' }}
                className="group-focus-within:text-[var(--text-tertiary)] transition-colors"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, LRN, student ID, grade level, section, strand..."
              className="search-input flex-1 text-xl md:text-2xl font-light w-full"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="mono-tag transition-colors"
                style={{ color: 'var(--text-quaternary)' }}
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div ref={filtersRef} className="mb-10 flex flex-col md:flex-row gap-6 md:items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono-tag mr-2" style={{ color: 'var(--text-muted)' }}>STATUS</span>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
              >
                {s === 'not-enrolled' ? 'NOT ENROLLED' : s.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="hidden md:block w-px h-6" style={{ background: 'var(--border-primary)' }} />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono-tag mr-2" style={{ color: 'var(--text-muted)' }}>GRADE</span>
            <button
              onClick={() => setGradeFilter('all')}
              className={`filter-chip ${gradeFilter === 'all' ? 'active' : ''}`}
            >
              ALL
            </button>
            {allGradeLevels.map((gl) => (
              <button
                key={gl}
                onClick={() => setGradeFilter(gl)}
                className={`filter-chip ${gradeFilter === gl ? 'active' : ''}`}
              >
                {gl === 'K' ? 'K' : `G${gl}`}
              </button>
            ))}
          </div>
        </div>

        {/* Counter */}
        <div ref={counterRef} className="flex items-center gap-4 mb-8">
          <span className="text-6xl md:text-7xl font-extralight tracking-tighter">
            {filtered.length}
          </span>
          <div className="flex flex-col">
            <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>RESULTS</span>
            <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>FOUND</span>
          </div>
          <div className="flex-1 h-px ml-4" style={{ background: 'var(--border-primary)' }} />
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-4 px-1 mb-4">
          <div className="col-span-4 md:col-span-3">
            <span className="mono-tag">NAME</span>
          </div>
          <div className="col-span-2 hidden md:block">
            <span className="mono-tag">GRADE LEVEL</span>
          </div>
          <div className="col-span-2 hidden md:block">
            <span className="mono-tag">SECTION</span>
          </div>
          <div className="col-span-2 hidden lg:block">
            <span className="mono-tag">LRN</span>
          </div>
          <div className="col-span-3 hidden md:block text-right">
            <span className="mono-tag">STATUS</span>
          </div>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="pb-20">
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-2xl font-extralight mb-2" style={{ color: 'var(--text-faint)' }}>No results</p>
              <p className="mono-tag" style={{ color: 'var(--text-ghost)' }}>Try adjusting your search or filters</p>
            </div>
          )}

          {filtered.map((student, i) => (
            <div
              key={student.id}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="student-row py-5 px-1 grid grid-cols-12 gap-4 items-center relative"
              onMouseEnter={(e) => handleRowHover(e.currentTarget, true)}
              onMouseLeave={(e) => handleRowHover(e.currentTarget, false)}
              onClick={() => setSelectedStudent(student)}
            >
              {/* Hover indicator */}
              <div
                className="row-indicator absolute left-0 top-0 w-[3px] h-full origin-top"
                style={{ transform: 'scaleX(0)', background: 'var(--text-primary)' }}
              />

              {/* Name + avatar */}
              <div className="col-span-8 md:col-span-3 flex items-center gap-3">
                <div className="w-7 h-7 border overflow-hidden flex-shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                  <img src={student.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-row-opacity)' }} />
                </div>
                <span className="row-name text-base font-light truncate">
                  {student.lastName}, {student.firstName}
                </span>
              </div>

              {/* Grade Level */}
              <div className="col-span-2 hidden md:flex items-center gap-2">
                <span className="text-sm font-light" style={{ color: 'var(--text-tertiary)' }}>
                  {getGradeLevelLabel(student.gradeLevel)}
                </span>
              </div>

              {/* Section */}
              <div className="col-span-2 hidden md:block">
                <span className="text-sm font-light" style={{ color: 'var(--text-quaternary)' }}>{student.section}</span>
              </div>

              {/* LRN */}
              <div className="col-span-2 hidden lg:block">
                <span className="text-xs font-mono tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {student.lrn}
                </span>
              </div>

              {/* Status + arrow */}
              <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-[6px] h-[6px] rounded-full"
                    style={{ background: statusColor(student.status) }}
                  />
                  <span
                    className="mono-tag hidden sm:inline"
                    style={{ color: statusColor(student.status) }}
                  >
                    {statusLabel(student.status)}
                  </span>
                </div>
                <div className="row-arrow opacity-0 -translate-x-2.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8H13M13 8L9 4M13 8L9 12"
                      stroke="var(--text-tertiary)"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="py-8 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>
            &copy; {new Date().getFullYear()} UNIVERS -- K-12 STUDENT INFORMATION SYSTEM
          </span>
          <span className="mono-tag" style={{ color: 'var(--text-invisible)' }}>v2.0.0</span>
        </div>
      </div>

      {/* Student Profile - Full Width */}
      <StudentProfile
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onStudentUpdate={handleStudentUpdate}
      />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
