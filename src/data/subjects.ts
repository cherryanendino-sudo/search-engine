export interface SubjectOffering {
  id: string;
  code: string;
  name: string;
  gradeLevel: string;
  section: string;
  strand: string | null;
  teacher: string;
  teacherId: string;
  schedule: string;
  room: string;
  units: number;
  capacity: number;
  enrolled: number;
  schoolYear: string;
  semester: string | null;
}

const subjectDefs: { name: string; gradeLevels: string[]; strand: string | null; units: number }[] = [
  // Elementary
  { name: 'Filipino', gradeLevels: ['1','2','3','4','5','6'], strand: null, units: 1 },
  { name: 'English', gradeLevels: ['1','2','3','4','5','6'], strand: null, units: 1 },
  { name: 'Mathematics', gradeLevels: ['1','2','3','4','5','6'], strand: null, units: 1 },
  { name: 'Science', gradeLevels: ['4','5','6'], strand: null, units: 1 },
  { name: 'Araling Panlipunan', gradeLevels: ['1','2','3','4','5','6'], strand: null, units: 1 },
  { name: 'MAPEH', gradeLevels: ['1','2','3','4','5','6'], strand: null, units: 2 },
  { name: 'Edukasyon sa Pagpapakatao', gradeLevels: ['1','2','3','4','5','6'], strand: null, units: 1 },
  { name: 'Mother Tongue', gradeLevels: ['1','2','3'], strand: null, units: 1 },

  // JHS
  { name: 'Filipino', gradeLevels: ['7','8','9','10'], strand: null, units: 1 },
  { name: 'English', gradeLevels: ['7','8','9','10'], strand: null, units: 1 },
  { name: 'Mathematics', gradeLevels: ['7','8','9','10'], strand: null, units: 1 },
  { name: 'Science', gradeLevels: ['7','8','9','10'], strand: null, units: 1 },
  { name: 'Araling Panlipunan', gradeLevels: ['7','8','9','10'], strand: null, units: 1 },
  { name: 'MAPEH', gradeLevels: ['7','8','9','10'], strand: null, units: 2 },
  { name: 'Edukasyon sa Pagpapakatao', gradeLevels: ['7','8','9','10'], strand: null, units: 1 },
  { name: 'TLE', gradeLevels: ['7','8','9','10'], strand: null, units: 1 },
  { name: 'Computer Education', gradeLevels: ['7','8','9','10'], strand: null, units: 1 },

  // SHS Core
  { name: 'Oral Communication', gradeLevels: ['11','12'], strand: null, units: 3 },
  { name: 'Reading & Writing', gradeLevels: ['11','12'], strand: null, units: 3 },
  { name: 'Komunikasyon at Pananaliksik', gradeLevels: ['11','12'], strand: null, units: 3 },
  { name: 'General Mathematics', gradeLevels: ['11','12'], strand: null, units: 3 },
  { name: 'Earth & Life Science', gradeLevels: ['11'], strand: null, units: 3 },
  { name: 'Physical Science', gradeLevels: ['12'], strand: null, units: 3 },
  { name: 'PE & Health', gradeLevels: ['11','12'], strand: null, units: 2 },
  { name: 'Media & Information Literacy', gradeLevels: ['11','12'], strand: null, units: 3 },
  { name: 'Understanding Culture', gradeLevels: ['11','12'], strand: null, units: 3 },

  // STEM
  { name: 'Pre-Calculus', gradeLevels: ['11'], strand: 'STEM', units: 4 },
  { name: 'Basic Calculus', gradeLevels: ['12'], strand: 'STEM', units: 4 },
  { name: 'General Biology', gradeLevels: ['11','12'], strand: 'STEM', units: 4 },
  { name: 'General Chemistry', gradeLevels: ['11','12'], strand: 'STEM', units: 4 },
  { name: 'General Physics', gradeLevels: ['11','12'], strand: 'STEM', units: 4 },
  { name: 'Research/Capstone', gradeLevels: ['12'], strand: 'STEM', units: 3 },

  // ABM
  { name: 'Applied Economics', gradeLevels: ['11'], strand: 'ABM', units: 4 },
  { name: 'Business Ethics', gradeLevels: ['11'], strand: 'ABM', units: 4 },
  { name: 'Fundamentals of ABM', gradeLevels: ['11'], strand: 'ABM', units: 4 },
  { name: 'Business Math', gradeLevels: ['11','12'], strand: 'ABM', units: 4 },
  { name: 'Organization & Management', gradeLevels: ['12'], strand: 'ABM', units: 4 },

  // HUMSS
  { name: 'Creative Writing', gradeLevels: ['11'], strand: 'HUMSS', units: 4 },
  { name: 'Creative Nonfiction', gradeLevels: ['12'], strand: 'HUMSS', units: 4 },
  { name: 'Trends & Networks', gradeLevels: ['11','12'], strand: 'HUMSS', units: 4 },
  { name: 'Philippine Politics', gradeLevels: ['11','12'], strand: 'HUMSS', units: 4 },
  { name: 'Community Engagement', gradeLevels: ['12'], strand: 'HUMSS', units: 3 },
];

