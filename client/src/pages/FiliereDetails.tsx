import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Filières data (same as in Home.tsx)
const filieres = [
  {
    id: 'isi',
    name: 'Ingénierie des Systèmes Informatiques',
    shortName: 'ISI',
    shortDescription: 'Formation en développement logiciel, bases de données, réseaux et systèmes informatiques.',
    description: 'La filière Ingénierie des Systèmes Informatiques vise à former des étudiants capables de concevoir, développer et administrer des systèmes informatiques modernes. La formation couvre les principaux domaines de l\'informatique, notamment le développement logiciel, les bases de données, les réseaux et les systèmes informatiques. Elle met l\'accent sur l\'acquisition de compétences techniques solides à travers des enseignements théoriques, des travaux pratiques et des projets appliqués.',
    benefits: [
      'Maîtrise des bases du développement logiciel',
      'Compréhension des systèmes et architectures informatiques',
      'Capacité à travailler sur des projets informatiques concrets',
      'Préparation à l\'intégration professionnelle ou à la poursuite des études',
    ],
    icon: '💻',
  },
  {
    id: 'eea',
    name: 'Électronique, Électrotechnique & Automatique',
    shortName: 'EEA',
    shortDescription: 'Formation en électronique, automatisme et systèmes industriels.',
    description: 'Cette filière forme des spécialistes dans les domaines de l\'électronique, de l\'électrotechnique et de l\'automatisation industrielle. Les étudiants acquièrent des connaissances théoriques et pratiques sur les systèmes électroniques, les installations électriques et les processus automatisés. La formation est orientée vers les applications industrielles, avec une forte composante pratique en laboratoire.',
    benefits: [
      'Compréhension des systèmes électroniques et automatisés',
      'Développement de compétences techniques polyvalentes',
      'Capacité à intervenir sur des systèmes industriels',
      'Adaptation aux environnements technologiques et industriels',
    ],
    icon: '⚡',
  },
  {
    id: 'gm',
    name: 'Génie Mécanique',
    shortName: 'GM',
    shortDescription: 'Formation en conception mécanique, fabrication et maintenance industrielle.',
    description: 'La filière Génie Mécanique prépare les étudiants à la conception, la fabrication et la maintenance des systèmes mécaniques. Elle aborde les notions fondamentales de mécanique, de matériaux, de fabrication et de maintenance industrielle. Les étudiants développent leurs compétences à travers des travaux pratiques, des projets techniques et des études de cas.',
    benefits: [
      'Maîtrise des principes de conception mécanique',
      'Compréhension des processus de fabrication industrielle',
      'Capacité d\'analyse et de résolution de problèmes techniques',
      'Préparation aux métiers de l\'industrie mécanique',
    ],
    icon: '🔧',
  },
  {
    id: 'ge',
    name: 'Génie Énergétique',
    shortName: 'GE',
    shortDescription: 'Formation en énergies renouvelables, efficacité énergétique et systèmes thermiques.',
    description: 'La filière Génie Énergétique est dédiée à l\'étude des systèmes de production, de gestion et d\'optimisation de l\'énergie. Elle couvre les domaines des énergies conventionnelles et renouvelables, de l\'efficacité énergétique et des installations thermiques. La formation vise à sensibiliser les étudiants aux enjeux énergétiques actuels et à les préparer à intervenir dans des contextes techniques variés.',
    benefits: [
      'Compréhension des systèmes énergétiques',
      'Sensibilisation à l\'efficacité et à la transition énergétique',
      'Compétences techniques appliquées',
      'Ouverture vers les secteurs industriels et énergétiques',
    ],
    icon: '🔥',
  },
];

const FiliereDetails: React.FC = () => {
  const { filiereId } = useParams<{ filiereId: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const filiere = filieres.find(f => f.id === filiereId);

  if (!filiere) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-issat-navy' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
            Filière non trouvée
          </h1>
          <Link
            to="/#filieres"
            className="text-issat-red hover:text-issat-redLight transition"
          >
            Retour aux filières
          </Link>
        </div>
      </div>
    );
  }

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
                onClick={() => navigate('/#filieres')}
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
          <div className="max-w-5xl mx-auto px-8 lg:px-16 xl:px-24">
            <div className={`backdrop-blur-lg p-10 rounded-3xl border shadow-2xl ${isDark
              ? 'bg-white/10 border-white/30'
              : 'bg-white/40 border-white/50'
              }`}>
              {/* Header Section */}
              <div className="flex items-start space-x-6 mb-8">
                <div className="text-6xl">{filiere.icon}</div>
                <div className="flex-1">
                  <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                    {filiere.name}
                  </h1>
                  <p className={`text-xl mb-2 ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                    {filiere.shortName}
                  </p>
                  <p className={`text-lg leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                    {filiere.shortDescription}
                  </p>
                </div>
              </div>

              {/* Description Section */}
              <div className="mt-8 border-t border-white/20 pt-8">
                <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                  <GraduationCap className="h-6 w-6 text-issat-red" />
                  <span>📘 Description</span>
                </h2>
                <p className={`text-lg leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                  {filiere.description}
                </p>
              </div>

              {/* Benefits Section */}
              <div className="mt-8 border-t border-white/20 pt-8">
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                  🌟 Bénéfices
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {filiere.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start space-x-3 p-4 rounded-xl border ${isDark
                        ? 'bg-white/5 border-white/20'
                        : 'bg-white/20 border-white/30'
                        }`}
                    >
                      <span className="text-issat-red text-xl mt-1">✓</span>
                      <p className={`flex-1 ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-10 pt-8 border-t border-white/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className={`text-center sm:text-left ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                    Intéressé par cette filière ? Contactez-nous pour plus d'informations.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/#contact')}
                      className="px-6 py-3 bg-issat-red text-white rounded-lg hover:bg-issat-redLight transition font-medium shadow-lg"
                    >
                      Nous contacter
                    </button>
                    <button
                      onClick={() => navigate('/#filieres')}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition font-medium border border-white/30"
                    >
                      Autres filières
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FiliereDetails;

