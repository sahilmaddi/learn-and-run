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
    // Audio Context browser policy handling
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

// Modules with exactly 5 words each
const modulesData = [
  {
    id: 1,
    title: 'Module 1: Everyday Basics',
    words: [
      { id: 1, english: 'Hello', spanish: '¡Hola!', french: 'Bonjour !', german: 'Hallo!', japanese: 'こんにちは！', italian: 'Ciao!', options: ['Hello', 'Goodbye', 'Run'] },
      { id: 2, english: 'Yes', spanish: 'Sí', french: 'Oui', german: 'Ja', japanese: 'はい', italian: 'Sì', options: ['Yes', 'No', 'Please'] },
      { id: 3, english: 'No', spanish: 'No', french: 'Non', german: 'Nein', japanese: 'いいえ', italian: 'No', options: ['Yes', 'No', 'Stop'] },
      { id: 4, english: 'Please', spanish: 'Por favor', french: 'S’il vous plaît', german: 'Bitte', japanese: 'お願いします', italian: 'Per favore', options: ['Thank you', 'Please', 'Hello'] },
      { id: 5, english: 'Thank you', spanish: 'Gracias', french: 'Merci', german: 'Danke', japanese: 'ありがとう', italian: 'Grazie', options: ['Thank you', 'Sorry', 'Walk'] }
    ]
  },
  {
    id: 2,
    title: 'Module 2: Runner Actions',
    words: [
      { id: 6, english: 'Walk', spanish: 'Caminar', french: 'Marcher', german: 'Gehen', japanese: '歩く', italian: 'Camminare', options: ['Walk', 'Run', 'Stop'] },
      { id: 7, english: 'Run', spanish: 'Correr', french: 'Courir', german: 'Laufen', japanese: '走る', italian: 'Correre', options: ['Run', 'Jump', 'Drink'] },
      { id: 8, english: 'Stop', spanish: 'Alto', french: 'Stop', german: 'Halt', japanese: '止まれ', italian: 'Stop', options: ['Fast', 'Slow', 'Stop'] },
      { id: 9, english: 'Start', spanish: 'Empezar', french: 'Commencer', german: 'Starten', japanese: '始める', italian: 'Iniziare', options: ['Start', 'End', 'Rest'] },
      { id: 10, english: 'Jump', spanish: 'Saltar', french: 'Sauter', german: 'Springen', japanese: '跳ぶ', italian: 'Saltare', options: ['Jump', 'Walk', 'Breathe'] }
    ]
  }
];

