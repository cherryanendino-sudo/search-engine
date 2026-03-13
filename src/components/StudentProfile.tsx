import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import type { Student } from '../data/students';
import { getGradeLevelLabel } from '../data/students';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'overview' | 'academic' | 'reports' | 'documents' | 'enrollment';

interface Props {
  student: Student | null;
  onClose: () => void;
  onStudentUpdate?: (updated: Student) => void;
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

interface EditableFields {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  nationality: string;
  religion: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianOccupation: string;
}

export function StudentProfile({ student, onClose, onStudentUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [enrollModal, setEnrollModal] = useState(false);
  const [enrollGrade, setEnrollGrade] = useState('');
  const [enrollSection, setEnrollSection] = useState('');
  const [enrollSY, setEnrollSY] = useState('2025-2026');
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<EditableFields | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'registrar';

  const overlayRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!student) return;
    setActiveTab('overview');
    setEnrollModal(false);
    setEnrollSuccess(false);
    setIsEditing(false);
    setSaveSuccess(false);

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

  const startEditing = () => {
    if (!student) return;
    setEditFields({
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      suffix: student.suffix,
      sex: student.sex,
      dateOfBirth: student.dateOfBirth,
      nationality: student.nationality,
      religion: student.religion,
      phone: student.phone,
      email: student.email,
      address: student.address,
      city: student.city,
      province: student.province,
      zipCode: student.zipCode,
      guardianName: student.guardian.name,
      guardianRelationship: student.guardian.relationship,
      guardianPhone: student.guardian.phone,
      guardianEmail: student.guardian.email,
      guardianOccupation: student.guardian.occupation,
    });
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditFields(null);
    setSaveSuccess(false);
  };

  const saveEditing = () => {
    if (!student || !editFields || !onStudentUpdate) return;

    const updated: Student = {
      ...student,
      firstName: editFields.firstName,
      middleName: editFields.middleName,
      lastName: editFields.lastName,
      suffix: editFields.suffix,
      sex: editFields.sex,
      dateOfBirth: editFields.dateOfBirth,
      nationality: editFields.nationality,
      religion: editFields.religion,
      phone: editFields.phone,
      email: editFields.email,
      address: editFields.address,
      city: editFields.city,
      province: editFields.province,
      zipCode: editFields.zipCode,
      guardian: {
        name: editFields.guardianName,
        relationship: editFields.guardianRelationship,
        phone: editFields.guardianPhone,
        email: editFields.guardianEmail,
        occupation: editFields.guardianOccupation,
      },
    };

    onStudentUpdate(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setIsEditing(false);
      setEditFields(null);
      setSaveSuccess(false);
    }, 1200);
  };

  const updateField = (field: keyof EditableFields, value: string) => {
    setEditFields((prev) => prev ? { ...prev, [field]: value } : prev);
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
      <div ref={profileRef} className="absolute inset-0 md:inset-4 lg:inset-6 border overflow-hidden flex flex-col" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Top bar */}
        <div ref={contentRef}>
          <div className="anim-item flex items-center justify-between px-6 md:px-10 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="flex items-center gap-4">
              <button onClick={handleClose} className="w-9 h-9 border flex items-center justify-center transition-all" style={{ borderColor: 'var(--border-secondary)', }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-secondary)'; }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10 2L4 7L10 12" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
              <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>STUDENT PROFILE</span>
              <div className="w-px h-3" style={{ background: 'var(--border-secondary)' }} />
              <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{student.studentId}</span>
            </div>
          </div>

