export interface TeachingLoad {
  subjectCode: string;
  subjectName: string;
  gradeLevel: string;
  section: string;
  schedule: string;
  room: string;
  studentCount: number;
}

export interface Faculty {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  title: string; // Mrs., Mr., Ms., Dr.
  sex: 'Male' | 'Female';
  dateOfBirth: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  employeeId: string;
  department: string;
  specialization: string;
  position: string;
  status: 'active' | 'on-leave' | 'resigned' | 'retired';
  dateHired: string;
  avatar: string;
  teachingLoad: TeachingLoad[];
  advisorySection: string | null;
  advisoryGradeLevel: string | null;
}

const firstNames = [
  'Richmond', 'Maria', 'Jose', 'Ana', 'Roberto', 'Carmen', 'Eduardo', 'Teresa',
  'Fernando', 'Gloria', 'Alejandro', 'Rosario', 'Miguel', 'Patricia', 'Carlos',
  'Dolores', 'Antonio', 'Beatriz', 'Francisco', 'Luisa', 'Gabriel', 'Esperanza',
  'Ramon', 'Imelda', 'Joaquin', 'Natividad', 'Manuel', 'Remedios', 'Pedro', 'Sofia',
];

const middleNames = [
  'Reyes', 'Santos', 'Cruz', 'Bautista', 'Gonzales', 'Lopez', 'Garcia', 'Rivera',
  'Mendoza', 'Torres', 'Flores', 'Ramos', 'Aquino', 'Castillo',
];

const lastNames = [
  'Abueva', 'Santos', 'Reyes', 'Bautista', 'Gonzales', 'Lopez', 'Garcia', 'Rivera',
  'Mendoza', 'Torres', 'Flores', 'Ramos', 'Aquino', 'Castillo', 'Villanueva',
  'Navarro', 'Mercado', 'Salvador', 'Aguilar', 'Fernandez', 'Santiago', 'Perez',
  'Dela Rosa', 'Cordero', 'Ocampo', 'Lim', 'Tan', 'Dizon', 'Pascual', 'Marquez',
];

const titles = ['Mrs.', 'Mr.', 'Ms.', 'Dr.'];
const credentials = ['LPT', 'LPT, MAEd', 'LPT, MAED - MATH', 'LPT, PhD', 'PhD', 'MAEd', 'MSc', 'MBA', 'LPT, MA', 'EdD'];

const departments = [
  'Elementary', 'Junior High School', 'Senior High School - STEM',
  'Senior High School - ABM', 'Senior High School - HUMSS', 'Kindergarten',
  'Mathematics', 'Science', 'English', 'Filipino', 'Social Studies', 'TLE', 'MAPEH',
];

const specializations = [
  'Mathematics', 'General Science', 'Biology', 'Chemistry', 'Physics',
  'English Language', 'Literature', 'Filipino Language', 'Social Studies',
  'History', 'Physical Education', 'Music', 'Arts', 'Health Education',
  'Technology & Livelihood Education', 'Computer Science', 'Values Education',
  'Mother Tongue', 'Research', 'Business Management', 'Accounting',
  'Creative Writing', 'Communication Arts',
];

const positions = [
  'Teacher I', 'Teacher II', 'Teacher III', 'Master Teacher I', 'Master Teacher II',
  'Head Teacher I', 'Head Teacher II', 'Head Teacher III',
  'Department Head', 'Grade Level Coordinator', 'Subject Area Coordinator',
];

const sections = [
  'Sampaguita', 'Rosal', 'Dahlia', 'Jasmine', 'Camia', 'Orchid', 'Sunflower', 'Lily',
  'Rizal', 'Mabini', 'Bonifacio', 'Aguinaldo', 'Luna', 'Del Pilar', 'Silang', 'Jacinto',
  'Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Amethyst', 'Topaz', 'Garnet', 'Opal',
];

