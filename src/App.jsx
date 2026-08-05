import React, { useEffect, useMemo, useState, useRef } from 'react';

// ============================================================================
// ICONS
// ============================================================================
const IconTheme = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconAudio = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="M14.5 8.5a3.5 3.5 0 0 1 0 7" />
    <path d="M17.5 6.5a5.5 5.5 0 0 1 0 11" />
  </svg>
);

const IconPlay = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const IconPause = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

// ============================================================================
// AUDIO UTILS
// ============================================================================
const playSoundEffect = (type) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'correct') {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
      });
    }
  } catch (e) {
    // Audio Context restriction handling
  }
};

// ============================================================================
// DATA & CURRICULUM
// ============================================================================
const languages = [
  { value: 'spanish', label: 'Spanish 🇪🇸', langCode: 'es-ES' },
  { value: 'french', label: 'French 🇫🇷', langCode: 'fr-FR' },
  { value: 'german', label: 'German 🇩🇪', langCode: 'de-DE' },
  { value: 'japanese', label: 'Japanese 🇯🇵', langCode: 'ja-JP' },
  { value: 'italian', label: 'Italian 🇮🇹', langCode: 'it-IT' }
];

const modulesData = [
  {
    id: 'm1',
    title: 'Module 1: Essential Basics',
    description: 'Master core greetings and quick conversational markers.',
    words: [
      { english: 'Hello', spanish: '¡Hola!', french: 'Bonjour !', german: 'Hallo!', japanese: 'こんにちは！', italian: 'Ciao!' },
      { english: 'Yes', spanish: 'Sí', french: 'Oui', german: 'Ja', japanese: 'はい', italian: 'Sì' },
      { english: 'No', spanish: 'No', french: 'Non', german: 'Nein', japanese: 'いいえ', italian: 'No' },
      { english: 'Please', spanish: 'Por favor', french: 'S’il vous plaît', german: 'Bitte', japanese: 'お願いします', italian: 'Per favore' },
      { english: 'Thank you', spanish: 'Gracias', french: 'Merci', german: 'Danke', japanese: 'ありがとう', italian: 'Grazie' }
    ],
    quiz: [
      { question: 'How do you say "Hello"?', options: ['¡Hola!', 'Gracias', 'No'], answer: '¡Hola!' },
      { question: 'How do you say "Thank you"?', options: ['Por favor', 'Gracias', 'Sí'], answer: 'Gracias' }
    ]
  },
  {
    id: 'm2',
    title: 'Module 2: Runner Movement',
    description: 'Learn physical action verbs designed for active listening.',
    words: [
      { english: 'Walk', spanish: 'Caminar', french: 'Marcher', german: 'Gehen', japanese: '歩く', italian: 'Camminare' },
      { english: 'Run', spanish: 'Correr', french: 'Courir', german: 'Laufen', japanese: '走る', italian: 'Correre' },
      { english: 'Stop', spanish: 'Alto', french: 'Stop', german: 'Halt', japanese: '止まれ', italian: 'Stop' },
      { english: 'Start', spanish: 'Empezar', french: 'Commencer', german: 'Starten', japanese: '始める', italian: 'Iniziare' },
      { english: 'Jump', spanish: 'Saltar', french: 'Sauter', german: 'Springen', japanese: '跳ぶ', italian: 'Saltare' }
    ],
    quiz: [
      { question: 'What is the action verb for "Run"?', options: ['Caminar', 'Correr', 'Saltar'], answer: 'Correr' },
      { question: 'What is the command for "Stop"?', options: ['Alto', 'Empezar', 'Correr'], answer: 'Alto' }
    ]
  },
  {
    id: 'm3',
    title: 'Module 3: Speed & Pace',
    description: 'Pacing terms to regulate your cadence while running.',
    words: [
      { english: 'Fast', spanish: 'Rápido', french: 'Rapide', german: 'Schnell', japanese: '速い', italian: 'Veloce' },
      { english: 'Slow', spanish: 'Lento', french: 'Lent', german: 'Langsam', japanese: '遅い', italian: 'Lento' },
      { english: 'Now', spanish: 'Ahora', french: 'Maintenant', german: 'Jetzt', japanese: '今', italian: 'Adesso' },
      { english: 'Rhythm', spanish: 'Ritmo', french: 'Rythme', german: 'Rhythmus', japanese: 'リズム', italian: 'Ritmo' },
      { english: 'Pace', spanish: 'Paso', french: 'Allure', german: 'Tempo', japanese: 'ペース', italian: 'Passo' }
    ],
    quiz: [
      { question: 'How do you describe "Fast"?', options: ['Lento', 'Rápido', 'Paso'], answer: 'Rápido' }
    ]
  }
];

