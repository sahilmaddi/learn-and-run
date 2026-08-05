import React, { useState, useRef } from 'react';
import { Volume2, Gauge } from 'lucide-react';

const SPANISH_PHRASES = [
  {
    phrase: "Vamos despacio",
    ipa: "[ˈba.mos ðesˈpa.sjo]",
    respelling: "BAH-mohs des-PAH-syoh",
    translation: "Let's walk / go slowly",
    note: "Starts with a soft 'B' sound in Spanish, not English 'V'."
  },
  {
    phrase: "Andemos despacio",
    ipa: "[anˈde.mos ðesˈpa.sjo]",
    respelling: "ahn-DEH-mohs des-PAH-syoh",
    translation: "Let's walk slowly (inclusive command)",
    note: "Primary stress falls on 'DEH'."
  },
  {
    phrase: "Caminemos despacio",
    ipa: "[ka.miˈne.mos ðesˈpa.sjo]",
    respelling: "kah-mee-NEH-mohs des-PAH-syoh",
    translation: "Let's walk slowly (from 'caminar')",
    note: "Primary stress falls on 'NEH'."
  },
  {
    phrase: "Podemos ir despacio",
    ipa: "[poˈde.mos iɾ ðesˈpa.sjo]",
    respelling: "poh-DEH-mohs eer des-PAH-syoh",
    translation: "We can go slowly",
    note: "Polite option. 'Podemos' and 'ir' merge naturally in fast speech."
  },
  {
    phrase: "Despacito",
    ipa: "[des.paˈsi.to]",
    respelling: "des-pah-SEE-toh",
    translation: "Slowly / nice and slow",
    note: "Diminutive form. Stress shifts from 'PA' to 'SEE'."
  }
];

const SPEED_PRESETS = [
  { label: '0.6x Ultra Slow', rate: 0.6 },
  { label: '0.8x Slow Pace', rate: 0.8 },
  { label: '1.0x Normal Speed', rate: 1.0 }
];

export default function SpanishPronunciationGuide() {
  const [selected, setSelected] = useState(SPANISH_PHRASES[0]);
  const [playingPhrase, setPlayingPhrase] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.8);
  const audioRef = useRef(null);

  const handlePlayAudio = (e, item, rateOverride) => {
    if (e) e.stopPropagation();
    setSelected(item);

    const activeRate = rateOverride || speechRate;

    // Stop existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setPlayingPhrase(item.phrase);

    // Method 1: HTML5 Audio via Serverless Proxy Route
    const audioUrl = `/api/tts?text=${encodeURIComponent(item.phrase)}&lang=es-MX`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = activeRate;
    audioRef.current = audio;

    audio.onended = () => setPlayingPhrase(null);
    audio.onerror = () => {
      // Method 2: Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(item.phrase);
        utterance.lang = 'es-MX';
        utterance.rate = activeRate;
        utterance.onend = () => setPlayingPhrase(null);
        utterance.onerror = () => setPlayingPhrase(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingPhrase(null);
      }
    };

    audio.play().catch(() => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(item.phrase);
        utterance.lang = 'es-MX';
        utterance.rate = activeRate;
        utterance.onend = () => setPlayingPhrase(null);
        utterance.onerror = () => setPlayingPhrase(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingPhrase(null);
      }
    });
  };

  const handleRateChange = (rate) => {
    setSpeechRate(rate);
    if (audioRef.current && playingPhrase) {
      audioRef.current.playbackRate = rate;
    } else if (selected) {
      handlePlayAudio(null, selected, rate);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'system-ui, sans-serif', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#111827' }}>
        Spanish Walking Phrases & Audio Guide
      </h2>

      {/* Speed Controls */}
      <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>
          <Gauge size={16} /> Select Playback Speed:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset.rate}
              onClick={() => handleRateChange(preset.rate)}
              style={{
                padding: '8px 4px',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: speechRate === preset.rate ? '2px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: speechRate === preset.rate ? '#2563eb' : '#ffffff',
                color: speechRate === preset.rate ? '#ffffff' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
        {SPANISH_PHRASES.map((item) => {
          const isSelected = selected.phrase === item.phrase;
          const isPlaying = playingPhrase === item.phrase;

          return (
            <li
              key={item.phrase}
              onClick={() => setSelected(item)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderRadius: '6px',
                marginBottom: '6px',
                backgroundColor: isSelected ? '#f0f4ff' : '#f9f9f9',
                borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong style={{ color: '#0f172a' }}>{item.phrase}</strong>
                <span style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: '10px' }}>
                  ({item.translation})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ fontSize: '0.85rem', color: '#4b5563' }}>{item.ipa}</code>
                <button
                  onClick={(e) => handlePlayAudio(e, item)}
                  title="Play pronunciation"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    borderRadius: '50%',
                    border: 'none',
                    background: isPlaying ? '#2563eb' : '#e2e8f0',
                    color: isPlaying ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div style={{ padding: '14px', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1f2937' }}>{selected.phrase}</h3>
            <button
              onClick={(e) => handlePlayAudio(e, selected)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <Volume2 size={16} />
              {playingPhrase === selected.phrase ? `Playing (${speechRate}x)...` : `Listen (${speechRate}x)`}
            </button>
          </div>
          <p style={{ margin: '4px 0' }}><strong>IPA:</strong> <code>{selected.ipa}</code></p>
          <p style={{ margin: '4px 0' }}><strong>Phonetic Respelling:</strong> <span>{selected.respelling}</span></p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#4b5563' }}><em>{selected.note}</em></p>
        </div>
      )}
    </div>
  );
}
