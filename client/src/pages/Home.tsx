import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  FileText,
  Calendar,
  BookOpen,
  Bot,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Facebook,
  Users,
  Award,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import iaNexusLogo from '../assets/ia-nexus.jpeg';
import tunivisionLogo from '../assets/tunivision.jpeg';
import tlpLogo from '../assets/tlp.jpeg';
import technomakerLogo from '../assets/technomaker.jpeg';

const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [showClubsContent, setShowClubsContent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const footerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  const actualites = [
    {
      title: 'Calendrier des examens S1 2024-2025',
      date: '15 Jan 2025',
      type: 'Examen',
    },
    {
      title: 'Inscription pédagogique - Session de rattrapage',
      date: '10 Jan 2025',
      type: 'Annonce',
    },
    {
      title: 'Journée portes ouvertes ISSAT Kairouan',
      date: '5 Jan 2025',
      type: 'Événement',
    },
    {
      title: 'Nouveau partenariat industriel',
      date: '28 Déc 2024',
      type: 'Actualité',
    },
  ];

  const handleStudentAccess = () => {
    if (user) {
      navigate('/student/dashboard');
    } else {
      navigate('/login');
    }
  };

  // Synchronize audio and video - play/pause, mute, and time
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio || !showVideoPopup) return;

    // Sync play/pause
    const handlePlay = () => {
      audio.play().catch(err => console.log('Audio play failed:', err));
    };
    const handlePause = () => {
      audio.pause();
    };

    // Sync time (with threshold to avoid infinite loop)
    const handleTimeUpdate = () => {
      if (Math.abs(audio.currentTime - video.currentTime) > 0.5) {
        audio.currentTime = video.currentTime;
      }
    };

    // Sync volume and mute
    const handleVolumeChange = () => {
      audio.volume = video.muted ? 0 : video.volume;
      audio.muted = video.muted;
    };

    // Sync seeking
    const handleSeeking = () => {
      audio.currentTime = video.currentTime;
    };
    const handleSeeked = () => {
      audio.currentTime = video.currentTime;
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    // Initial sync
    audio.volume = video.muted ? 0 : video.volume;
    audio.muted = video.muted;
    if (!video.paused) {
      audio.play().catch(err => console.log('Audio play failed:', err));
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [showVideoPopup]);

  // Stop audio when popup closes
  useEffect(() => {
    if (!showVideoPopup) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [showVideoPopup]);

  // Detect scroll to bottom and show map popup
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollBottom = scrollTop + windowHeight;

      // Check if scrolled past footer (with some threshold)
      if (footerRef.current) {
        const footerTop = footerRef.current.offsetTop;
        const footerHeight = footerRef.current.offsetHeight;
        const footerBottom = footerTop + footerHeight;

        // If scrolled past footer and haven't shown popup yet
        if (scrollBottom > footerBottom + 100 && !hasScrolledToBottom) {
          setHasScrolledToBottom(true);
          setShowMapPopup(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolledToBottom]);

  // ISSAT Kairouan coordinates
  const universityLat = 35.6714;
  const universityLng = 10.1006;
  const universityAddress = 'Route périphérique Dar El Amen 3100, Kairouan';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Map - Fixed */}
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
        {/* Subtle radial overlay only in center, letting map show on sides */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at center, rgba(30, 58, 95, 0.5) 0%, rgba(30, 58, 95, 0.2) 40%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 40%, transparent 70%)'
          }}
        ></div>
        {/* Additional subtle vertical gradient for content areas */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(30, 58, 95, 0.2) 0%, transparent 20%, transparent 80%, rgba(30, 58, 95, 0.2) 100%)'
              : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, transparent 20%, transparent 80%, rgba(255, 255, 255, 0.15) 100%)'
          }}
        ></div>
      </div>

      {/* Floating Content Container */}
      <div className="relative z-10">

        {/* 1️⃣ TOP BAR (INSTITUTIONAL HEADER) */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
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

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-white/90 hover:text-white transition">Accueil</Link>
                <a href="https://issatkr.rnu.tn/fra/home" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white transition">Institut</a>
                <a href="#filieres" className="text-white/90 hover:text-white transition">Filières</a>
                <a href="#actualites" className="text-white/90 hover:text-white transition">Actualités</a>
                <Link to="/about-us" className="text-white/90 hover:text-white transition">About Us</Link>
                <a href="#contact" className="text-white/90 hover:text-white transition">Contact</a>
              </nav>

              {/* Access Button & Theme Toggle */}
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition border border-white/30"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={handleStudentAccess}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition font-medium text-sm border border-white/30"
                >
                  🔐 Espace Intranet
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-white/20">
                <nav className="flex flex-col space-y-3">
                  <Link to="/" className="text-white/90 hover:text-white transition">Accueil</Link>
                  <a href="https://issatkr.rnu.tn/fra/home" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white transition">Institut</a>
                  <a href="#filieres" className="text-white/90 hover:text-white transition">Filières</a>
                  <a href="#actualites" className="text-white/90 hover:text-white transition">Actualités</a>
                  <Link to="/about-us" className="text-white/90 hover:text-white transition">About Us</Link>
                  <a href="#contact" className="text-white/90 hover:text-white transition">Contact</a>
                  <div className="pt-3 space-y-2">
                    <button
                      onClick={toggleTheme}
                      className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition font-medium border border-white/30 flex items-center justify-center space-x-2"
                    >
                      {isDark ? <><Sun size={18} /> <span>Mode clair</span></> : <><Moon size={18} /> <span>Mode sombre</span></>}
                    </button>
                    <button
                      onClick={handleStudentAccess}
                      className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition font-medium border border-white/30"
                    >
                      🔐 Espace Intranet
                    </button>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* 2️⃣ HERO SECTION */}
        <section className="relative py-32 md:py-48">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Text */}
              <div className="text-center md:text-left">
                <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                  Plateforme Numérique de l'ISSAT Kairouan
                </h1>
                <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                  Un accès centralisé aux services administratifs, pédagogiques et universitaires.
                </p>
                <button
                  onClick={handleStudentAccess}
                  className="px-6 py-3 bg-issat-red text-white rounded-lg hover:bg-issat-redLight transition font-medium shadow-lg"
                >
                  Espace Intranet
                </button>
              </div>
              {/* Right: Video - Smaller and Adjusted */}
              <div className="hidden md:block relative flex items-center justify-center">
                <div
                  className={`backdrop-blur-md rounded-2xl overflow-hidden border-2 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 relative group w-full ${isDark
                    ? 'bg-white/10 border-white/30'
                    : 'bg-white/30 border-white/50'
                    }`}
                  onClick={() => setShowVideoPopup(true)}
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto max-h-[600px] object-cover"
                  >
                    <source src="/videos/hero-video.mp4" type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                  {/* Play overlay indicator */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3️⃣ QUICK SERVICES */}
        <section className="relative py-32">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
            <h2 className={`text-4xl md:text-5xl font-bold text-center mb-16 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
              Services Rapides
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: FileText, title: 'Documents Administratifs', desc: 'Demande et suivi de documents' },
                { icon: Calendar, title: 'Suivi des Absences', desc: 'Consultez vos absences en temps réel' },
                { icon: BookOpen, title: 'Filières & Modules', desc: 'Informations sur les formations' },
                { icon: Bot, title: 'Assistant Étudiant 24/7', desc: 'Aide et support automatique' },
              ].map((service, idx) => (
                <div
                  key={idx}
                  className={`backdrop-blur-lg p-8 rounded-2xl transition-all duration-300 cursor-pointer border shadow-xl hover:shadow-2xl hover:scale-105 ${isDark
                    ? 'bg-white/10 hover:bg-white/15 border-white/30'
                    : 'bg-white/40 hover:bg-white/50 border-white/50'
                    }`}
                >
                  <service.icon className="h-14 w-14 text-issat-red mb-6" />
                  <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-issat-navy'}`}>{service.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4️⃣ ABOUT ISSAT SECTION */}
        <section className="relative py-32">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Clickable Card to Open Popup */}
              <button
                onClick={() => setShowAboutPopup(true)}
                className={`backdrop-blur-lg p-10 rounded-3xl border shadow-2xl text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl ${isDark
                  ? 'bg-white/10 border-white/30 hover:bg-white/15'
                  : 'bg-white/40 border-white/50 hover:bg-white/50'
                  }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                    🏛️ À propos de l'ISSAT Kairouan
                  </h2>
                  <ChevronDown className={`h-6 w-6 ${isDark ? 'text-white' : 'text-issat-navy'}`} />
                </div>
                
                {/* Short version (always visible) */}
                <p className={`leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                  L'Institut Supérieur des Sciences Appliquées et de Technologie de Kairouan (ISSAT Kairouan) est un établissement universitaire public relevant de l'Université de Kairouan.
                  Il a pour mission de former des cadres qualifiés dans les domaines des sciences appliquées, de l'ingénierie et des technologies de l'information, en adéquation avec les besoins du tissu économique et industriel national.
                </p>
              </button>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: Users, number: 'Plusieurs centaines', label: 'Étudiants inscrits' },
                  { icon: BookOpen, number: 'Plusieurs', label: 'Filières technologiques' },
                  { icon: GraduationCap, number: 'Encadrement', label: 'Pédagogique spécialisé' },
                  { icon: Award, number: 'Vie', label: 'Associative et scientifique active' },
                ].map((stat, idx) => (
                  <div key={idx} className={`backdrop-blur-lg p-8 rounded-2xl text-center border shadow-xl hover:scale-105 transition-transform ${isDark
                    ? 'bg-white/10 border-white/30'
                    : 'bg-white/40 border-white/50'
                    }`}>
                    <stat.icon className="h-10 w-10 text-issat-red mx-auto mb-4" />
                    <div className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>{stat.number}</div>
                    <div className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4.5️⃣ CLUBS UNIVERSITAIRES SECTION */}
        <section className="relative py-32">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
            <div className={`backdrop-blur-lg p-10 rounded-3xl border shadow-2xl ${isDark
              ? 'bg-white/10 border-white/30'
              : 'bg-white/40 border-white/50'
              }`}>
              <button
                onClick={() => setShowClubsContent(!showClubsContent)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                    🎭 Vie associative & Clubs universitaires
                  </h2>
                  {showClubsContent ? (
                    <ChevronUp className={`h-6 w-6 ${isDark ? 'text-white' : 'text-issat-navy'}`} />
                  ) : (
                    <ChevronDown className={`h-6 w-6 ${isDark ? 'text-white' : 'text-issat-navy'}`} />
                  )}
                </div>
              </button>

              {/* Short version (always visible) */}
              <p className={`mb-4 leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                L'ISSAT Kairouan accorde une importance particulière à la vie associative et culturelle, considérée comme un pilier essentiel de la formation universitaire.
                Les clubs universitaires offrent aux étudiants un espace d'expression, d'apprentissage et de développement personnel, en complément du parcours académique.
              </p>

              {/* Extended content (shown on click) */}
              {showClubsContent && (
                <div className="mt-6 space-y-6 animate-fadeIn">
                  <p className={`leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                    À travers les clubs, les étudiants développent des compétences transversales telles que le travail en équipe, la communication, le leadership et l'esprit d'initiative, tout en renforçant leur intégration à la vie universitaire.
                  </p>

                  {/* Clubs Grid */}
                  <div className="grid md:grid-cols-2 gap-8 mt-10">
                    {/* AI-Nexus */}
                    <div className={`backdrop-blur-lg p-6 rounded-2xl border shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all ${isDark
                      ? 'bg-white/10 hover:bg-white/15 border-white/30'
                      : 'bg-white/40 hover:bg-white/50 border-white/50'
                      }`}>
                      <div className="flex items-start space-x-4 mb-4">
                        <img
                          src={iaNexusLogo}
                          alt="AI-Nexus"
                          className="w-16 h-16 rounded-lg object-cover border-2 border-issat-red"
                        />
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                            🤖 AI-Nexus
                          </h3>
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                            Club scientifique orienté vers les technologies de l'intelligence artificielle et de la data.
                            Il vise à initier les étudiants aux concepts modernes de l'IA à travers des ateliers pratiques, projets collaboratifs et activités de formation.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                          Domaines abordés :
                        </p>
                        <ul className={`text-xs space-y-1 ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                          <li>• Intelligence artificielle</li>
                          <li>• Machine Learning</li>
                          <li>• Data & nouvelles technologies</li>
                          <li>• Projets appliqués</li>
                        </ul>
                      </div>
                    </div>

                    {/* Tunivision */}
                    <div className={`backdrop-blur-lg p-6 rounded-2xl border shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all ${isDark
                      ? 'bg-white/10 hover:bg-white/15 border-white/30'
                      : 'bg-white/40 hover:bg-white/50 border-white/50'
                      }`}>
                      <div className="flex items-start space-x-4 mb-4">
                        <img
                          src={tunivisionLogo}
                          alt="Tunivision"
                          className="w-16 h-16 rounded-lg object-cover border-2 border-issat-red"
                        />
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                            🎥 Tunivision
                          </h3>
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                            Club à vocation médiatique et créative, dédié à la communication audiovisuelle et digitale au sein de l'institut.
                            Il offre aux étudiants un espace pour développer leurs compétences en production visuelle, couverture d'événements et création de contenu.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                          Activités principales :
                        </p>
                        <ul className={`text-xs space-y-1 ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                          <li>• Photographie et vidéo</li>
                          <li>• Montage et création de contenu</li>
                          <li>• Couverture d'événements universitaires</li>
                          <li>• Communication digitale</li>
                        </ul>
                      </div>
                    </div>

                    {/* TLP */}
                    <div className={`backdrop-blur-lg p-6 rounded-2xl border shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all ${isDark
                      ? 'bg-white/10 hover:bg-white/15 border-white/30'
                      : 'bg-white/40 hover:bg-white/50 border-white/50'
                      }`}>
                      <div className="flex items-start space-x-4 mb-4">
                        <img
                          src={tlpLogo}
                          alt="TLP"
                          className="w-16 h-16 rounded-lg object-cover border-2 border-issat-red"
                        />
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                            💻 TLP – Tunisian Programming Lovers
                          </h3>
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                            Club scientifique axé sur la programmation, le développement logiciel et les nouvelles technologies.
                            Il rassemble des étudiants passionnés par le code et l'informatique, favorisant l'apprentissage par la pratique et l'échange de connaissances.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                          Axes principaux :
                        </p>
                        <ul className={`text-xs space-y-1 ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                          <li>• Programmation et algorithmique</li>
                          <li>• Développement web et applicatif</li>
                          <li>• Cybersécurité et technologies émergentes</li>
                          <li>• Esprit de collaboration et de partage</li>
                        </ul>
                      </div>
                    </div>

                    {/* TechnoMaker */}
                    <div className={`backdrop-blur-lg p-6 rounded-2xl border shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all ${isDark
                      ? 'bg-white/10 hover:bg-white/15 border-white/30'
                      : 'bg-white/40 hover:bg-white/50 border-white/50'
                      }`}>
                      <div className="flex items-start space-x-4 mb-4">
                        <img
                          src={technomakerLogo}
                          alt="TechnoMaker"
                          className="w-16 h-16 rounded-lg object-cover border-2 border-issat-red"
                        />
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                            🛠️ TechnoMaker
                          </h3>
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                            Club technologique orienté vers le faire, l'expérimentation et la création technique.
                            Il permet aux étudiants de transformer des idées en projets concrets à travers l'utilisation de composants électroniques, systèmes embarqués et solutions innovantes.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                          Domaines d'intérêt :
                        </p>
                        <ul className={`text-xs space-y-1 ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                          <li>• Robotique</li>
                          <li>• IoT et systèmes embarqués</li>
                          <li>• Prototypage et électronique</li>
                          <li>• Projets techniques collaboratifs</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5️⃣ FILIÈRES & DÉPARTEMENTS */}
        <section id="filieres" className="relative py-32">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
            <h2 className={`text-4xl md:text-5xl font-bold text-center mb-16 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
              Filières & Départements
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {filieres.map((filiere, idx) => (
                <div
                  key={idx}
                  className={`backdrop-blur-lg p-8 rounded-2xl border-l-4 border-issat-red transition-all duration-300 shadow-xl hover:shadow-2xl ${isDark
                    ? 'bg-white/10 hover:bg-white/15 border-white/30'
                    : 'bg-white/40 hover:bg-white/50 border-white/50'
                    }`}
                >
                  <div className="flex items-start space-x-6">
                    <div className="text-5xl">{filiere.icon}</div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-xl mb-3 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                        {filiere.name}
                      </h3>
                      <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-white/80' : 'text-issat-navy/80'}`}>
                        {filiere.shortDescription}
                      </p>
                      
                      {/* View Details Button - Redirects to detail page */}
                      <Link
                        to={`/filiere/${filiere.id}`}
                        className="text-issat-red font-medium hover:text-issat-redLight transition flex items-center space-x-2 mb-4 inline-flex"
                      >
                        <span>Voir détails</span>
                        <ChevronDown className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6️⃣ ACTUALITÉS & ANNONCES */}
        <section id="actualites" className="relative py-32">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
            <h2 className={`text-4xl md:text-5xl font-bold text-center mb-16 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
              Actualités & Annonces
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {actualites.map((actu, idx) => (
                <div
                  key={idx}
                  className={`backdrop-blur-lg p-8 rounded-2xl transition-all duration-300 border shadow-xl hover:shadow-2xl hover:scale-[1.02] ${isDark
                    ? 'bg-white/10 hover:bg-white/15 border-white/30'
                    : 'bg-white/40 hover:bg-white/50 border-white/50'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`font-bold flex-1 ${isDark ? 'text-white' : 'text-issat-navy'}`}>{actu.title}</h3>
                    <span className="bg-issat-red text-white text-xs px-3 py-1 rounded-full ml-3">
                      {actu.date}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-white/70' : 'text-issat-navy/70'}`}>{actu.type}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <a
                href="https://issatkr.rnu.tn/fra/home"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center font-medium hover:text-issat-red transition ${isDark ? 'text-white' : 'text-issat-navy'
                  }`}
              >
                Voir toutes les actualités <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* 7️⃣ AI ASSISTANT TEASER */}
        <section className="relative py-32">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 text-center">
            <div className={`backdrop-blur-lg rounded-3xl p-16 border shadow-2xl max-w-4xl mx-auto ${isDark
              ? 'bg-white/10 border-white/30'
              : 'bg-white/40 border-white/50'
              }`}>
              <Bot className="h-16 w-16 mx-auto mb-6 text-issat-red" />
              <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-issat-navy'}`}>Besoin d'aide ?</h2>
              <p className={`text-lg mb-8 ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                Notre assistant numérique vous guide dans vos démarches administratives et pédagogiques.
              </p>
              <button
                onClick={handleStudentAccess}
                className="px-8 py-3 bg-issat-red text-white rounded-lg hover:bg-issat-redLight transition font-medium shadow-lg"
              >
                Poser une question
              </button>
            </div>
          </div>
        </section>

        {/* 8️⃣ FOOTER */}
        <footer id="contact" ref={footerRef} className="relative backdrop-blur-md bg-white/5 border-t border-white/20 py-12">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* ISSAT Info */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white p-1 flex-shrink-0">
                    <img
                      src="/images/logoissatkr.png"
                      alt="ISSAT Kairouan"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white leading-tight">Institut Supérieur des Sciences Appliquées et de Technologie de Kairouan</h3>
                    <p className="text-xs text-white/70 leading-tight mt-1">ISSAT Kairouan</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-issat-red" />
                    <span className="text-white/80">Route périphérique Dar El Amen 3100, Kairouan</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 flex-shrink-0 text-issat-red" />
                    <span className="text-white/80">contact@issatkr.rnu.tn</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 flex-shrink-0 text-issat-red" />
                    <span className="text-white/80">+216 XX XXX XXX</span>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-white">Liens Utiles</h3>
                <div className="space-y-2 text-sm">
                  <a
                    href="https://www.rnu.tn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/80 hover:text-issat-red transition"
                  >
                    Réseau National Universitaire (RNU)
                  </a>
                  <a
                    href="https://www.mes.tn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/80 hover:text-issat-red transition"
                  >
                    Ministère de l'Enseignement Supérieur
                  </a>
                  <a
                    href="https://issatkr.rnu.tn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/80 hover:text-issat-red transition"
                  >
                    Site Officiel ISSAT Kairouan
                  </a>
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-white">Suivez-nous</h3>
                <div className="space-y-2">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-white/80 hover:text-issat-red transition"
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="text-sm">Page Facebook</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-8 text-center text-sm text-white/80">
              <p>© 2025 ISSAT Kairouan. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Google Maps Popup Modal */}
      {showMapPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowMapPopup(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMapPopup(false)}></div>

          {/* Modal Content */}
          <div
            className={`relative z-10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl ${isDark
              ? 'bg-white/10 backdrop-blur-md border border-white/20'
              : 'bg-white/90 backdrop-blur-md border border-white/40'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/20' : 'border-gray-200'
              }`}>
              <div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                  Localisation ISSAT Kairouan
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                  {universityAddress}
                </p>
              </div>
              <button
                onClick={() => setShowMapPopup(false)}
                className={`p-2 rounded-lg transition ${isDark
                  ? 'hover:bg-white/20 text-white'
                  : 'hover:bg-gray-200 text-issat-navy'
                  }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Map */}
            <div className="relative w-full h-[500px]">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.5!2d${universityLng}!3d${universityLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzVcNDAnMTcuMCJOIDEwXzAwJzAyLjIiRQ!5e0!3m2!1sen!2stn!4v1234567890!5m2!1sen!2stn&q=${encodeURIComponent(universityAddress)}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="ISSAT Kairouan Location"
              ></iframe>
            </div>

            {/* Footer Actions */}
            <div className={`flex items-center justify-between p-6 border-t ${isDark ? 'border-white/20' : 'border-gray-200'
              }`}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${universityLat},${universityLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition ${isDark
                  ? 'bg-issat-red hover:bg-issat-redLight text-white'
                  : 'bg-issat-red hover:bg-issat-redLight text-white'
                  }`}
              >
                <MapPin size={18} />
                <span>Obtenir l'itinéraire</span>
                <ExternalLink size={16} />
              </a>
              <button
                onClick={() => setShowMapPopup(false)}
                className={`px-6 py-2 rounded-lg transition ${isDark
                  ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  : 'bg-gray-200 hover:bg-gray-300 text-issat-navy'
                  }`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About ISSAT Popup */}
      {showAboutPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowAboutPopup(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAboutPopup(false)}></div>

          {/* Modal Content */}
          <div
            className={`relative z-10 w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl ${isDark
              ? 'bg-white/10 backdrop-blur-md border border-white/20'
              : 'bg-white/90 backdrop-blur-md border border-white/40'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/20' : 'border-gray-200'
              }`}>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🏛️</div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                  À propos de l'ISSAT Kairouan
                </h3>
              </div>
              <button
                onClick={() => setShowAboutPopup(false)}
                className={`p-2 rounded-lg transition ${isDark
                  ? 'hover:bg-white/20 text-white'
                  : 'hover:bg-gray-200 text-issat-navy'
                  }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              {/* Short version */}
              <p className={`mb-6 leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                L'Institut Supérieur des Sciences Appliquées et de Technologie de Kairouan (ISSAT Kairouan) est un établissement universitaire public relevant de l'Université de Kairouan.
                Il a pour mission de former des cadres qualifiés dans les domaines des sciences appliquées, de l'ingénierie et des technologies de l'information, en adéquation avec les besoins du tissu économique et industriel national.
              </p>

              <p className={`mb-6 leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                L'ISSAT Kairouan propose des formations académiques et technologiques alliant enseignements théoriques, travaux pratiques et projets appliqués, favorisant ainsi l'innovation, l'employabilité et l'esprit d'initiative chez les étudiants.
              </p>
              <p className={`mb-6 leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                Grâce à un corps enseignant qualifié, des infrastructures pédagogiques en constante évolution et une vie universitaire dynamique, l'institut joue un rôle essentiel dans le développement régional et national, tout en valorisant les compétences des jeunes diplômés.
              </p>

              {/* Formations proposées */}
              <div className="mt-8">
                <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                  🎓 Formations proposées
                </h3>
                <p className={`mb-4 leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                  L'institut offre plusieurs parcours dans les domaines suivants :
                </p>
                <ul className={`list-disc list-inside space-y-2 mb-4 ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                  <li>Informatique et technologies de l'information</li>
                  <li>Génie logiciel</li>
                  <li>Réseaux et télécommunications</li>
                  <li>Informatique industrielle et systèmes embarqués</li>
                  <li>Technologies appliquées et ingénierie</li>
                </ul>
                <p className={`leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                  Ces formations sont conçues pour répondre aux standards académiques nationaux et préparer les étudiants à l'intégration professionnelle ou à la poursuite des études supérieures.
                </p>
              </div>

              {/* Valeurs & Vision */}
              <div className="mt-8">
                <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                  🌱 Valeurs & Vision
                </h3>
                <p className={`mb-4 leading-relaxed ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                  L'ISSAT Kairouan s'engage à :
                </p>
                <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-white/90' : 'text-issat-navy/90'}`}>
                  <li>Promouvoir la qualité de l'enseignement</li>
                  <li>Encourager la recherche appliquée et l'innovation</li>
                  <li>Développer l'esprit entrepreneurial</li>
                  <li>Renforcer l'ouverture sur l'environnement socio-économique</li>
                  <li>Instaurer une culture de responsabilité, de rigueur et de citoyenneté</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Popup Modal */}
      {showVideoPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowVideoPopup(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowVideoPopup(false)}></div>

          {/* Modal Content */}
          <div
            className={`relative z-10 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl ${isDark
              ? 'bg-white/10 backdrop-blur-md border border-white/20'
              : 'bg-white/90 backdrop-blur-md border border-white/40'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/20' : 'border-gray-200'
              }`}>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-issat-navy'}`}>
                ISSAT Kairouan
              </h3>
              <button
                onClick={() => setShowVideoPopup(false)}
                className={`p-2 rounded-lg transition ${isDark
                  ? 'hover:bg-white/20 text-white'
                  : 'hover:bg-gray-200 text-issat-navy'
                  }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Video with YouTube Audio Background */}
            <div className="relative w-full bg-black">
              {/* Background Audio from YouTube - synchronized with video */}
              <audio
                ref={audioRef}
                loop
                className="hidden"
                preload="auto"
              >
                <source src="/audio/background-music.webm" type="audio/webm" />
                <source src="/audio/background-music.mp3" type="audio/mpeg" />
              </audio>

              {/* Local Video - synchronized with audio */}
              <video
                ref={videoRef}
                autoPlay
                loop
                controls
                playsInline
                className="w-full h-auto max-h-[80vh] object-contain"
              >
                <source src="/videos/hero-video.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${isDark ? 'border-white/20' : 'border-gray-200'
              }`}>
              <button
                onClick={() => setShowVideoPopup(false)}
                className={`w-full px-6 py-3 rounded-lg transition font-medium ${isDark
                  ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  : 'bg-gray-200 hover:bg-gray-300 text-issat-navy'
                  }`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
