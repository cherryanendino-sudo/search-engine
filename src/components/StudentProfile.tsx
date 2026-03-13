import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import type { Student } from '../data/students';
import { getGradeLevelLabel } from '../data/students';

type Tab = 'overview' | 'academic' | 'reports' | 'documents' | 'enrollment';

interface Props {
  student: Student | null;
  onClose: () => void;
}

const statusColor = (s: Student['status']) => {
  switch (s) {
    case 'enrolled': return '#4ade80';
    case 'graduated': return '#60a5fa';
    case 'not-enrolled': return '#fbbf24';
    case 'transferred': return '#c084fc';
    case 'dropped': return '#f87171';
    default: return '#555';
  }
};

const docStatusColor = (s: string) => {
  if (s === 'submitted') return '#4ade80';
  if (s === 'pending') return '#fbbf24';
  return '#f87171';
};

export function StudentProfile({ student, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [enrollModal, setEnrollModal] = useState(false);
  const [enrollGrade, setEnrollGrade] = useState('');
  const [enrollSection, setEnrollSection] = useState('');
  const [enrollSY, setEnrollSY] = useState('2025-2026');
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!student) return;
    setActiveTab('overview');
    setEnrollModal(false);
    setEnrollSuccess(false);

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
  }, [student]);

  // Tab content animation
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

  const handleEnroll = () => {
    setEnrollSuccess(true);
    setTimeout(() => setEnrollModal(false), 1500);
  };

  if (!student) return null;

  const sc = statusColor(student.status);
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'academic', label: 'Academic Load' },
    { key: 'reports', label: 'Report Card' },
    { key: 'documents', label: 'Documents' },
    { key: 'enrollment', label: 'Enrollment' },
  ];

  const currentReportCard = student.reportCards.length > 0 ? student.reportCards[student.reportCards.length - 1] : null;
  const pastReportCards = student.reportCards.slice(0, -1);

  const submittedDocs = student.documents.filter(d => d.status === 'submitted').length;
  const totalUnits = student.academicLoad.reduce((a, b) => a + b.units, 0);

  return (
    <div className="fixed inset-0 z-50">
      <div ref={overlayRef} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
      <div ref={profileRef} className="absolute inset-0 md:inset-4 lg:inset-6 bg-[#080808] border border-[#1a1a1a] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Top bar */}
        <div ref={contentRef}>
          <div className="anim-item flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#141414]">
            <div className="flex items-center gap-4">
              <button onClick={handleClose} className="w-9 h-9 border border-[#222] flex items-center justify-center hover:border-[#555] hover:bg-[#111] transition-all">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10 2L4 7L10 12" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc }} />
                <span className="mono-tag" style={{ color: sc }}>
                  {student.status.replace('-', ' ')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="mono-tag text-[#333]">STUDENT PROFILE</span>
              <div className="w-px h-3 bg-[#222]" />
              <span className="mono-tag text-[#333]">{student.studentId}</span>
            </div>
          </div>

          {/* Profile header */}
          <div className="anim-item px-6 md:px-10 py-6 md:py-8 border-b border-[#141414]">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 border border-[#222] bg-[#0d0d0d] overflow-hidden relative">
                  <img src={student.avatar} alt="" className="w-full h-full object-cover invert opacity-70" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent" />
                </div>
              </div>

              {/* Name & Quick Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-3">
                  <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-none">
                    {student.firstName}
                  </h2>
                  <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-none text-[#444]">
                    {student.middleName.charAt(0)}. {student.lastName} {student.suffix}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="mono-tag text-[#666]">LRN: {student.lrn}</span>
                  <span className="mono-tag text-[#333]">|</span>
                  <span className="mono-tag text-[#666]">{getGradeLevelLabel(student.gradeLevel)}</span>
                  <span className="mono-tag text-[#333]">|</span>
                  <span className="mono-tag text-[#666]">Section {student.section}</span>
                  {student.strand && (
                    <>
                      <span className="mono-tag text-[#333]">|</span>
                      <span className="mono-tag text-[#666]">{student.strand}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="hidden lg:flex items-center gap-6">
                <div className="text-center">
                  <span className="mono-tag block mb-1">SUBJECTS</span>
                  <span className="text-2xl font-light">{student.academicLoad.length}</span>
                </div>
                <div className="w-px h-10 bg-[#1a1a1a]" />
                <div className="text-center">
                  <span className="mono-tag block mb-1">UNITS</span>
                  <span className="text-2xl font-light">{totalUnits}</span>
                </div>
                <div className="w-px h-10 bg-[#1a1a1a]" />
                <div className="text-center">
                  <span className="mono-tag block mb-1">DOCS</span>
                  <span className="text-2xl font-light">{submittedDocs}/{student.documents.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="anim-item px-6 md:px-10 border-b border-[#141414] overflow-x-auto scrollbar-hide">
            <div className="flex gap-0 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-5 py-3.5 mono-tag transition-all duration-300 ${
                    activeTab === tab.key ? 'text-white' : 'text-[#444] hover:text-[#888]'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content - scrollable */}
        <div ref={tabContentRef} className="flex-1 overflow-y-auto px-6 md:px-10 py-6 md:py-8">
          
          {/* ========== OVERVIEW TAB ========== */}
          {activeTab === 'overview' && (
            <div className="max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                
                {/* Personal Information */}
                <div className="lg:col-span-2 tab-anim">
                  <div className="border border-[#151515] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4 bg-white" />
                      <span className="mono-tag text-white">Personal Information</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                      {([
                        ['Full Name', `${student.firstName} ${student.middleName} ${student.lastName} ${student.suffix}`],
                        ['Sex', student.sex],
                        ['Date of Birth', new Date(student.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                        ['Age', `${student.age} years old`],
                        ['Nationality', student.nationality],
                        ['Religion', student.religion],
                      ] as [string, string][]).map(([label, value]) => (
                        <div key={label}>
                          <span className="mono-tag block mb-1.5">{label}</span>
                          <span className="text-sm font-light text-[#ccc]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="tab-anim">
                  <div className="border border-[#151515] p-6 h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4 bg-white" />
                      <span className="mono-tag text-white">Contact</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="mono-tag block mb-1.5">Email</span>
                        <span className="text-sm font-mono text-[#888] break-all">{student.email}</span>
                      </div>
                      <div>
                        <span className="mono-tag block mb-1.5">Phone</span>
                        <span className="text-sm font-mono text-[#888]">{student.phone}</span>
                      </div>
                      <div>
                        <span className="mono-tag block mb-1.5">Address</span>
                        <span className="text-sm font-light text-[#ccc]">{student.address}, {student.city}, {student.province} {student.zipCode}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="lg:col-span-2 tab-anim">
                  <div className="border border-[#151515] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4 bg-white" />
                      <span className="mono-tag text-white">Guardian / Parent</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                      {([
                        ['Name', student.guardian.name],
                        ['Relationship', student.guardian.relationship],
                        ['Phone', student.guardian.phone],
                        ['Email', student.guardian.email],
                        ['Occupation', student.guardian.occupation],
                      ] as [string, string][]).map(([label, value]) => (
                        <div key={label}>
                          <span className="mono-tag block mb-1.5">{label}</span>
                          <span className="text-sm font-light text-[#ccc]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Academic Summary */}
                <div className="tab-anim">
                  <div className="border border-[#151515] p-6 h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4 bg-white" />
                      <span className="mono-tag text-white">Academic Info</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="mono-tag block mb-1.5">Grade Level</span>
                        <span className="text-lg font-light">{getGradeLevelLabel(student.gradeLevel)}</span>
                      </div>
                      <div>
                        <span className="mono-tag block mb-1.5">Section</span>
                        <span className="text-sm font-light text-[#ccc]">{student.section}</span>
                      </div>
                      {student.strand && (
                        <div>
                          <span className="mono-tag block mb-1.5">Strand / Track</span>
                          <span className="text-sm font-light text-[#ccc]">{student.strand} — {student.track}</span>
                        </div>
                      )}
                      <div>
                        <span className="mono-tag block mb-1.5">School Year</span>
                        <span className="text-sm font-light text-[#ccc]">{student.currentSchoolYear}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Previous General Averages */}
                {pastReportCards.length > 0 && (
                  <div className="lg:col-span-3 tab-anim">
                    <div className="border border-[#151515] p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-4 bg-white" />
                        <span className="mono-tag text-white">Academic History</span>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {pastReportCards.map((rc, idx) => (
                          <div key={idx} className="flex-shrink-0 border border-[#1a1a1a] p-4 min-w-[140px] hover:border-[#333] transition-colors">
                            <span className="mono-tag block mb-1 text-[#555]">{rc.schoolYear}</span>
                            <span className="mono-tag block mb-3 text-[#777]">{getGradeLevelLabel(rc.gradeLevel)}</span>
                            <span className="text-3xl font-light">{rc.generalAverage ?? '—'}</span>
                            <span className="text-xs text-[#555] ml-1">avg</span>
                            <div className="mt-2 h-[2px] bg-[#1a1a1a]">
                              <div className="h-full bg-white transition-all" style={{ width: `${((rc.generalAverage ?? 0) / 100) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== ACADEMIC LOAD TAB ========== */}
          {activeTab === 'academic' && (
            <div className="max-w-6xl">
              {student.academicLoad.length === 0 ? (
                <div className="tab-anim py-20 text-center">
                  <p className="text-2xl font-extralight text-[#333] mb-2">No Academic Load</p>
                  <p className="mono-tag text-[#2a2a2a]">Student is not currently enrolled</p>
                </div>
              ) : (
                <>
                  <div className="tab-anim flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4 bg-white" />
                      <span className="mono-tag text-white">Current Subjects — S.Y. {student.currentSchoolYear}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="mono-tag text-[#555]">{student.academicLoad.length} subjects</span>
                      <div className="w-px h-3 bg-[#222]" />
                      <span className="mono-tag text-[#555]">{totalUnits} total units</span>
                    </div>
                  </div>

                  {/* Subject list header */}
                  <div className="tab-anim hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b border-[#1a1a1a] mb-1">
                    <div className="col-span-1"><span className="mono-tag">Code</span></div>
                    <div className="col-span-3"><span className="mono-tag">Subject</span></div>
                    <div className="col-span-1"><span className="mono-tag">Units</span></div>
                    <div className="col-span-2"><span className="mono-tag">Teacher</span></div>
                    <div className="col-span-3"><span className="mono-tag">Schedule</span></div>
                    <div className="col-span-2"><span className="mono-tag">Room</span></div>
                  </div>

                  {student.academicLoad.map((subject, i) => (
                    <div key={i} className="tab-anim group">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 border-b border-[#111] hover:bg-[#0d0d0d] transition-colors relative">
                        <div className="absolute left-0 top-0 w-[2px] h-full bg-white scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                        <div className="col-span-1">
                          <span className="md:hidden mono-tag text-[#444] mr-2">CODE:</span>
                          <span className="text-xs font-mono text-[#555]">{subject.code}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="text-sm font-light text-[#e0e0e0]">{subject.name}</span>
                        </div>
                        <div className="col-span-1">
                          <span className="md:hidden mono-tag text-[#444] mr-2">UNITS:</span>
                          <span className="text-sm font-mono text-[#777]">{subject.units}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="md:hidden mono-tag text-[#444] mr-2">TEACHER:</span>
                          <span className="text-sm font-light text-[#666]">{subject.teacher}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="md:hidden mono-tag text-[#444] mr-2">SCHED:</span>
                          <span className="text-xs font-mono text-[#555]">{subject.schedule}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="md:hidden mono-tag text-[#444] mr-2">ROOM:</span>
                          <span className="text-xs font-mono text-[#555]">{subject.room}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Summary bar */}
                  <div className="tab-anim mt-6 border border-[#151515] p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="mono-tag block mb-1">Total Subjects</span>
                        <span className="text-xl font-light">{student.academicLoad.length}</span>
                      </div>
                      <div className="w-px h-8 bg-[#1a1a1a]" />
                      <div>
                        <span className="mono-tag block mb-1">Total Units</span>
                        <span className="text-xl font-light">{totalUnits}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
                      <span className="mono-tag text-[#4ade80]">REGULAR LOAD</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========== REPORT CARD TAB ========== */}
          {activeTab === 'reports' && (
            <div className="max-w-6xl">
              {student.reportCards.length === 0 ? (
                <div className="tab-anim py-20 text-center">
                  <p className="text-2xl font-extralight text-[#333] mb-2">No Report Cards</p>
                  <p className="mono-tag text-[#2a2a2a]">No academic records available</p>
                </div>
              ) : (
                <>
                  {/* Current report card */}
                  {currentReportCard && (
                    <div className="tab-anim mb-8">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-4 bg-white" />
                          <span className="mono-tag text-white">
                            S.Y. {currentReportCard.schoolYear} — {getGradeLevelLabel(currentReportCard.gradeLevel)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="mono-tag text-[#555]">Section: {currentReportCard.section}</span>
                          <span className="mono-tag text-[#555]">Adviser: {currentReportCard.adviser}</span>
                        </div>
                      </div>

                      <div className="border border-[#151515] overflow-hidden">
                        {/* Header */}
                        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 bg-[#0c0c0c] border-b border-[#1a1a1a]">
                          <div className="col-span-4"><span className="mono-tag">Subject</span></div>
                          <div className="col-span-1 text-center"><span className="mono-tag">Q1</span></div>
                          <div className="col-span-1 text-center"><span className="mono-tag">Q2</span></div>
                          <div className="col-span-1 text-center"><span className="mono-tag">Q3</span></div>
                          <div className="col-span-1 text-center"><span className="mono-tag">Q4</span></div>
                          <div className="col-span-2 text-center"><span className="mono-tag">Final</span></div>
                          <div className="col-span-2 text-right"><span className="mono-tag">Remarks</span></div>
                        </div>

                        {currentReportCard.entries.map((entry, i) => (
                          <div key={i} className="tab-anim grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-2 px-4 py-3 border-b border-[#0f0f0f] hover:bg-[#0d0d0d] transition-colors">
                            <div className="col-span-4 flex items-center gap-2">
                              <span className="text-sm font-light text-[#ccc]">{entry.subjectName}</span>
                            </div>
                            <div className="col-span-1 text-center">
                              <span className={`text-sm font-mono ${entry.q1 !== null && entry.q1 >= 75 ? 'text-[#888]' : 'text-[#f87171]'}`}>
                                {entry.q1 ?? '—'}
                              </span>
                            </div>
                            <div className="col-span-1 text-center">
                              <span className={`text-sm font-mono ${entry.q2 !== null ? (entry.q2 >= 75 ? 'text-[#888]' : 'text-[#f87171]') : 'text-[#333]'}`}>
                                {entry.q2 ?? '—'}
                              </span>
                            </div>
                            <div className="col-span-1 text-center">
                              <span className={`text-sm font-mono ${entry.q3 !== null ? (entry.q3 >= 75 ? 'text-[#888]' : 'text-[#f87171]') : 'text-[#333]'}`}>
                                {entry.q3 ?? '—'}
                              </span>
                            </div>
                            <div className="col-span-1 text-center">
                              <span className={`text-sm font-mono ${entry.q4 !== null ? (entry.q4 >= 75 ? 'text-[#888]' : 'text-[#f87171]') : 'text-[#333]'}`}>
                                {entry.q4 ?? '—'}
                              </span>
                            </div>
                            <div className="col-span-2 text-center">
                              <span className={`text-sm font-mono font-semibold ${entry.finalGrade !== null ? (entry.finalGrade >= 75 ? 'text-white' : 'text-[#f87171]') : 'text-[#333]'}`}>
                                {entry.finalGrade ?? '—'}
                              </span>
                            </div>
                            <div className="col-span-2 text-right">
                              <span className={`mono-tag ${entry.remarks === 'Passed' ? 'text-[#4ade80]' : entry.remarks === 'Failed' ? 'text-[#f87171]' : 'text-[#fbbf24]'}`}>
                                {entry.remarks}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* General Average */}
                        <div className="tab-anim grid grid-cols-12 gap-2 px-4 py-4 bg-[#0c0c0c]">
                          <div className="col-span-4">
                            <span className="text-sm font-semibold text-white">General Average</span>
                          </div>
                          <div className="col-span-4" />
                          <div className="col-span-2 text-center">
                            <span className="text-lg font-mono font-semibold text-white">
                              {currentReportCard.generalAverage ?? '—'}
                            </span>
                          </div>
                          <div className="col-span-2" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Past report cards */}
                  {pastReportCards.length > 0 && (
                    <div className="tab-anim">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-1 h-4 bg-[#333]" />
                        <span className="mono-tag text-[#555]">Previous Records</span>
                      </div>

                      <div className="space-y-4">
                        {pastReportCards.map((rc, idx) => (
                          <details key={idx} className="tab-anim group border border-[#151515]">
                            <summary className="flex items-center justify-between px-4 py-3 hover:bg-[#0d0d0d] transition-colors cursor-pointer list-none">
                              <div className="flex items-center gap-4">
                                <svg className="w-3 h-3 text-[#555] transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="none">
                                  <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-sm font-light text-[#aaa]">{rc.schoolYear}</span>
                                <span className="mono-tag text-[#555]">{getGradeLevelLabel(rc.gradeLevel)}</span>
                                <span className="mono-tag text-[#333]">SEC. {rc.section}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="mono-tag text-[#555]">AVG:</span>
                                <span className="text-lg font-mono font-light text-[#aaa]">{rc.generalAverage ?? '—'}</span>
                              </div>
                            </summary>
                            <div className="border-t border-[#151515]">
                              {rc.entries.map((entry, ei) => (
                                <div key={ei} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-[#0a0a0a]">
                                  <div className="col-span-5 md:col-span-4">
                                    <span className="text-xs font-light text-[#888]">{entry.subjectName}</span>
                                  </div>
                                  <div className="col-span-1 text-center"><span className="text-xs font-mono text-[#555]">{entry.q1 ?? '—'}</span></div>
                                  <div className="col-span-1 text-center"><span className="text-xs font-mono text-[#555]">{entry.q2 ?? '—'}</span></div>
                                  <div className="col-span-1 text-center"><span className="text-xs font-mono text-[#555]">{entry.q3 ?? '—'}</span></div>
                                  <div className="col-span-1 text-center"><span className="text-xs font-mono text-[#555]">{entry.q4 ?? '—'}</span></div>
                                  <div className="col-span-2 md:col-span-1 text-center">
                                    <span className="text-xs font-mono font-semibold text-[#aaa]">{entry.finalGrade ?? '—'}</span>
                                  </div>
                                  <div className="col-span-1 md:col-span-2 text-right">
                                    <span className={`mono-tag ${entry.remarks === 'Passed' ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                                      {entry.remarks === 'Passed' ? '✓' : '✗'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ========== DOCUMENTS TAB ========== */}
          {activeTab === 'documents' && (
            <div className="max-w-6xl">
              <div className="tab-anim flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-white" />
                  <span className="mono-tag text-white">Student Documents</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="mono-tag text-[#4ade80]">{submittedDocs} submitted</span>
                  <span className="mono-tag text-[#fbbf24]">{student.documents.filter(d => d.status === 'pending').length} pending</span>
                  <span className="mono-tag text-[#f87171]">{student.documents.filter(d => d.status === 'missing').length} missing</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="tab-anim mb-8">
                <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-white to-[#666] rounded-full transition-all duration-700"
                    style={{ width: `${(submittedDocs / student.documents.length) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="mono-tag text-[#333]">Completion</span>
                  <span className="mono-tag text-[#555]">{Math.round((submittedDocs / student.documents.length) * 100)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                {student.documents.map((doc, i) => (
                  <div key={i} className="tab-anim group border border-[#141414] hover:border-[#222] transition-colors">
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-10 h-10 border border-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:border-[#333] transition-colors">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V6L9 1z" stroke="#555" strokeWidth="1" />
                            <path d="M9 1v5h5" stroke="#555" strokeWidth="1" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-light text-[#ccc] block">{doc.name}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="mono-tag text-[#333]">{doc.type.toUpperCase().replace('_', ' ')}</span>
                            {doc.fileSize && (
                              <>
                                <span className="mono-tag text-[#222]">|</span>
                                <span className="mono-tag text-[#333]">{doc.fileSize}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {doc.dateSubmitted && (
                          <span className="mono-tag text-[#333] hidden sm:inline">{doc.dateSubmitted}</span>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: docStatusColor(doc.status) }} />
                          <span className="mono-tag" style={{ color: docStatusColor(doc.status) }}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== ENROLLMENT TAB ========== */}
          {activeTab === 'enrollment' && (
            <div className="max-w-6xl">
              {/* Enroll action */}
              <div className="tab-anim mb-8">
                <div className="border border-[#1a1a1a] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4 bg-[#4ade80]" />
                      <span className="mono-tag text-white">Enroll to New Term</span>
                    </div>
                    <span className="mono-tag text-[#333]">REGISTRAR ACTION</span>
                  </div>
                  <p className="text-sm font-light text-[#555] mb-5">
                    Enroll this student to a new school year or term. This action will create a new enrollment record.
                  </p>
                  <button
                    onClick={() => { setEnrollModal(true); setEnrollSuccess(false); }}
                    className="px-6 py-3 border border-white text-white mono-tag hover:bg-white hover:text-black transition-all duration-300"
                  >
                    + Enroll Student
                  </button>
                </div>
              </div>

              {/* Enrollment Timeline */}
              <div className="tab-anim flex items-center gap-3 mb-6">
                <div className="w-1 h-4 bg-white" />
                <span className="mono-tag text-white">Enrollment History</span>
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[#1a1a1a]" />

                {[...student.enrollmentHistory].reverse().map((record, i) => (
                  <div key={i} className="tab-anim relative flex gap-6 mb-6 last:mb-0">
                    {/* Dot */}
                    <div className="relative z-10 flex-shrink-0 mt-1">
                      <div className={`w-[10px] h-[10px] rounded-full border-2 ${
                        record.status === 'enrolled' ? 'border-[#4ade80] bg-[#4ade80]' :
                        record.status === 'completed' ? 'border-[#60a5fa] bg-transparent' :
                        'border-[#555] bg-transparent'
                      }`} style={{ marginLeft: '15px' }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 border border-[#151515] p-5 hover:border-[#222] transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-base font-light">{record.schoolYear}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{
                            background: record.status === 'enrolled' ? '#4ade80' :
                              record.status === 'completed' ? '#60a5fa' :
                              record.status === 'dropped' ? '#f87171' : '#c084fc'
                          }} />
                          <span className="mono-tag" style={{
                            color: record.status === 'enrolled' ? '#4ade80' :
                              record.status === 'completed' ? '#60a5fa' :
                              record.status === 'dropped' ? '#f87171' : '#c084fc'
                          }}>
                            {record.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div>
                          <span className="mono-tag block mb-1">Grade Level</span>
                          <span className="text-sm font-light text-[#aaa]">{getGradeLevelLabel(record.gradeLevel)}</span>
                        </div>
                        <div>
                          <span className="mono-tag block mb-1">Section</span>
                          <span className="text-sm font-light text-[#aaa]">{record.section}</span>
                        </div>
                        <div>
                          <span className="mono-tag block mb-1">Date Enrolled</span>
                          <span className="text-sm font-light text-[#aaa]">{record.dateEnrolled}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 md:px-10 py-3 border-t border-[#141414] flex items-center justify-between">
          <span className="mono-tag text-[#222]">UNIVERS.EDU — STUDENT INFORMATION SYSTEM</span>
          <span className="mono-tag text-[#222]">S.Y. 2024-2025</span>
        </div>
      </div>

      {/* ========== ENROLLMENT MODAL ========== */}
      {enrollModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEnrollModal(false)} />
          <div className="relative bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-md p-8">
            {enrollSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border border-[#4ade80] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13L9 17L19 7" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-lg font-light text-[#4ade80] mb-2">Enrollment Successful</p>
                <p className="mono-tag text-[#555]">Student has been enrolled</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-white" />
                    <span className="mono-tag text-white">New Enrollment</span>
                  </div>
                  <button onClick={() => setEnrollModal(false)} className="w-8 h-8 border border-[#222] flex items-center justify-center hover:border-[#555] transition-colors">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1L13 13M13 1L1 13" stroke="#888" strokeWidth="1.5" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 pb-4 border-b border-[#141414]">
                  <span className="text-sm font-light text-[#888]">Enrolling: {student.firstName} {student.lastName}</span>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mono-tag block mb-2">School Year</label>
                    <select value={enrollSY} onChange={(e) => setEnrollSY(e.target.value)}
                      className="w-full bg-[#0d0d0d] border border-[#1a1a1a] px-4 py-3 text-sm font-light text-white focus:border-[#555] outline-none transition-colors">
                      <option value="2025-2026">2025-2026</option>
                      <option value="2024-2025">2024-2025</option>
                    </select>
                  </div>
                  <div>
                    <label className="mono-tag block mb-2">Grade Level</label>
                    <select value={enrollGrade} onChange={(e) => setEnrollGrade(e.target.value)}
                      className="w-full bg-[#0d0d0d] border border-[#1a1a1a] px-4 py-3 text-sm font-light text-white focus:border-[#555] outline-none transition-colors">
                      <option value="">Select grade level</option>
                      <option value="K">Kindergarten</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>Grade {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mono-tag block mb-2">Section</label>
                    <input type="text" value={enrollSection} onChange={(e) => setEnrollSection(e.target.value)}
                      placeholder="Enter section name"
                      className="w-full bg-[#0d0d0d] border border-[#1a1a1a] px-4 py-3 text-sm font-light text-white placeholder-[#333] focus:border-[#555] outline-none transition-colors" />
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={!enrollGrade || !enrollSection}
                  className="mt-8 w-full py-3 border border-white text-white mono-tag hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white disabled:cursor-not-allowed"
                >
                  Confirm Enrollment
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
