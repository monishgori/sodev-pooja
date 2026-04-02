import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { LocalNotifications } from '@capacitor/local-notifications';
import { chalisaData } from './data/chalisa';
import { mantras } from './data/mantras';
import { bhajans } from './data/bhajans';
import { aartis } from './data/aartis';
import { stutis } from './data/stutis';
import { quotes } from './data/quotes';
import { videos } from './data/videos';
import { historyData } from './data/history';
import { policyData } from './data/policy';
// Web haptics fallback
const ImpactStyle = {
  Light: 10,
  Medium: 20,
  Heavy: 30
};

// Memoized Library Tray to prevent jumping/flickering on re-renders (Critical for iOS Safari)
const DevotionalLibrary = React.memo(({
  isLibraryOpen, setIsLibraryOpen, language, startReading, morningToggle, eveningToggle, isMorningOn, isEveningOn,
  morningTime, setMorningTime, eveningTime, setEveningTime
}) => {
  return (
    <>
      {isLibraryOpen && <div className="tray-backdrop" onClick={() => setIsLibraryOpen(false)}></div>}
      <div
        className={`library-tray glass-panel ${isLibraryOpen ? 'active' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tray-handle" onClick={() => setIsLibraryOpen(false)}></div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 10px' }}>
          <div className="tray-title" style={{ margin: 0 }}>Devotional Library</div>
        </div>

        <div className="library-grid">
          <button className="library-card" onClick={(e) => { e.stopPropagation(); startReading('chalisa'); }}>

            <span className="lib-hindi">
              {language === 'gujarati' ? 'દાદા ની ચાલીસા' : language === 'english' ? "Dada's Chalisa" : 'दादा की चालीसा'}
            </span>
            <span className="lib-eng">CHALISA</span>
          </button>
          <button className="library-card" onClick={(e) => { e.stopPropagation(); startReading('mantras'); }}>

            <span className="lib-hindi">
              {language === 'gujarati' ? 'દાદા ના મંત્ર' : language === 'english' ? "Dada's Mantras" : 'दादा के मंत्र'}
            </span>
            <span className="lib-eng">MANTRAS</span>
          </button>
          <button className="library-card" onClick={(e) => { e.stopPropagation(); startReading('bhajans'); }}>

            <span className="lib-hindi">
              {language === 'gujarati' ? 'દાદા ના ભજન' : language === 'english' ? "Dada's Bhajans" : 'दादा के भजन'}
            </span>
            <span className="lib-eng">BHAJANS</span>
          </button>
          <button className="library-card" onClick={(e) => { e.stopPropagation(); startReading('aartis'); }}>

            <span className="lib-hindi">
              {language === 'gujarati' ? 'દાદા ની આરતી' : language === 'english' ? "Dada's Aarti" : 'दादा की आरती'}
            </span>
            <span className="lib-eng">AARTI</span>
          </button>
          <button className="library-card" onClick={(e) => { e.stopPropagation(); startReading('stutis'); }}>

            <span className="lib-hindi">
              {language === 'gujarati' ? 'દાદા ની સ્તુતિ' : language === 'english' ? "Dada's Stuti" : 'दादा की स्तुति'}
            </span>
            <span className="lib-eng">STUTI</span>
          </button>
          <button className="library-card" onClick={(e) => { e.stopPropagation(); startReading('history'); }}>

            <span className="lib-hindi">
              {language === 'gujarati' ? 'દાદા નો ઇતિહાસ' : language === 'english' ? "Dada's History" : 'दादा का इतिहास'}
            </span>
            <span className="lib-eng">HISTORY</span>
          </button>
          <button className="library-card library-card-wide" onClick={(e) => { e.stopPropagation(); startReading('videos'); }}>
            <div className="wide-card-content">

              <div className="wide-text">
                <span className="lib-hindi" style={{ fontSize: '1.3rem' }}>
                  {language === 'gujarati' ? 'દાદા ના દર્શન' : language === 'english' ? "Dada's Darshan" : 'दादा के दर्शन'}
                </span>
                <span className="lib-eng">VIDEOS</span>
              </div>
            </div>
          </button>
        </div>

        <div className="settings-section" style={{ marginTop: '20px', padding: '0 15px' }}>
          <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {language === 'gujarati' ? 'દૈનિક સૂચનાઓ (Reminders)' : language === 'english' ? 'Daily Reminders' : 'दैनिक सूचनाएं (Reminders)'}
          </div>

          <div className="setting-row glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '12px 15px', marginBottom: '10px', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🌅</span>
                {language === 'gujarati' ? 'આજનો વિચાર' : language === 'english' ? 'Morning Quote' : 'सुबह का विचार'}
              </div>
              <div className={`switch ${isMorningOn ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); morningToggle(!isMorningOn); }}>
                <div className="switch-knob"></div>
              </div>
            </div>
            {isMorningOn && (
              <div className="time-picker-row" style={{ marginTop: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                  {language === 'gujarati' ? 'સમય પસંદ કરો:' : language === 'english' ? 'Select Time:' : 'समय चुनें:'}
                </span>
                <input
                  type="time"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                  className="settings-time-input"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>

          <div className="setting-row glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '12px 15px', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🪔</span>
                {language === 'gujarati' ? 'સાંજ ની આરતી' : language === 'english' ? 'Evening Aarti' : 'शाम की आरती'}
              </div>
              <div className={`switch ${isEveningOn ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); eveningToggle(!isEveningOn); }}>
                <div className="switch-knob"></div>
              </div>
            </div>
            {isEveningOn && (
              <div className="time-picker-row" style={{ marginTop: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                  {language === 'gujarati' ? 'સમય પસંદ કરો:' : language === 'english' ? 'Select Time:' : 'समय चुनें:'}
                </span>
                <input
                  type="time"
                  value={eveningTime}
                  onChange={(e) => setEveningTime(e.target.value)}
                  className="settings-time-input"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        </div>

        <div className="tray-privacy-footer" style={{ textAlign: 'center', padding: '25px 0 15px 0', opacity: 0.5 }}>
          <button
            onClick={(e) => { e.stopPropagation(); startReading('policy'); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.65rem',
              letterSpacing: '1px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            PRIVACY POLICY
          </button>
        </div>
      </div>
    </>
  );
});

function App() {
  const [currentMode, setCurrentMode] = useState(() => {
    try { return localStorage.getItem('pooja_mode') || 'chalisa'; } catch { return 'chalisa'; }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem('pooja_lang') || 'gujarati'; } catch { return 'gujarati'; }
  });
  const [repeatCount, setRepeatCount] = useState(() => {
    try { return Number(localStorage.getItem('pooja_repeat')) || 1; } catch { return 1; }
  });
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [flowers, setFlowers] = useState([]);
  const [isLyricsVisible, setIsLyricsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeVerse, setActiveVerse] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(() => {
    try { return Number(localStorage.getItem('pooja_index')) || 0; } catch { return 0; }
  });
  const [activeIncidentIndex, setActiveIncidentIndex] = useState(null);
  const [historyView, setHistoryView] = useState('menu'); // 'menu', 'lifeStory', 'incidents'
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Notification States
  const [morningNotification, setMorningNotification] = useState(() => {
    try { return localStorage.getItem('sodev_morning_notif') === 'true'; } catch { return false; }
  });
  const [eveningNotification, setEveningNotification] = useState(() => {
    try { return localStorage.getItem('sodev_evening_notif') === 'true'; } catch { return false; }
  });

  const [morningTime, setMorningTime] = useState(() => {
    try { return localStorage.getItem('sodev_morning_time') || '06:30'; } catch { return '06:30'; }
  });
  const [eveningTime, setEveningTime] = useState(() => {
    try { return localStorage.getItem('sodev_evening_time') || '18:30'; } catch { return '18:30'; }
  });

  // Handle Notification Scheduling
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permStatus = await LocalNotifications.checkPermissions();
        if (permStatus.display !== 'granted') {
          if (morningNotification || eveningNotification) {
            const reqStatus = await LocalNotifications.requestPermissions();
            if (reqStatus.display !== 'granted') {
              console.log('Permission not granted for notifications');
              setMorningNotification(false);
              setEveningNotification(false);
              return;
            }
          } else {
            return; // no perms and not trying to turn on
          }
        }

        // Cancel existing
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
        }

        const notificationsList = [];

        if (morningNotification) {
          const [h, m] = morningTime.split(':').map(Number);
          const quoteText = dailyQuote[language] || dailyQuote.hindi || "";
          const snippet = quoteText.length > 50 ? quoteText.substring(0, 50) + "..." : quoteText;

          notificationsList.push({
            title: language === 'gujarati' ? 'શુભ પ્રભાત ધન્ય દિવસ! 🌅' : language === 'english' ? 'Good Morning! 🌅' : 'शुभ प्रभात धन्य दिन! 🌅',
            body: snippet || (language === 'gujarati' ? 'તમારો આજનો વિચાર વાંચવા માટે ટચ કરો.' : language === 'english' ? 'Tap to read your thought of the day.' : 'आज का विचार पढ़ने के लिए टैप करें।'),
            id: 1,
            schedule: { on: { hour: h, minute: m }, allowWhileIdle: true }
          });
        }

        if (eveningNotification) {
          const [h, m] = eveningTime.split(':').map(Number);
          notificationsList.push({
            title: language === 'gujarati' ? 'આરતી નો સમય' : language === 'english' ? 'Evening Aarti Time' : 'आरती का समय',
            body: language === 'gujarati' ? 'શ્રી સોદેવપીર દાદા ની સાંજની આરતી કરવાનો સમય થઈ ગયો છે.' : language === 'english' ? 'It is time for Shri Sodevpir Dada evening Aarti.' : 'श्री सोदेवपीर दादा की शाम की आरती का समय हो गया है।',
            id: 2,
            schedule: { on: { hour: h, minute: m }, allowWhileIdle: true }
          });
        }

        if (notificationsList.length > 0) {
          await LocalNotifications.schedule({ notifications: notificationsList });
        }
      } catch (e) {
        console.log('Notification setup failed', e);
      }
    };

    setupNotifications();
    localStorage.setItem('sodev_morning_notif', morningNotification.toString());
    localStorage.setItem('sodev_evening_notif', eveningNotification.toString());
    localStorage.setItem('sodev_morning_time', morningTime);
    localStorage.setItem('sodev_evening_time', eveningTime);
  }, [morningNotification, eveningNotification, morningTime, eveningTime, language]);

  // iOS Safari Stability: Lock body scroll when tray is open to prevent jumping
  useEffect(() => {
    if (isLibraryOpen) {
      document.body.classList.add('tray-open');
    } else {
      document.body.classList.remove('tray-open');
    }
  }, [isLibraryOpen]);
  const [sleepTimer, setSleepTimer] = useState(null); // in minutes
  const [timerId, setTimerId] = useState(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [dailyQuote, setDailyQuote] = useState({ gujarati: '', hindi: '', english: '' });
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isAppOpenReady, setIsAppOpenReady] = useState(false);

  // Splash Screen Logic
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Shortened to 2.5s to match user expectation (1-2s range)
    return () => clearTimeout(splashTimer);
  }, []);

  // Initialize AdMob & Show Banner
  useEffect(() => {
    const prepareAds = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        console.log("AdMob: Initializing...");
        await AdMob.initialize();

        // 🛡️ INDEPENDENT BANNER
        try {
          await AdMob.showBanner({
            adId: 'ca-app-pub-5914382038291713/2444272147',
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false
          });
          console.log("AdMob: Production Banner Loaded ✅");
        } catch (bannerErr) {
          console.error("AdMob Banner Error Details:", bannerErr);
          window.lastBannerError = bannerErr.message;
        }

        // 🚀 NOTE: App Open Ads are not supported in @capacitor-community/admob v8 yet.
        // Interstitial ads can be used as a full-screen alternative if needed.

      } catch (e) { console.warn("AdMob Global Error:", e.message); }
    };
    prepareAds();
  }, []);

  const backgroundImage = '/assets/images/guide_bg1.jpg?v=4';

  // Background Slider & Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'english') {
      if (hour < 12) return "Good Morning";
      if (hour < 17) return "Good Afternoon";
      return "Good Evening";
    } else if (language === 'gujarati') {
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
    try {
      localStorage.setItem('pooja_mode', currentMode);
      localStorage.setItem('pooja_lang', language);
      localStorage.setItem('pooja_repeat', repeatCount);
      localStorage.setItem('pooja_index', activeItemIndex);
    } catch (e) {
      console.warn("Storage full or disabled:", e);
    }
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
        title: 'Shri Sodevpir Dada App',
        text: 'Download Shri Sodevpir Dada app for Daily Quotes, Chalisa and Bhajans!',
        url: 'https://shrisodevpirdada.vercel.app/',
      }).catch(console.error);
    } else {
      alert("Sharing is not supported on this browser/device.");
    }
  };




  // Audio Instance Managed by Ref
  const audioRef = useRef(null);
  const bellAudioRef = useRef(null);
  const shankhAudioRef = useRef(null);

  // GLOBAL AUDIO CLEANUP (Memory Leak Prevention)
  useEffect(() => {
    return () => {
      [audioRef, bellAudioRef, shankhAudioRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = "";
          ref.current = null;
        }
      });
    };
  }, []);

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

  // Robust Audio Instance Creation for Mobile/Android
  const createAudioInstance = (path) => {
    console.log("INITIALIZING AUDIO:", path);

    // Ensure we have a persistent audio instance
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.pause();

    // Set source and properties for faster loading
    audio.src = path;
    audio.preload = "auto";
    audio.load();

    // Setup events
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);

    audio.ontimeupdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };

    audio.onloadedmetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.onerror = () => {
      setIsPlaying(false);
    };

    audio.onended = null;
    return audio;
  };

  const getAudioPath = () => {
    const audioModes = ['chalisa', 'mantras', 'bhajans', 'aartis', 'stutis'];
    if (!audioModes.includes(currentMode)) return "/assets/audio/chalisa1.mp3";

    return currentMode === 'chalisa' ? "/assets/audio/chalisa1.mp3" :
      currentMode === 'mantras' ? (mantras[activeItemIndex]?.audio || "/assets/audio/Shree_Sodevpir_Dada_Dhyan_Mantra.mp3") :
        currentMode === 'bhajans' ? (bhajans[activeItemIndex]?.audio || "/assets/audio/Jholi_Meri_Bhar_De.mp3") :
          currentMode === 'aartis' ? (aartis[activeItemIndex]?.audio || "/assets/audio/aarti.mp3") :
            currentMode === 'stutis' ? (stutis[activeItemIndex]?.audio || "/assets/audio/Stuti.m4a") :
              "/assets/audio/chalisa1.mp3";
  };

  // Effect to handle source changes (switching tracks)
  useEffect(() => {
    const audioModes = ['chalisa', 'mantras', 'bhajans', 'aartis', 'stutis'];
    if (!audioModes.includes(currentMode)) return;

    const path = getAudioPath();

    // RESET counters on track change
    setCurrentTime(0);
    setDuration(0);
    setCurrentRepeat(0);
    setIsPlaying(false);

    // Safari Fix: Only touch the existing instance if it's already there. 
    // If not, it will be created on the first user "PLAY" click.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = path;
      audioRef.current.load(); // Prepare for next play
    } else {
      createAudioInstance(path); // Pre-warm
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentMode, activeItemIndex]);

  // ROBUST REPEATER LOGIC: Handles looping with state directly
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.onended = () => {
      if (currentRepeat + 1 < repeatCount) {
        setCurrentRepeat(prev => prev + 1);
        audio.currentTime = 0;
        // Small delay protects against "rapid fire" bugs on some mobile OS
        setTimeout(() => {
          if (audio) {
            audio.play().catch(e => console.error("Repeater Error:", e.message));
          }
        }, 200);
      } else {
        setIsPlaying(false);
        setCurrentRepeat(0);
        audio.currentTime = audio.duration || 0;
      }
    };
  }, [currentRepeat, repeatCount]);

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

  const startReading = useCallback((mode) => {
    triggerHaptic(ImpactStyle.Light);
    if (mode === 'history') {
      setHistoryView('menu');
      setActiveIncidentIndex(null);
    }

    const audioModes = ['chalisa', 'mantras', 'bhajans', 'aartis', 'stutis'];
    const isNewModeAudio = audioModes.includes(mode);

    // 1. If we are staying in the same mode, just show the view
    // 2. If we are entering a non-audio mode (History/Videos), don't disturb background audio
    if (currentMode === mode || !isNewModeAudio) {
      setCurrentMode(mode);
      setIsLyricsVisible(true);
      setIsLibraryOpen(false);
      return;
    }

    // 3. Otherwise, we are switching to a DIFFERENT audio mode - stop previous
    setCurrentMode(mode);
    setIsLyricsVisible(true);
    setIsLibraryOpen(false);
    setActiveItemIndex(0);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  }, [currentMode]);

  return (
    <>
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
          <img src={backgroundImage} alt="SODEV" className="bg-image active" />
          <div className="bg-overlay"></div>
        </div>

        {/* Top Bar */}
        <header className="top-bar">
          <div className="divine-centerpiece">
            <div className="divine-name">ૐ શ્રી સાદેવપીર દાદાય નમઃ</div>
          </div>

          <div className="top-bar-side-content">
            <div className="header-greeting" onClick={() => setIsLyricsVisible(false)}>
              <div className={`greeting-text lang-${language}`}>{getGreeting()}</div>
            </div>

            {!isLyricsVisible && !isFocusMode && dailyQuote && (
              <div className="daily-quote-card glass-panel">
                <div className="quote-header">
                  <span className="quote-icon">❝</span>
                  <span className="quote-label">
                    {language === 'gujarati' ? 'આજનો વિચાર' : language === 'english' ? 'Thought of the Day' : 'आज का विचार'}
                  </span>
                </div>
                <div className="quote-content">
                  <div className="main-quote">
                    {dailyQuote[language] || dailyQuote.english || dailyQuote.hindi}
                  </div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic(ImpactStyle.Light);
                    setIsLibraryOpen(!isLibraryOpen);
                  }}
                >
                  ⋯
                </button>

                <button className="dock-play-btn" onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(ImpactStyle.Medium);

                  // CRITICAL: Ensure audio instance exists on user interaction for iOS Safari
                  if (!audioRef.current) {
                    createAudioInstance(getAudioPath());
                  }

                  const audio = audioRef.current;
                  if (audio) {
                    if (isPlaying) {
                      audio.pause();
                      setIsPlaying(false);
                    } else {
                      const playPromise = audio.play();
                      if (playPromise !== undefined) {
                        playPromise
                          .then(() => setIsPlaying(true))
                          .catch(err => console.error("Dock Play Error:", err.message));
                      }
                    }
                  }
                }}>
                  {isPlaying ? '⏸' : '▶'}
                </button>

                <div className="language-pill-container mini">
                  <button
                    className={`lang-pill-btn ${language === 'gujarati' ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setLanguage('gujarati'); triggerHaptic(); }}
                  >
                    G
                  </button>
                  <button
                    className={`lang-pill-btn ${language === 'hindi' ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setLanguage('hindi'); triggerHaptic(); }}
                  >
                    H
                  </button>
                  <button
                    className={`lang-pill-btn ${language === 'english' ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setLanguage('english'); triggerHaptic(); }}
                  >
                    E
                  </button>
                </div>

                <div className="dock-repeat-island glass-panel">
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
                  {repeatCount > 1 && (
                    <div className="dock-jaap-badge">
                      {currentRepeat + 1}/{repeatCount}
                    </div>
                  )}
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

        {/* DEVOTIONAL LIBRARY TRAY (Isolated to prevent flickering/jumping) */}
        <DevotionalLibrary
          isLibraryOpen={isLibraryOpen}
          setIsLibraryOpen={setIsLibraryOpen}
          language={language}
          startReading={startReading}
          morningToggle={setMorningNotification}
          eveningToggle={setEveningNotification}
          isMorningOn={morningNotification}
          isEveningOn={eveningNotification}
          morningTime={morningTime}
          setMorningTime={setMorningTime}
          eveningTime={eveningTime}
          setEveningTime={setEveningTime}
        />

        {/* LYRICS VIEW */}
        {isLyricsVisible && (
          <main key={`${currentMode}-${language}`} className="lyrics-container">
            <div className="top-actions-row">
              <div className="back-btn glass-panel" onClick={() => setIsLyricsVisible(false)}>
                <span className="back-icon">←</span> {
                  language === 'gujarati' ? 'વાંચન બંધ કરો' :
                    language === 'english' ? 'Close Reading' : 'पठन बंद करें'
                }
              </div>
              {currentMode === 'history' && historyView !== 'menu' && (
                <div className="back-btn glass-panel secondary-back" onClick={() => {
                  if (historyView === 'incidentDetail') {
                    setHistoryView('incidents');
                  } else {
                    setHistoryView('menu');
                  }
                  triggerHaptic();
                }}>
                  <span className="back-icon">↺</span> {
                    language === 'gujarati' ? 'પાછા જાઓ' :
                      language === 'english' ? 'Go Back' : 'वापस जाएं'
                  }
                </div>
              )}
            </div>

            <div className="page-header">
              <div className="page-title">
                {language === 'gujarati' ? (
                  currentMode === 'chalisa' ? 'દાદા ની ચાલીસા' :
                    currentMode === 'mantras' ? 'દાદા ના સિદ્ધ મંત્ર' :
                      currentMode === 'bhajans' ? 'દાદા ના ભજન' :
                        currentMode === 'aartis' ? 'દાદા ની આરતી' :
                          currentMode === 'stutis' ? 'દાદા ની સ્તુતિ' :
                            currentMode === 'history' ? (
                              historyView === 'menu' ? 'દાદા નો ઇતિહાસ' :
                                historyView === 'lifeStory' ? 'દાદા ની જીવન કથા' :
                                  historyView === 'incidentDetail' && activeIncidentIndex !== null ? historyData.incidents[activeIncidentIndex].title[language] : 'દાદા ના ચમત્કારો'
                            ) :
                              currentMode === 'videos' ? 'દાદા ના દર્શન' :
                                currentMode === 'policy' ? 'ગોપનીયતા નીતિ' : 'સોદેવ પૂજા'
                ) : language === 'english' ? (
                  currentMode === 'chalisa' ? "Dada's Chalisa" :
                    currentMode === 'mantras' ? "Dada's Siddh Mantras" :
                      currentMode === 'bhajans' ? "Dada's Bhajans" :
                        currentMode === 'aartis' ? "Dada's Aarti" :
                          currentMode === 'stutis' ? "Dada's Stuti" :
                            currentMode === 'history' ? (
                              historyView === 'menu' ? "Dada's History" :
                                historyView === 'lifeStory' ? "Dada's Life Story" :
                                  historyView === 'incidentDetail' && activeIncidentIndex !== null ? historyData.incidents[activeIncidentIndex].title[language] : "Dada's Miracles"
                            ) :
                              currentMode === 'videos' ? "Dada's Darshan" :
                                currentMode === 'policy' ? 'Privacy Policy' : 'Sodev Pooja'
                ) : (
                  currentMode === 'chalisa' ? 'दादा की चालीसा' :
                    currentMode === 'mantras' ? 'दादा के सिद्ध मंत्र' :
                      currentMode === 'bhajans' ? 'दादा के भजन' :
                        currentMode === 'aartis' ? 'दादा की आरती' :
                          currentMode === 'stutis' ? 'दादा की स्तुति' :
                            currentMode === 'history' ? (
                              historyView === 'menu' ? 'दादा का इतिहास' :
                                historyView === 'lifeStory' ? 'दादा की जीवन कथा' :
                                  historyView === 'incidentDetail' && activeIncidentIndex !== null ? historyData.incidents[activeIncidentIndex].title[language] : 'दादा के चमत्कार'
                            ) :
                              currentMode === 'videos' ? 'दादा के दर्शन' :
                                currentMode === 'policy' ? 'गोपनीयता नीति' : 'सोदेव पूजा'
                )}
              </div>
              <div className="page-subtitle">
                {['chalisa', 'mantras', 'bhajans', 'aartis', 'stutis'].includes(currentMode) && repeatCount > 1 && (
                  <div className="jaap-counter">
                    Jaap {currentRepeat + 1} of {repeatCount}
                  </div>
                )}
                {currentMode === 'videos' && (
                  language === 'gujarati' ? 'સોદેવપીર દર્શન સંગ્રહ' :
                    language === 'english' ? 'Sodevpir Darshan Collection' : 'सोदेवपीर दर्शन संग्रह'
                )}
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
                  <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {mantra.name} {activeItemIndex === index && (
                      language === 'gujarati' ? ' (પસંદ કરેલ)' :
                        language === 'english' ? ' (Selected)' : ' (चयनित)'
                    )}
                  </div>
                  <div className="hindi-text" style={{ fontSize: '1.2rem' }}>
                    {mantra[language] || mantra.gujarati || mantra.hindi}
                  </div>
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
                    if (audioRef.current) {
                      audioRef.current.pause();
                    }
                  }}
                >
                  <div style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
                    {bhajan[language] || bhajan.name} {activeItemIndex === index && (
                      language === 'gujarati' ? ' (પસંદ કરેલ)' :
                        language === 'english' ? ' (Selected)' : ' (चयनित)'
                    )}
                  </div>
                </div>
              ))
            ) : currentMode === 'aartis' ? (
              aartis.map((verse, index) => (
                <div key={index} className="verse glass-panel">
                  <div className="hindi-text">{verse[language] || verse.gujarati || verse.hindi}</div>
                </div>
              ))
            ) : currentMode === 'stutis' ? (
              stutis.map((verse, index) => (
                <div key={index} className="verse glass-panel">
                  <div className="hindi-text">{verse[language] || verse.gujarati || verse.hindi}</div>
                </div>
              ))
            ) : currentMode === 'history' ? (
              <div className="history-section-container">
                {historyView === 'menu' ? (
                  <>
                    <div className="page-header center-header">
                      <div className="page-subtitle">{language === 'english' ? 'Choose a Section to Read' : 'પઠન માટે વિભાગ પસંદ કરો'}</div>
                    </div>
                    <div className="history-menu-grid">
                      <button className="history-menu-card glass-panel" onClick={() => { setHistoryView('lifeStory'); triggerHaptic(ImpactStyle.Medium); }}>
                        <div className="menu-card-icon">📖</div>
                        <div className="menu-card-content">
                          <div className="menu-card-title">{
                            language === 'gujarati' ? 'જીવન ચરિત્ર' :
                              language === 'english' ? 'Life History' : 'जीवन चरित्र'
                          }</div>
                          <div className="menu-card-subtitle">{
                            language === 'english' ? 'Sacred Story & Journey' : 'Life Story & Miracles'
                          }</div>
                        </div>
                      </button>
                      <button className="history-menu-card glass-panel" onClick={() => { setHistoryView('incidents'); triggerHaptic(ImpactStyle.Medium); }}>
                        <div className="menu-card-icon">✨</div>
                        <div className="menu-card-content">
                          <div className="menu-card-title">{
                            language === 'gujarati' ? 'દાદાના ચમત્કારો' :
                              language === 'english' ? 'Divine Miracles' : 'दादा के चमत्कार'
                          }</div>
                          <div className="menu-card-subtitle">{
                            language === 'english' ? 'True Incidents of Dada' : 'True Incidents Index'
                          }</div>
                        </div>
                      </button>
                    </div>
                  </>
                ) : historyView === 'lifeStory' ? (
                  <>
                    <div className="page-header center-header">
                      <div className="page-subtitle">{language === 'english' ? 'Sacred Journey of Sodevpir Dada' : 'શ્રી સોદેવપીર દાદાની જીવન ગાથા'}</div>
                    </div>
                    {historyData.lifeStory.content.map((item) => (
                      <div key={item.id} className="verse glass-panel">
                        <div style={{ color: 'var(--secondary)', fontSize: '1.2rem', marginBottom: '15px' }}>
                          {item.subtitle[language] || item.subtitle.hindi}
                        </div>
                        <div className="hindi-text" style={{ fontSize: '1.1rem', textAlign: 'left' }}>
                          {item.text[language] || item.text.hindi}
                        </div>
                      </div>
                    ))}
                  </>
                ) : historyView === 'incidents' ? (
                  <>
                    <div className="page-header center-header">
                      <div className="page-subtitle">{language === 'english' ? 'Select a Miracle to Read' : 'વાંચવા માટે એક ચમત્કાર પસંદ કરો'}</div>
                    </div>
                    <div className="incidents-grid">
                      {historyData.incidents.map((incident, idx) => (
                        <button
                          key={incident.id}
                          className={`incident-select-card glass-panel ${activeIncidentIndex === idx ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveIncidentIndex(idx);
                            setHistoryView('incidentDetail');
                            triggerHaptic(ImpactStyle.Light);
                          }}
                        >
                          <span className="incident-number">#{idx + 1}</span>
                          <span className="incident-title-text">{incident.title[language] || incident.title.hindi}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : historyView === 'incidentDetail' ? (
                  <div className="selected-incident-viewer-fullscreen active-verse">
                    <div className="page-header center-header">
                      <div className="page-subtitle">{
                        language === 'gujarati' ? 'ચમત્કારનો ઇતિહાસ' :
                          language === 'english' ? 'History of Miracle' : 'चमत्कार का इतिहास'
                      }</div>
                    </div>
                    {activeIncidentIndex !== null && historyData.incidents[activeIncidentIndex] && (
                      <div className="hindi-text incident-content-full">
                        {historyData.incidents[activeIncidentIndex].content[language] || historyData.incidents[activeIncidentIndex].content.hindi}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : currentMode === 'videos' ? (
              <div className="videos-section-container">
                <div className="videos-grid-flow">
                  {videos.map((vid) => (
                    <div key={vid.id} className="video-premium-card glass-panel">
                      <div className="video-container-wrapper">
                        <iframe
                          width="100%"
                          height="200"
                          src={`https://www.youtube.com/embed/${vid.youtubeId}?modestbranding=1&rel=0`}
                          title={vid.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="video-card-details">
                        <div className="video-platform-badge">
                          <span className="youtube-logo">🔴</span> YouTube
                        </div>
                        <div className="video-card-title">
                          {vid[language] || vid.gujarati || vid.hindi}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : currentMode === 'policy' ? (
              <div className="policy-section-container">
                <div className="page-header">
                  <div className="page-subtitle">Privacy & Data Transparency</div>
                </div>
                <div className="verse glass-panel" style={{ textAlign: 'center', marginBottom: '30px', padding: '15px' }}>
                  <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', opacity: 0.8 }}>
                    Last Updated: {policyData.lastUpdated}
                  </div>
                </div>
                {policyData.sections.map((section, idx) => (
                  <div key={idx} className="verse glass-panel">
                    <div style={{ color: 'var(--secondary)', fontSize: '1.2rem', marginBottom: '15px' }}>
                      {section.subtitle[language] || section.subtitle.english}
                    </div>
                    <div className="hindi-text" style={{ fontSize: '1.1rem', textAlign: 'left' }}>
                      {section.text[language] || section.text.english}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </main>
        )}

        {/* No separate footer - all is in dashboard */}
      </div>
      {showSplash && (
        <div className="divine-splash-clean">
          <img src="/assets/images/merged_splash.png" className="splash-full-img" alt="Divine Sodevpir Dada" />
        </div>
      )}
    </>
  );
}

export default App;
