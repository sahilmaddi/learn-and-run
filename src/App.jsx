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
// AUDIO UTILS & ROBUST NATIVE TTS ENGINE
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
    console.warn('Audio Context trigger failed:', e);
  }
};

const speakTextHelper = (text, langCode) => {
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langCode;
    utter.rate = 0.85;

    const availableVoices = window.speechSynthesis.getVoices();
    const langPrefix = langCode.slice(0, 2);

    // Prioritize exact match, then language prefix match (e.g., 'es')
    const nativeVoice =
      availableVoices.find((v) => v.lang.replace('_', '-') === langCode) ||
      availableVoices.find((v) => v.lang.startsWith(langPrefix));

    if (nativeVoice) {
      utter.voice = nativeVoice;
    }

    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.error('Speech synthesis error:', e);
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
    id: 1,
    title: 'Module 1: Basic Greetings',
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
    title: 'Module 2: Essential Pronouns',
    words: [
      { id: 6, english: 'I', spanish: 'Yo', french: 'Je', german: 'Ich', japanese: '私', italian: 'Io', options: ['I', 'You', 'We'] },
      { id: 7, english: 'You', spanish: 'Tú', french: 'Tu', german: 'Du', japanese: 'あなた', italian: 'Tu', options: ['You', 'He', 'They'] },
      { id: 8, english: 'He', spanish: 'Él', french: 'Il', german: 'Er', japanese: '彼', italian: 'Egli', options: ['He', 'She', 'We'] },
      { id: 9, english: 'She', spanish: 'Ella', french: 'Elle', german: 'Sie', japanese: '彼女', italian: 'Ella', options: ['He', 'She', 'I'] },
      { id: 10, english: 'We', spanish: 'Nosotros', french: 'Nous', german: 'Wir', japanese: '私たち', italian: 'Noi', options: ['We', 'They', 'You'] }
    ]
  },
  {
    id: 3,
    title: 'Module 3: Core Verbs',
    words: [
      { id: 11, english: 'To be', spanish: 'Ser', french: 'Être', german: 'Sein', japanese: '〜である', italian: 'Essere', options: ['To be', 'To have', 'To want'] },
      { id: 12, english: 'To have', spanish: 'Tener', french: 'Avoir', german: 'Haben', japanese: '持っている', italian: 'Avere', options: ['To bring', 'To have', 'To do'] },
      { id: 13, english: 'To want', spanish: 'Querer', french: 'Vouloir', german: 'Wollen', japanese: '〜したい', italian: 'Volere', options: ['To want', 'To speak', 'To know'] },
      { id: 14, english: 'To need', spanish: 'Necesitar', french: 'Avoir besoin', german: 'Brauchen', japanese: '必要である', italian: 'Avere bisogno', options: ['To need', 'To go', 'To eat'] },
      { id: 15, english: 'To go', spanish: 'Ir', french: 'Aller', german: 'Gehen', japanese: '行く', italian: 'Andare', options: ['To go', 'To stay', 'To see'] }
    ]
  },
  {
    id: 4,
    title: 'Module 4: Numbers (1-5)',
    words: [
      { id: 16, english: 'One', spanish: 'Uno', french: 'Un', german: 'Eins', japanese: '一', italian: 'Uno', options: ['One', 'Two', 'Three'] },
      { id: 17, english: 'Two', spanish: 'Dos', french: 'Deux', german: 'Zwei', japanese: '二', italian: 'Due', options: ['One', 'Two', 'Four'] },
      { id: 18, english: 'Three', spanish: 'Tres', french: 'Trois', german: 'Drei', japanese: '三', italian: 'Tre', options: ['Three', 'Five', 'Two'] },
      { id: 19, english: 'Four', spanish: 'Cuatro', french: 'Quatre', german: 'Vier', japanese: '四', italian: 'Quattro', options: ['Four', 'One', 'Three'] },
      { id: 20, english: 'Five', spanish: 'Cinco', french: 'Cinq', german: 'Fünf', japanese: '五', italian: 'Cinque', options: ['Five', 'Four', 'Two'] }
    ]
  },
  {
    id: 5,
    title: 'Module 5: Common Actions',
    words: [
      { id: 21, english: 'Walk', spanish: 'Caminar', french: 'Marcher', german: 'Gehen', japanese: '歩く', italian: 'Camminare', options: ['Walk', 'Run', 'Stop'] },
      { id: 22, english: 'Run', spanish: 'Correr', french: 'Courir', german: 'Laufen', japanese: '走る', italian: 'Correre', options: ['Run', 'Jump', 'Drink'] },
      { id: 23, english: 'Eat', spanish: 'Comer', french: 'Manger', german: 'Essen', japanese: '食べる', italian: 'Mangiare', options: ['Eat', 'Drink', 'Sleep'] },
      { id: 24, english: 'Drink', spanish: 'Beber', french: 'Boire', german: 'Trinken', japanese: '飲む', italian: 'Bere', options: ['Drink', 'Eat', 'Cook'] },
      { id: 25, english: 'Sleep', spanish: 'Dormir', french: 'Dormir', german: 'Schlafen', japanese: '寝る', italian: 'Dormire', options: ['Sleep', 'Wake', 'Rest'] }
    ]
  },
  {
    id: 6,
    title: 'Module 6: Food & Drink',
    words: [
      { id: 26, english: 'Water', spanish: 'Agua', french: 'Eau', german: 'Wasser', japanese: '水', italian: 'Acqua', options: ['Water', 'Milk', 'Bread'] },
      { id: 27, english: 'Bread', spanish: 'Pan', french: 'Pain', german: 'Brot', japanese: 'パン', italian: 'Pane', options: ['Bread', 'Coffee', 'Fruit'] },
      { id: 28, english: 'Coffee', spanish: 'Café', french: 'Café', german: 'Kaffee', japanese: 'コーヒー', italian: 'Caffè', options: ['Coffee', 'Tea', 'Water'] },
      { id: 29, english: 'Tea', spanish: 'Té', french: 'Thé', german: 'Tee', japanese: 'お茶', italian: 'Tè', options: ['Tea', 'Juice', 'Milk'] },
      { id: 30, english: 'Food', spanish: 'Comida', french: 'Nourriture', german: 'Essen', japanese: '食べ物', italian: 'Cibo', options: ['Food', 'Drink', 'Water'] }
    ]
  },
  {
    id: 7,
    title: 'Module 7: Travel & Navigation',
    words: [
      { id: 31, english: 'Where', spanish: 'Dónde', french: 'Où', german: 'Wo', japanese: 'どこ', italian: 'Dove', options: ['Where', 'When', 'Why'] },
      { id: 32, english: 'Here', spanish: 'Aquí', french: 'Ici', german: 'Hier', japanese: 'ここ', italian: 'Qui', options: ['Here', 'There', 'Where'] },
      { id: 33, english: 'Street', spanish: 'Calle', french: 'Rue', german: 'Straße', japanese: '通り', italian: 'Strada', options: ['Street', 'House', 'Hotel'] },
      { id: 34, english: 'Hotel', spanish: 'Hotel', french: 'Hôtel', german: 'Hotel', japanese: 'ホテル', italian: 'Hotel', options: ['Hotel', 'Store', 'Airport'] },
      { id: 35, english: 'Help', spanish: 'Ayuda', french: 'Aide', german: 'Hilfe', japanese: '助けて', italian: 'Aiuto', options: ['Help', 'Stop', 'Go'] }
    ]
  },
  {
    id: 8,
    title: 'Module 8: Time & Days',
    words: [
      { id: 36, english: 'Today', spanish: 'Hoy', french: 'Aujourd’hui', german: 'Heute', japanese: '今日', italian: 'Oggi', options: ['Today', 'Tomorrow', 'Yesterday'] },
      { id: 37, english: 'Tomorrow', spanish: 'Mañana', french: 'Demain', german: 'Morgen', japanese: '明日', italian: 'Domani', options: ['Tomorrow', 'Today', 'Now'] },
      { id: 38, english: 'Now', spanish: 'Ahora', french: 'Maintenant', german: 'Jetzt', japanese: '今', italian: 'Adesso', options: ['Now', 'Later', 'Never'] },
      { id: 39, english: 'Day', spanish: 'Día', french: 'Jour', german: 'Tag', japanese: '日', italian: 'Giorno', options: ['Day', 'Night', 'Week'] },
      { id: 40, english: 'Night', spanish: 'Noche', french: 'Nuit', german: 'Nacht', japanese: '夜', italian: 'Notte', options: ['Night', 'Day', 'Morning'] }
    ]
  },
  {
    id: 9,
    title: 'Module 9: Key Descriptors',
    words: [
      { id: 41, english: 'Good', spanish: 'Bueno', french: 'Bon', german: 'Gut', japanese: '良い', italian: 'Buono', options: ['Good', 'Bad', 'Big'] },
      { id: 42, english: 'Bad', spanish: 'Malo', french: 'Mauvais', german: 'Schlecht', japanese: '悪い', italian: 'Cattivo', options: ['Bad', 'Good', 'Small'] },
      { id: 43, english: 'Big', spanish: 'Grande', french: 'Grand', german: 'Groß', japanese: '大きい', italian: 'Grande', options: ['Big', 'Small', 'Fast'] },
      { id: 44, english: 'Small', spanish: 'Pequeño', french: 'Petit', german: 'Klein', japanese: '小さい', italian: 'Piccolo', options: ['Small', 'Big', 'Slow'] },
      { id: 45, english: 'Fast', spanish: 'Rápido', french: 'Rapide', german: 'Schnell', japanese: '速い', italian: 'Veloce', options: ['Fast', 'Slow', 'Good'] }
    ]
  },
  {
    id: 10,
    title: 'Module 10: Basic Questions',
    words: [
      { id: 46, english: 'What', spanish: 'Qué', french: 'Quoi', german: 'Was', japanese: '何', italian: 'Cosa', options: ['What', 'Who', 'Where'] },
      { id: 47, english: 'Who', spanish: 'Quién', french: 'Qui', german: 'Wer', japanese: '誰', italian: 'Chi', options: ['Who', 'What', 'How'] },
      { id: 48, english: 'How', spanish: 'Cómo', french: 'Comment', german: 'Wie', japanese: 'どのように', italian: 'Come', options: ['How', 'Why', 'When'] },
      { id: 49, english: 'When', spanish: 'Cuándo', french: 'Quand', german: 'Wann', japanese: 'いつ', italian: 'Quando', options: ['When', 'Where', 'How'] },
      { id: 50, english: 'Why', spanish: 'Por qué', french: 'Pourquoi', german: 'Warum', japanese: 'なぜ', italian: 'Perché', options: ['Why', 'What', 'Who'] }
    ]
  }
];

