export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin' | 'teacher';
}

export interface StudentProfile {
  _id: string;
  user: {
    _id: string;
    email: string;
  };
  firstName: string;
  lastName: string;
  studentId?: string;
  filiere: string;
  level: 'L1' | 'L2' | 'L3';
  group?: string;
  picture?: string;
  username?: string;
  adminPassword?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  _id: string;
  user: {
    _id: string;
    email: string;
  };
  firstName: string;
  lastName: string;
  teacherId?: string;
  department?: string;
  specialization?: string;
  modules?: Array<{
    _id: string;
    name: string;
    code: string;
  }>;
  filieres?: string[];
  phone?: string;
  office?: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

// Union type for any profile
export type Profile = StudentProfile | TeacherProfile;

export interface AuthResponse {
  token: string;
  user: User;
  profile?: Profile;
}
