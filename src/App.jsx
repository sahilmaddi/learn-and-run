import React, { useEffect, useMemo, useState, useRef } from 'react';

// Icons
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

// Built-in Synthesizer Sound Effects using Web Audio API
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
    // Ignore browser audio policy restrictions
  }
};

// Supported Languages
const languages = [
  { value: 'spanish', label: 'Spanish', langCode: 'es-ES' },
  { value: 'french', label: 'French', langCode: 'fr-FR' },
  { value: 'german', label: 'German', langCode: 'de-DE' },
  { value: 'japanese', label: 'Japanese', langCode: 'ja-JP' },
  { value: 'italian', label: 'Italian', langCode: 'it-IT' }
];

// 30 Step-by-Step Vocabulary Database
const stepByStepVocab = [
  // Module 1: Basics
  { id: 1, module: 'Module 1: Basics', english: 'Hello', spanish: '¡Hola!', french: 'Bonjour !', german: 'Hallo!', japanese: 'こんにちは！', italian: 'Ciao!', options: ['Hello', 'Goodbye', 'Run'] },
  { id: 2, module: 'Module 1: Basics', english: 'Yes', spanish: 'Sí', french: 'Oui', german: 'Ja', japanese: 'はい', italian: 'Sì', options: ['Yes', 'No', 'Please'] },
  { id: 3, module: 'Module 1: Basics', english: 'No', spanish: 'No', french: 'Non', german: 'Nein', japanese: 'いいえ', italian: 'No', options: ['Yes', 'No', 'Stop'] },
  { id: 4, module: 'Module 1: Basics', english: 'Please', spanish: 'Por favor', french: 'S’il vous plaît', german: 'Bitte', japanese: 'お願いします', italian: 'Per favore', options: ['Thank you', 'Please', 'Hello'] },
  { id: 5, module: 'Module 1: Basics', english: 'Thank you', spanish: 'Gracias', french: 'Merci', german: 'Danke', japanese: 'ありがとう', italian: 'Grazie', options: ['Thank you', 'Sorry', 'Walk'] },

  // Module 2: Runner Actions
  { id: 6, module: 'Module 2: Actions', english: 'Walk', spanish: 'Caminar', french: 'Marcher', german: 'Gehen', japanese: '歩く', italian: 'Camminare', options: ['Walk', 'Run', 'Stop'] },
  { id: 7, module: 'Module 2: Actions', english: 'Run', spanish: 'Correr', french: 'Courir', german: 'Laufen', japanese: '走る', italian: 'Correre', options: ['Run', 'Jump', 'Drink'] },
  { id: 8, module: 'Module 2: Actions', english: 'Stop', spanish: 'Alto', french: 'Stop', german: 'Halt', japanese: '止まれ', italian: 'Stop', options: ['Fast', 'Slow', 'Stop'] },
  { id: 9, module: 'Module 2: Actions', english: 'Start', spanish: 'Empezar', french: 'Commencer', german: 'Starten', japanese: '始める', italian: 'Iniziare', options: ['Start', 'End', 'Rest'] },
  { id: 10, module: 'Module 2: Actions', english: 'Jump', spanish: 'Saltar', french: 'Sauter', german: 'Springen', japanese: '跳ぶ', italian: 'Saltare', options: ['Jump', 'Walk', 'Breathe'] },

  // Module 3: Speed & Pace
  { id: 11, module: 'Module 3: Pace', english: 'Fast', spanish: 'Rápido', french: 'Rapide', german: 'Schnell', japanese: '速い', italian: 'Veloce', options: ['Fast', 'Slow', 'Heavy'] },
  { id: 12, module: 'Module 3: Pace', english: 'Slow', spanish: 'Lento', french: 'Lent', german: 'Langsam', japanese: '遅い', italian: 'Lento', options: ['Fast', 'Slow', 'Now'] },
  { id: 13, module: 'Module 3: Pace', english: 'Now', spanish: 'Ahora', french: 'Maintenant', german: 'Jetzt', japanese: '今', italian: 'Adesso', options: ['Later', 'Now', 'Tomorrow'] },
  { id: 14, module: 'Module 3: Pace', english: 'Rhythm', spanish: 'Ritmo', french: 'Rythme', german: 'Rhythmus', japanese: 'リズム', italian: 'Ritmo', options: ['Pace', 'Rhythm', 'Speed'] },
  { id: 15, module: 'Module 3: Pace', english: 'Pace', spanish: 'Paso', french: 'Allure', german: 'Tempo', japanese: 'ペース', italian: 'Passo', options: ['Pace', 'Rest', 'Mile'] },

  // Module 4: Body & Fitness
  { id: 16, module: 'Module 4: Fitness', english: 'Breathe', spanish: 'Respirar', french: 'Respirer', german: 'Atmen', japanese: '呼吸する', italian: 'Respirare', options: ['Breathe', 'Heart', 'Leg'] },
  { id: 17, module: 'Module 4: Fitness', english: 'Heart', spanish: 'Corazón', french: 'Cœur', german: 'Herz', japanese: '心臓', italian: 'Cuore', options: ['Heart', 'Arm', 'Feet'] },
  { id: 18, module: 'Module 4: Fitness', english: 'Water', spanish: 'Agua', french: 'Eau', german: 'Wasser', japanese: '水', italian: 'Acqua', options: ['Water', 'Food', 'Juice'] },
  { id: 19, module: 'Module 4: Fitness', english: 'Strong', spanish: 'Fuerte', french: 'Fort', german: 'Stark', japanese: '強い', italian: 'Forte', options: ['Tired', 'Strong', 'Weak'] },
  { id: 20, module: 'Module 4: Fitness', english: 'Energy', spanish: 'Energía', french: 'Énergie', german: 'Energie', japanese: 'エネルギー', italian: 'Energia', options: ['Energy', 'Rest', 'Sleep'] },

  // Module 5: Numbers
  { id: 21, module: 'Module 5: Numbers', english: 'One', spanish: 'Uno', french: 'Un', german: 'Eins', japanese: '一', italian: 'Uno', options: ['One', 'Two', 'Three'] },
  { id: 22, module: 'Module 5: Numbers', english: 'Two', spanish: 'Dos', french: 'Deux', german: 'Zwei', japanese: '二', italian: 'Due', options: ['One', 'Two', 'Four'] },
  { id: 23, module: 'Module 5: Numbers', english: 'Three', spanish: 'Tres', french: 'Trois', german: 'Drei', japanese: '三', italian: 'Tre', options: ['Two', 'Three', 'Five'] },
  { id: 24, module: 'Module 5: Numbers', english: 'Five', spanish: 'Cinco', french: 'Cinq', german: 'Fünf', japanese: '五', italian: 'Cinque', options: ['Four', 'Five', 'Ten'] },
  { id: 25, module: 'Module 5: Numbers', english: 'Ten', spanish: 'Diez', french: 'Dix', german: 'Zehn', japanese: '十', italian: 'Dieci', options: ['Five', 'Ten', 'Twenty'] },

  // Module 6: Motivation
  { id: 26, module: 'Module 6: Motivation', english: 'Let’s go!', spanish: '¡Vamos!', french: 'Allons-y !', german: 'Los geht’s!', japanese: '行こう！', italian: 'Andiamo!', options: ['Let’s go!', 'Stop now', 'Good job'] },
  { id: 27, module: 'Module 6: Motivation', english: 'Good job', spanish: 'Buen trabajo', french: 'Beau travail', german: 'Gute Arbeit', japanese: 'よくやった', italian: 'Buon lavoro', options: ['Good job', 'Bad', 'Try again'] },
  { id: 28, module: 'Module 6: Motivation', english: 'You can do it', spanish: 'Tú puedes', french: 'Tu peux le faire', german: 'Du schaffst das', japanese: '君ならできる', italian: 'Ce la puoi fare', options: ['You can do it', 'Give up', 'Slow down'] },
  { id: 29, module: 'Module 6: Motivation', english: 'Finish', spanish: 'Meta / Final', french: 'Finition', german: 'Ziel', japanese: 'ゴール', italian: 'Traguardo', options: ['Start', 'Finish', 'Middle'] },
  { id: 30, module: 'Module 6: Motivation', english: 'Victory', spanish: 'Victoria', french: 'Victoire', german: 'Sieg', japanese: '勝利', italian: 'Vittoria', options: ['Victory', 'Loss', 'Game'] }
];

