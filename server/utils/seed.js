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

// ============ FILIÈRES ET MODULES ISSAT KAIROUAN ============

// Ingénierie des Systèmes Informatiques (ISI)
const ISI_MODULES = [
  // Semestre 1
  { name: 'Algorithmique & Programmation 1', code: 'ISI-S1-ALGO1', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 1, coefficient: 3 },
  { name: 'Architecture des Ordinateurs', code: 'ISI-S1-ARCHI', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 1, coefficient: 2 },
  { name: 'Mathématiques (Analyse & Algèbre)', code: 'ISI-S1-MATH', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 1, coefficient: 3 },
  { name: 'Systèmes Logiques', code: 'ISI-S1-SYSLOG', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 1, coefficient: 2 },
  { name: 'Introduction aux SI', code: 'ISI-S1-INTROSI', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 1, coefficient: 1 },
  { name: 'Anglais 1', code: 'ISI-S1-ANG', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 1, coefficient: 1 },
  { name: 'Techniques de Communication 1', code: 'ISI-S1-COM', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 1, coefficient: 1 },
  // Semestre 2
  { name: 'Programmation 2', code: 'ISI-S2-PROG2', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 2, coefficient: 3 },
  { name: 'Structures de Données', code: 'ISI-S2-SD', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 2, coefficient: 3 },
  { name: 'Bases de Données 1', code: 'ISI-S2-BD1', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Systèmes d\'Exploitation (bases)', code: 'ISI-S2-SE', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Probabilités & Statistiques', code: 'ISI-S2-PROBA', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Anglais 2', code: 'ISI-S2-ANG', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 2, coefficient: 1 },
  { name: 'Droit & Éthique Informatique', code: 'ISI-S2-DROIT', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L1', semester: 2, coefficient: 1 },
  // Semestre 3
  { name: 'Programmation Orientée Objet (Java)', code: 'ISI-S3-POO', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 3, coefficient: 3 },
  { name: 'Bases de Données 2', code: 'ISI-S3-BD2', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Réseaux Informatiques 1', code: 'ISI-S3-RES1', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Génie Logiciel', code: 'ISI-S3-GL', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Mathématiques pour Informatique', code: 'ISI-S3-MATHI', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Anglais Technique', code: 'ISI-S3-ANGT', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 3, coefficient: 1 },
  // Semestre 4
  { name: 'Développement Web', code: 'ISI-S4-WEB', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 4, coefficient: 3 },
  { name: 'Systèmes d\'Exploitation (Linux)', code: 'ISI-S4-LINUX', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Réseaux Informatiques 2', code: 'ISI-S4-RES2', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'UML & Modélisation', code: 'ISI-S4-UML', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Sécurité Informatique', code: 'ISI-S4-SEC', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Mini-Projet', code: 'ISI-S4-MINI', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', semester: 4, coefficient: 2 },
  // Semestre 5
  { name: 'Développement Web Avancé', code: 'ISI-S5-WEBA', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L3', semester: 5, coefficient: 3 },
  { name: 'Applications Distribuées', code: 'ISI-S5-DIST', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Administration Systèmes & Réseaux', code: 'ISI-S5-ADMIN', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Intelligence Artificielle', code: 'ISI-S5-IA', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Méthodes Agiles', code: 'ISI-S5-AGILE', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L3', semester: 5, coefficient: 1 },
  { name: 'Projet (Préparation PFE)', code: 'ISI-S5-PFE', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L3', semester: 5, coefficient: 2 },
];

// Électronique – Électrotechnique – Automatique (EEA)
const EEA_MODULES = [
  // Semestre 1
  { name: 'Mathématiques', code: 'EEA-S1-MATH', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 1, coefficient: 3 },
  { name: 'Physique', code: 'EEA-S1-PHY', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 1, coefficient: 3 },
  { name: 'Circuits Électriques', code: 'EEA-S1-CIRC', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 1, coefficient: 2 },
  { name: 'Algorithmique', code: 'EEA-S1-ALGO', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 1, coefficient: 2 },
  { name: 'Dessin Technique', code: 'EEA-S1-DT', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 1, coefficient: 1 },
  { name: 'Anglais', code: 'EEA-S1-ANG', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 1, coefficient: 1 },
  // Semestre 2
  { name: 'Électronique Analogique', code: 'EEA-S2-ELANA', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 2, coefficient: 3 },
  { name: 'Électronique Numérique', code: 'EEA-S2-ELNUM', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Mesures Électriques', code: 'EEA-S2-MES', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Informatique Industrielle', code: 'EEA-S2-II', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Probabilités', code: 'EEA-S2-PROBA', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Anglais', code: 'EEA-S2-ANG', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', semester: 2, coefficient: 1 },
  // Semestre 3
  { name: 'Automatique Continue', code: 'EEA-S3-AUTOC', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 3, coefficient: 3 },
  { name: 'Machines Électriques', code: 'EEA-S3-MACH', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Microcontrôleurs', code: 'EEA-S3-MICRO', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Capteurs & Instrumentation', code: 'EEA-S3-CAPT', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Électronique de Puissance', code: 'EEA-S3-ELPUI', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Communication', code: 'EEA-S3-COM', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 3, coefficient: 1 },
  // Semestre 4
  { name: 'Automatique Discrète', code: 'EEA-S4-AUTOD', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Réseaux Industriels', code: 'EEA-S4-RESIND', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Commande des Systèmes', code: 'EEA-S4-CMDSYS', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 4, coefficient: 3 },
  { name: 'Supervision (SCADA)', code: 'EEA-S4-SCADA', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Maintenance Industrielle', code: 'EEA-S4-MAINT', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Mini-Projet', code: 'EEA-S4-MINI', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L2', semester: 4, coefficient: 2 },
  // Semestre 5
  { name: 'Automatique Avancée', code: 'EEA-S5-AUTOA', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L3', semester: 5, coefficient: 3 },
  { name: 'Systèmes Temps Réel', code: 'EEA-S5-STR', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Diagnostic & Maintenance', code: 'EEA-S5-DIAG', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Qualité & Sécurité', code: 'EEA-S5-QS', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L3', semester: 5, coefficient: 1 },
  { name: 'Projet Industriel', code: 'EEA-S5-PROJ', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Préparation PFE', code: 'EEA-S5-PFE', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L3', semester: 5, coefficient: 2 },
];

// Génie Mécanique
const GM_MODULES = [
  // Semestre 1
  { name: 'Mathématiques', code: 'GM-S1-MATH', filiere: 'Génie Mécanique', level: 'L1', semester: 1, coefficient: 3 },
  { name: 'Physique', code: 'GM-S1-PHY', filiere: 'Génie Mécanique', level: 'L1', semester: 1, coefficient: 3 },
  { name: 'Mécanique Générale', code: 'GM-S1-MECG', filiere: 'Génie Mécanique', level: 'L1', semester: 1, coefficient: 3 },
  { name: 'Dessin Industriel', code: 'GM-S1-DI', filiere: 'Génie Mécanique', level: 'L1', semester: 1, coefficient: 2 },
  { name: 'Matériaux', code: 'GM-S1-MAT', filiere: 'Génie Mécanique', level: 'L1', semester: 1, coefficient: 2 },
  { name: 'Informatique', code: 'GM-S1-INFO', filiere: 'Génie Mécanique', level: 'L1', semester: 1, coefficient: 1 },
  // Semestre 2
  { name: 'Résistance des Matériaux', code: 'GM-S2-RDM', filiere: 'Génie Mécanique', level: 'L1', semester: 2, coefficient: 3 },
  { name: 'Cinématique & Dynamique', code: 'GM-S2-CIN', filiere: 'Génie Mécanique', level: 'L1', semester: 2, coefficient: 3 },
  { name: 'Fabrication Mécanique', code: 'GM-S2-FAB', filiere: 'Génie Mécanique', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Métrologie', code: 'GM-S2-MET', filiere: 'Génie Mécanique', level: 'L1', semester: 2, coefficient: 1 },
  { name: 'Thermodynamique', code: 'GM-S2-THERMO', filiere: 'Génie Mécanique', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Anglais', code: 'GM-S2-ANG', filiere: 'Génie Mécanique', level: 'L1', semester: 2, coefficient: 1 },
  // Semestre 3
  { name: 'Mécanique des Fluides', code: 'GM-S3-MF', filiere: 'Génie Mécanique', level: 'L2', semester: 3, coefficient: 3 },
  { name: 'Transfert de Chaleur', code: 'GM-S3-TC', filiere: 'Génie Mécanique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'CFAO', code: 'GM-S3-CFAO', filiere: 'Génie Mécanique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Tribologie', code: 'GM-S3-TRIB', filiere: 'Génie Mécanique', level: 'L2', semester: 3, coefficient: 1 },
  { name: 'Éléments de Machines', code: 'GM-S3-ELEM', filiere: 'Génie Mécanique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Communication', code: 'GM-S3-COM', filiere: 'Génie Mécanique', level: 'L2', semester: 3, coefficient: 1 },
  // Semestre 4
  { name: 'Maintenance Industrielle', code: 'GM-S4-MAINT', filiere: 'Génie Mécanique', level: 'L2', semester: 4, coefficient: 3 },
  { name: 'Gestion de Production', code: 'GM-S4-GP', filiere: 'Génie Mécanique', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Vibrations', code: 'GM-S4-VIB', filiere: 'Génie Mécanique', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Qualité & Normalisation', code: 'GM-S4-QN', filiere: 'Génie Mécanique', level: 'L2', semester: 4, coefficient: 1 },
  { name: 'Sécurité Industrielle', code: 'GM-S4-SEC', filiere: 'Génie Mécanique', level: 'L2', semester: 4, coefficient: 1 },
  { name: 'Mini-Projet', code: 'GM-S4-MINI', filiere: 'Génie Mécanique', level: 'L2', semester: 4, coefficient: 2 },
  // Semestre 5
  { name: 'Diagnostic des Systèmes', code: 'GM-S5-DIAG', filiere: 'Génie Mécanique', level: 'L3', semester: 5, coefficient: 3 },
  { name: 'Maintenance Préventive', code: 'GM-S5-MAINTP', filiere: 'Génie Mécanique', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Gestion Industrielle', code: 'GM-S5-GI', filiere: 'Génie Mécanique', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Projet Technique', code: 'GM-S5-PROJ', filiere: 'Génie Mécanique', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Préparation PFE', code: 'GM-S5-PFE', filiere: 'Génie Mécanique', level: 'L3', semester: 5, coefficient: 2 },
];

// Génie Énergétique
const GE_MODULES = [
  // Semestre 1
  { name: 'Mathématiques', code: 'GE-S1-MATH', filiere: 'Génie Énergétique', level: 'L1', semester: 1, coefficient: 3 },
  { name: 'Physique', code: 'GE-S1-PHY', filiere: 'Génie Énergétique', level: 'L1', semester: 1, coefficient: 3 },
  { name: 'Thermique', code: 'GE-S1-THERM', filiere: 'Génie Énergétique', level: 'L1', semester: 1, coefficient: 2 },
  { name: 'Électrotechnique', code: 'GE-S1-ELEC', filiere: 'Génie Énergétique', level: 'L1', semester: 1, coefficient: 2 },
  { name: 'Dessin Technique', code: 'GE-S1-DT', filiere: 'Génie Énergétique', level: 'L1', semester: 1, coefficient: 1 },
  { name: 'Informatique', code: 'GE-S1-INFO', filiere: 'Génie Énergétique', level: 'L1', semester: 1, coefficient: 1 },
  // Semestre 2
  { name: 'Thermodynamique', code: 'GE-S2-THERMO', filiere: 'Génie Énergétique', level: 'L1', semester: 2, coefficient: 3 },
  { name: 'Transfert de Chaleur', code: 'GE-S2-TC', filiere: 'Génie Énergétique', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Machines Thermiques', code: 'GE-S2-MT', filiere: 'Génie Énergétique', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Instrumentation', code: 'GE-S2-INST', filiere: 'Génie Énergétique', level: 'L1', semester: 2, coefficient: 2 },
  { name: 'Anglais', code: 'GE-S2-ANG', filiere: 'Génie Énergétique', level: 'L1', semester: 2, coefficient: 1 },
  { name: 'Communication', code: 'GE-S2-COM', filiere: 'Génie Énergétique', level: 'L1', semester: 2, coefficient: 1 },
  // Semestre 3
  { name: 'Froid & Climatisation', code: 'GE-S3-FROID', filiere: 'Génie Énergétique', level: 'L2', semester: 3, coefficient: 3 },
  { name: 'Énergies Renouvelables', code: 'GE-S3-ENR', filiere: 'Génie Énergétique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Automatique', code: 'GE-S3-AUTO', filiere: 'Génie Énergétique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Installations Thermiques', code: 'GE-S3-IT', filiere: 'Génie Énergétique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Électricité Industrielle', code: 'GE-S3-EI', filiere: 'Génie Énergétique', level: 'L2', semester: 3, coefficient: 2 },
  { name: 'Mini-Projet', code: 'GE-S3-MINI', filiere: 'Génie Énergétique', level: 'L2', semester: 3, coefficient: 2 },
  // Semestre 4
  { name: 'Audit Énergétique', code: 'GE-S4-AUDIT', filiere: 'Génie Énergétique', level: 'L2', semester: 4, coefficient: 3 },
  { name: 'Gestion de l\'Énergie', code: 'GE-S4-GEST', filiere: 'Génie Énergétique', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Maintenance Énergétique', code: 'GE-S4-MAINT', filiere: 'Génie Énergétique', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Réseaux Énergétiques', code: 'GE-S4-RES', filiere: 'Génie Énergétique', level: 'L2', semester: 4, coefficient: 2 },
  { name: 'Qualité & Sécurité', code: 'GE-S4-QS', filiere: 'Génie Énergétique', level: 'L2', semester: 4, coefficient: 1 },
  { name: 'Projet Appliqué', code: 'GE-S4-PROJ', filiere: 'Génie Énergétique', level: 'L2', semester: 4, coefficient: 2 },
  // Semestre 5
  { name: 'Optimisation Énergétique', code: 'GE-S5-OPT', filiere: 'Génie Énergétique', level: 'L3', semester: 5, coefficient: 3 },
  { name: 'Systèmes Solaires & Éoliens', code: 'GE-S5-SOL', filiere: 'Génie Énergétique', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Management Énergétique', code: 'GE-S5-MAN', filiere: 'Génie Énergétique', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Projet Technique', code: 'GE-S5-PROJT', filiere: 'Génie Énergétique', level: 'L3', semester: 5, coefficient: 2 },
  { name: 'Préparation PFE', code: 'GE-S5-PFE', filiere: 'Génie Énergétique', level: 'L3', semester: 5, coefficient: 2 },
];

// All filières
const FILIERES = [
  'Ingénierie des Systèmes Informatiques',
  'Électronique, Électrotechnique & Automatique', 
  'Génie Mécanique',
  'Génie Énergétique',
  'Master Data Science',
  'Master Automatique & Informatique Industrielle'
];

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

    // Create admin profile
    const adminProfile = new StudentProfile({
      user: adminUser._id,
      firstName: 'Admin',
      lastName: 'ISSAT',
      filiere: 'Administration',
      level: 'L1',
    });
    await adminProfile.save();
    console.log('✅ Admin user created');

    // Create all modules
    const allModules = [...ISI_MODULES, ...EEA_MODULES, ...GM_MODULES, ...GE_MODULES];
    const createdModules = [];
    
    for (const mod of allModules) {
      const module = new Module(mod);
      await module.save();
      createdModules.push(module);
    }
    console.log(`✅ ${createdModules.length} modules created`);

    // Create teachers
    const teachers = [
      {
        email: 'prof.informatique@issat.tn',
        firstName: 'Mohamed',
        lastName: 'Ben Ali',
        department: 'Informatique',
        specialization: 'Génie Logiciel',
        filieres: ['Ingénierie des Systèmes Informatiques'],
        phone: '+216 71 234 567',
        office: 'Bureau 101',
      },
      {
        email: 'prof.electronique@issat.tn',
        firstName: 'Fatma',
        lastName: 'Trabelsi',
        department: 'Électronique',
        specialization: 'Automatique Industrielle',
        filieres: ['Électronique, Électrotechnique & Automatique'],
        phone: '+216 71 234 568',
        office: 'Bureau 201',
      },
      {
        email: 'prof.mecanique@issat.tn',
        firstName: 'Khaled',
        lastName: 'Mezghani',
        department: 'Génie Mécanique',
        specialization: 'Maintenance Industrielle',
        filieres: ['Génie Mécanique'],
        phone: '+216 71 234 569',
        office: 'Bureau 301',
      },
      {
        email: 'prof.energie@issat.tn',
        firstName: 'Salma',
        lastName: 'Bouaziz',
        department: 'Énergie',
        specialization: 'Énergies Renouvelables',
        filieres: ['Génie Énergétique'],
        phone: '+216 71 234 570',
        office: 'Bureau 401',
      },
    ];

    const createdTeachers = [];
    for (const teacher of teachers) {
      const user = new User({
        email: teacher.email,
        password: 'password123',
        role: 'teacher',
      });
      await user.save();

      // Get modules for this teacher's filière
      const teacherModules = createdModules
        .filter(m => teacher.filieres.includes(m.filiere))
        .slice(0, 5)
        .map(m => m._id);

      const profile = new TeacherProfile({
        user: user._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        teacherId: `T${String(createdTeachers.length + 1).padStart(3, '0')}`,
        department: teacher.department,
        specialization: teacher.specialization,
        modules: teacherModules,
        filieres: teacher.filieres,
        phone: teacher.phone,
        office: teacher.office,
      });
      await profile.save();
      createdTeachers.push({ user, profile });
    }
    console.log('✅ Teachers created');

    // Create students
    const students = [
      { firstName: 'Ahmed', lastName: 'Ben Salah', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', group: 'A' },
      { firstName: 'Fatma', lastName: 'Hammami', filiere: 'Ingénierie des Systèmes Informatiques', level: 'L2', group: 'A' },
      { firstName: 'Karim', lastName: 'Jlassi', filiere: 'Électronique, Électrotechnique & Automatique', level: 'L1', group: 'B' },
      { firstName: 'Sarra', lastName: 'Mansouri', filiere: 'Génie Mécanique', level: 'L3', group: 'A' },
      { firstName: 'Youssef', lastName: 'Gharbi', filiere: 'Génie Énergétique', level: 'L2', group: 'B' },
    ];

    const createdStudents = [];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const user = new User({
        email: `student${i + 1}@issat.tn`,
        password: 'password123',
        role: 'student',
      });
      await user.save();

      const profile = new StudentProfile({
        user: user._id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: `ST${String(i + 1).padStart(4, '0')}`,
        filiere: student.filiere,
        level: student.level,
        group: student.group,
        username: `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}`,
        adminPassword: 'pass123',
      });
      await profile.save();
      createdStudents.push({ user, profile });
    }
    console.log('✅ Students created');

    // Create timetable entries
    const isiTeacher = createdTeachers.find(t => t.profile.department === 'Informatique');
    const isiModules = createdModules.filter(m => m.filiere === 'Ingénierie des Systèmes Informatiques' && m.level === 'L2');
    
    if (isiTeacher && isiModules.length > 0) {
      const timetableEntries = [
        { dayOfWeek: 'Lundi', startTime: '08:30', endTime: '10:00', type: 'Cours', room: 'Salle 101' },
        { dayOfWeek: 'Lundi', startTime: '10:15', endTime: '11:45', type: 'TD', room: 'Salle 102' },
        { dayOfWeek: 'Mardi', startTime: '14:00', endTime: '15:30', type: 'TP', room: 'Labo Info 1' },
        { dayOfWeek: 'Mercredi', startTime: '08:30', endTime: '10:00', type: 'Cours', room: 'Amphi A' },
        { dayOfWeek: 'Jeudi', startTime: '10:15', endTime: '11:45', type: 'TP', room: 'Labo Info 2' },
      ];

      for (let i = 0; i < timetableEntries.length; i++) {
        await Timetable.create({
          teacher: isiTeacher.profile._id,
          module: isiModules[i % isiModules.length]._id,
          filiere: 'Ingénierie des Systèmes Informatiques',
          level: 'L2',
          group: 'A',
          ...timetableEntries[i],
        });
      }
      console.log('✅ Timetable created');
    }

    // Create ClassHub messages
    if (isiTeacher && isiModules.length > 0) {
      await ClassHubMessage.create({
        teacher: isiTeacher.profile._id,
        filieres: ['Ingénierie des Systèmes Informatiques'],
        level: 'L2',
        module: isiModules[0]._id,
        title: 'Bienvenue - Semestre 2024/2025',
        content: 'Bienvenue aux étudiants de la filière Ingénierie des Systèmes Informatiques. Les supports de cours seront partagés régulièrement.',
        type: 'announcement',
        isPinned: true,
      });
    }
    console.log('✅ ClassHub messages created');

    // Create absences
    const isiStudent = createdStudents.find(s => s.profile.filiere === 'Ingénierie des Systèmes Informatiques');
    if (isiStudent && isiModules.length > 0) {
      await Absence.create({
        student: isiStudent.profile._id,
        module: isiModules[0]._id,
        date: new Date('2024-12-01'),
        justified: false,
        recordedBy: adminUser._id,
      });
      await Absence.create({
        student: isiStudent.profile._id,
        module: isiModules[1]._id,
        date: new Date('2024-12-05'),
        justified: true,
        justificationReason: 'Certificat médical',
        recordedBy: adminUser._id,
      });
    }
    console.log('✅ Absences created');

    // Create document requests
    if (isiStudent) {
      await DocumentRequest.create({
        student: isiStudent.profile._id,
        type: 'attestation_scolarite',
        status: 'pending',
        comment: 'Pour dossier de bourse',
      });
    }
    console.log('✅ Document requests created');

    // Create info notes
    await InfoNote.create({
      title: 'Inscription au Semestre de Printemps 2025',
      content: 'Les inscriptions au semestre de printemps 2025 sont ouvertes. Veuillez consulter le calendrier académique.',
      category: 'academic',
      priority: 'high',
      targetAudience: ['all'],
      createdBy: adminUser._id,
    });

    await InfoNote.create({
      title: 'Journée Portes Ouvertes',
      content: 'L\'ISSAT Kairouan organise une journée portes ouvertes le 15 janvier 2025.',
      category: 'event',
      priority: 'medium',
      targetAudience: ['all'],
      createdBy: adminUser._id,
    });
    console.log('✅ Info notes created');

    // Create messages
    await Message.create({
      title: 'Cours de POO annulé',
      content: 'Le cours de Programmation Orientée Objet de demain est annulé pour cause de réunion pédagogique.',
      type: 'prof_absence',
      targetAudience: ['all'],
      createdBy: adminUser._id,
    });
    console.log('✅ Messages created');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📚 Filières créées:');
    FILIERES.slice(0, 4).forEach(f => console.log(`   - ${f}`));
    console.log(`\n📦 ${createdModules.length} modules créés`);
    console.log('\n📝 Identifiants de connexion:');
    console.log('   Admin: admin@issat.tn / password123');
    console.log('   Prof Informatique: prof.informatique@issat.tn / password123');
    console.log('   Prof Électronique: prof.electronique@issat.tn / password123');
    console.log('   Prof Mécanique: prof.mecanique@issat.tn / password123');
    console.log('   Prof Énergie: prof.energie@issat.tn / password123');
    console.log('   Étudiants: student1@issat.tn à student5@issat.tn / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
