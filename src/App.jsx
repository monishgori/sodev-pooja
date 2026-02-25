import React, { useState, useEffect, useRef } from 'react';
import { chalisaData } from './data/chalisa';
import { mantras } from './data/mantras';
import { bhajans } from './data/bhajans';
import { aartis } from './data/aartis';
import { stutis } from './data/stutis';
import { videos } from './data/videos';
import { quotes } from './data/quotes';
// Web haptics fallback
const ImpactStyle = {
  Light: 10,
  Medium: 20,
  Heavy: 30
};

function App() {
  // Safe Storage Utility
  const getSafeStorage = (key, fallback) => {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (e) {
      console.warn("Storage access failed:", e);
      return fallback;
    }
  };

  const [currentMode, setCurrentMode] = useState(() => getSafeStorage('pooja_mode', 'chalisa'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState(() => getSafeStorage('pooja_lang', 'gujarati'));
  const [repeatCount, setRepeatCount] = useState(() => Number(getSafeStorage('pooja_repeat', 1)));
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [flowers, setFlowers] = useState([]);
  const [isLyricsVisible, setIsLyricsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeVerse, setActiveVerse] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(() => Number(getSafeStorage('pooja_index', 0)));
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null); // in minutes
  const [timerId, setTimerId] = useState(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [dailyQuote, setDailyQuote] = useState({ gujarati: '', hindi: '', english: '' });
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // Save Preferences
  useEffect(() => {
    try {
      localStorage.setItem('pooja_mode', currentMode);
      localStorage.setItem('pooja_lang', language);
      localStorage.setItem('pooja_repeat', repeatCount);
      localStorage.setItem('pooja_index', activeItemIndex);
    } catch (e) {
      console.warn("Saving to storage failed:", e);
    }
  }, [currentMode, language, repeatCount, activeItemIndex]);

  const audioRef = useRef(null);
  const bellAudioRef = useRef(null);
  const shankhAudioRef = useRef(null);

  const backgroundImage = '/assets/images/1.png';

  // Background Slider & Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'gujarati') {
      if (hour < 12) return "શુભ પ્રભાત";
      if (hour < 17) return "શુભ બપોર";
      return "શુભ સંધ્યા";
    } else {
      if (hour < 12) return "शुभ प्रभात";
      if (hour < 17) return "शुभ दोपहर";
      return "शुभ संध्या";
    }
  };

  const triggerHaptic = (style = ImpactStyle.Medium) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(style);
    }
  };

  useEffect(() => {
    // Select daily quote based on current date (Deterministic)
    const today = new Date();
    // Using simple hash: (Year * 1000) + (Month * 40) + Date
    const dayHash = (today.getFullYear() * 1000) + (today.getMonth() * 40) + today.getDate();
    const quoteIndex = dayHash % quotes.length;
    setDailyQuote(quotes[quoteIndex]);
  }, []);


  // Sleep Timer logic
  useEffect(() => {
    if (sleepTimer) {
      if (timerId) clearTimeout(timerId);
      const id = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          setSleepTimer(null);
          alert("Sleep timer finished. Pooja paused.");
        }
      }, sleepTimer * 60000);
      setTimerId(id);
    }
    return () => { if (timerId) clearTimeout(timerId); };
  }, [sleepTimer]);

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SODEV POOJA',
        text: 'Download SODEV POOJA app for Chalisa, Mantras and Bhajans!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing is not supported on this browser/device.");
    }
  };




  // Time Update Handler
  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(cur);
      if (dur && isFinite(dur) && dur > 0 && duration !== dur) {
        setDuration(dur);
      }
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && audio.duration && isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
  };

  const handleSeekEnd = (e) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setIsSeeking(false);
  };

  const formatTime = (time) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };


  // Auto-scroll logic removed as per user request to revoke auto-sync

  // Flower Shower Logic
  const startFlowerShower = () => {
    const flowerTypes = ['🌸', '🌼', '🌺', '🌹', '🌻', '🌷', '🏵️'];
    const newFlowers = Array.from({ length: 25 }).map((_, i) => ({
      id: Date.now() + i,
      type: flowerTypes[Math.floor(Math.random() * flowerTypes.length)],
      left: Math.random() * 100 + '%',
      delay: Math.random() * 2 + 's',
      duration: 4 + Math.random() * 2 + 's'
    }));
    setFlowers(prev => [...prev, ...newFlowers]);
    setTimeout(() => {
      setFlowers(prev => prev.filter(f => !newFlowers.find(nf => nf.id === f.id)));
    }, 6000);
  };

  const ringBell = () => {
    triggerHaptic(ImpactStyle.Heavy);
    setIsBellRinging(true);
    if (bellAudioRef.current) {
      bellAudioRef.current.currentTime = 0;
      bellAudioRef.current.play().catch(() => { });
    }
    setTimeout(() => setIsBellRinging(false), 500);
  };

  const playShankh = () => {
    triggerHaptic(ImpactStyle.Heavy);
    if (shankhAudioRef.current) {
      shankhAudioRef.current.currentTime = 0;
      shankhAudioRef.current.play().catch(() => { });
    }
  };

  const toggleDiya = () => {
    triggerHaptic();
    setIsDiyaLit(!isDiyaLit);
  };


  const togglePlay = () => {
    triggerHaptic(ImpactStyle.Medium);
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().catch(error => {
        console.error("Playback failed:", error);
      });
    } else {
      audioRef.current.pause();
    }
  };

  // Reset playback only when the actual audio source changes
  useEffect(() => {
    const currentAudioSrc =
      currentMode === 'chalisa' ? "/assets/audio/chalisa.mp3" :
        currentMode === 'mantras' ? (mantras[activeItemIndex]?.audio || "/assets/audio/mantra.mp3") :
          currentMode === 'bhajans' ? (bhajans[activeItemIndex]?.audio || "/assets/audio/bhajan.mp3") :
            currentMode === 'aartis' ? (aartis[activeItemIndex]?.audio || "/assets/audio/aarti.mp3") :
              currentMode === 'videos' ? "" :
                (stutis[activeItemIndex]?.audio || "/assets/audio/Stuti.mp3");

    const prevSrc = audioRef.current?.getAttribute('data-prev-src');

    if (prevSrc !== currentAudioSrc) {
      setCurrentTime(0);
      setDuration(0);
      setCurrentRepeat(0);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = currentAudioSrc; // Explicitly update src
        audioRef.current.load(); // Force browser to fetch the new file properly
        audioRef.current.setAttribute('data-prev-src', currentAudioSrc);
      }
    }
  }, [currentMode, activeItemIndex]);

  const startReading = (mode) => {
    triggerHaptic(ImpactStyle.Light);
    setCurrentMode(mode);
    setIsLyricsVisible(true);
    setIsLibraryOpen(false);
    setActiveItemIndex(0); // Reset to first item
    setIsPlaying(false); // Stop any previous audio
    if (audioRef.current) audioRef.current.pause();
  };

  return (
    <div className={`app-container ${isLyricsVisible ? 'view-mode' : 'home-mode'}`}>
      {/* Diya (Lamp) */}
      <div className={`diya-container ${isDiyaLit ? 'lit' : ''}`}>
        <div className="diya-glow"></div>
        <div className="diya-base">🪔</div>
      </div>
      {/* Ambient Particles */}
      <div className="particles-container">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: Math.random() * 5 + 's',
            width: 2 + Math.random() * 3 + 'px',
            height: 2 + Math.random() * 3 + 'px'
          }}></div>
        ))}
      </div>
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={(e) => {
          console.error("Audio error details:", e.target.error);
          setIsPlaying(false);
        }}
        onEnded={() => {
          if (currentRepeat + 1 < repeatCount) {
            setCurrentRepeat(prev => prev + 1);
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              setCurrentTime(0);
              audioRef.current.play().catch(() => { });
            }
          } else {
            setIsPlaying(false);
            setCurrentRepeat(0);
            if (audioRef.current) setCurrentTime(audioRef.current.duration);
          }
        }} />
      <audio ref={bellAudioRef} src="/assets/audio/bell.mp3" />
      <audio ref={shankhAudioRef} src="/assets/audio/shankh.mp3" />

      {/* Flower Shower */}
      {flowers.map(flower => (
        <div key={flower.id} className="flower" style={{
          left: flower.left,
          animationDelay: flower.delay,
          animationDuration: flower.duration
        }}>{flower.type}</div>
      ))}

      {/* Background Section */}
      <div className="background-slider" onClick={() => setIsLyricsVisible(false)}>
        <img src={backgroundImage} alt="SODEV" className={`bg-image active ${isPlaying ? 'pulse-visualizer' : ''}`} />
        <div className="bg-overlay"></div>
      </div>

      {/* Top Bar */}
      <header className="top-bar">
        <div className="divine-centerpiece">
          <div className="divine-name">ૐ શ્રી સાદેવપીર દાદાય નમઃ</div>
        </div>

        <div className="top-bar-side-content">
          <div className="header-greeting" onClick={() => setIsLyricsVisible(false)}>
            <div className="greeting-text">{getGreeting()}</div>
          </div>

          {!isLyricsVisible && !isFocusMode && (dailyQuote.gujarati || dailyQuote.hindi) && (
            <div className="daily-quote-card glass-panel">
              <div className="quote-header">
                <span className="quote-icon">❝</span>
                <span className="quote-label">{language === 'gujarati' ? 'આજનો વિચાર' : 'आज का विचार'}</span>
              </div>
              <div className="quote-content">
                <div className="main-quote">
                  {dailyQuote[language] || dailyQuote.gujarati || dailyQuote.hindi}
                </div>
                {language !== 'gujarati' && dailyQuote.gujarati && <div className="sub-quote guj">{dailyQuote.gujarati}</div>}
                {language !== 'hindi' && dailyQuote.hindi && <div className="sub-quote hindi">{dailyQuote.hindi}</div>}
              </div>
            </div>
          )}

        </div>
      </header>

      <div className="bottom-dashboard-container">

        {/* POOJA DOCK: Celestial Duo-Island */}
        <div className="pooja-dock">

          {/* Island 1: Rituals */}
          <div className="ritual-island glass-panel">
            <div className="ritual-scroller">
              <div className="dock-icon-item" onClick={ringBell}>
                <div className={`dock-icon ${isBellRinging ? 'bell-ringing' : ''}`}>🔔</div>
                <span>Bell</span>
              </div>
              <div className="dock-icon-item" onClick={playShankh}>
                <div className="dock-icon">🐚</div>
                <span>Shankh</span>
              </div>
              <div className="dock-icon-item" onClick={startFlowerShower}>
                <div className="dock-icon">🌸</div>
                <span>Flowers</span>
              </div>
              <div className="dock-icon-item" onClick={toggleDiya}>
                <div className={`dock-icon ${isDiyaLit ? 'active' : ''}`}>🪔</div>
                <span>Lamp</span>
              </div>
            </div>
          </div>

          {/* Island 2: Main Controls */}
          <div className="control-island glass-panel">
            <div className="dock-controls-row">
              <button
                className={`dock-lib-btn ${isLibraryOpen ? 'active' : ''}`}
                onClick={() => {
                  triggerHaptic(ImpactStyle.Light);
                  setIsLibraryOpen(!isLibraryOpen);
                }}
              >
                ⋯
              </button>

              <button className="dock-play-btn" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>

              <div className="dock-control-cluster">
                <div className="language-pill-container mini">
                  <button
                    className={`lang-pill-btn ${language === 'gujarati' ? 'active' : ''}`}
                    onClick={() => { setLanguage('gujarati'); triggerHaptic(); }}
                  >
                    GUJ
                  </button>
                  <button
                    className={`lang-pill-btn ${language === 'hindi' ? 'active' : ''}`}
                    onClick={() => { setLanguage('hindi'); triggerHaptic(); }}
                  >
                    HIN
                  </button>
                </div>

                <div className="repeat-pill-container">
                  <span className="repeat-icon">🔁</span>
                  <select
                    value={repeatCount}
                    onChange={(e) => setRepeatCount(Number(e.target.value))}
                    className="repeat-mini-select"
                  >
                    <option value="1">1x</option>
                    <option value="3">3x</option>
                    <option value="11">11x</option>
                    <option value="21">21x</option>
                    <option value="108">108x</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="dock-seek-row">
              <span className="dock-time">{formatTime(currentTime)}</span>
              <div className="seek-container">
                <div
                  className="seek-fill"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
                <input
                  type="range"
                  className="seek-bar"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onMouseDown={() => setIsSeeking(true)}
                  onTouchStart={() => setIsSeeking(true)}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  onChange={handleSeek}
                />
              </div>
              <span className="dock-time">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DEVOTIONAL LIBRARY TRAY (Independent Layer) */}
      {isLibraryOpen && <div className="tray-backdrop" onClick={() => setIsLibraryOpen(false)}></div>}
      <div className={`library-tray glass-panel ${isLibraryOpen ? 'active' : ''}`}>
        <div className="tray-handle" onClick={() => setIsLibraryOpen(false)}></div>
        <div className="tray-title">Devotional Library</div>

        <div className="library-grid">
          <button className="library-card" onClick={() => startReading('chalisa')}>
            <span className="lib-hindi">
              {language === 'gujarati' ? 'સોદેવ ચાલીસા' : 'सोदेव चालीसा'}
            </span>
            <span className="lib-eng">CHALISA</span>
          </button>
          <button className="library-card" onClick={() => startReading('mantras')}>
            <span className="lib-hindi">
              {language === 'gujarati' ? 'સિદ્ધ મંત્ર' : 'सिद्ध मंत्र'}
            </span>
            <span className="lib-eng">MANTRAS</span>
          </button>
          <button className="library-card" onClick={() => startReading('bhajans')}>
            <span className="lib-hindi">
              {language === 'gujarati' ? 'ભજન સંગ્રહ' : 'भजन संग्रह'}
            </span>
            <span className="lib-eng">BHAJANS</span>
          </button>
          <button className="library-card" onClick={() => startReading('aartis')}>
            <span className="lib-hindi">
              {language === 'gujarati' ? 'સોદેવ આરતી' : 'सोदेव आरती'}
            </span>
            <span className="lib-eng">AARTI</span>
          </button>
          <button className="library-card library-card-wide" onClick={() => startReading('stutis')}>
            <span className="lib-hindi">
              {language === 'gujarati' ? 'સોદેવ સ્તુતિ' : 'सोदेव स्तुति'}
            </span>
            <span className="lib-eng">STUTI</span>
          </button>
          <button className="library-card library-card-wide" style={{ background: 'linear-gradient(135deg, #ff000033, #00000033)', borderColor: '#ff0000' }} onClick={() => startReading('videos')}>
            <span className="lib-hindi">
              {language === 'gujarati' ? 'સોદેવ વિડિયો' : 'सोदेव वीडियो'}
            </span>
            <span className="lib-eng" style={{ color: '#ff4444' }}>DIVINE VIDEOS</span>
          </button>
        </div>
        <a href="/privacy.html" className="privacy-link" target="_blank" rel="noopener noreferrer">
          PRIVACY POLICY
        </a>
      </div>

      {/* LYRICS VIEW */}
      {isLyricsVisible && (
        <main className="lyrics-container">
          <div className="back-btn glass-panel" onClick={() => setIsLyricsVisible(false)}>
            <span className="back-icon">←</span> {language === 'gujarati' ? 'વાંચન બંધ કરો' : 'पठन बंद करें'}
          </div>

          <div className="page-header">
            <div className="page-title">
              {language === 'gujarati' ? (
                currentMode === 'chalisa' ? 'સોદેવ ચાલીસા' :
                  currentMode === 'mantras' ? 'સિદ્ધ મંત્ર સંગ્રહ' :
                    currentMode === 'bhajans' ? 'ભજન સંગ્રહ' :
                      currentMode === 'aartis' ? 'સોદેવ આરતી' :
                        currentMode === 'videos' ? 'સોદેવ વિડિયો' : 'સોદેવ સ્તુતિ'
              ) : (
                currentMode === 'chalisa' ? 'सोदेव चालीसा' :
                  currentMode === 'mantras' ? 'सिद्ध मंत्र संग्रह' :
                    currentMode === 'bhajans' ? 'भजन संग्रह' :
                      currentMode === 'aartis' ? 'सोदेव आरती' :
                        currentMode === 'videos' ? 'सोदेव वीडियो' : 'सोदेव स्तुति'
              )}
            </div>
            <div className="page-subtitle">
              {currentMode === 'chalisa' && currentRepeat > 0 && `Jaap ${currentRepeat + 1} of ${repeatCount}`}
            </div>
          </div>

          {currentMode === 'chalisa' ? (
            chalisaData.lyrics.map((verse, index) => (
              <div key={index} className={`verse glass-panel ${activeVerse === index ? 'active-verse' : ''}`}>
                <div className="hindi-text">{verse[language] || verse.gujarati || verse.hindi}</div>
              </div>
            ))
          ) : currentMode === 'mantras' ? (
            mantras.map((mantra, index) => (
              <div
                key={index}
                className={`verse glass-panel ${activeItemIndex === index ? 'active-verse' : ''}`}
                onClick={() => {
                  if (activeItemIndex !== index) {
                    setActiveItemIndex(index);
                  }
                }}
              >
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                  {mantra.name} {activeItemIndex === index && ' (Selected)'}
                </div>
                <div className="hindi-text">{mantra[language] || mantra.gujarati || mantra.hindi}</div>
              </div>
            ))
          ) : currentMode === 'bhajans' ? (
            bhajans.map((bhajan, index) => (
              <div
                key={index}
                className={`verse glass-panel ${activeItemIndex === index ? 'active-verse' : ''}`}
                onClick={() => {
                  if (activeItemIndex !== index) {
                    setActiveItemIndex(index);
                  }
                }}
              >
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                  {bhajan.name} {activeItemIndex === index && ' (Selected)'}
                </div>
                <div className="hindi-text">{bhajan[language] || bhajan.gujarati || bhajan.hindi}</div>
              </div>
            ))
          ) : currentMode === 'aartis' ? (
            aartis.map((aarti, index) => (
              <div
                key={index}
                className={`verse glass-panel ${activeItemIndex === index ? 'active-verse' : ''}`}
                onClick={() => setActiveItemIndex(index)}
              >
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                  {aarti.name}
                </div>
                <div className="hindi-text">{aarti[language] || aarti.gujarati || aarti.hindi}</div>
              </div>
            ))
          ) : currentMode === 'videos' ? (
            <div className="videos-list" style={{ display: 'grid', gap: '15px', padding: '10px' }}>
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="video-item glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '12px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveItemIndex(index)}
                >
                  <div style={{
                    width: '100px',
                    height: '60px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative'
                  }}>
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt={video.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(255, 0, 0, 0.8)',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem'
                    }}>▶</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>{video.title}</div>
                    <div className="hindi-text" style={{ fontSize: '1rem', marginTop: '4px', marginBottom: '0' }}>{video[language] || video.gujarati || video.hindi}</div>
                  </div>
                </div>
              ))}

              {/* Fixed Video Player Overlay when active */}
              {activeItemIndex !== null && currentMode === 'videos' && (
                <div style={{
                  position: 'fixed',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0,0,0,0.9)',
                  zIndex: 10000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }} onClick={() => setActiveItemIndex(null)}>
                  <div style={{ width: '100%', maxWidth: '800px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveItemIndex(null)}
                      style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '0',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                      }}
                    >✕</button>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                      <iframe
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px' }}
                        src={`https://www.youtube.com/embed/${videos[activeItemIndex]?.youtubeId}?autoplay=1`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            stutis.map((stuti, index) => (
              <div
                key={index}
                className={`verse glass-panel ${activeItemIndex === index ? 'active-verse' : ''}`}
                onClick={() => setActiveItemIndex(index)}
              >
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                  {stuti.name}
                </div>
                <div className="hindi-text">{stuti[language] || stuti.gujarati || stuti.hindi}</div>
              </div>
            ))
          )}
        </main>
      )}

      {/* No separate footer - all is in dashboard */}
    </div>
  );
}

export default App;
