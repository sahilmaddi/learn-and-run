import React, { useState, useEffect, useRef } from 'react';
import { Volume2, ChevronLeft, Globe, Mic, MicOff, CheckCircle2, XCircle } from 'lucide-react';

const LANGUAGES = [
  { id: 'es-MX', name: 'Spanish (Latin America)', flag: '🇲🇽', speechLang: 'es-MX' },
  { id: 'es-ES', name: 'Spanish (Castilian)', flag: '🇪🇸', speechLang: 'es-ES' },
  { id: 'fr-FR', name: 'French', flag: '🇫🇷', speechLang: 'fr-FR' },
  { id: 'de-DE', name: 'German', flag: '🇩🇪', speechLang: 'de-DE' },
  { id: 'it-IT', name: 'Italian', flag: '🇮🇹', speechLang: 'it-IT' }
];

const PHONETIC_MAPS = {
  'es-MX': {
    'gracias': 'grah-syahs',
    'hola': 'oh-lah',
    'por favor': 'por fah-bor',
    'de nada': 'deh nah-dah'
  },
  'es-ES': {
    'gracias': 'grah-thyahs',
    'hola': 'oh-lah',
    'por favor': 'por fah-bor',
    'de nada': 'deh nah-dah'
  },
  'fr-FR': {
    'bonjour': 'boh-zhoor',
    'merci': 'mair-see',
    's’il vous plaît': 'seel voo pleh',
    'au revoir': 'oh ruh-vwar'
  },
  'de-DE': {
    'danke': 'dahn-kuh',
    'guten tag': 'goo-ten tahk',
    'bitte': 'bit-tuh',
    'auf wiedersehen': 'owf vee-der-zay-en'
  },
  'it-IT': {
    'grazie': 'graht-syeh',
    'ciao': 'chow',
    'per favore': 'pair fah-voh-reh',
    'prego': 'pray-goh'
  }
};

export default function SpeechApp() {
  const [selectedLang, setSelectedLang] = useState(null);
  const [inputText, setInputText] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isMicSupported, setIsMicSupported] = useState(true);

  // Refs for Speech & Audio Processing
  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Load Synthesis Voices
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

  // Initialize Speech Recognition API
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
      setFeedback(null);
      startAudioVisualizer();
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      evaluatePronunciation(resultText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      stopAudioVisualizer();
      setIsListening(false);
    };

    recognition.onend = () => {
      stopAudioVisualizer();
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [inputText, selectedLang]);

  // Clean up Audio Context and Animation Frames on Unmount
  useEffect(() => {
    return () => {
      stopAudioVisualizer();
    };
  }, []);

  // Start Real-Time Web Audio Visualizer
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      drawWaveform();
    } catch (err) {
      console.error('Microphone access denied for visualizer:', err);
    }
  };

  // Stop Audio Processing and Release Mic Stream
  const stopAudioVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  // Render Real-Time Frequency Bars to Canvas
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

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Dynamic gradient color depending on audio intensity
        const red = Math.min(255, barHeight + 100);
        const green = 150;
        const blue = 255 - barHeight;

        ctx.fillStyle = `rgb(${red},${green},${blue})`;
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

  const evaluatePronunciation = (userSpoken) => {
    if (!inputText.trim()) return;

    const target = normalizeText(inputText);
    const spoken = normalizeText(userSpoken);

    if (target === spoken) {
      setFeedback({ isMatch: true, score: 100 });
      return;
    }

    const targetWords = target.split(' ');
    const spokenWords = spoken.split(' ');
    
    let matches = 0;
    targetWords.forEach((word) => {
      if (spokenWords.includes(word)) matches++;
    });

    const calculatedScore = Math.round((matches / Math.max(targetWords.length, spokenWords.length)) * 100);
    
    setFeedback({
      isMatch: calculatedScore >= 75,
      score: calculatedScore
    });
  };

  const handleSpeak = (textToSpeak = inputText) => {
    if (!('speechSynthesis' in window) || !selectedLang || !textToSpeak.trim()) return;

    window.speechSynthesis.cancel();

    const nativeVoice = availableVoices.find(v => 
      v.lang.toLowerCase() === selectedLang.id.toLowerCase() ||
      v.lang.toLowerCase().startsWith(selectedLang.id.split('-')[0])
    );

    let textToDeliver = textToSpeak.trim();
    let targetLang = selectedLang.id;

    if (nativeVoice) {
      textToDeliver = textToDeliver.replace(/\s+([!?])/g, '$1');
    } else {
      const map = PHONETIC_MAPS[selectedLang.id] || {};
      const cleanKey = textToDeliver.toLowerCase();
      if (map[cleanKey]) {
        textToDeliver = map[cleanKey];
        targetLang = 'en-US';
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToDeliver);
    utterance.lang = targetLang;
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    stopAudioVisualizer();
    setIsSpeaking(false);
    setIsListening(false);
    setSelectedLang(null);
    setInputText('');
    setTranscript('');
    setFeedback(null);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      {!selectedLang ? (
        <div>
          <h2>Select a Language</h2>
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
          {/* Header with Back Navigation */}
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
                setFeedback(null);
                setTranscript('');
              }}
              placeholder="Enter phrase to practice..."
              style={{ padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
            />

            {/* Live Audio Visualizer Canvas */}
            {isListening && (
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={60}
                  style={{ width: '100%', height: '60px' }}
                />
                <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 500 }}>
                  Listening to audio stream...
                </span>
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
                  padding: '10px',
                  fontSize: '15px',
                  background: isSpeaking ? '#aaa' : '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={18} />
                {isSpeaking ? 'Speaking...' : 'Listen'}
              </button>

              <button
                onClick={toggleListening}
                disabled={!isMicSupported || !inputText.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  fontSize: '15px',
                  background: isListening ? '#d97706' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isMicSupported && inputText.trim() ? 'pointer' : 'not-allowed',
                  opacity: !isMicSupported || !inputText.trim() ? 0.6 : 1
                }}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                {isListening ? 'Stop' : 'Record'}
              </button>
            </div>

            {!isMicSupported && (
              <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>
                Speech recognition is not supported in this browser (Use Chrome or Edge).
              </p>
            )}

            {/* Feedback Display */}
            {transcript && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: feedback?.isMatch ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${feedback?.isMatch ? '#a7f3d0' : '#fecaca'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {feedback?.isMatch ? (
                      <CheckCircle2 size={18} color="#059669" />
                    ) : (
                      <XCircle size={18} color="#dc2626" />
                    )}
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: feedback?.isMatch ? '#047857' : '#b91c1c' }}>
                      {feedback?.isMatch ? 'Great Pronunciation!' : 'Try Again'}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginLeft: 'auto' }}>
                    Score: {feedback?.score}%
                  </span>
                </div>

                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#374151' }}>
                  <strong>Heard:</strong> "{transcript}"
                </p>
              </div>
            )}

            {/* Quick Test Chips */}
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Sample Phrases:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.keys(PHONETIC_MAPS[selectedLang.id] || {}).map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => {
                      setInputText(phrase);
                      setTranscript('');
                      setFeedback(null);
                      handleSpeak(phrase);
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '14px',
                      borderRadius: '16px',
                      border: '1px solid #0070f3',
                      background: '#f0f7ff',
                      color: '#0070f3',
                      cursor: 'pointer'
                    }}
                  >
                    {phrase}
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
