import React, { useState, useEffect, useRef } from 'react';
import { Volume2, ChevronLeft, Globe, Mic, MicOff, Gauge } from 'lucide-react';

const LANGUAGES = [
  { id: 'es-MX', name: 'Spanish (Latin America)', flag: '🇲🇽', speechLang: 'es-MX' },
  { id: 'es-ES', name: 'Spanish (Castilian)', flag: '🇪🇸', speechLang: 'es-ES' },
  { id: 'fr-FR', name: 'French', flag: '🇫🇷', speechLang: 'fr-FR' },
  { id: 'de-DE', name: 'German', flag: '🇩🇪', speechLang: 'de-DE' },
  { id: 'it-IT', name: 'Italian', flag: '🇮🇹', speechLang: 'it-IT' }
];

const MARATHON_LINGO = {
  'es-MX': [
    { term: 'el muro', meaning: 'The Wall (Mile 20 fatigue)', fallback: 'el moo-roh' },
    { term: 'ritmo de carrera', meaning: 'Race pace', fallback: 'reet-moh deh kah-reh-rah' },
    { term: 'hidratación', meaning: 'Hydration station', fallback: 'ee-drah-tah-syohn' },
    { term: 'meta', meaning: 'Finish line', fallback: 'meh-tah' }
  ],
  'es-ES': [
    { term: 'el muro', meaning: 'The Wall (Mile 20 fatigue)', fallback: 'el moo-roh' },
    { term: 'ritmo de carrera', meaning: 'Race pace', fallback: 'reet-moh deh kah-reh-rah' },
    { term: 'hidratación', meaning: 'Hydration station', fallback: 'ee-drah-tah-thyohn' },
    { term: 'meta', meaning: 'Finish line', fallback: 'meh-tah' }
  ],
  'fr-FR': [
    { term: 'le mur', meaning: 'The Wall', fallback: 'luh myoor' },
    { term: 'allure de course', meaning: 'Race pace', fallback: 'ah-lyoor duh koors' },
    { term: 'ravitaillement', meaning: 'Aid station', fallback: 'rah-vee-tye-mah' },
    { term: 'ligne d’arrivée', meaning: 'Finish line', fallback: 'leen dah-ree-vay' }
  ],
  'de-DE': [
    { term: 'der Hammer-Mann', meaning: 'Hitting the wall', fallback: 'dair hah-mer-mahn' },
    { term: 'Wettkampftempo', meaning: 'Race pace', fallback: 'vet-kahmpf-tem-poh' },
    { term: 'Verpflegungsstation', meaning: 'Aid station', fallback: 'fair-pfly-goongs-shta-tsyoohn' },
    { term: 'Ziellinie', meaning: 'Finish line', fallback: 'tseel-lee-nee-uh' }
  ],
  'it-IT': [
    { term: 'il muro', meaning: 'The Wall', fallback: 'eel moo-roh' },
    { term: 'ritmo gara', meaning: 'Race pace', fallback: 'reet-moh gah-rah' },
    { term: 'ristoro', meaning: 'Aid station', fallback: 'ree-stor-oh' },
    { term: 'traguardo', meaning: 'Finish line', fallback: 'trah-gwahr-doh' }
  ]
};

const PACE_PRESETS = [
  { label: '0.6x Ultra Slow', rate: 0.6 },
  { label: '0.8x Marathon', rate: 0.8 },
  { label: '1.0x Normal', rate: 1.0 }
];

