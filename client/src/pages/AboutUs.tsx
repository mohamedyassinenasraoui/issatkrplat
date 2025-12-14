import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, Linkedin, Mail, Code, Users, Rocket, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Team members data
const teamMembers = [
  {
    id: 1,
    name: 'Mohamed Yassine Nasraoui',
    role: 'Full Stack Developer',
    parcours: 'Étudiant en Ingénierie des Systèmes Informatiques à l\'ISSAT Kairouan. Passionné par le développement web et mobile, avec une expertise en React, Node.js, et bases de données.',
    image: '/images/team/member1.jpg', // You can add team member images
    github: 'https://github.com/mohamedyassinenasraoui',
    linkedin: 'https://linkedin.com/in/mohamedyassinenasraoui',
    email: 'mohamedyassine.nasraoui@example.com',
  },
  {
    id: 2,
    name: 'Said Bennaceur',
    role: 'AI/ML Engineer & Backend Developer',
    parcours: 'Étudiant en Informatique, spécialisé en Intelligence Artificielle et Machine Learning. Expert en développement backend et intégration d\'IA.',
    image: '/images/team/member2.jpg',
    github: 'https://github.com/saidbennaceur05-cpu',
    linkedin: 'https://linkedin.com/in/saidbennaceur',
    email: 'said.bennaceur@example.com',
  },
  // Add more team members as needed
];

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-issat-navy' : 'bg-gray-50'}`}>
      {/* Background Map (same as Home) */}
      <div className="fixed inset-0 z-0">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.5!2d10.1006!3d35.6714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzVcNDAnMTcuMCJOIDEwXzAwJzAyLjIiRQ!5e0!3m2!1sen!2stn!4v1234567890!5m2!1sen!2stn"
          width="100%"
          height="100%"
          style={{
            border: 0,
            filter: isDark
              ? 'brightness(0.3) contrast(1.2) saturate(0.7)'
              : 'brightness(0.6) contrast(1.1) saturate(0.9)'
          }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
          title="ISSAT Kairouan Location"
        ></iframe>
        {/* Subtle radial overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at center, rgba(30, 58, 95, 0.5) 0%, rgba(30, 58, 95, 0.2) 40%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 40%, transparent 70%)'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white p-1">
                  <img
                    src="/images/logoissatkr.png"
                    alt="ISSAT Kairouan"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="font-bold text-lg text-white leading-tight">ISSAT<span className="text-issat-red">KR</span></span>
                  <p className="text-xs text-white/80 leading-tight hidden sm:block">Institut Supérieur des Sciences Appliquées et de Technologie de Kairouan</p>
                  <p className="text-xs text-white/80 leading-tight sm:hidden">Institut Supérieur</p>
                </div>
              </Link>
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition font-medium text-sm border border-white/30"
              >
                <ArrowLeft size={18} />
                <span>Retour</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <section className="relative py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
            {/* Hero Section */}
            <div className={`backdrop-blur-lg p-10 rounded-3xl border shadow-2xl mb-12 text-center ${isDark
              ? 'bg-white/10 border-white/30'
              : 'bg-white/40 border-white/50'
              }`}>
              <div className="flex justify-center mb-6">
                <div className="text-6xl">👥</div>
              </div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                À propos de nous
              </h1>
              <p className={`text-xl leading-relaxed max-w-3xl mx-auto ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                Nous sommes une équipe d'étudiants passionnés de l'ISSAT Kairouan, dédiés à la création de solutions numériques innovantes pour améliorer l'expérience universitaire.
              </p>
            </div>

            {/* Project Description */}
            <div className={`backdrop-blur-lg p-10 rounded-3xl border shadow-2xl mb-12 ${isDark
              ? 'bg-white/10 border-white/30'
              : 'bg-white/40 border-white/50'
              }`}>
              <div className="flex items-center space-x-3 mb-6">
                <Rocket className="h-8 w-8 text-issat-red" />
                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                  Notre Projet
                </h2>
              </div>
              <div className="space-y-4">
                <p className={`text-lg leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                  La <strong>Plateforme Numérique de l'ISSAT Kairouan</strong> est une solution complète développée pour moderniser et centraliser les services administratifs, pédagogiques et universitaires de l'institut.
                </p>
                <p className={`text-lg leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                  Cette plateforme offre aux étudiants, enseignants et administrateurs un accès unifié à tous les services essentiels : suivi des absences, gestion des documents, communication, et bien plus encore.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className={`p-6 rounded-2xl border ${isDark
                  ? 'bg-white/5 border-white/20'
                  : 'bg-white/20 border-white/30'
                  }`}>
                  <Code className="h-8 w-8 text-issat-red mb-4" />
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                    Développement
                  </h3>
                  <p className={`${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                    Stack moderne : React, Node.js, MongoDB, Tailwind CSS
                  </p>
                </div>
                <div className={`p-6 rounded-2xl border ${isDark
                  ? 'bg-white/5 border-white/20'
                  : 'bg-white/20 border-white/30'
                  }`}>
                  <Users className="h-8 w-8 text-issat-red mb-4" />
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                    Collaboration
                  </h3>
                  <p className={`${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                    Travail d'équipe et développement agile
                  </p>
                </div>
                <div className={`p-6 rounded-2xl border ${isDark
                  ? 'bg-white/5 border-white/20'
                  : 'bg-white/20 border-white/30'
                  }`}>
                  <Award className="h-8 w-8 text-issat-red mb-4" />
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                    Innovation
                  </h3>
                  <p className={`${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                    Intégration d'IA et technologies modernes
                  </p>
                </div>
              </div>
            </div>

            {/* Team Section */}
            <div className={`backdrop-blur-lg p-10 rounded-3xl border shadow-2xl ${isDark
              ? 'bg-white/10 border-white/30'
              : 'bg-white/40 border-white/50'
              }`}>
              <div className="flex items-center space-x-3 mb-8">
                <Users className="h-8 w-8 text-issat-red" />
                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                  Notre Équipe
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`backdrop-blur-lg p-8 rounded-2xl border shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all ${isDark
                      ? 'bg-white/10 border-white/30'
                      : 'bg-white/40 border-white/50'
                      }`}
                  >
                    <div className="flex items-start space-x-6">
                      {/* Profile Image */}
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-issat-red flex-shrink-0">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image not found
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-issat-red text-white text-2xl font-bold">${member.name.split(' ').map(n => n[0]).join('')}</div>`;
                            }
                          }}
                        />
                      </div>

                      {/* Member Info */}
                      <div className="flex-1">
                        <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                          {member.name}
                        </h3>
                        <p className={`text-lg mb-4 text-issat-red font-medium`}>
                          {member.role}
                        </p>
                        <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                          {member.parcours}
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center space-x-3">
                          {member.github && (
                            <a
                              href={member.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2 rounded-lg transition ${isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-white/20 hover:bg-white/30 text-issat-navy'
                                }`}
                              title="GitHub"
                            >
                              <Github size={20} />
                            </a>
                          )}
                          {member.linkedin && (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2 rounded-lg transition ${isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-white/20 hover:bg-white/30 text-issat-navy'
                                }`}
                              title="LinkedIn"
                            >
                              <Linkedin size={20} />
                            </a>
                          )}
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className={`p-2 rounded-lg transition ${isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-white/20 hover:bg-white/30 text-issat-navy'
                                }`}
                              title="Email"
                            >
                              <Mail size={20} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies Used */}
            <div className={`backdrop-blur-lg p-10 rounded-3xl border shadow-2xl mt-12 ${isDark
              ? 'bg-white/10 border-white/30'
              : 'bg-white/40 border-white/50'
              }`}>
              <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                Technologies Utilisées
              </h2>
              <div className="grid md:grid-cols-4 gap-4">
                {['React', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Express.js', 'OpenAI API', 'Multer'].map((tech) => (
                  <div
                    key={tech}
                    className={`p-4 rounded-xl text-center border ${isDark
                      ? 'bg-white/5 border-white/20 text-white'
                      : 'bg-white/20 border-white/30 text-issat-navy'
                      }`}
                  >
                    <span className="font-medium">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className={`backdrop-blur-lg p-10 rounded-3xl border shadow-2xl mt-12 text-center ${isDark
              ? 'bg-white/10 border-white/30'
              : 'bg-white/40 border-white/50'
              }`}>
              <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                Contactez-nous
              </h2>
              <p className={`text-lg mb-6 ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                Vous avez des questions ou des suggestions ? N'hésitez pas à nous contacter !
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://github.com/mohamedyassinenasraoui/issatkrplat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-6 py-3 bg-issat-red text-white rounded-lg hover:bg-issat-redLight transition font-medium shadow-lg"
                >
                  <Github size={20} />
                  <span>Voir le projet sur GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;

