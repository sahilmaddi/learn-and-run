import React, { useState, useEffect, useRef } from 'react';
import { Volume2, ChevronLeft, Globe, Mic, MicOff, Gauge, AlertCircle } from 'lucide-react';

const LANGUAGES = [
  { id: 'es-MX', name: 'Spanish (Latin America)', flag: '🇲🇽', speechLang: 'es-MX' },
  { id: 'es-ES', name: 'Spanish (Castilian)', flag: '🇪🇸', speechLang: 'es-ES' },
  { id: 'fr-FR', name: 'French', flag: '🇫🇷', speechLang: 'fr-FR' },
  { id: 'de-DE', name: 'German', flag: '🇩🇪', speechLang: 'de-DE' },
  { id: 'it-IT', name: 'Italian', flag: '🇮🇹', speechLang: 'it-IT' }
];

const MARATHON_LINGO = {
  'es-MX': [
    { term: 'el muro', meaning: 'The Wall (Mile 20 fatigue)' },
    { term: 'ritmo de carrera', meaning: 'Race pace' },
    { term: 'estación de hidratación', meaning: 'Hydration station' },
    { term: 'línea de meta', meaning: 'Finish line' }
  ],
  'es-ES': [
    { term: 'el muro', meaning: 'The Wall (Mile 20 fatigue)' },
    { term: 'ritmo de carrera', meaning: 'Race pace' },
    { term: 'avituallamiento', meaning: 'Aid / Hydration station' },
    { term: 'línea de meta', meaning: 'Finish line' }
  ],
  'fr-FR': [
    { term: 'le mur', meaning: 'The Wall' },
    { term: 'allure de course', meaning: 'Race pace' },
    { term: 'ravitaillement', meaning: 'Aid station' },
    { term: 'ligne d’arrivée', meaning: 'Finish line' }
  ],
  'de-DE': [
    { term: 'der Hammermann', meaning: 'Hitting the wall' },
    { term: 'Wettkampftempo', meaning: 'Race pace' },
    { term: 'Verpflegungsstation', meaning: 'Aid station' },
    { term: 'Ziellinie', meaning: 'Finish line' }
  ],
  'it-IT': [
    { term: 'il muro', meaning: 'The Wall' },
    { term: 'ritmo gara', meaning: 'Race pace' },
    { term: 'punto di ristoro', meaning: 'Aid station' },
    { term: 'linea del traguardo', meaning: 'Finish line' }
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.8);

  // Audio Engine Mode: 'vercel' | 'google-cloud' | 'web-speech'
  const [audioEngine, setAudioEngine] = useState('vercel');
  const [googleApiKey, setGoogleApiKey] = useState('');

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wordFeedback, setWordFeedback] = useState([]);
  const [isMicSupported, setIsMicSupported] = useState(true);

  // Audio & Animation Refs
  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioPlayerRef = useRef(null);

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

  // Audio Visualizer
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

  // MULTI-AGENT TTS CONTROLLER
  const handleSpeak = async (textToSpeak = inputText, overrideRate) => {
    if (!selectedLang || !textToSpeak.trim()) return;
    const rate = overrideRate || speechRate;
    const text = textToSpeak.trim();

    // Stop existing audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);

    // AGENT 1: Vercel Proxy Serverless Endpoint
    if (audioEngine === 'vercel') {
      const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${selectedLang.id}`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = rate;
      audioPlayerRef.current = audio;

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        alert('Vercel API TTS route failed. Check server logs or try Web Speech mode.');
      };
      audio.play().catch(() => setIsSpeaking(false));
      return;
    }

    // AGENT 2: Direct Google Cloud Text-to-Speech API
    if (audioEngine === 'google-cloud') {
      if (!googleApiKey) {
        alert('Please enter a Google Cloud API Key in options.');
        setIsSpeaking(false);
        return;
      }

      try {
        const response = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text },
              voice: { languageCode: selectedLang.id, ssmlGender: 'NEUTRAL' },
              audioConfig: { audioEncoding: 'MP3' }
            })
          }
        );

        const data = await response.json();
        if (data.audioContent) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
          audio.playbackRate = rate;
          audioPlayerRef.current = audio;

          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => setIsSpeaking(false);
          audio.play();
        } else {
          throw new Error(data.error?.message || 'Synthesis failed');
        }
      } catch (err) {
        alert(`Google Cloud TTS Error: ${err.message}`);
        setIsSpeaking(false);
      }
      return;
    }

    // AGENT 3: Web Speech API Browser Native Fallback
    if (audioEngine === 'web-speech') {
      if (!('speechSynthesis' in window)) {
        alert('Web Speech API is not supported in this browser.');
        setIsSpeaking(false);
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      const nativeVoice = voices.find(v =>
        v.lang.toLowerCase() === selectedLang.id.toLowerCase() ||
        v.lang.toLowerCase().startsWith(selectedLang.id.split('-')[0])
      );

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLang.id;
      utterance.rate = rate;
      if (nativeVoice) utterance.voice = nativeVoice;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
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
    if (audioPlayerRef.current) audioPlayerRef.current.pause();
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

            {/* Audio Engine Selection Selector */}
            <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                AUDIO ENGINE AGENT:
              </label>
              <select
                value={audioEngine}
                onChange={(e) => setAudioEngine(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', fontSize: '13px' }}
              >
                <option value="vercel">Vercel Proxy Agent (Google Translate TTS)</option>
                <option value="google-cloud">Google Cloud TTS Agent (Native Quality)</option>
                <option value="web-speech">Browser Native Agent (Web Speech API)</option>
              </select>

              {audioEngine === 'google-cloud' && (
                <input
                  type="password"
                  placeholder="Enter Google Cloud API Key..."
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                  style={{ width: '100%', marginTop: '8px', padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              )}
            </div>

            {/* Pace Selector */}
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
                      cursor: 'pointer'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Audio Visualizer */}
            {isListening && (
              <div style={{ background: '#18181b', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <canvas ref={canvasRef} width={380} height={50} style={{ width: '100%', height: '50px' }} />
                <span style={{ fontSize: '12px', color: '#10b981' }}>Listening at pace...</span>
              </div>
            )}

            {/* Controls */}
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

            {/* Word-by-Word Feedback */}
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

            {/* Lingo Selection */}
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