const runAudioTracks = [
  { id: '1', english: 'Start walking slowly', target: { spanish: 'Empieza a caminar despacio', french: 'Commencez à marcher lentement', german: 'Fange langsam an zu gehen', japanese: 'ゆっくり歩き始めて', italian: 'Inizia a camminare lentamente' }, duration: 10 },
  { id: '2', english: 'Increase your pace now', target: { spanish: 'Aumenta tu ritmo ahora', french: 'Augmentez votre allure maintenant', german: 'Erhöhe jetzt dein Tempo', japanese: '今すぐペースを上げて', italian: 'Aumenta il tuo passo adesso' }, duration: 15 },
  { id: '3', english: 'Breathe deeply and relax', target: { spanish: 'Respira hondo y relájate', french: 'Respirez profondément et détendez-vous', german: 'Atme tief ein und entspanne dich', japanese: '深呼吸してリラックスして', italian: 'Respira profondamente e rilassati' }, duration: 12 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('learn'); // 'learn' | 'run' | 'dashboard' | 'about'
  const [selectedLang, setSelectedLang] = useState('spanish');
  const [isDark, setIsDark] = useState(true);

  // Learning Module State
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);

  // User Stats
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(3);
  const [completedModules, setCompletedModules] = useState([]);

  // Audio Run State
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(runAudioTracks[0].duration);
  const timerRef = useRef(null);

  const currentLangObj = useMemo(() => languages.find(l => l.value === selectedLang), [selectedLang]);
  const activeModule = modulesData[currentModuleIdx];

  // System Dark Theme setup
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = isDark ? '#020617' : '#f8fafc';
  }, [isDark]);

  // Dynamic PWA Manifest Injector
  useEffect(() => {
    const manifestJson = {
      name: "Learn & Run PWA",
      short_name: "LearnRun",
      start_url: "/",
      display: "standalone",
      background_color: "#020617",
      theme_color: "#10b981",
      icons: [
        {
          src: "https://via.placeholder.com/192/10b981/ffffff?text=Run",
          sizes: "192x192",
          type: "image/png"
        }
      ]
    };
    const stringManifest = JSON.stringify(manifestJson);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    let linkTag = document.querySelector('link[rel="manifest"]');
    if (!linkTag) {
      linkTag = document.createElement('link');
      linkTag.rel = 'manifest';
      document.head.appendChild(linkTag);
    }
    linkTag.href = manifestURL;
  }, []);

  // Text To Speech Execution
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = currentLangObj.langCode;
      utter.rate = 0.85;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.error(e);
    }
  };

  // Quiz evaluation
  const handleAnswerSelect = (questionIdx, selectedOpt) => {
    setUserAnswers((prev) => ({ ...prev, [questionIdx]: selectedOpt }));
  };

  const submitQuiz = () => {
    let score = 0;
    activeModule.quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) score += 1;
    });

    if (score === activeModule.quiz.length) {
      playSoundEffect('correct');
      setXp(x => x + 50);
      setStreak(s => s + 1);
      if (!completedModules.includes(activeModule.id)) {
        setCompletedModules(prev => [...prev, activeModule.id]);
      }
    }
    setQuizFinished(true);
  };

  // Run mode playback timer
  useEffect(() => {
    if (isPlaying && activeTab === 'run') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (trackIndex < runAudioTracks.length - 1) {
              const nextTrackIdx = trackIndex + 1;
              setTrackIndex(nextTrackIdx);
              return runAudioTracks[nextTrackIdx].duration;
            } else {
              setIsPlaying(false);
              playSoundEffect('correct');
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, activeTab, trackIndex]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-300 pb-20 md:pb-8`}>
      
      {/* HEADER / NAVIGATION BAR */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} px-4 py-3.5`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo & App Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('learn')}>
            <div className="h-9 w-9 rounded-2xl bg-emerald-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-400/20">
              🏃
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-none">Learn & Run</h1>
              <span className="text-[10px] text-slate-400 font-medium">Audio Vocabulary Trainer</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/40 border border-slate-800 p-1 rounded-full">
            {[
              { id: 'learn', label: '🌱 Modules' },
              { id: 'run', label: '🎧 Audio Player' },
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'about', label: 'ℹ️ About' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${activeTab === tab.id ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Controls: Language & Theme Switcher */}
          <div className="flex items-center gap-2">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold outline-none transition ${isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-slate-100 text-slate-900'}`}
            >
              {languages.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>

            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'}`}
              aria-label="Toggle Theme"
            >
              <IconTheme className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ========================================================================= */}
        {/* VIEW 1: MODULES & FLASHCARDS LEARNING                                     */}
        {/* ========================================================================= */}
        {activeTab === 'learn' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar: Module Selector */}
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Curriculum Modules</h2>
              {modulesData.map((mod, idx) => {
                const isActive = idx === currentModuleIdx;
                const isDone = completedModules.includes(mod.id);

                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setCurrentModuleIdx(idx);
                      setIsQuizMode(false);
                      setQuizFinished(false);
                      setUserAnswers({});
                    }}
                    className={`w-full text-left p-4 rounded-3xl border transition flex items-center justify-between ${isActive ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'border-slate-800 bg-slate-900 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                        Module {idx + 1}
                      </span>
                      <h3 className="font-bold text-sm leading-tight text-slate-200">{mod.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{mod.description}</p>
                    </div>
                    {isDone && <span className="text-emerald-400 text-base font-bold">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Right Main Content Area: Flashcard View or Quiz View */}
            <div className="lg:col-span-8">
              <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                
                {/* Module Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Current Unit</span>
                    <h2 className="text-xl sm:text-2xl font-black">{activeModule.title}</h2>
                  </div>
                  
                  {!isQuizMode ? (
                    <button
                      onClick={() => setIsQuizMode(true)}
                      className="px-4 py-2 rounded-2xl bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-400/20 hover:scale-105 transition"
                    >
                      Take Quiz →
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsQuizMode(false)}
                      className="px-4 py-2 rounded-2xl border border-slate-700 text-slate-300 font-bold text-xs"
                    >
                      ← Back to Vocabulary
                    </button>
                  )}
                </div>

                {/* MODE A: FLASHCARDS (Batch study all words first) */}
                {!isQuizMode && (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-400 font-medium">Review all vocabulary items in this batch before taking the module quiz:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeModule.words.map((item, idx) => {
                        const foreignWord = item[selectedLang] || item.spanish;
                        return (
                          <div key={idx} className={`p-5 rounded-2xl border flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'}`}>
                            <div>
                              <div className="text-xs text-slate-400 font-medium">{item.english}</div>
                              <div className="text-xl font-bold text-emerald-400 mt-0.5">{foreignWord}</div>
                            </div>
                            <button
                              onClick={() => speakText(foreignWord)}
                              className="p-3 rounded-xl bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400 hover:text-slate-950 transition"
                            >
                              <IconAudio className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-slate-800 text-center">
                      <button
                        onClick={() => setIsQuizMode(true)}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-400/20 hover:scale-105 transition"
                      >
                        Ready! Start Module Quiz →
                      </button>
                    </div>
                  </div>
                )}

                {/* MODE B: MODULE QUIZ */}
                {isQuizMode && (
                  <div className="space-y-6">
                    {!quizFinished ? (
                      <>
                        {activeModule.quiz.map((q, qIdx) => (
                          <div key={qIdx} className={`p-5 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'}`}>
                            <p className="font-bold text-sm mb-3 text-slate-200">{qIdx + 1}. {q.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = userAnswers[qIdx] === opt;
                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleAnswerSelect(qIdx, opt)}
                                    className={`p-3 rounded-xl text-xs font-bold border transition ${isSelected ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400' : 'border-slate-800 text-slate-400 hover:border-slate-700'}`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={submitQuiz}
                          disabled={Object.keys(userAnswers).length < activeModule.quiz.length}
                          className="w-full py-4 rounded-2xl bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-400/20 disabled:opacity-30 transition"
                        >
                          Submit Quiz
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-8 space-y-4">
                        <div className="text-5xl">🎉</div>
                        <h3 className="text-2xl font-black">Module Quiz Completed!</h3>
                        <p className="text-xs text-slate-400">You earned +50 XP and increased your study streak.</p>
                        <button
                          onClick={() => {
                            setIsQuizMode(false);
                            setQuizFinished(false);
                            setUserAnswers({});
                          }}
                          className="px-6 py-3 rounded-2xl bg-emerald-400 text-slate-950 font-bold text-xs"
                        >
                          Return to Vocabulary
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: RUNNER AUDIO MODE PLAYER                                          */}
        {/* ========================================================================= */}
        {activeTab === 'run' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className={`p-8 rounded-[2.5rem] border text-center shadow-2xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
                Hands-Free Audio Track {trackIndex + 1} of {runAudioTracks.length}
              </span>

              <div className="p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 my-6">
                <div className="text-3xl font-black text-emerald-400 leading-tight mb-2">
                  {runAudioTracks[trackIndex].target[selectedLang] || runAudioTracks[trackIndex].target.spanish}
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  "{runAudioTracks[trackIndex].english}"
                </p>
                <div className="mt-6 inline-flex items-center px-6 py-2 rounded-full bg-emerald-400/20 text-emerald-400 font-black text-xl">
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-20 w-20 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-400/30 hover:scale-105 active:scale-95 transition"
                >
                  {isPlaying ? <IconPause className="h-10 w-10" /> : <IconPlay className="h-10 w-10 ml-1" />}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: USER DASHBOARD & STATS                                           */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black">Performance Dashboard</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-6 rounded-3xl border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Current Streak</div>
                <div className="text-2xl font-black text-slate-100">{streak} Days</div>
              </div>

              <div className={`p-6 rounded-3xl border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Total XP Points</div>
                <div className="text-2xl font-black text-emerald-400">{xp} XP</div>
              </div>

              <div className={`p-6 rounded-3xl border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Completed Modules</div>
                <div className="text-2xl font-black text-slate-100">{completedModules.length} / {modulesData.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: ABOUT PAGE                                                        */}
        {/* ========================================================================= */}
        {activeTab === 'about' && (
          <div className={`p-8 rounded-[2.5rem] border max-w-2xl mx-auto space-y-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h2 className="text-2xl font-black">About Learn & Run</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Learn & Run combines audio-first spaced repetition with outdoor fitness activities. Learn whole module vocabulary blocks at home, then run while listening to automated timing queues in your chosen target language.
            </p>
            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs text-emerald-400 font-bold">PWA Enabled • Works Offline</span>
            </div>
          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-lg px-4 py-2 flex items-center justify-around z-50`}>
        {[
          { id: 'learn', label: 'Modules', icon: '🌱' },
          { id: 'run', label: 'Run', icon: '🎧' },
          { id: 'dashboard', label: 'Stats', icon: '📊' },
          { id: 'about', label: 'About', icon: 'ℹ️' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 py-1 ${activeTab === item.id ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
