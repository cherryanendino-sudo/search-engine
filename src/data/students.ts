export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export interface Subject {
  code: string;
  name: string;
  units: number;
  teacher: string;
  schedule: string;
  room: string;
}

export interface ReportCardEntry {
  subjectCode: string;
  subjectName: string;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  finalGrade: number | null;
  remarks: 'Passed' | 'Failed' | 'In Progress';
}

export interface ReportCard {
  schoolYear: string;
  gradeLevel: GradeLevel;
  section: string;
  adviser: string;
  entries: ReportCardEntry[];
  generalAverage: number | null;
}

export interface DocumentVersion {
  version: number;
  filename: string;
  dateUploaded: string;
  fileSize: string;
}

export interface DocumentComment {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'birth_cert' | 'form137' | 'form138' | 'good_moral' | 'report_card' | 'photo' | 'medical' | 'transfer' | 'enrollment_form' | 'other';
  status: 'submitted' | 'pending' | 'missing';
  verificationStatus: 'approved' | 'pending' | 'rejected' | 'unverified';
  verifiedBy: string | null;
  notes: string | null;
  dateSubmitted: string | null;
  fileSize: string | null;
  currentVersion: number;
  versions: DocumentVersion[];
  comments: DocumentComment[];
}

export interface EnrollmentRecord {
  schoolYear: string;
  gradeLevel: GradeLevel;
  section: string;
  status: 'enrolled' | 'completed' | 'dropped' | 'transferred';
  dateEnrolled: string;
}

export interface Guardian {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  occupation: string;
}

export interface Student {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  age: number;
  nationality: string;
  religion: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  phone: string;
  email: string;
  lrn: string; // Learner Reference Number
  studentId: string;
  gradeLevel: GradeLevel;
  section: string;
  strand: string | null; // for SHS (Grade 11-12)
  track: string | null;
  status: 'enrolled' | 'not-enrolled' | 'graduated' | 'transferred' | 'dropped';
  avatar: string;
  enrollmentDate: string;
  currentSchoolYear: string;
  guardian: Guardian;
  academicLoad: Subject[];
  reportCards: ReportCard[];
  documents: Document[];
  enrollmentHistory: EnrollmentRecord[];
}

const gradeLevelLabels: Record<GradeLevel, string> = {
  'K': 'Kindergarten',
  '1': 'Grade 1', '2': 'Grade 2', '3': 'Grade 3',
  '4': 'Grade 4', '5': 'Grade 5', '6': 'Grade 6',
  '7': 'Grade 7', '8': 'Grade 8', '9': 'Grade 9', '10': 'Grade 10',
  '11': 'Grade 11', '12': 'Grade 12',
};

export function getGradeLevelLabel(gl: GradeLevel): string {
  return gradeLevelLabels[gl];
}