// Curriculum for Run Mode
const curriculum = [
  {
    id: 1,
    title: 'Chapter 1: Warmup & Pace Controls',
    tracks: [
      { id: '1-1', duration: 10, target: { spanish: '¡Vamos a caminar!', french: 'Allons marcher !', german: 'Lass uns gehen!', japanese: '歩きましょう！', italian: 'Andiamo a camminare!' }, english: 'Let us start walking!' },
      { id: '1-2', duration: 8, target: { spanish: 'Inhala profundamente', french: 'Inspirez profondément', german: 'Atme tief ein', japanese: '深呼吸してください', italian: 'Inspira profondamente' }, english: 'Inhale deeply' },
      { id: '1-3', duration: 12, target: { spanish: 'Empieza a trotar suavemente', french: 'Commencez à jogger doucement', german: 'Fange langsam an zu joggen', japanese: 'ゆっくりジョギングを始めて', italian: 'Inizia a fare un trotterello leggero' }, english: 'Start jogging gently' }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('beginner'); // 'beginner' | 'run'
  const [selectedLang, setSelectedLang] = useState('spanish');
  const [isDark, setIsDark] = useState(true);
  
  // Progression & Mode State ('learn' vs 'quiz')
  const [stepMode, setStepMode] = useState('learn'); // 'learn' | 'quiz'
  const [completedWordIds, setCompletedWordIds] = useState(new Set([1]));
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [quizSelection, setQuizSelection] = useState(null);
  const [streakCount, setStreakCount] = useState(1);
  const [xpPoints, setXpPoints] = useState(10);

  // Run Player Section State
  const [chapterIndex, setChapterIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);

  const currentLangObj = useMemo(() => languages.find(l => l.value === selectedLang), [selectedLang]);
  const currentStepWord = stepByStepVocab[activeStepIndex];
  const activeForeignWord = currentStepWord[selectedLang] || currentStepWord.english;

  const currentChapter = curriculum[chapterIndex];
  const currentTrack = currentChapter.tracks[trackIndex];
  const foreignPhrase = currentTrack.target[selectedLang] || currentTrack.english;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = isDark ? '#020617' : '#f8fafc';
  }, [isDark]);

  // Text-To-Speech
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = currentLangObj.langCode;
      utter.rate = 0.85;
      utter.volume = 1.0;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  // Switch to Quiz view
  const handleStartPractice = () => {
    setStepMode('quiz');
    setQuizSelection(null);
  };

  // Check Quiz Selection and Unlock Next Word Step
  const handleQuizCheck = (option) => {
    setQuizSelection(option);
    if (option === currentStepWord.english) {
      playSoundEffect('correct');
      
      const nextWord = stepByStepVocab[activeStepIndex + 1];
      setCompletedWordIds((prev) => {
        const updated = new Set(prev);
        updated.add(currentStepWord.id);
        if (nextWord) updated.add(nextWord.id);
        return updated;
      });

      setXpPoints((xp) => xp + 10);
      setStreakCount((s) => s + 1);
    }
  };

  const handleNextWordStep = () => {
    if (activeStepIndex < stepByStepVocab.length - 1) {
      const nextIdx = activeStepIndex + 1;
      setActiveStepIndex(nextIdx);
      setStepMode('learn');
      setQuizSelection(null);
      const nextWordObj = stepByStepVocab[nextIdx];
      speakText(nextWordObj[selectedLang] || nextWordObj.english);
    }
  };

  const handlePrevWordStep = () => {
    if (activeStepIndex > 0) {
      const prevIdx = activeStepIndex - 1;
      setActiveStepIndex(prevIdx);
      setStepMode('learn');
      setQuizSelection(null);
      const prevWordObj = stepByStepVocab[prevIdx];
      speakText(prevWordObj[selectedLang] || prevWordObj.english);
    }
  };

  // Continuous Playback Engine
  useEffect(() => {
    if (isPlaying && activeTab === 'run') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (trackIndex < currentChapter.tracks.length - 1) {
              setTrackIndex((t) => t + 1);
            } else {
              setIsPlaying(false);
              playSoundEffect('correct');
              clearInterval(timerRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, activeTab, trackIndex, chapterIndex]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 pb-12`}>
      <div className="w-full max-w-lg mx-auto px-4 py-6">
        
        {/* Navigation Bar */}
        <header className={`mb-6 flex items-center justify-between rounded-full border px-4 py-2 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => { setActiveTab('beginner'); setIsPlaying(false); }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${activeTab === 'beginner' ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-slate-100'}`}
            >
              🌱 Beginner Learning
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('run')}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${activeTab === 'run' ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-slate-100'}`}
            >
              🏃 Run Mode
            </button>
          </div>

          <button
            type="button"
            className="rounded-full bg-slate-800 p-2 text-slate-300 hover:text-white"
            onClick={() => setIsDark(!isDark)}
          >
            <IconTheme className="h-4 w-4" />
          </button>
        </header>

        {/* Global Language Selector */}
        <div className="mb-6">
          <select
            value={selectedLang}
            onChange={(e) => {
              setSelectedLang(e.target.value);
              setIsPlaying(false);
            }}
            className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none ${isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-slate-100 text-slate-900'}`}
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* =================================================== */}
        {/* STEP-BY-STEP WORD-BY-WORD BEGINNER LEARNING         */}
        {/* =================================================== */}
        {activeTab === 'beginner' && (
          <div className="space-y-6">
            
            {/* Gamification Bar */}
            <div className={`flex items-center justify-between rounded-3xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <div>
                  <p className="text-xs text-slate-400">Streak</p>
                  <p className="font-bold text-sm">{streakCount} Words</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="text-xs text-slate-400">Total Points</p>
                  <p className="font-bold text-sm text-emerald-400">{xpPoints} XP</p>
                </div>
              </div>
            </div>

            {/* Active Word Card */}
            <div className={`rounded-[2.5rem] border p-6 text-center shadow-xl relative ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
                {currentStepWord.module} • Word {activeStepIndex + 1} of {stepByStepVocab.length}
              </span>

              {/* Step 1: LEARN MODE */}
              {stepMode === 'learn' && (
                <div className="py-4">
                  <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3">
                    Step 1: Learn Word
                  </span>

                  {/* Target Foreign Word */}
                  <div className="text-4xl font-black text-emerald-400 my-2 tracking-wide">
                    {activeForeignWord}
                  </div>

                  {/* English Translation */}
                  <p className="text-xl font-bold text-slate-300 mb-4">
                    "{currentStepWord.english}"
                  </p>

                  {/* Audio Listen Button */}
                  <button
                    type="button"
                    onClick={() => speakText(activeForeignWord)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-400/20 hover:scale-105 active:scale-95 transition mb-6"
                  >
                    <IconAudio className="h-4 w-4" /> Listen Pronunciation
                  </button>

                  <div>
                    <button
                      type="button"
                      onClick={handleStartPractice}
                      className="w-full py-3.5 rounded-2xl bg-emerald-400 text-slate-950 font-bold text-sm shadow-md hover:opacity-90 active:scale-98 transition"
                    >
                      I Got It! Test Me →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: QUIZ / PRACTICE MODE */}
              {stepMode === 'quiz' && (
                <div className="py-2">
                  <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3">
                    Step 2: Test Memory
                  </span>

                  <div className="text-3xl font-black text-emerald-400 my-3 tracking-wide">
                    {activeForeignWord}
                  </div>

                  <p className="text-xs text-slate-400 mb-4 font-medium">Select the correct English translation:</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {currentStepWord.options.map((opt, idx) => {
                      const isSelected = quizSelection === opt;
                      const isCorrect = opt === currentStepWord.english;

                      let btnStyle = isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100';
                      if (isSelected) {
                        btnStyle = isCorrect ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold' : 'border-red-500 bg-red-500/20 text-red-400 font-bold';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuizCheck(opt)}
                          className={`p-3 rounded-2xl border text-xs transition ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setStepMode('learn')}
                      className="text-xs text-slate-400 underline hover:text-slate-200"
                    >
                      ← Review Word
                    </button>
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handlePrevWordStep}
                  disabled={activeStepIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold disabled:opacity-30"
                >
                  ← Previous Word
                </button>

                <button
                  type="button"
                  onClick={handleNextWordStep}
                  disabled={activeStepIndex >= stepByStepVocab.length - 1 || !completedWordIds.has(currentStepWord.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 text-xs font-bold disabled:opacity-30"
                >
                  Next Word →
                </button>
              </div>
            </div>

          </div>
        )}

        {/* =================================================== */}
        {/* SECTION 2: RUNNER AUDIO MODE PLAYER                 */}
        {/* =================================================== */}
        {activeTab === 'run' && (
          <div className="space-y-6">
            <div className={`rounded-[2.5rem] border p-6 shadow-2xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <div className={`rounded-3xl border p-6 text-center mb-6 relative overflow-hidden transition ${isPlaying ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  Track {trackIndex + 1} of {currentChapter.tracks.length}
                </span>

                <div className="text-2xl font-black text-emerald-400 my-2 leading-tight">
                  {foreignPhrase}
                </div>

                <div className="text-sm font-medium text-slate-400">
                  "{currentTrack.english}"
                </div>

                <div className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-400/20 px-6 py-1.5 text-xl font-black text-emerald-400">
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20 hover:scale-105 active:scale-95 transition"
                >
                  {isPlaying ? <IconPause className="h-8 w-8" /> : <IconPlay className="h-8 w-8 ml-1" />}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