const teacherNames = [
  'Mrs. Reyes', 'Mr. Santos', 'Ms. Cruz', 'Dr. Bautista', 'Mrs. Garcia', 'Mr. Rivera',
  'Ms. Mendoza', 'Mr. Torres', 'Mrs. Flores', 'Dr. Ramos', 'Mrs. Villanueva', 'Mr. Navarro',
  'Ms. Mercado', 'Mr. Aguilar', 'Mrs. Perez', 'Dr. Soriano', 'Mr. Abueva', 'Ms. Dela Rosa',
  'Mrs. Cordero', 'Mr. Ocampo', 'Ms. Lim', 'Dr. Tan', 'Mr. Dizon', 'Mrs. Pascual',
];

const sections = [
  'Sampaguita', 'Rosal', 'Dahlia', 'Jasmine', 'Camia', 'Orchid', 'Sunflower', 'Lily',
  'Rizal', 'Mabini', 'Bonifacio', 'Aguinaldo', 'Luna', 'Del Pilar', 'Silang', 'Jacinto',
  'Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Amethyst', 'Topaz',
];

const rooms = [
  'Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203',
  'Room 301', 'Room 302', 'Lab 1', 'Lab 2', 'Lab 3', 'Comp Lab', 'Music Room', 'Gym',
];

const scheduleSlots = [
  'MWF 7:00-8:00', 'MWF 8:00-9:00', 'MWF 9:00-10:00', 'MWF 10:00-11:00',
  'TTh 7:00-8:30', 'TTh 8:30-10:00', 'TTh 10:00-11:30', 'TTh 1:00-2:30',
  'MWF 1:00-2:00', 'MWF 2:00-3:00', 'TTh 2:30-4:00', 'MWF 3:00-4:00',
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

function generateSubjectOfferings(): SubjectOffering[] {
  const rand = seededRandom(77);
  const result: SubjectOffering[] = [];
  let counter = 0;

  for (const def of subjectDefs) {
    for (const gl of def.gradeLevels) {
      // 1-3 sections per grade level
      const numSections = 1 + Math.floor(rand() * 3);
      for (let s = 0; s < numSections; s++) {
        counter++;
        const section = pick(sections, rand);
        const teacher = pick(teacherNames, rand);
        const capacity = 30 + Math.floor(rand() * 15);
        const enrolled = Math.floor(capacity * (0.6 + rand() * 0.4));

        result.push({
          id: `subj-${String(counter).padStart(4, '0')}`,
          code: `${gl}-${def.name.replace(/[^A-Z]/gi, '').slice(0, 4).toUpperCase()}${String(s + 1).padStart(2, '0')}`,
          name: def.name,
          gradeLevel: gl,
          section,
          strand: def.strand,
          teacher,
          teacherId: `fac-${String(Math.floor(rand() * 40) + 1).padStart(4, '0')}`,
          schedule: pick(scheduleSlots, rand),
          room: pick(rooms, rand),
          units: def.units,
          capacity,
          enrolled,
          schoolYear: '2024-2025',
          semester: parseInt(gl) >= 11 ? (rand() > 0.5 ? '1st Semester' : '2nd Semester') : null,
        });
      }
    }
  }

  return result;
}

export const subjectOfferings = generateSubjectOfferings();

export const allStrands = ['All', 'STEM', 'ABM', 'HUMSS', 'GAS', 'TVL-ICT', 'TVL-HE'] as const;