// Subjects per grade level
const elementarySubjects = ['Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'Edukasyon sa Pagpapakatao', 'Mother Tongue'];
const jhsSubjects = ['Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'Edukasyon sa Pagpapakatao', 'TLE', 'Computer Education'];
const shsCoreSubjects = ['Oral Communication', 'Reading & Writing', 'Komunikasyon at Pananaliksik', 'General Mathematics', 'Earth & Life Science', 'Physical Science', 'PE & Health', 'Media & Information Literacy', 'Understanding Culture'];
const stemSpecialized = ['Pre-Calculus', 'Basic Calculus', 'General Biology', 'General Chemistry', 'General Physics', 'Research/Capstone'];
const abmSpecialized = ['Applied Economics', 'Business Ethics', 'Fundamentals of ABM', 'Business Math', 'Organization & Management', 'Research/Capstone'];
const humssSpecialized = ['Creative Writing', 'Creative Nonfiction', 'Trends & Networks', 'Philippine Politics', 'Community Engagement', 'Research/Capstone'];

const firstNames = [
  'Maria', 'Juan', 'Angel', 'Joshua', 'Princess', 'Mark', 'Andrea', 'Christian',
  'Jasmine', 'Daniel', 'Sophia', 'Gabriel', 'Nicole', 'James', 'Althea', 'Carl',
  'Samantha', 'Rafael', 'Bianca', 'Miguel', 'Trisha', 'Adrian', 'Kyla', 'Patrick',
  'Hannah', 'Nathaniel', 'Clarisse', 'Lorenzo', 'Alyssa', 'Elijah', 'Isabelle', 'Marco',
  'Camille', 'Ethan', 'Janelle', 'Sebastian', 'Denise', 'Liam', 'Erica', 'Noah',
  'Katrina', 'Zion', 'Mia', 'Reign', 'Chloe', 'Brent', 'Fiona', 'Dominic'
];

const middleNames = [
  'Reyes', 'Santos', 'Cruz', 'Bautista', 'Gonzales', 'Lopez', 'Garcia', 'Rivera',
  'Mendoza', 'Torres', 'Flores', 'Ramos', 'Aquino', 'Castillo', 'Villanueva', 'Soriano'
];

const lastNames = [
  'Dela Cruz', 'Santos', 'Reyes', 'Bautista', 'Gonzales', 'Lopez', 'Garcia', 'Rivera',
  'Mendoza', 'Torres', 'Flores', 'Ramos', 'Aquino', 'Castillo', 'Villanueva', 'Manalo',
  'Navarro', 'Mercado', 'Salvador', 'Tan', 'Lim', 'Sy', 'Co', 'Chua',
  'Ong', 'Dizon', 'Pascual', 'Aguilar', 'Marquez', 'Fernandez', 'Santiago', 'Perez'
];

const sections = [
  'Sampaguita', 'Rosal', 'Dahlia', 'Jasmine', 'Camia', 'Orchid', 'Sunflower', 'Lily',
  'Rizal', 'Mabini', 'Bonifacio', 'Aguinaldo', 'Luna', 'Del Pilar', 'Silang', 'Jacinto',
  'Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Amethyst', 'Topaz', 'Garnet', 'Opal'
];

const teacherFirstNames = ['Mrs.', 'Mr.', 'Ms.', 'Dr.'];
const teacherLastNames = ['Reyes', 'Santos', 'Cruz', 'Bautista', 'Garcia', 'Rivera', 'Mendoza', 'Torres', 'Flores', 'Ramos', 'Villanueva', 'Navarro', 'Mercado', 'Aguilar', 'Perez', 'Soriano'];

const cities = ['Quezon City', 'Manila', 'Makati', 'Pasig', 'Taguig', 'Caloocan', 'Marikina', 'Parañaque', 'Las Piñas', 'Muntinlupa', 'Valenzuela', 'San Juan', 'Mandaluyong', 'Pasay'];
const provinces = ['Metro Manila', 'Cavite', 'Laguna', 'Bulacan', 'Rizal', 'Batangas', 'Pampanga'];
const streets = ['Rizal St.', 'Mabini St.', 'Luna Ave.', 'Bonifacio Blvd.', 'Quezon Ave.', 'Roxas Blvd.', 'Aguinaldo Hwy.', 'Marcos Ave.', 'EDSA', 'Commonwealth Ave.', 'Katipunan Ave.', 'Aurora Blvd.'];
const religions = ['Roman Catholic', 'Protestant', 'Iglesia ni Cristo', 'Islam', 'Born Again Christian', 'Seventh-day Adventist', 'Buddhism'];
const occupations = ['Teacher', 'Engineer', 'Nurse', 'OFW', 'Driver', 'Business Owner', 'Government Employee', 'IT Professional', 'Accountant', 'Doctor', 'Lawyer', 'Police Officer', 'Vendor', 'Farmer'];

const strands = ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL-ICT', 'TVL-HE'];
const tracks = ['Academic', 'Academic', 'Academic', 'Academic', 'Technical-Vocational', 'Technical-Vocational'];

const rooms = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203', 'Room 301', 'Room 302', 'Lab 1', 'Lab 2', 'Lab 3', 'Comp Lab', 'Music Room', 'Gym', 'Library'];
const schedules = ['MWF 7:00-8:00', 'MWF 8:00-9:00', 'MWF 9:00-10:00', 'MWF 10:00-11:00', 'TTh 7:00-8:30', 'TTh 8:30-10:00', 'TTh 10:00-11:30', 'TTh 1:00-2:30', 'MWF 1:00-2:00', 'MWF 2:00-3:00', 'TTh 2:30-4:00'];

const documentTypes: { name: string; type: Document['type'] }[] = [
  { name: 'PSA Birth Certificate', type: 'birth_cert' },
  { name: 'Form 137 (School Records)', type: 'form137' },
  { name: 'Form 138 (Report Card)', type: 'form138' },
  { name: 'Certificate of Good Moral Character', type: 'good_moral' },
  { name: '2x2 ID Photo', type: 'photo' },
  { name: 'Medical Certificate', type: 'medical' },
  { name: 'Enrollment Form', type: 'enrollment_form' },
  { name: 'Transfer Credential', type: 'transfer' },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function generateSubjects(gradeLevel: GradeLevel, strand: string | null, rand: () => number): Subject[] {
  let subjectNames: string[];
  const gl = parseInt(gradeLevel) || 0;

  if (gradeLevel === 'K') {
    subjectNames = ['Language', 'Mathematics', 'Reading', 'Writing', 'Music & Arts', 'Physical Education', 'Values Education'];
  } else if (gl >= 1 && gl <= 6) {
    subjectNames = [...elementarySubjects];
    if (gl <= 3) subjectNames = subjectNames.filter(s => s !== 'Science');
  } else if (gl >= 7 && gl <= 10) {
    subjectNames = [...jhsSubjects];
  } else {
    subjectNames = [...shsCoreSubjects];
    if (strand === 'STEM') subjectNames.push(...stemSpecialized.slice(0, 3));
    else if (strand === 'ABM') subjectNames.push(...abmSpecialized.slice(0, 3));
    else if (strand === 'HUMSS') subjectNames.push(...humssSpecialized.slice(0, 3));
    else subjectNames.push('Elective 1', 'Elective 2', 'Elective 3');
  }

  return subjectNames.map((name, i) => ({
    code: `${gradeLevel}-${String(i + 1).padStart(2, '0')}`,
    name,
    units: gradeLevel === 'K' ? 1 : (gl >= 11 ? (i < shsCoreSubjects.length ? 3 : 4) : (name === 'MAPEH' ? 2 : 1)),
    teacher: `${pick(teacherFirstNames, rand)} ${pick(teacherLastNames, rand)}`,
    schedule: pick(schedules, rand),
    room: pick(rooms, rand),
  }));
}

function generateReportCard(gradeLevel: GradeLevel, section: string, schoolYear: string, isComplete: boolean, rand: () => number): ReportCard {
  const gl = parseInt(gradeLevel) || 0;
  let subjectNames: string[];
  
  if (gradeLevel === 'K') {
    subjectNames = ['Language', 'Mathematics', 'Reading', 'Writing', 'Music & Arts', 'Physical Education', 'Values Education'];
  } else if (gl >= 1 && gl <= 6) {
    subjectNames = [...elementarySubjects];
    if (gl <= 3) subjectNames = subjectNames.filter(s => s !== 'Science');
  } else if (gl >= 7 && gl <= 10) {
    subjectNames = [...jhsSubjects];
  } else {
    subjectNames = [...shsCoreSubjects.slice(0, 6)];
  }

  const entries: ReportCardEntry[] = subjectNames.map((name, i) => {
    const base = 75 + Math.floor(rand() * 20);
    const q1 = Math.min(99, base + Math.floor(rand() * 8) - 3);
    const q2 = isComplete || rand() > 0.3 ? Math.min(99, base + Math.floor(rand() * 8) - 3) : null;
    const q3 = isComplete ? Math.min(99, base + Math.floor(rand() * 8) - 3) : null;
    const q4 = isComplete ? Math.min(99, base + Math.floor(rand() * 8) - 3) : null;
    const grades = [q1, q2, q3, q4].filter((g): g is number => g !== null);
    const avg = grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null;

    return {
      subjectCode: `${gradeLevel}-${String(i + 1).padStart(2, '0')}`,
      subjectName: name,
      q1, q2, q3, q4,
      finalGrade: isComplete ? avg : null,
      remarks: isComplete ? (avg && avg >= 75 ? 'Passed' : 'Failed') : 'In Progress',
    };
  });

  const completedEntries = entries.filter(e => e.finalGrade !== null);
  const generalAverage = completedEntries.length > 0
    ? Math.round(completedEntries.reduce((a, b) => a + (b.finalGrade || 0), 0) / completedEntries.length)
    : null;

  return {
    schoolYear,
    gradeLevel,
    section,
    adviser: `${pick(teacherFirstNames, rand)} ${pick(teacherLastNames, rand)}`,
    entries,
    generalAverage,
  };
}

function generateStudents(): Student[] {
  const rand = seededRandom(42);
  const result: Student[] = [];

  for (let i = 0; i < 80; i++) {
    const firstName = pick(firstNames, rand);
    const middleName = pick(middleNames, rand);
    const lastName = pick(lastNames, rand);
    const sex = rand() > 0.5 ? 'Male' as const : 'Female' as const;
    const suffix = rand() > 0.92 ? (rand() > 0.5 ? 'Jr.' : 'III') : '';

    // Grade level distribution
    const glRoll = rand();
    let gradeLevel: GradeLevel;
    if (glRoll < 0.05) gradeLevel = 'K';
    else if (glRoll < 0.12) gradeLevel = pick(['1', '2', '3'] as GradeLevel[], rand);
    else if (glRoll < 0.25) gradeLevel = pick(['4', '5', '6'] as GradeLevel[], rand);
    else if (glRoll < 0.55) gradeLevel = pick(['7', '8', '9', '10'] as GradeLevel[], rand);
    else gradeLevel = pick(['11', '12'] as GradeLevel[], rand);

    const gl = parseInt(gradeLevel) || 0;
    const age = gradeLevel === 'K' ? 5 + Math.floor(rand() * 2) : gl + 5 + Math.floor(rand() * 2);
    const birthYear = 2024 - age;
    const birthMonth = Math.floor(rand() * 12) + 1;
    const birthDay = Math.floor(rand() * 28) + 1;

    const section = pick(sections, rand);
    const strand = gl >= 11 ? pick(strands, rand) : null;
    const track = strand ? tracks[strands.indexOf(strand)] : null;

    const statusRoll = rand();
    const status: Student['status'] = statusRoll > 0.88 ? 'not-enrolled' : statusRoll > 0.82 ? 'graduated' : statusRoll > 0.78 ? 'transferred' : 'enrolled';

    const city = pick(cities, rand);
    const province = pick(provinces, rand);
    const street = pick(streets, rand);
    const houseNum = Math.floor(rand() * 999) + 1;

    // Guardian
    const guardianRelation = rand() > 0.6 ? 'Mother' : rand() > 0.3 ? 'Father' : 'Guardian';
    const guardian: Guardian = {
      name: `${pick(firstNames, rand)} ${middleName} ${lastName}`,
      relationship: guardianRelation,
      phone: `09${Math.floor(rand() * 10)}${Math.floor(rand() * 10)}${String(Math.floor(rand() * 10000000)).padStart(7, '0')}`,
      email: `${pick(firstNames, rand).toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, '')}@gmail.com`,
      occupation: pick(occupations, rand),
    };

    // Academic load
    const academicLoad = status === 'enrolled' ? generateSubjects(gradeLevel, strand, rand) : [];

    // Report cards (previous years)
    const reportCards: ReportCard[] = [];
    const numPastYears = Math.min(gl, 3 + Math.floor(rand() * 2));
    for (let y = 0; y < numPastYears; y++) {
      const pastGl = String(Math.max(gl === 0 ? 0 : gl - numPastYears + y + 1, 1)) as GradeLevel;
      const sy = `${2024 - numPastYears + y}-${2025 - numPastYears + y}`;
      reportCards.push(generateReportCard(pastGl, pick(sections, rand), sy, true, rand));
    }
    // Current year report card (in progress)
    if (status === 'enrolled') {
      reportCards.push(generateReportCard(gradeLevel, section, '2024-2025', false, rand));
    }

    // Documents
    const verifierNames = ['RICHMOND ABUEVA, LPT, MAED - MATH', 'MARIA SANTOS, LPT', 'JOSE REYES, PhD', 'ANA CRUZ, LPT, MAEd'];
    const commentTexts = ['Document approved', 'Please resubmit with updated information', 'Verified and filed', 'Pending review by registrar', 'Original copy received'];
    const documents: Document[] = documentTypes.map((dt, di) => {
      const statusRoll = rand();
      const docStatus: Document['status'] = statusRoll > 0.3 ? 'submitted' : statusRoll > 0.1 ? 'pending' : 'missing';
      const dateSubmitted = docStatus === 'submitted' ? `${2024 - Math.floor(rand() * 3)}-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-${String(Math.floor(rand() * 28) + 1).padStart(2, '0')}` : null;
      const fileSize = docStatus === 'submitted' ? `${(rand() * 4 + 0.5).toFixed(1)} MB` : null;

      // Verification status
      const verRoll = rand();
      const verificationStatus: Document['verificationStatus'] = docStatus === 'submitted'
        ? (verRoll > 0.3 ? 'approved' : verRoll > 0.1 ? 'pending' : 'rejected')
        : 'unverified';
      const verifiedBy = verificationStatus === 'approved' ? pick(verifierNames, rand) : null;

      // Notes
      const notesRoll = rand();
      const notes = docStatus === 'submitted' && notesRoll > 0.6 ? pick(['Original copy on file', 'Photocopy accepted', 'Awaiting original', 'No notes'], rand) : null;

      // Versions
      const numVersions = docStatus === 'submitted' ? 1 + (rand() > 0.7 ? 1 : 0) + (rand() > 0.9 ? 1 : 0) : 0;
      const docId = `${dt.type.toUpperCase()}_${String(Math.floor(rand() * 100000000)).padStart(8, '0')}`;
      const versions: DocumentVersion[] = [];
      for (let v = 1; v <= numVersions; v++) {
        const vYear = 2024 - Math.floor(rand() * 2);
        const vMonth = Math.floor(rand() * 12) + 1;
        const vDay = Math.floor(rand() * 28) + 1;
        versions.push({
          version: v,
          filename: `${docId}_v${v}.pdf`,
          dateUploaded: `${vYear}-${String(vMonth).padStart(2, '0')}-${String(vDay).padStart(2, '0')}`,
          fileSize: `${(rand() * 4 + 0.5).toFixed(1)} MB`,
        });
      }

      // Comments
      const numComments = docStatus === 'submitted' ? (rand() > 0.4 ? 1 : 0) + (rand() > 0.7 ? 1 : 0) : 0;
      const comments: DocumentComment[] = [];
      for (let c = 0; c < numComments; c++) {
        const cYear = 2024 - Math.floor(rand() * 2);
        const cMonth = Math.floor(rand() * 12) + 1;
        const cDay = Math.floor(rand() * 28) + 1;
        comments.push({
          id: `cmt-${i}-${di}-${c}`,
          author: pick(verifierNames, rand),
          date: `${cYear}-${String(cMonth).padStart(2, '0')}-${String(cDay).padStart(2, '0')}`,
          text: pick(commentTexts, rand),
        });
      }

      return {
        id: `doc-${i}-${di}`,
        name: dt.name,
        type: dt.type,
        status: docStatus,
        verificationStatus,
        verifiedBy,
        notes,
        dateSubmitted,
        fileSize,
        currentVersion: numVersions,
        versions,
        comments,
      };
    });

    // Enrollment history
    const enrollmentHistory: EnrollmentRecord[] = [];
    for (let y = 0; y < numPastYears; y++) {
      const pastGl = String(Math.max(gl === 0 ? 0 : gl - numPastYears + y + 1, 1)) as GradeLevel;
      enrollmentHistory.push({
        schoolYear: `${2024 - numPastYears + y}-${2025 - numPastYears + y}`,
        gradeLevel: pastGl,
        section: pick(sections, rand),
        status: 'completed',
        dateEnrolled: `${2024 - numPastYears + y}-06-${String(Math.floor(rand() * 20) + 1).padStart(2, '0')}`,
      });
    }
    if (status === 'enrolled') {
      enrollmentHistory.push({
        schoolYear: '2024-2025',
        gradeLevel,
        section,
        status: 'enrolled',
        dateEnrolled: `2024-06-${String(Math.floor(rand() * 20) + 1).padStart(2, '0')}`,
      });
    }

    const lrn = `${String(Math.floor(rand() * 9) + 1)}${String(Math.floor(rand() * 100000000000)).padStart(11, '0')}`;

    result.push({
      id: `stu-${String(i + 1).padStart(4, '0')}`,
      firstName,
      middleName,
      lastName,
      suffix,
      sex,
      dateOfBirth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
      age,
      nationality: rand() > 0.95 ? 'Chinese-Filipino' : 'Filipino',
      religion: pick(religions, rand),
      address: `${houseNum} ${street}`,
      city,
      province,
      zipCode: String(1000 + Math.floor(rand() * 8000)),
      phone: `09${Math.floor(rand() * 10)}${Math.floor(rand() * 10)}${String(Math.floor(rand() * 10000000)).padStart(7, '0')}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, '')}@univers.edu.ph`,
      lrn,
      studentId: `UNV-${String(birthYear).slice(2)}${String(Math.floor(rand() * 99999)).padStart(5, '0')}`,
      gradeLevel,
      section,
      strand,
      track,
      status,
      avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${firstName}${lastName}${i}&backgroundColor=000000`,
      enrollmentDate: enrollmentHistory.length > 0 ? enrollmentHistory[enrollmentHistory.length - 1].dateEnrolled : '',
      currentSchoolYear: '2024-2025',
      guardian,
      academicLoad,
      reportCards,
      documents,
      enrollmentHistory,
    });
  }

  return result;
}

export const students = generateStudents();
export const allGradeLevels: GradeLevel[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
