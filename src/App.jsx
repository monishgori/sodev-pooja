import React, { useState, useEffect, useRef } from 'react';
import { chalisaData } from './data/chalisa';
import { mantras } from './data/mantras';
import { bhajans } from './data/bhajans';
import { aartis } from './data/aartis';
import { stutis } from './data/stutis';
import { quotes } from './data/quotes';
import { videos } from './data/videos';
import { historyData } from './data/history';
// Web haptics fallback
const ImpactStyle = {
  Light: 10,
  Medium: 20,
  Heavy: 30
};

function App() {
  const [currentMode, setCurrentMode] = useState(localStorage.getItem('pooja_mode') || 'chalisa');
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('pooja_lang') || 'gujarati');
  const [repeatCount, setRepeatCount] = useState(Number(localStorage.getItem('pooja_repeat')) || 1);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [flowers, setFlowers] = useState([]);
  const [isLyricsVisible, setIsLyricsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeVerse, setActiveVerse] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(Number(localStorage.getItem('pooja_index')) || 0);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null); // in minutes
  const [timerId, setTimerId] = useState(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [dailyQuote, setDailyQuote] = useState({ gujarati: '', hindi: '', english: '' });
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

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

  // Save Preferences
  useEffect(() => {
    localStorage.setItem('pooja_mode', currentMode);
    localStorage.setItem('pooja_lang', language);
    localStorage.setItem('pooja_repeat', repeatCount);
    localStorage.setItem('pooja_index', activeItemIndex);
  }, [currentMode, language, repeatCount, activeItemIndex]);

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




  // Audio Instance Managed by Ref
  const audioRef = useRef(null);
  const bellAudioRef = useRef(null);
  const shankhAudioRef = useRef(null);

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

  // Auto-scroll logic: When activeVerse changes, scroll the lyrics container
  useEffect(() => {
    if (isLyricsVisible && isPlaying) {
      const activeElement = document.querySelector('.active-verse');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeVerse, isLyricsVisible, isPlaying]);

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

  const toggleDiya = () => {
    triggerHaptic();
    setIsDiyaLit(!isDiyaLit);
  };

  // Helper to create and setup a new audio instance
  const createAudioInstance = (path) => {
    // Stop previous if exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    // Create new instance
    console.log("Loading audio path:", path);
    const audio = new Audio(path);

    audio.onerror = (e) => {
      console.log("Audio failed to load from path:", audio.src);
      console.error("Audio Error Details:", audio.error);
      setIsPlaying(false);
    };

    audio.ontimeupdate = () => {
      if (!isSeeking) {
        const cur = audio.currentTime;
        const dur = audio.duration;
        setCurrentTime(cur);
        if (dur && isFinite(dur) && dur > 0) {
          setDuration(dur);
        }

        // Lyrics Sync
        if (currentMode === 'chalisa') {
          const verseCount = chalisaData.lyrics.length;
          const index = Math.floor((cur / (dur || 1)) * verseCount);
          const safeIndex = Math.min(index, verseCount - 1);
          if (safeIndex !== activeVerse) setActiveVerse(safeIndex);
        }
      }
    };

    audio.onloadedmetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.onended = () => {
      if (currentRepeat + 1 < repeatCount) {
        setCurrentRepeat(prev => prev + 1);
        audio.currentTime = 0;
        setCurrentTime(0);
        console.log("Replaying track, path:", path);
        audio.play().catch(e => console.error("Replay error:", e));
      } else {
        setIsPlaying(false);
        setCurrentRepeat(0);
        setCurrentTime(audio.duration);
      }
    };

    audioRef.current = audio;
    return audio;
  };

  // Effect to handle source changes (switching tracks)
  useEffect(() => {
    const rawAudioSrc =
      currentMode === 'chalisa' ? "/assets/audio/chalisa1.mp3" :
        currentMode === 'mantras' ? (mantras[activeItemIndex]?.audio || "/assets/audio/mantra.mp3") :
          currentMode === 'bhajans' ? (bhajans[activeItemIndex]?.audio || "/assets/audio/bhajan.mp3") :
            currentMode === 'aartis' ? (aartis[activeItemIndex]?.audio || "/assets/audio/aarti.mp3") :
              currentMode === 'stutis' ? (stutis[activeItemIndex]?.audio || "/assets/audio/stuti.m4a") :
                "/assets/audio/chalisa1.mp3";

    console.log(`Mode: ${currentMode} | Index: ${activeItemIndex} | Resolved Source: ${rawAudioSrc}`);

    setCurrentTime(0);
    setDuration(0);
    setCurrentRepeat(0);
    setIsPlaying(false);

    createAudioInstance(rawAudioSrc);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentMode, activeItemIndex]);

  const ringBell = () => {
    triggerHaptic(ImpactStyle.Heavy);
    setIsBellRinging(true);
    if (!bellAudioRef.current) {
      bellAudioRef.current = new Audio("/assets/audio/bell.mp3");
      bellAudioRef.current.onerror = () => console.log("Bell audio failed to load");
    }
    bellAudioRef.current.currentTime = 0;
    bellAudioRef.current.play().catch(() => { });
    setTimeout(() => setIsBellRinging(false), 500);
  };

  const playShankh = () => {
    triggerHaptic(ImpactStyle.Heavy);
    if (!shankhAudioRef.current) {
      shankhAudioRef.current = new Audio("/assets/audio/shankh.mp3");
      shankhAudioRef.current.onerror = () => console.log("Shankh audio failed to load");
    }
    shankhAudioRef.current.currentTime = 0;
    shankhAudioRef.current.play().catch(() => { });
  };

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

              <button className="dock-play-btn" onClick={() => {
                triggerHaptic(ImpactStyle.Medium);
                console.log(`[DOCK PLAY] Mode: ${currentMode} | isPlaying: ${isPlaying} | Audio state: ${audioRef.current?.paused ? 'paused' : 'playing'}`);
                if (audioRef.current) {
                  if (isPlaying) {
                    console.log("[DOCK] Pausing:", audioRef.current.src);
                    audioRef.current.pause();
                    setIsPlaying(false);
                  } else {
                    console.log("[DOCK] Playing:", audioRef.current.src);
                    audioRef.current.play()
                      .then(() => {
                        console.log("[DOCK] Play Success");
                        setIsPlaying(true);
                      })
                      .catch(e => {
                        console.error("[DOCK] Play Error:", e.message);
                        console.error("Path attempted:", audioRef.current.src);
                      });
                  }
                } else {
                  console.error("[DOCK] No audio instance found!");
                }
              }}>
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
          <button className="library-card" onClick={() => startReading('stutis')}>
            <span className="lib-hindi">
              {language === 'gujarati' ? 'સોદેવ સ્તુતિ' : 'सोदेव स्तुति'}
            </span>
            <span className="lib-eng">STUTI</span>
          </button>
          <button className="library-card" onClick={() => startReading('history')}>
            <span className="lib-hindi">
              {language === 'gujarati' ? 'જીવન ચરિત્ર' : 'जीवन चरित्र'}
            </span>
            <span className="lib-eng">HISTORY</span>
          </button>
          <button className="library-card library-card-wide" onClick={() => startReading('videos')}>
            <span className="lib-hindi">
              {language === 'gujarati' ? 'યુટ્યુબ ભક્તિ' : 'यूट्यूब भक्ति'}
            </span>
            <span className="lib-eng">YOUTUBE VIDEOS</span>
          </button>
        </div>
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
                        currentMode === 'stutis' ? 'સોદેવ સ્તુતિ' :
                          currentMode === 'history' ? 'શ્રી સોદેવપીર જીવન ચરિત્ર' :
                            currentMode === 'videos' ? 'સોદેવ ભક્તિ વીડિયો' : 'સોદેવ પૂજા'
              ) : (
                currentMode === 'chalisa' ? 'सोदेव चालीसा' :
                  currentMode === 'mantras' ? 'सिद्ध मंत्र संग्रह' :
                    currentMode === 'bhajans' ? 'भजन संग्रह' :
                      currentMode === 'aartis' ? 'सोदेव आरती' :
                        currentMode === 'stutis' ? 'सोदेव स्तुति' :
                          currentMode === 'history' ? 'श्री सोदेवपीर जीवन चरित्र' :
                            currentMode === 'videos' ? 'सोदेव भक्ति वीडियो' : 'सोदेव पूजा'
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
                  setActiveItemIndex(index);
                  setIsPlaying(false);
                  if (audioRef.current) {
                    audioRef.current.pause();
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
                  setActiveItemIndex(index);
                  setIsPlaying(false);
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
                onClick={() => {
                  setActiveItemIndex(index);
                  setIsPlaying(false);
                }}
              >
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                  {aarti.name} {activeItemIndex === index && ' (Selected)'}
                </div>
                <div className="hindi-text">{aarti[language] || aarti.gujarati || aarti.hindi}</div>
              </div>
            ))
          ) : currentMode === 'stutis' ? (
            stutis.map((stuti, index) => (
              <div
                key={index}
                className={`verse glass-panel ${activeItemIndex === index ? 'active-verse' : ''}`}
                onClick={() => {
                  setActiveItemIndex(index);
                  setIsPlaying(false);
                }}
              >
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                  {stuti.name} {activeItemIndex === index && ' (Selected)'}
                </div>
                <div className="hindi-text">{stuti[language] || stuti.gujarati || stuti.hindi}</div>
              </div>
            ))
          ) : currentMode === 'history' ? (
            <div className="history-section">
              {historyData.lifeStory.content.map((item) => (
                <div key={item.id} className="verse glass-panel">
                  <div style={{ color: 'var(--secondary)', fontSize: '1.2rem', marginBottom: '15px' }}>
                    {item.subtitle[language]}
                  </div>
                  <div className="hindi-text" style={{ fontSize: '1.1rem', textAlign: 'left' }}>
                    {item.text[language]}
                  </div>
                </div>
              ))}
              <div className="page-header" style={{ marginTop: '50px' }}>
                <div className="page-title">{language === 'gujarati' ? 'દાદાના ચમત્કારો' : 'दादा के चमत्कार'}</div>
              </div>
              {historyData.incidents.map((incident) => (
                <div key={incident.id} className="verse glass-panel">
                  <div style={{ color: 'var(--secondary)', fontSize: '1.2rem', marginBottom: '15px' }}>
                    {incident.title[language]}
                  </div>
                  <div className="hindi-text" style={{ fontSize: '1.1rem', textAlign: 'left' }}>
                    {incident.content[language]}
                  </div>
                </div>
              ))}
            </div>
          ) : currentMode === 'videos' ? (
            <div className="videos-grid-flow">
              {videos.map((vid) => (
                <div key={vid.id} className="verse glass-panel video-card-item">
                  <div style={{ color: 'var(--secondary)', fontSize: '1rem', marginBottom: '15px' }}>
                    {vid[language]}
                  </div>
                  <div className="video-container-wrapper">
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                      title={vid.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: '15px' }}
                    ></iframe>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </main>
      )}

      {/* No separate footer - all is in dashboard */}
    </div>
  );
}

export default App;