const runAudioTracks = [
  { id: '1', english: 'Start walking slowly', target: { spanish: 'Empieza a caminar despacio', french: 'Commencez à marcher lentement', german: 'Fange langsam an zu gehen', japanese: 'ゆっくり歩き始めて', italian: 'Inizia a camminare lentamente' }, duration: 10 },
  { id: '2', english: 'Increase your pace now', target: { spanish: 'Aumenta tu ritmo ahora', french: 'Augmentez votre allure maintenant', german: 'Erhöhe jetzt dein Tempo', japanese: '今すぐペースを上げて', italian: 'Aumenta il tuo passo adesso' }, duration: 15 },
  { id: '3', english: 'Breathe deeply and relax', target: { spanish: 'Respira hondo y relájate', french: 'Respirez profondément et détendez-vous', german: 'Atme tief ein und entspanne dich', japanese: '深呼吸してリラックスして', italian: 'Inspira profondamente' }, duration: 12 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('learn'); // 'learn' | 'run' | 'dashboard' | 'about'
  const [selectedLang, setSelectedLang] = useState('spanish');
  const [isDark, setIsDark] = useState(true);

  // Module & Single Word Index State
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0); // Index 0 to 4 = Words, Index 5 = Quiz Time
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // User Progress & Gamification
  const [xp, setXp] = useState(100);
  const [streak, setStreak] = useState(2);
  const [completedModules, setCompletedModules] = useState([]);

  // Runner Audio State
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(runAudioTracks[0].duration);
  const timerRef = useRef(null);

  const currentLangObj = useMemo(() => languages.find(l => l.value === selectedLang), [selectedLang]);
  const activeModule = modulesData[currentModuleIdx];
  const singleActiveWord = activeModule ? activeModule.words[wordIdx] : null;

  // Dark Mode Sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = isDark ? '#020617' : '#f8fafc';
  }, [isDark]);

  // PWA Dynamic Web Manifest
  useEffect(() => {
    const manifestJson = {
      name: "Learn & Run PWA",
      short_name: "LearnRun",
      start_url: "/",
      display: "standalone",
      background_color: "#020617",
      theme_color: "#10b981"
    };
    const blob = new Blob([JSON.stringify(manifestJson)], { type: 'application/json' });
    let linkTag = document.querySelector('link[rel="manifest"]');
    if (!linkTag) {
      linkTag = document.createElement('link');
      linkTag.rel = 'manifest';
      document.head.appendChild(linkTag);
    }
    linkTag.href = URL.createObjectURL(blob);
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

  // Single-Word Step Handlers
  const handleNextWord = () => {
    if (wordIdx < 4) {
      const nextWordIndex = wordIdx + 1;
      setWordIdx(nextWordIndex);
      const nextWord = activeModule.words[nextWordIndex];
      speakText(nextWord[selectedLang] || nextWord.spanish);
    } else {
      // All 5 words completed -> Move to Quiz
      setWordIdx(5);
    }
  };

  const handlePrevWord = () => {
    if (wordIdx > 0 && wordIdx < 5) {
      const prevWordIndex = wordIdx - 1;
      setWordIdx(prevWordIndex);
      const prevWord = activeModule.words[prevWordIndex];
      speakText(prevWord[selectedLang] || prevWord.spanish);
    }
  };

  // Quiz Answer Selection
  const handleQuizSelect = (wIdx, selectedOption) => {
    setQuizAnswers(prev => ({ ...prev, [wIdx]: selectedOption }));
  };

  // Submit 5-Word Module Quiz
  const handleSubmitQuiz = () => {
    let score = 0;
    activeModule.words.forEach((w, idx) => {
      if (quizAnswers[idx] === w.english) score += 1;
    });

    if (score === activeModule.words.length) {
      playSoundEffect('correct');
      setXp(x => x + 50);
      setStreak(s => s + 1);
      if (!completedModules.includes(activeModule.id)) {
        setCompletedModules(prev => [...prev, activeModule.id]);
      }
    }
    setQuizSubmitted(true);
  };

  // Advance to Next Module
  const handleNextModule = () => {
    if (currentModuleIdx < modulesData.length - 1) {
      setCurrentModuleIdx(prev => prev + 1);
      setWordIdx(0);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  // Continuous Playback Engine for Audio Mode
  useEffect(() => {
    if (isPlaying && activeTab === 'run') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (trackIndex < runAudioTracks.length - 1) {
              const nextIdx = trackIndex + 1;
              setTrackIndex(nextIdx);
              return runAudioTracks[nextIdx].duration;
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
      
      {/* APP BAR / HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} px-4 py-3.5`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('learn')}>
            <div className="h-9 w-9 rounded-2xl bg-emerald-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-400/20">
              🏃
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-none">Learn & Run</h1>
              <span className="text-[10px] text-slate-400 font-medium">1 Word at a Time Learning</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-900/40 border border-slate-800 p-1 rounded-full">
            {[
              { id: 'learn', label: '🌱 Study' },
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

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ========================================================================= */}
        {/* VIEW 1: ONE-WORD AT A TIME + 5-WORD MODULE QUIZ                          */}
        {/* ========================================================================= */}
        {activeTab === 'learn' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar: Modules Navigation */}
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Curriculum Modules</h2>
              {modulesData.map((m, idx) => {
                const isActive = idx === currentModuleIdx;
                const isDone = completedModules.includes(m.id);

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setCurrentModuleIdx(idx);
                      setWordIdx(0);
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className={`w-full text-left p-4 rounded-3xl border transition flex items-center justify-between ${isActive ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'border-slate-800 bg-slate-900 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                        Module {idx + 1}
                      </span>
                      <h3 className="font-bold text-sm leading-tight text-slate-200">{m.title}</h3>
                    </div>
                    {isDone && <span className="text-emerald-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Right Main Area: Displays ONLY 1 Word at a time, followed by 5-Word Quiz */}
            <div className="lg:col-span-8">
              <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-xl relative ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                
                {/* Visual Step Tracker (1 to 5 words, then Quiz) */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">{activeModule.title}</span>
                    <h2 className="text-xl sm:text-2xl font-black">
                      {wordIdx < 5 ? `Word ${wordIdx + 1} of 5` : 'Module Quiz (5 Questions)'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-2.5 w-6 rounded-full transition-all ${wordIdx === step ? 'bg-emerald-400 scale-105' : step < wordIdx ? 'bg-emerald-500/40' : 'bg-slate-800'}`}
                      />
                    ))}
                    <div className={`h-2.5 w-6 rounded-full ml-1 transition-all ${wordIdx === 5 ? 'bg-amber-400 scale-105' : 'bg-slate-800'}`} />
                  </div>
                </div>

                {/* STEP 1: SINGLE WORD FLASHCARD VIEW (Shows ONLY 1 word at a time) */}
                {wordIdx < 5 && singleActiveWord && (
                  <div className="text-center py-8">
                    <span className="inline-block px-3.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold tracking-wider uppercase mb-6">
                      Word {wordIdx + 1} of 5
                    </span>

                    {/* Single Foreign Word */}
                    <div className="text-4xl sm:text-6xl font-black text-emerald-400 my-2 tracking-wide">
                      {singleActiveWord[selectedLang] || singleActiveWord.spanish}
                    </div>

                    {/* English Meaning */}
                    <p className="text-xl font-bold text-slate-300 mb-6">
                      "{singleActiveWord.english}"
                    </p>

                    {/* Audio Pronunciation Button */}
                    <button
                      type="button"
                      onClick={() => speakText(singleActiveWord[selectedLang] || singleActiveWord.spanish)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-400/20 hover:scale-105 active:scale-95 transition mb-10"
                    >
                      <IconAudio className="h-4 w-4" /> Listen Pronunciation
                    </button>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                      <button
                        onClick={handlePrevWord}
                        disabled={wordIdx === 0}
                        className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-30"
                      >
                        ← Previous Word
                      </button>

                      <button
                        onClick={handleNextWord}
                        className="px-6 py-2.5 rounded-xl bg-emerald-400 text-slate-950 text-xs font-black shadow-md hover:scale-105 transition"
                      >
                        {wordIdx === 4 ? 'Finish All 5 Words & Start Quiz →' : 'Next Word →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: 5-WORD QUIZ (Appears ONLY after all 5 words are viewed) */}
                {wordIdx === 5 && (
                  <div className="space-y-6">
                    {!quizSubmitted ? (
                      <>
                        <p className="text-xs text-slate-400 font-medium">All 5 words complete! Select the correct English translation for each word:</p>
                        
                        {activeModule.words.map((word, wIdx) => {
                          const targetWord = word[selectedLang] || word.spanish;
                          return (
                            <div key={wIdx} className={`p-4 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-black text-emerald-400 text-lg">{targetWord}</span>
                                <span className="text-[10px] text-slate-400">Question {wIdx + 1} of 5</span>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2">
                                {word.options.map((opt, oIdx) => {
                                  const isSelected = quizAnswers[wIdx] === opt;
                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() => handleQuizSelect(wIdx, opt)}
                                      className={`p-2.5 rounded-xl text-xs font-bold border transition ${isSelected ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400' : 'border-slate-800 text-slate-400 hover:border-slate-700'}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        <button
                          onClick={handleSubmitQuiz}
                          disabled={Object.keys(quizAnswers).length < 5}
                          className="w-full py-4 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm shadow-xl disabled:opacity-30 transition"
                        >
                          Submit 5-Question Quiz
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-8 space-y-4">
                        <div className="text-5xl">🎉</div>
                        <h3 className="text-2xl font-black">All 5 Questions Completed!</h3>
                        <p className="text-xs text-slate-400">You earned +50 XP and mastered this module.</p>
                        <button
                          onClick={handleNextModule}
                          disabled={currentModuleIdx >= modulesData.length - 1}
                          className="px-8 py-3.5 rounded-2xl bg-emerald-400 text-slate-950 font-black text-xs shadow-lg disabled:opacity-30"
                        >
                          {currentModuleIdx < modulesData.length - 1 ? 'Start Next Module →' : 'All Modules Finished!'}
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
        {/* VIEW 3: DASHBOARD                                                        */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black">Performance Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-6 rounded-3xl border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Streak</div>
                <div className="text-2xl font-black text-slate-100">{streak} Days</div>
              </div>

              <div className={`p-6 rounded-3xl border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Total XP</div>
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
        {/* VIEW 4: ABOUT                                                            */}
        {/* ========================================================================= */}
        {activeTab === 'about' && (
          <div className={`p-8 rounded-[2.5rem] border max-w-2xl mx-auto space-y-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h2 className="text-2xl font-black">About Learn & Run</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This app guides you through 1 single word at a time. After cycling through all 5 words in a module, a 5-question test reviews your retention.
            </p>
          </div>
        )}

      </main>

      {/* MOBILE NAVIGATION BAR */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-lg px-4 py-2 flex items-center justify-around z-50`}>
        {[
          { id: 'learn', label: 'Study', icon: '🌱' },
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