export default function RunnerSpeechApp() {
  const [selectedLang, setSelectedLang] = useState(null);
  const [inputText, setInputText] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.8); // Default marathon pace

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wordFeedback, setWordFeedback] = useState([]);
  const [isMicSupported, setIsMicSupported] = useState(true);

  // Audio Visualizer Canvas & Audio Context Refs
  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        setAvailableVoices(window.speechSynthesis.getVoices());
      }
    };
    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setWordFeedback([]);
      startAudioVisualizer();
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      evaluateWordByWord(resultText);
    };

    recognition.onerror = () => {
      stopAudioVisualizer();
      setIsListening(false);
    };

    recognition.onend = () => {
      stopAudioVisualizer();
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [inputText, selectedLang]);

  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);

      analyser.fftSize = 128;
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      drawWaveform();
    } catch (err) {
      console.error('Mic access error:', err);
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };
    draw();
  };

  const normalizeText = (str) => {
    return str
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()!?]/g, '')
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const evaluateWordByWord = (userSpoken) => {
    if (!inputText.trim()) return;

    const targetWords = normalizeText(inputText).split(' ');
    const spokenWords = normalizeText(userSpoken).split(' ');

    const feedback = targetWords.map((word) => ({
      word,
      isCorrect: spokenWords.includes(word)
    }));

    setWordFeedback(feedback);
  };

  const handleSpeak = (textToSpeak = inputText, overrideRate) => {
    if (!('speechSynthesis' in window) || !selectedLang || !textToSpeak.trim()) return;

    window.speechSynthesis.cancel();

    const nativeVoice = availableVoices.find(v => 
      v.lang.toLowerCase() === selectedLang.id.toLowerCase() ||
      v.lang.toLowerCase().startsWith(selectedLang.id.split('-')[0])
    );

    let textToDeliver = textToSpeak.trim();
    let targetLang = selectedLang.id;

    if (!nativeVoice) {
      const list = MARATHON_LINGO[selectedLang.id] || [];
      const item = list.find(entry => entry.term.toLowerCase() === textToDeliver.toLowerCase());
      if (item) {
        textToDeliver = item.fallback;
        targetLang = 'en-US';
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToDeliver);
    utterance.lang = targetLang;
    utterance.rate = overrideRate || speechRate; // Dynamically uses selected rate

    if (nativeVoice) utterance.voice = nativeVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current || !selectedLang) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = selectedLang.speechLang;
      recognitionRef.current.start();
    }
  };

  const handleGoBack = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
    stopAudioVisualizer();
    setIsSpeaking(false);
    setIsListening(false);
    setSelectedLang(null);
    setInputText('');
    setTranscript('');
    setWordFeedback([]);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      {!selectedLang ? (
        <div>
          <h2>Marathon Audio Guide</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Select target language for running terminology:</p>
          <div style={{ display: 'grid', gap: '8px' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  background: '#fff'
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <button
              onClick={handleGoBack}
              title="Return to language selection"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f0f0f0',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={20} />
              <Globe size={18} />
            </button>
            <h3 style={{ margin: 0 }}>
              {selectedLang.flag} {selectedLang.name}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setWordFeedback([]);
                setTranscript('');
              }}
              placeholder="Enter marathon phrase..."
              style={{ padding: '12px', fontSize: '18px', borderRadius: '6px', border: '1px solid #ccc' }}
            />

            {/* Interactive Speed Toggle Controls */}
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
                <Gauge size={16} /> Select Audio Pace:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {PACE_PRESETS.map((preset) => (
                  <button
                    key={preset.rate}
                    onClick={() => {
                      setSpeechRate(preset.rate);
                      if (inputText.trim()) {
                        handleSpeak(inputText, preset.rate);
                      }
                    }}
                    style={{
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      borderRadius: '6px',
                      border: speechRate === preset.rate ? '2px solid #0070f3' : '1px solid #cbd5e1',
                      background: speechRate === preset.rate ? '#0070f3' : '#fff',
                      color: speechRate === preset.rate ? '#fff' : '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {isListening && (
              <div style={{ background: '#18181b', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <canvas ref={canvasRef} width={380} height={50} style={{ width: '100%', height: '50px' }} />
                <span style={{ fontSize: '12px', color: '#10b981' }}>Listening at pace...</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleSpeak()}
                disabled={isSpeaking || !inputText.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontSize: '15px',
                  background: isSpeaking ? '#aaa' : '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={20} />
                {isSpeaking ? 'Playing...' : `Play (${speechRate}x)`}
              </button>

              <button
                onClick={toggleListening}
                disabled={!isMicSupported || !inputText.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontSize: '15px',
                  background: isListening ? '#d97706' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                {isListening ? 'Stop' : 'Record'}
              </button>
            </div>

            {wordFeedback.length > 0 && (
              <div style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Pronunciation Breakdown:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {wordFeedback.map((item, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        background: item.isCorrect ? '#dcfce7' : '#fee2e2',
                        color: item.isCorrect ? '#15803d' : '#b91c1c',
                        border: `1px solid ${item.isCorrect ? '#86efac' : '#fca5a5'}`
                      }}
                    >
                      {item.word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                Official Marathon Lingo:
              </p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {(MARATHON_LINGO[selectedLang.id] || []).map((item) => (
                  <button
                    key={item.term}
                    onClick={() => {
                      setInputText(item.term);
                      setTranscript('');
                      setWordFeedback([]);
                      handleSpeak(item.term);
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{item.term}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.meaning}</div>
                    </div>
                    <Volume2 size={16} color="#0070f3" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