const runAudioTracks = [
  { id: '1', english: 'Start walking slowly', target: { spanish: 'Empieza a caminar despacio', french: 'Commencez à marcher lentement', german: 'Fange langsam an zu gehen', japanese: 'ゆっくり歩き始めて', italian: 'Inizia a camminare lentamente' }, duration: 10 },
  { id: '2', english: 'Increase your pace now', target: { spanish: 'Aumenta tu ritmo ahora', french: 'Augmentez votre allure maintenant', german: 'Erhöhe jetzt dein Tempo', japanese: '今すぐペースを上げて', italian: 'Aumenta il tuo passo adesso' }, duration: 15 },
  { id: '3', english: 'Breathe deeply and relax', target: { spanish: 'Respira hondo y relájate', french: 'Respirez profondément et détendez-vous', german: 'Atme tief ein und entspanne dich', japanese: '深呼吸してリラックスして', italian: 'Inspira profondamente' }, duration: 12 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('learn');
  const [selectedLang, setSelectedLang] = useState('spanish');
  const [isDark, setIsDark] = useState(true);

  // Module & Word Index
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Progress
  const [xp, setXp] = useState(100);
  const [streak, setStreak] = useState(2);
  const [completedModules, setCompletedModules] = useState([]);

  // Audio Player State
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(runAudioTracks[0].duration);
  const timerRef = useRef(null);

  const currentLangObj = useMemo(() => languages.find(l => l.value === selectedLang), [selectedLang]);
  const activeModule = modulesData[currentModuleIdx];
  const singleActiveWord = activeModule ? activeModule.words[wordIdx] : null;

  // Initialize Voices on Mount & set listener to ensure speech engine voice pool is loaded
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = isDark ? '#020617' : '#f8fafc';
  }, [isDark]);

  const speakCurrentWord = (text) => {
    speakTextHelper(text, currentLangObj.langCode);
  };

  const handleNextWord = () => {
    if (wordIdx < 4) {
      const nextWordIdx = wordIdx + 1;
      setWordIdx(nextWordIdx);
      const nextWord = activeModule.words[nextWordIdx];
      const textToSpeak = nextWord[selectedLang] || nextWord.spanish;
      speakCurrentWord(textToSpeak);
    } else {
      setWordIdx(5);
    }
  };

  const handlePrevWord = () => {
    if (wordIdx > 0 && wordIdx < 5) {
      const prevWordIdx = wordIdx - 1;
      setWordIdx(prevWordIdx);
      const prevWord = activeModule.words[prevWordIdx];
      const textToSpeak = prevWord[selectedLang] || prevWord.spanish;
      speakCurrentWord(textToSpeak);
    }
  };

  const handleQuizSelect = (wIdx, selectedOption) => {
    setQuizAnswers(prev => ({ ...prev, [wIdx]: selectedOption }));
  };

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

  const handleNextModule = () => {
    if (currentModuleIdx < modulesData.length - 1) {
      setCurrentModuleIdx(prev => prev + 1);
      setWordIdx(0);
      setQuizAnswers({});
      setQuizSubmitted(false);

      const firstWord = modulesData[currentModuleIdx + 1].words[0];
      speakCurrentWord(firstWord[selectedLang] || firstWord.spanish);
    }
  };

  const togglePlayMarathon = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      const trackText = runAudioTracks[trackIndex].target[selectedLang] || runAudioTracks[trackIndex].target.spanish;
      speakTextHelper(trackText, currentLangObj.langCode);
    } else {
      setIsPlaying(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    if (isPlaying && activeTab === 'run') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (trackIndex < runAudioTracks.length - 1) {
              const nextIdx = trackIndex + 1;
              setTrackIndex(nextIdx);

              const nextTrackText = runAudioTracks[nextIdx].target[selectedLang] || runAudioTracks[nextIdx].target.spanish;
              speakTextHelper(nextTrackText, currentLangObj.langCode);

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
  }, [isPlaying, activeTab, trackIndex, selectedLang, currentLangObj]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-300 pb-20 md:pb-8`}>
      {/* HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} px-4 py-3.5`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('learn')}>
            <div className="h-9 w-9 rounded-2xl bg-emerald-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-400/20">
              🏃
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-none">Learn & Run</h1>
              <span className="text-[10px] text-slate-400 font-medium">Beginner Complete Course</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-900/40 border border-slate-800 p-1 rounded-full">
            {[
              { id: 'learn', label: '🌱 Study' },
              { id: 'run', label: '🎧 Marathon Lingo' },
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'about', label: 'ℹ️ About' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsPlaying(false);
                  setActiveTab(tab.id);
                }}
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
            >
              <IconTheme className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'learn' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="hidden lg:block lg:col-span-4 space-y-2.5 max-h-[80vh] overflow-y-auto pr-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Curriculum (10 Modules)</h2>
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
                      const targetWord = m.words[0];
                      speakCurrentWord(targetWord[selectedLang] || targetWord.spanish);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between ${isActive ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'border-slate-800 bg-slate-900 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                        Module {idx + 1}
                      </span>
                      <h3 className="font-bold text-xs leading-tight text-slate-200">{m.title}</h3>
                    </div>
                    {isDone && <span className="text-emerald-400 font-bold text-xs">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-8">
              <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-xl relative ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
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
                        className={`h-2.5 w-5 rounded-full transition-all ${wordIdx === step ? 'bg-emerald-400 scale-105' : step < wordIdx ? 'bg-emerald-500/40' : 'bg-slate-800'}`}
                      />
                    ))}
                    <div className={`h-2.5 w-5 rounded-full ml-1 transition-all ${wordIdx === 5 ? 'bg-amber-400 scale-105' : 'bg-slate-800'}`} />
                  </div>
                </div>

                {wordIdx < 5 && singleActiveWord && (
                  <div className="text-center py-8">
                    <span className="inline-block px-3.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold tracking-wider uppercase mb-6">
                      Word {wordIdx + 1} of 5
                    </span>

                    <div className="text-4xl sm:text-6xl font-black text-emerald-400 my-2 tracking-wide">
                      {singleActiveWord[selectedLang] || singleActiveWord.spanish}
                    </div>

                    <p className="text-xl font-bold text-slate-300 mb-6">
                      "{singleActiveWord.english}"
                    </p>

                    <button
                      type="button"
                      onClick={() => speakCurrentWord(singleActiveWord[selectedLang] || singleActiveWord.spanish)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-400/20 hover:scale-105 active:scale-95 transition mb-10"
                    >
                      <IconAudio className="h-4 w-4" /> Listen Pronunciation
                    </button>

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
                        {wordIdx === 4 ? 'Finish Words & Start Quiz →' : 'Next Word →'}
                      </button>
                    </div>
                  </div>
                )}

                {wordIdx === 5 && (
                  <div className="space-y-6">
                    {!quizSubmitted ? (
                      <>
                        <p className="text-xs text-slate-400 font-medium">Select the correct English translation for each word:</p>
                        
                        {activeModule.words.map((word, wIdx) => {
                          const targetWord = word[selectedLang] || word.spanish;
                          return (
                            <div key={wIdx} className={`p-4 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-black text-emerald-400 text-lg">{targetWord}</span>
                                <button
                                  type="button"
                                  onClick={() => speakCurrentWord(targetWord)}
                                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                                >
                                  <IconAudio className="h-3.5 w-3.5" /> Speak
                                </button>
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
                        <h3 className="text-2xl font-black">Module Mastered!</h3>
                        <p className="text-xs text-slate-400">You earned +50 XP for completing Module {currentModuleIdx + 1}.</p>
                        <button
                          onClick={handleNextModule}
                          disabled={currentModuleIdx >= modulesData.length - 1}
                          className="px-8 py-3.5 rounded-2xl bg-emerald-400 text-slate-950 font-black text-xs shadow-lg disabled:opacity-30"
                        >
                          {currentModuleIdx < modulesData.length - 1 ? 'Start Next Module →' : 'Course Completed! 🏆'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MARATHON LINGO MODE */}
        {activeTab === 'run' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className={`p-8 rounded-[2.5rem] border text-center shadow-2xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
                Marathon Lingo • Track {trackIndex + 1} of {runAudioTracks.length}
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
                  onClick={togglePlayMarathon}
                  className="h-20 w-20 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-400/30 hover:scale-105 active:scale-95 transition"
                >
                  {isPlaying ? <IconPause className="h-10 w-10" /> : <IconPlay className="h-10 w-10 ml-1" />}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 text-left space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audio Cues Queue</h4>
                {runAudioTracks.map((tr, idx) => (
                  <button
                    key={tr.id}
                    onClick={() => {
                      setTrackIndex(idx);
                      setTimeLeft(tr.duration);
                      if (isPlaying) {
                        const trackText = tr.target[selectedLang] || tr.target.spanish;
                        speakTextHelper(trackText, currentLangObj.langCode);
                      }
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${idx === trackIndex ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block">Cue {idx + 1}</span>
                      <p className="text-xs font-bold">{tr.target[selectedLang] || tr.target.spanish}</p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{tr.duration}s</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <h2 className="text-2xl font-black mb-6">Your Progress Overview</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">Total XP</span>
                  <p className="text-3xl font-black text-emerald-400 mt-1">{xp} XP</p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Day Streak</span>
                  <p className="text-3xl font-black text-amber-400 mt-1">{streak} Days 🔥</p>
                </div>

                <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block">Completed</span>
                  <p className="text-3xl font-black text-blue-400 mt-1">{completedModules.length} / 10</p>
                </div>
              </div>

              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Module Completion Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modulesData.map((m) => {
                  const done = completedModules.includes(m.id);
                  return (
                    <div key={m.id} className={`p-4 rounded-xl border flex items-center justify-between ${done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/40'}`}>
                      <span className="text-xs font-bold text-slate-300">{m.title}</span>
                      <span className={`text-xs font-bold ${done ? 'text-emerald-400' : 'text-slate-500'}`}>{done ? 'Completed ✓' : 'Incomplete'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <h2 className="text-2xl font-black mb-4">About Learn & Run</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Learn & Run combines structured flashcard curriculum learning with hands-free audio cueing designed for workouts, runs, and active study.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md px-4 py-2.5 flex items-center justify-around z-50`}>
        {[
          { id: 'learn', label: 'Study', icon: '🌱' },
          { id: 'run', label: 'Marathon', icon: '🎧' },
          { id: 'dashboard', label: 'Stats', icon: '📊' },
          { id: 'about', label: 'About', icon: 'ℹ️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setIsPlaying(false);
              setActiveTab(tab.id);
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