const subjectsByDept: Record<string, string[]> = {
  'Mathematics': ['General Mathematics', 'Pre-Calculus', 'Basic Calculus', 'Statistics & Probability', 'Business Math'],
  'Science': ['General Biology', 'General Chemistry', 'General Physics', 'Earth & Life Science', 'Physical Science'],
  'English': ['Oral Communication', 'Reading & Writing', 'English for Academic Purposes', 'Creative Writing', 'Creative Nonfiction'],
  'Filipino': ['Komunikasyon at Pananaliksik', 'Pagbasa at Pagsusuri', 'Filipino sa Piling Larangan'],
  'Social Studies': ['Araling Panlipunan', 'Philippine Politics', 'Understanding Culture', 'Trends & Networks', 'Community Engagement'],
  'TLE': ['Technology & Livelihood Education', 'Computer Education', 'Entrepreneurship'],
  'MAPEH': ['Physical Education', 'Music', 'Arts', 'Health', 'PE & Health'],
  'Elementary': ['Filipino', 'English', 'Mathematics', 'Science', 'Mother Tongue', 'Edukasyon sa Pagpapakatao'],
  'Junior High School': ['Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'TLE', 'Computer Education'],
};

const rooms = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203', 'Room 301', 'Room 302', 'Lab 1', 'Lab 2', 'Comp Lab', 'Music Room', 'Gym', 'Library'];
const schedules = ['MWF 7:00-8:00', 'MWF 8:00-9:00', 'MWF 9:00-10:00', 'MWF 10:00-11:00', 'TTh 7:00-8:30', 'TTh 8:30-10:00', 'TTh 10:00-11:30', 'TTh 1:00-2:30', 'MWF 1:00-2:00', 'MWF 2:00-3:00', 'TTh 2:30-4:00'];
const gradeLevels = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const cities = ['Quezon City', 'Manila', 'Makati', 'Pasig', 'Taguig', 'Caloocan', 'Marikina'];
const provinces = ['Metro Manila', 'Cavite', 'Laguna', 'Bulacan', 'Rizal'];
const streets = ['Rizal St.', 'Mabini St.', 'Luna Ave.', 'Bonifacio Blvd.', 'Quezon Ave.', 'Roxas Blvd.', 'Katipunan Ave.', 'Aurora Blvd.'];

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

function generateFaculty(): Faculty[] {
  const rand = seededRandom(99);
  const result: Faculty[] = [];

  for (let i = 0; i < 40; i++) {
    const sex = rand() > 0.45 ? 'Female' as const : 'Male' as const;
    const firstName = pick(firstNames, rand);
    const middleName = pick(middleNames, rand);
    const lastName = pick(lastNames, rand);
    const suffix = rand() > 0.95 ? 'Jr.' : '';
    const title = rand() > 0.85 ? 'Dr.' : pick(titles.filter(t => sex === 'Female' ? t !== 'Mr.' : t !== 'Mrs.' && t !== 'Ms.'), rand) || (sex === 'Female' ? 'Ms.' : 'Mr.');
    const credential = pick(credentials, rand);

    const age = 28 + Math.floor(rand() * 30);
    const birthYear = 2024 - age;
    const birthMonth = Math.floor(rand() * 12) + 1;
    const birthDay = Math.floor(rand() * 28) + 1;

    const department = pick(departments, rand);
    const specialization = pick(specializations, rand);
    const position = pick(positions, rand);

    const statusRoll = rand();
    const status: Faculty['status'] = statusRoll > 0.9 ? 'on-leave' : statusRoll > 0.85 ? 'resigned' : 'active';

    const hireYear = 2024 - Math.floor(rand() * 20) - 1;

    // Generate teaching load (3-6 subjects)
    const numSubjects = 3 + Math.floor(rand() * 4);
    const deptSubjects = subjectsByDept[department] ?? subjectsByDept['Junior High School']!;
    const teachingLoad: TeachingLoad[] = [];
    for (let s = 0; s < numSubjects; s++) {
      const subjectName = pick(deptSubjects, rand);
      const gl = pick(gradeLevels.slice(6), rand); // Focus on Grade 7-12
      teachingLoad.push({
        subjectCode: `${gl}-${String(s + 1).padStart(2, '0')}`,
        subjectName,
        gradeLevel: gl,
        section: pick(sections, rand),
        schedule: pick(schedules, rand),
        room: pick(rooms, rand),
        studentCount: 25 + Math.floor(rand() * 20),
      });
    }

    const hasAdvisory = rand() > 0.4;

    result.push({
      id: `fac-${String(i + 1).padStart(4, '0')}`,
      firstName,
      middleName,
      lastName,
      suffix,
      title,
      sex,
      dateOfBirth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
      age,
      phone: `09${Math.floor(rand() * 10)}${Math.floor(rand() * 10)}${String(Math.floor(rand() * 10000000)).padStart(7, '0')}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, '')}@univers.edu.ph`,
      address: `${Math.floor(rand() * 999) + 1} ${pick(streets, rand)}`,
      city: pick(cities, rand),
      province: pick(provinces, rand),
      employeeId: `EMP-${String(hireYear).slice(2)}${String(Math.floor(rand() * 9999)).padStart(4, '0')}`,
      department,
      specialization,
      position: `${position}${credential ? ` (${credential})` : ''}`,
      status,
      dateHired: `${hireYear}-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-${String(Math.floor(rand() * 28) + 1).padStart(2, '0')}`,
      avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${firstName}${lastName}fac${i}&backgroundColor=000000`,
      teachingLoad,
      advisorySection: hasAdvisory ? pick(sections, rand) : null,
      advisoryGradeLevel: hasAdvisory ? pick(gradeLevels.slice(6), rand) : null,
    });
  }

  return result;
}

export const faculty = generateFaculty();