          {/* Profile header */}
          <div className="anim-item px-6 md:px-10 py-6 md:py-8" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 border overflow-hidden relative" style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-input)' }}>
                  <img src={student.avatar} alt="" className="w-full h-full object-cover" style={{ filter: 'var(--avatar-invert)', opacity: 'var(--avatar-opacity)' }} />
                  <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border-tertiary), transparent)' }} />
                </div>
              </div>

              {/* Name & Quick Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-3">
                  <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-none">
                    {student.firstName}
                  </h2>
                  <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-none" style={{ color: 'var(--text-muted)' }}>
                    {student.middleName.charAt(0)}. {student.lastName} {student.suffix}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="mono-tag" style={{ color: 'var(--text-tertiary)' }}>LRN: {student.lrn}</span>
                  <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>|</span>
                  <span className="mono-tag" style={{ color: 'var(--text-tertiary)' }}>{getGradeLevelLabel(student.gradeLevel)}</span>
                  <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>|</span>
                  <span className="mono-tag" style={{ color: 'var(--text-tertiary)' }}>Section {student.section}</span>
                  {student.strand && (
                    <>
                      <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>|</span>
                      <span className="mono-tag" style={{ color: 'var(--text-tertiary)' }}>{student.strand}</span>
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
                <div className="w-px h-10" style={{ background: 'var(--border-primary)' }} />
                <div className="text-center">
                  <span className="mono-tag block mb-1">UNITS</span>
                  <span className="text-2xl font-light">{totalUnits}</span>
                </div>
                <div className="w-px h-10" style={{ background: 'var(--border-primary)' }} />
                <div className="text-center">
                  <span className="mono-tag block mb-1">DOCS</span>
                  <span className="text-2xl font-light">{submittedDocs}/{student.documents.length}</span>
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
                  className={`relative px-5 py-3.5 mono-tag transition-all duration-300 ${
                    activeTab === tab.key ? '' : ''
                  }`}
                  style={{
                    color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
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

        {/* Tab Content - scrollable */}
        <div ref={tabContentRef} className="flex-1 overflow-y-auto px-6 md:px-10 py-6 md:py-8">
          
          {/* ========== OVERVIEW TAB ========== */}
          {activeTab === 'overview' && (
            <div className="max-w-6xl">
              {/* Edit controls */}
              {canEdit && (
                <div className="tab-anim mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4" style={{ background: isEditing ? '#fbbf24' : 'var(--text-primary)' }} />
                    <span className="mono-tag" style={{ color: isEditing ? '#fbbf24' : 'var(--text-primary)' }}>
                      {isEditing ? 'Editing Mode' : 'Student Information'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <>
                        {saveSuccess ? (
                          <span className="mono-tag text-[#4ade80]">Saved successfully</span>
                        ) : (
                          <>
                            <button
                              onClick={cancelEditing}
                              className="px-4 py-2 border mono-tag transition-all"
                              style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-tertiary)' }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveEditing}
                              className="px-4 py-2 border mono-tag transition-all duration-300 bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30 hover:bg-[#4ade80]/20"
                            >
                              Save Changes
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={startEditing}
                        className="px-4 py-2 border mono-tag transition-all"
                        style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-secondary)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                      >
                        Edit Information
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                
                {/* Personal Information */}
                <div className="lg:col-span-2 tab-anim">
                  <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Personal Information</span>
                    </div>
                    {isEditing && editFields ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                        <div>
                          <span className="mono-tag block mb-1.5">First Name</span>
                          <input className="edit-input" value={editFields.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Middle Name</span>
                          <input className="edit-input" value={editFields.middleName} onChange={(e) => updateField('middleName', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Last Name</span>
                          <input className="edit-input" value={editFields.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Suffix</span>
                          <input className="edit-input" value={editFields.suffix} onChange={(e) => updateField('suffix', e.target.value)} placeholder="Jr., III, etc." />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Sex</span>
                          <select className="edit-input" value={editFields.sex} onChange={(e) => updateField('sex', e.target.value)}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Date of Birth</span>
                          <input className="edit-input" type="date" value={editFields.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Nationality</span>
                          <input className="edit-input" value={editFields.nationality} onChange={(e) => updateField('nationality', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Religion</span>
                          <input className="edit-input" value={editFields.religion} onChange={(e) => updateField('religion', e.target.value)} />
                        </div>
                      </div>
                    ) : (
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
                            <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="tab-anim">
                  <div className="border p-6 h-full" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Contact</span>
                    </div>
                    {isEditing && editFields ? (
                      <div className="space-y-4">
                        <div>
                          <span className="mono-tag block mb-1.5">Email</span>
                          <input className="edit-input" value={editFields.email} onChange={(e) => updateField('email', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Phone</span>
                          <input className="edit-input" value={editFields.phone} onChange={(e) => updateField('phone', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Address</span>
                          <input className="edit-input" value={editFields.address} onChange={(e) => updateField('address', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="mono-tag block mb-1.5">City</span>
                            <input className="edit-input" value={editFields.city} onChange={(e) => updateField('city', e.target.value)} />
                          </div>
                          <div>
                            <span className="mono-tag block mb-1.5">Province</span>
                            <input className="edit-input" value={editFields.province} onChange={(e) => updateField('province', e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Zip Code</span>
                          <input className="edit-input" value={editFields.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <span className="mono-tag block mb-1.5">Email</span>
                          <span className="text-sm font-mono break-all" style={{ color: 'var(--text-tertiary)' }}>{student.email}</span>
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Phone</span>
                          <span className="text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>{student.phone}</span>
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Address</span>
                          <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{student.address}, {student.city}, {student.province} {student.zipCode}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="lg:col-span-2 tab-anim">
                  <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Guardian / Parent</span>
                    </div>
                    {isEditing && editFields ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                        <div>
                          <span className="mono-tag block mb-1.5">Name</span>
                          <input className="edit-input" value={editFields.guardianName} onChange={(e) => updateField('guardianName', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Relationship</span>
                          <input className="edit-input" value={editFields.guardianRelationship} onChange={(e) => updateField('guardianRelationship', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Phone</span>
                          <input className="edit-input" value={editFields.guardianPhone} onChange={(e) => updateField('guardianPhone', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Email</span>
                          <input className="edit-input" value={editFields.guardianEmail} onChange={(e) => updateField('guardianEmail', e.target.value)} />
                        </div>
                        <div>
                          <span className="mono-tag block mb-1.5">Occupation</span>
                          <input className="edit-input" value={editFields.guardianOccupation} onChange={(e) => updateField('guardianOccupation', e.target.value)} />
                        </div>
                      </div>
                    ) : (
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
                            <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Summary */}
                <div className="tab-anim">
                  <div className="border p-6 h-full" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Academic Info</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="mono-tag block mb-1.5">Grade Level</span>
                        <span className="text-lg font-light">{getGradeLevelLabel(student.gradeLevel)}</span>
                      </div>
                      <div>
                        <span className="mono-tag block mb-1.5">Section</span>
                        <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{student.section}</span>
                      </div>
                      {student.strand && (
                        <div>
                          <span className="mono-tag block mb-1.5">Strand / Track</span>
                          <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{student.strand} -- {student.track}</span>
                        </div>
                      )}
                      <div>
                        <span className="mono-tag block mb-1.5">School Year</span>
                        <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{student.currentSchoolYear}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Previous General Averages */}
                {pastReportCards.length > 0 && (
                  <div className="lg:col-span-3 tab-anim">
                    <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                        <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Academic History</span>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {pastReportCards.map((rc, idx) => (
                          <div key={idx} className="flex-shrink-0 border p-4 min-w-[140px] transition-colors" style={{ borderColor: 'var(--border-primary)' }}>
                            <span className="mono-tag block mb-1" style={{ color: 'var(--text-quaternary)' }}>{rc.schoolYear}</span>
                            <span className="mono-tag block mb-3" style={{ color: 'var(--text-tertiary)' }}>{getGradeLevelLabel(rc.gradeLevel)}</span>
                            <span className="text-3xl font-light">{rc.generalAverage ?? '--'}</span>
                            <span className="text-xs ml-1" style={{ color: 'var(--text-quaternary)' }}>avg</span>
                            <div className="mt-2 h-[2px]" style={{ background: 'var(--gpa-bar-bg)' }}>
                              <div className="h-full transition-all" style={{ background: 'var(--gpa-fill)', width: `${((rc.generalAverage ?? 0) / 100) * 100}%` }} />
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
                  <p className="text-2xl font-extralight mb-2" style={{ color: 'var(--text-faint)' }}>No Academic Load</p>
                  <p className="mono-tag" style={{ color: 'var(--text-ghost)' }}>Student is not currently enrolled</p>
                </div>
              ) : (
                <>
                  <div className="tab-anim flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Current Subjects -- S.Y. {student.currentSchoolYear}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{student.academicLoad.length} subjects</span>
                      <div className="w-px h-3" style={{ background: 'var(--border-secondary)' }} />
                      <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{totalUnits} total units</span>
                    </div>
                  </div>

                  {/* Subject list header */}
                  <div className="tab-anim hidden md:grid grid-cols-12 gap-4 px-4 py-3 mb-1" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <div className="col-span-1"><span className="mono-tag">Code</span></div>
                    <div className="col-span-3"><span className="mono-tag">Subject</span></div>
                    <div className="col-span-1"><span className="mono-tag">Units</span></div>
                    <div className="col-span-2"><span className="mono-tag">Teacher</span></div>
                    <div className="col-span-3"><span className="mono-tag">Schedule</span></div>
                    <div className="col-span-2"><span className="mono-tag">Room</span></div>
                  </div>

                  {student.academicLoad.map((subject, i) => (
                    <div key={i} className="tab-anim group">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 transition-colors relative" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                        <div className="absolute left-0 top-0 w-[2px] h-full scale-y-0 group-hover:scale-y-100 transition-transform origin-top" style={{ background: 'var(--text-primary)' }} />
                        <div className="col-span-1">
                          <span className="md:hidden mono-tag mr-2" style={{ color: 'var(--text-muted)' }}>CODE:</span>
                          <span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{subject.code}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{subject.name}</span>
                        </div>
                        <div className="col-span-1">
                          <span className="md:hidden mono-tag mr-2" style={{ color: 'var(--text-muted)' }}>UNITS:</span>
                          <span className="text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>{subject.units}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="md:hidden mono-tag mr-2" style={{ color: 'var(--text-muted)' }}>TEACHER:</span>
                          <span className="text-sm font-light" style={{ color: 'var(--text-tertiary)' }}>{subject.teacher}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="md:hidden mono-tag mr-2" style={{ color: 'var(--text-muted)' }}>SCHED:</span>
                          <span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{subject.schedule}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="md:hidden mono-tag mr-2" style={{ color: 'var(--text-muted)' }}>ROOM:</span>
                          <span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{subject.room}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Summary bar */}
                  <div className="tab-anim mt-6 border p-5 flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="mono-tag block mb-1">Total Subjects</span>
                        <span className="text-xl font-light">{student.academicLoad.length}</span>
                      </div>
                      <div className="w-px h-8" style={{ background: 'var(--border-primary)' }} />
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
                  <p className="text-2xl font-extralight mb-2" style={{ color: 'var(--text-faint)' }}>No Report Cards</p>
                  <p className="mono-tag" style={{ color: 'var(--text-ghost)' }}>No academic records available</p>
                </div>
              ) : (
                <>
                  {/* Current report card */}
                  {currentReportCard && (
                    <div className="tab-anim mb-8">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                          <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>
                            S.Y. {currentReportCard.schoolYear} -- {getGradeLevelLabel(currentReportCard.gradeLevel)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>Section: {currentReportCard.section}</span>
                          <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>Adviser: {currentReportCard.adviser}</span>
                        </div>
                      </div>

                      <div className="border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
                        {/* Header */}
                        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-primary)' }}>
                          <div className="col-span-4"><span className="mono-tag">Subject</span></div>
                          <div className="col-span-1 text-center"><span className="mono-tag">Q1</span></div>
                          <div className="col-span-1 text-center"><span className="mono-tag">Q2</span></div>
                          <div className="col-span-1 text-center"><span className="mono-tag">Q3</span></div>
                          <div className="col-span-1 text-center"><span className="mono-tag">Q4</span></div>
                          <div className="col-span-2 text-center"><span className="mono-tag">Final</span></div>
                          <div className="col-span-2 text-right"><span className="mono-tag">Remarks</span></div>
                        </div>

                        {currentReportCard.entries.map((entry, i) => (
                          <div key={i} className="tab-anim grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-2 px-4 py-3 transition-colors" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                            <div className="col-span-4 flex items-center gap-2">
                              <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{entry.subjectName}</span>
                            </div>
                            <div className="col-span-1 text-center">
                              <span className={`text-sm font-mono ${entry.q1 !== null && entry.q1 >= 75 ? '' : 'text-[#f87171]'}`} style={entry.q1 !== null && entry.q1 >= 75 ? { color: 'var(--text-tertiary)' } : {}}>
                                {entry.q1 ?? '--'}
                              </span>
                            </div>
                            <div className="col-span-1 text-center">
                              <span className={`text-sm font-mono ${entry.q2 !== null ? (entry.q2 >= 75 ? '' : 'text-[#f87171]') : ''}`} style={entry.q2 !== null && entry.q2 >= 75 ? { color: 'var(--text-tertiary)' } : entry.q2 === null ? { color: 'var(--text-faint)' } : {}}>
                                {entry.q2 ?? '--'}
                              </span>
                            </div>
                            <div className="col-span-1 text-center">
                              <span className={`text-sm font-mono ${entry.q3 !== null ? (entry.q3 >= 75 ? '' : 'text-[#f87171]') : ''}`} style={entry.q3 !== null && entry.q3 >= 75 ? { color: 'var(--text-tertiary)' } : entry.q3 === null ? { color: 'var(--text-faint)' } : {}}>
                                {entry.q3 ?? '--'}
                              </span>
                            </div>
                            <div className="col-span-1 text-center">
                              <span className={`text-sm font-mono ${entry.q4 !== null ? (entry.q4 >= 75 ? '' : 'text-[#f87171]') : ''}`} style={entry.q4 !== null && entry.q4 >= 75 ? { color: 'var(--text-tertiary)' } : entry.q4 === null ? { color: 'var(--text-faint)' } : {}}>
                                {entry.q4 ?? '--'}
                              </span>
                            </div>
                            <div className="col-span-2 text-center">
                              <span className={`text-sm font-mono font-semibold ${entry.finalGrade !== null ? (entry.finalGrade >= 75 ? '' : 'text-[#f87171]') : ''}`} style={entry.finalGrade !== null && entry.finalGrade >= 75 ? { color: 'var(--text-primary)' } : entry.finalGrade === null ? { color: 'var(--text-faint)' } : {}}>
                                {entry.finalGrade ?? '--'}
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
                        <div className="tab-anim grid grid-cols-12 gap-2 px-4 py-4" style={{ background: 'var(--bg-card)' }}>
                          <div className="col-span-4">
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>General Average</span>
                          </div>
                          <div className="col-span-4" />
                          <div className="col-span-2 text-center">
                            <span className="text-lg font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {currentReportCard.generalAverage ?? '--'}
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
                        <div className="w-1 h-4" style={{ background: 'var(--border-tertiary)' }} />
                        <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>Previous Records</span>
                      </div>

                      <div className="space-y-4">
                        {pastReportCards.map((rc, idx) => (
                          <details key={idx} className="tab-anim group border" style={{ borderColor: 'var(--border-primary)' }}>
                            <summary className="flex items-center justify-between px-4 py-3 transition-colors cursor-pointer list-none">
                              <div className="flex items-center gap-4">
                                <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--text-quaternary)' }}>
                                  <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{rc.schoolYear}</span>
                                <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{getGradeLevelLabel(rc.gradeLevel)}</span>
                                <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>SEC. {rc.section}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>AVG:</span>
                                <span className="text-lg font-mono font-light" style={{ color: 'var(--text-secondary)' }}>{rc.generalAverage ?? '--'}</span>
                              </div>
                            </summary>
                            <div style={{ borderTop: '1px solid var(--border-primary)' }}>
                              {rc.entries.map((entry, ei) => (
                                <div key={ei} className="grid grid-cols-12 gap-2 px-4 py-2" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                                  <div className="col-span-5 md:col-span-4">
                                    <span className="text-xs font-light" style={{ color: 'var(--text-tertiary)' }}>{entry.subjectName}</span>
                                  </div>
                                  <div className="col-span-1 text-center"><span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{entry.q1 ?? '--'}</span></div>
                                  <div className="col-span-1 text-center"><span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{entry.q2 ?? '--'}</span></div>
                                  <div className="col-span-1 text-center"><span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{entry.q3 ?? '--'}</span></div>
                                  <div className="col-span-1 text-center"><span className="text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{entry.q4 ?? '--'}</span></div>
                                  <div className="col-span-2 md:col-span-1 text-center">
                                    <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-secondary)' }}>{entry.finalGrade ?? '--'}</span>
                                  </div>
                                  <div className="col-span-1 md:col-span-2 text-right">
                                    <span className={`mono-tag ${entry.remarks === 'Passed' ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                                      {entry.remarks === 'Passed' ? 'P' : 'F'}
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
                  <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                  <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Student Documents</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="mono-tag text-[#4ade80]">{submittedDocs} submitted</span>
                  <span className="mono-tag text-[#fbbf24]">{student.documents.filter(d => d.status === 'pending').length} pending</span>
                  <span className="mono-tag text-[#f87171]">{student.documents.filter(d => d.status === 'missing').length} missing</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="tab-anim mb-8">
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-primary)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ background: 'var(--gpa-fill)', width: `${(submittedDocs / student.documents.length) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>Completion</span>
                  <span className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>{Math.round((submittedDocs / student.documents.length) * 100)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                {student.documents.map((doc, i) => (
                  <div key={i} className="tab-anim group border transition-colors" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0 transition-colors" style={{ borderColor: 'var(--border-primary)' }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V6L9 1z" stroke="var(--text-quaternary)" strokeWidth="1" />
                            <path d="M9 1v5h5" stroke="var(--text-quaternary)" strokeWidth="1" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-light block" style={{ color: 'var(--text-secondary)' }}>{doc.name}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{doc.type.toUpperCase().replace('_', ' ')}</span>
                            {doc.fileSize && (
                              <>
                                <span className="mono-tag" style={{ color: 'var(--text-invisible)' }}>|</span>
                                <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>{doc.fileSize}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {doc.dateSubmitted && (
                          <span className="mono-tag hidden sm:inline" style={{ color: 'var(--text-faint)' }}>{doc.dateSubmitted}</span>
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
                <div className="border p-6" style={{ borderColor: 'var(--border-primary)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4 bg-[#4ade80]" />
                      <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Enroll to New Term</span>
                    </div>
                    <span className="mono-tag" style={{ color: 'var(--text-faint)' }}>REGISTRAR ACTION</span>
                  </div>
                  <p className="text-sm font-light mb-5" style={{ color: 'var(--text-quaternary)' }}>
                    Enroll this student to a new school year or term. This action will create a new enrollment record.
                  </p>
                  <button
                    onClick={() => { setEnrollModal(true); setEnrollSuccess(false); }}
                    className="px-6 py-3 border mono-tag transition-all duration-300"
                    style={{ borderColor: 'var(--text-primary)', color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--bg-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  >
                    + Enroll Student
                  </button>
                </div>
              </div>

              {/* Enrollment Timeline */}
              <div className="tab-anim flex items-center gap-3 mb-6">
                <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>Enrollment History</span>
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-px" style={{ background: 'var(--border-primary)' }} />

                {[...student.enrollmentHistory].reverse().map((record, i) => (
                  <div key={i} className="tab-anim relative flex gap-6 mb-6 last:mb-0">
                    {/* Dot */}
                    <div className="relative z-10 flex-shrink-0 mt-1">
                      <div className={`w-[10px] h-[10px] rounded-full border-2 ${
                        record.status === 'enrolled' ? 'border-[#4ade80] bg-[#4ade80]' :
                        record.status === 'completed' ? 'border-[#60a5fa] bg-transparent' :
                        'border-[var(--text-quaternary)] bg-transparent'
                      }`} style={{ marginLeft: '15px' }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 border p-5 transition-colors" style={{ borderColor: 'var(--border-primary)' }}>
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
                          <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{getGradeLevelLabel(record.gradeLevel)}</span>
                        </div>
                        <div>
                          <span className="mono-tag block mb-1">Section</span>
                          <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{record.section}</span>
                        </div>
                        <div>
                          <span className="mono-tag block mb-1">Date Enrolled</span>
                          <span className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{record.dateEnrolled}</span>
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
        <div className="px-6 md:px-10 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <span className="mono-tag" style={{ color: 'var(--text-invisible)' }}>UNIVERS.EDU -- STUDENT INFORMATION SYSTEM</span>
          <span className="mono-tag" style={{ color: 'var(--text-invisible)' }}>S.Y. 2024-2025</span>
        </div>
      </div>

      {/* ========== ENROLLMENT MODAL ========== */}
      {enrollModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEnrollModal(false)} />
          <div className="relative border w-full max-w-md p-8" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
            {enrollSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border border-[#4ade80] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13L9 17L19 7" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-lg font-light text-[#4ade80] mb-2">Enrollment Successful</p>
                <p className="mono-tag" style={{ color: 'var(--text-quaternary)' }}>Student has been enrolled</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4" style={{ background: 'var(--text-primary)' }} />
                    <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>New Enrollment</span>
                  </div>
                  <button onClick={() => setEnrollModal(false)} className="w-8 h-8 border flex items-center justify-center transition-colors" style={{ borderColor: 'var(--border-secondary)' }}>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1L13 13M13 1L1 13" stroke="var(--text-tertiary)" strokeWidth="1.5" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <span className="text-sm font-light" style={{ color: 'var(--text-tertiary)' }}>Enrolling: {student.firstName} {student.lastName}</span>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mono-tag block mb-2">School Year</label>
                    <select value={enrollSY} onChange={(e) => setEnrollSY(e.target.value)}
                      className="w-full px-4 py-3 text-sm font-light outline-none transition-colors"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                      <option value="2025-2026">2025-2026</option>
                      <option value="2024-2025">2024-2025</option>
                    </select>
                  </div>
                  <div>
                    <label className="mono-tag block mb-2">Grade Level</label>
                    <select value={enrollGrade} onChange={(e) => setEnrollGrade(e.target.value)}
                      className="w-full px-4 py-3 text-sm font-light outline-none transition-colors"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
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
                      className="w-full px-4 py-3 text-sm font-light outline-none transition-colors"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={!enrollGrade || !enrollSection}
                  className="mt-8 w-full py-3 border mono-tag transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
                  style={{ borderColor: 'var(--text-primary)', color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => {
                    if (!(e.currentTarget as HTMLButtonElement).disabled) {
                      e.currentTarget.style.background = 'var(--text-primary)';
                      e.currentTarget.style.color = 'var(--bg-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
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
