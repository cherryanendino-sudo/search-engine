import { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { subjectOfferings } from '../data/subjects';

const gradeLevelGroups = [
  { label: 'ALL', value: 'all' },
  { label: 'ELEM', value: 'elem' },
  { label: 'JHS', value: 'jhs' },
  { label: 'SHS', value: 'shs' },
];

const strandFilters = ['All', 'STEM', 'ABM', 'HUMSS'];

export function SubjectOfferingsView() {
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [strandFilter, setStrandFilter] = useState('All');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filtered = useMemo(() => {
    return subjectOfferings.filter((s) => {
      const matchesQuery = query === '' ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.code.toLowerCase().includes(query.toLowerCase()) ||
        s.teacher.toLowerCase().includes(query.toLowerCase()) ||
        s.room.toLowerCase().includes(query.toLowerCase()) ||
        s.section.toLowerCase().includes(query.toLowerCase());

      let matchesLevel = true;
      const gl = parseInt(s.gradeLevel) || 0;
      if (levelFilter === 'elem') matchesLevel = gl >= 1 && gl <= 6;
      else if (levelFilter === 'jhs') matchesLevel = gl >= 7 && gl <= 10;
      else if (levelFilter === 'shs') matchesLevel = gl >= 11 && gl <= 12;

      const matchesStrand = strandFilter === 'All' || s.strand === strandFilter || (!s.strand && strandFilter === 'All');

      return matchesQuery && matchesLevel && matchesStrand;
    });
  }, [query, levelFilter, strandFilter]);

  // Animate rows
  useEffect(() => {
    if (!isLoaded) return;
    const visibleRows = rowRefs.current.filter(Boolean);
    if (visibleRows.length === 0) return;
    gsap.fromTo(visibleRows, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.02, ease: 'power3.out', overwrite: true });
  }, [filtered, isLoaded]);

  // Group by subject name for summary
  const subjectSummary = useMemo(() => {
    const map = new Map<string, { name: string; sections: number; totalEnrolled: number; totalCapacity: number; gradeLevels: Set<string> }>();
    for (const s of filtered) {
      const existing = map.get(s.name);
      if (existing) {
        existing.sections++;
        existing.totalEnrolled += s.enrolled;
        existing.totalCapacity += s.capacity;
        existing.gradeLevels.add(s.gradeLevel);
      } else {
        map.set(s.name, {
          name: s.name,
          sections: 1,
          totalEnrolled: s.enrolled,
          totalCapacity: s.capacity,
          gradeLevels: new Set([s.gradeLevel]),
        });
      }
    }
    return Array.from(map.values());
  }, [filtered]);

  const totalSections = filtered.length;
  const totalEnrolled = filtered.reduce((a, b) => a + b.enrolled, 0);

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div className="mb-12 md:mb-16 flex items-center gap-4">
        <div className="w-12 h-px" style={{ background: 'var(--border-tertiary)' }} />
        <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>
          Subject Offerings & Schedules -- S.Y. 2024-2025 -- {subjectOfferings.length} offerings
        </span>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="pb-4 flex items-center gap-4 group" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-faint)' }}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subject, code, teacher, room, section..."
            className="search-input flex-1 text-xl md:text-2xl font-light w-full"
          />
          {query && (
            <button onClick={() => setQuery('')} className="mono-tag transition-colors" style={{ color: 'var(--text-quaternary)' }}>CLEAR</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-10 flex flex-col md:flex-row gap-6 md:items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="mono-tag mr-2" style={{ color: 'var(--text-muted)' }}>LEVEL</span>
          {gradeLevelGroups.map((g) => (
            <button key={g.value} onClick={() => setLevelFilter(g.value)} className={`filter-chip ${levelFilter === g.value ? 'active' : ''}`}>
              {g.label}
            </button>
          ))}
        </div>
        <div className="hidden md:block w-px h-6" style={{ background: 'var(--border-primary)' }} />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="mono-tag mr-2" style={{ color: 'var(--text-muted)' }}>STRAND</span>
          {strandFilters.map((s) => (
            <button key={s} onClick={() => setStrandFilter(s)} className={`filter-chip ${strandFilter === s ? 'active' : ''}`}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-6xl md:text-7xl font-extralight tracking-tighter">{filtered.length}</span>
        <div className="flex flex-col">
          <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>OFFERINGS</span>
          <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>FOUND</span>
        </div>
        <div className="flex-1 h-px ml-4" style={{ background: 'var(--border-primary)' }} />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="mono-tag block" style={{ color: 'var(--text-quaternary)' }}>SECTIONS</span>
            <span className="text-lg font-light">{totalSections}</span>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--border-primary)' }} />
          <div className="text-right">
            <span className="mono-tag block" style={{ color: 'var(--text-quaternary)' }}>ENROLLED</span>
            <span className="text-lg font-light">{totalEnrolled}</span>
          </div>
        </div>
      </div>

      {/* Subject Summary Cards */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
          <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Subject Summary</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {subjectSummary.slice(0, 12).map((s) => (
            <div key={s.name} className="border p-3 transition-colors" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="text-xs font-light block mb-2 truncate" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
              <div className="flex items-end justify-between">
                <span className="text-lg font-light">{s.sections}</span>
                <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>sec</span>
              </div>
              <div className="mt-2 h-[2px]" style={{ background: 'var(--gpa-bar-bg)' }}>
                <div className="h-full transition-all" style={{ background: 'var(--gpa-fill)', width: `${Math.min(100, (s.totalEnrolled / s.totalCapacity) * 100)}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{s.totalEnrolled}</span>
                <span className="mono-tag" style={{ color: 'var(--text-ghost)' }}>/{s.totalCapacity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-1 mb-4">
        <div className="col-span-1"><span className="mono-tag">Code</span></div>
        <div className="col-span-2"><span className="mono-tag">Subject</span></div>
        <div className="col-span-1"><span className="mono-tag">Grade</span></div>
        <div className="col-span-1"><span className="mono-tag">Section</span></div>
        <div className="col-span-2"><span className="mono-tag">Teacher</span></div>
        <div className="col-span-2"><span className="mono-tag">Schedule</span></div>
        <div className="col-span-1"><span className="mono-tag">Room</span></div>
        <div className="col-span-2 text-right"><span className="mono-tag">Enrolled</span></div>
      </div>

      {/* Results */}
      <div className="pb-20">
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-2xl font-extralight mb-2" style={{ color: 'var(--text-faint)' }}>No offerings found</p>
            <p className="mono-tag" style={{ color: 'var(--text-ghost)' }}>Try adjusting your search or filters</p>
          </div>
        )}

        {filtered.map((subject, i) => {
          const fillPct = (subject.enrolled / subject.capacity) * 100;
          const fillColor = fillPct >= 90 ? '#f87171' : fillPct >= 70 ? '#fbbf24' : '#4ade80';

          return (
            <div key={subject.id}>
              <div
                ref={(el) => { rowRefs.current[i] = el; }}
                className="student-row py-4 px-1 grid grid-cols-12 gap-4 items-center relative"
                style={{ cursor: 'pointer' }}
                onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
              >
                <div className="col-span-4 md:col-span-1">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{subject.code}</span>
                </div>
                <div className="col-span-8 md:col-span-2">
                  <span className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>{subject.name}</span>
                  {subject.strand && <span className="mono-tag ml-2" style={{ color: fillColor }}>{subject.strand}</span>}
                </div>
                <div className="col-span-1 hidden md:block">
                  <span className="text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>G{subject.gradeLevel}</span>
                </div>
                <div className="col-span-1 hidden md:block">
                  <span className="text-sm font-light" style={{ color: 'var(--text-tertiary)' }}>{subject.section}</span>
                </div>
                <div className="col-span-2 hidden md:block">
                  <span className="text-sm font-light" style={{ color: 'var(--text-tertiary)' }}>{subject.teacher}</span>
                </div>
                <div className="col-span-2 hidden md:block">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{subject.schedule}</span>
                </div>
                <div className="col-span-1 hidden md:block">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{subject.room}</span>
                </div>
                <div className="col-span-2 hidden md:flex items-center justify-end gap-3">
                  <div className="w-16 h-1" style={{ background: 'var(--gpa-bar-bg)' }}>
                    <div className="h-full" style={{ background: fillColor, width: `${fillPct}%` }} />
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    {subject.enrolled}/{subject.capacity}
                  </span>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedSubject === subject.id && (
                <div className="mx-1 mb-3 border p-5" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="mono-tag block mb-1">Subject Code</span>
                      <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{subject.code}</span>
                    </div>
                    <div>
                      <span className="mono-tag block mb-1">Units</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subject.units}</span>
                    </div>
                    <div>
                      <span className="mono-tag block mb-1">School Year</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subject.schoolYear}</span>
                    </div>
                    {subject.semester && (
                      <div>
                        <span className="mono-tag block mb-1">Semester</span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subject.semester}</span>
                      </div>
                    )}
                    <div>
                      <span className="mono-tag block mb-1">Teacher</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subject.teacher}</span>
                    </div>
                    <div>
                      <span className="mono-tag block mb-1">Schedule</span>
                      <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{subject.schedule}</span>
                    </div>
                    <div>
                      <span className="mono-tag block mb-1">Room</span>
                      <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{subject.room}</span>
                    </div>
                    <div>
                      <span className="mono-tag block mb-1">Enrollment</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subject.enrolled} / {subject.capacity}</span>
                      <span className="mono-tag ml-2" style={{ color: fillColor }}>({Math.round(fillPct)}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
