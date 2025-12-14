import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import TeacherProfile from '../models/TeacherProfile.js';
import Module from '../models/Module.js';
import Absence from '../models/Absence.js';
import DocumentRequest from '../models/DocumentRequest.js';
import InfoNote from '../models/InfoNote.js';
import Message from '../models/Message.js';
import Timetable from '../models/Timetable.js';
import ClassHubMessage from '../models/ClassHub.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/issat';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await TeacherProfile.deleteMany({});
    await Module.deleteMany({});
    await Absence.deleteMany({});
    await DocumentRequest.deleteMany({});
    await InfoNote.deleteMany({});
    await Message.deleteMany({});
    await Timetable.deleteMany({});
    await ClassHubMessage.deleteMany({});

    // Create admin user
    const adminUser = new User({
      email: 'admin@issat.tn',
      password: 'password123',
      role: 'admin',
    });
    await adminUser.save();
    console.log('✅ Admin user created');

    // Create teacher user
    const teacherUser = new User({
      email: 'teacher@issat.tn',
      password: 'password123',
      role: 'teacher',
    });
    await teacherUser.save();

    // Create student users
    const student1 = new User({
      email: 'student1@issat.tn',
      password: 'password123',
      role: 'student',
    });
    await student1.save();

    const student2 = new User({
      email: 'student2@issat.tn',
      password: 'password123',
      role: 'student',
    });
    await student2.save();

    // Create modules first (needed for teacher profile)
    const modules = [
      {
        name: 'Algorithmique et Structures de Données',
        code: 'ASD',
        filiere: 'Informatique',
        level: 'L2',
        coefficient: 3,
        professor: 'Prof. Mohamed Ali',
      },
      {
        name: 'Base de Données',
        code: 'BDD',
        filiere: 'Informatique',
        level: 'L2',
        coefficient: 2,
        professor: 'Prof. Salma Ben Salah',
      },
      {
        name: 'Résistance des Matériaux',
        code: 'RDM',
        filiere: 'Genie Civil',
        level: 'L1',
        coefficient: 4,
        professor: 'Prof. Khaled Mezghani',
      },
      {
        name: 'Programmation Web',
        code: 'PW',
        filiere: 'Informatique',
        level: 'L2',
        coefficient: 2,
        professor: 'Prof. Mohamed Ali',
      },
    ];

    const createdModules = [];
    for (const mod of modules) {
      const module = new Module(mod);
      await module.save();
      createdModules.push(module);
    }
    console.log('✅ Modules created');

    // Create teacher profile
    const asdModule = createdModules.find(m => m.code === 'ASD');
    const pwModule = createdModules.find(m => m.code === 'PW');

    const teacherProfile = new TeacherProfile({
      user: teacherUser._id,
      firstName: 'Mohamed',
      lastName: 'Ali',
      teacherId: 'T001',
      department: 'Informatique',
      specialization: 'Génie Logiciel',
      modules: [asdModule._id, pwModule._id],
      filieres: ['Informatique'],
      phone: '+216 71 234 567',
      office: 'Bureau 205',
    });
    await teacherProfile.save();
    console.log('✅ Teacher created');

    // Create student profiles
    const profile1 = new StudentProfile({
      user: student1._id,
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      studentId: 'ST001',
      filiere: 'Informatique',
      level: 'L2',
      group: 'G1',
      username: 'ahmed.benali',
      adminPassword: 'pass123',
    });
    await profile1.save();

    const profile2 = new StudentProfile({
      user: student2._id,
      firstName: 'Fatma',
      lastName: 'Trabelsi',
      studentId: 'ST002',
      filiere: 'Genie Civil',
      level: 'L1',
      group: 'G2',
      username: 'fatma.trabelsi',
      adminPassword: 'pass456',
    });
    await profile2.save();
    console.log('✅ Students created');

    // Create timetable for teacher
    const timetableEntries = [
      {
        teacher: teacherProfile._id,
        module: asdModule._id,
        filiere: 'Informatique',
        level: 'L2',
        group: 'G1',
        dayOfWeek: 'Lundi',
        startTime: '08:30',
        endTime: '10:00',
        room: 'Salle 101',
        type: 'Cours',
      },
      {
        teacher: teacherProfile._id,
        module: asdModule._id,
        filiere: 'Informatique',
        level: 'L2',
        group: 'G1',
        dayOfWeek: 'Mercredi',
        startTime: '10:15',
        endTime: '11:45',
        room: 'Labo Info 1',
        type: 'TP',
      },
      {
        teacher: teacherProfile._id,
        module: pwModule._id,
        filiere: 'Informatique',
        level: 'L2',
        group: 'G1',
        dayOfWeek: 'Jeudi',
        startTime: '14:00',
        endTime: '15:30',
        room: 'Salle 202',
        type: 'Cours',
      },
    ];

    for (const entry of timetableEntries) {
      await Timetable.create(entry);
    }
    console.log('✅ Timetable created');

    // Create ClassHub message
    await ClassHubMessage.create({
      teacher: teacherProfile._id,
      filieres: ['Informatique'],
      level: 'L2',
      module: asdModule._id,
      title: 'Bienvenue au cours ASD!',
      content: 'Bienvenue dans le cours d\'Algorithmique et Structures de Données. Les supports de cours seront partagés ici.',
      type: 'announcement',
      isPinned: true,
    });
    console.log('✅ ClassHub message created');

    // Create absences
    const bddModule = createdModules.find(m => m.code === 'BDD');

    if (asdModule && profile1) {
      await Absence.create({
        student: profile1._id,
        module: asdModule._id,
        date: new Date('2024-01-15'),
        justified: false,
        recordedBy: adminUser._id,
      });

      await Absence.create({
        student: profile1._id,
        module: asdModule._id,
        date: new Date('2024-01-22'),
        justified: false,
        recordedBy: adminUser._id,
      });

      await Absence.create({
        student: profile1._id,
        module: bddModule._id,
        date: new Date('2024-01-20'),
        justified: true,
        recordedBy: adminUser._id,
      });
    }
    console.log('✅ Absences created');

    // Create document requests
    if (profile1) {
      await DocumentRequest.create({
        student: profile1._id,
        type: 'attestation_scolarite',
        status: 'pending',
        comment: 'Besoin pour bourse',
      });
    }
    console.log('✅ Document requests created');

    // Create info notes
    await InfoNote.create({
      title: 'Inscription semestre 2',
      content: 'Les inscriptions pour le semestre 2 sont ouvertes jusqu\'au 15 février.',
      category: 'academic',
      priority: 'high',
      targetAudience: ['all'],
      createdBy: adminUser._id,
    });

    await InfoNote.create({
      title: 'Journée portes ouvertes',
      content: 'L\'ISSAT organise une journée portes ouvertes le 25 mars 2024.',
      category: 'event',
      priority: 'medium',
      targetAudience: ['all'],
      createdBy: adminUser._id,
    });
    console.log('✅ Info notes created');

    // Create messages
    await Message.create({
      title: 'Absence du professeur',
      content: 'Le cours de Base de Données du 20 janvier est annulé.',
      type: 'prof_absence',
      targetAudience: ['all'],
      createdBy: adminUser._id,
    });
    console.log('✅ Messages created');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@issat.tn / password123');
    console.log('   Teacher: teacher@issat.tn / password123');
    console.log('   Student 1: student1@issat.tn / password123');
    console.log('   Student 2: student2@issat.tn / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
