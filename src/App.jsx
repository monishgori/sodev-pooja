import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
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

const NativeAudio = registerPlugin('NativeAudio');
const isNativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

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

        <div className="tray-privacy-footer" style={{ textAlign: 'center', padding: '20px 0 15px 0', opacity: 0.5, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--secondary)', fontWeight: 'bold' }}>
            {language === 'gujarati' ? 'ડેવલપર: DS Digital\'s' : language === 'english' ? 'DEVELOPER: DS DIGITAL\'S' : 'ડેવલપર: DS Digital\'s'}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); startReading('policy'); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.6rem',
              letterSpacing: '1px',
              cursor: 'pointer',
              fontWeight: '500',
              opacity: 0.8
            }}
          >
            PRIVACY POLICY
          </button>
        </div>
      </div>
    </>
  );
});

// 1. HIGH-PERFORMANCE CANVAS FLOWERS (Replaces 80+ Divs with 1 Canvas)
const DivineCanvasFlowers = React.memo(({ triggerCount, isAndroid }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const requestRef = useRef();

  const flowerEmojis = ['🌼', '🌹', '🪷', '💮', '🌻', '🌷', '🏵️', '🌸', '🏵️', '💮'];

  const initParticle = () => {
    return {
      x: Math.random() * window.innerWidth,
      y: -50,
      size: Math.random() * 15 + 15,
      type: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
      speed: Math.random() * 2 + 1.5,
      sway: Math.random() * 2 - 1,
      swaySpeed: Math.random() * 0.02 + 0.01,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05
    };
  };

  useEffect(() => {
    if (triggerCount > 0) {
      const batchSize = isAndroid ? 30 : 60;
      for (let i = 0; i < batchSize; i++) {
        particles.current.push(initParticle());
      }
    }
  }, [triggerCount, isAndroid]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i];
      p.y += p.speed;
      p.angle += p.rotationSpeed;
      p.x += Math.sin(p.y * p.swaySpeed) * 2;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.type, 0, 0);
      ctx.restore();

      // Remove off-screen
      if (p.y > canvas.height + 100) {
        particles.current.splice(i, 1);
        i--;
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <canvas 
      ref={canvasRef} 
      className="divine-canvas-layer"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    />
  );
});

// 2. Memoized Particle Background
const ParticlesBackground = React.memo(() => {
  return (
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
  );
});

// 3. Divine Header (Isolated)
const DivineHeader = React.memo(({ language, greeting, isLyricsVisible, isFocusMode, dailyQuote, onHomeClick }) => {
  return (
    <header className="top-bar">
      <div className="divine-centerpiece">
        <div className="divine-name" onClick={onHomeClick}>ૐ શ્રી સાદેવપીર દાદાય નમઃ</div>
      </div>

      <div className="top-bar-side-content">
        <div className="header-greeting" onClick={onHomeClick}>
          <div className={`greeting-text lang-${language}`}>{greeting}</div>
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
  );
});

// 4. Lyrics Viewer (Memoized & Performance Optimized)
const LyricsViewer = React.memo(({
  currentMode, language, activeVerse, activeItemIndex, activeIncidentIndex,
  setActiveItemIndex, historyView, setHistoryView, setActiveIncidentIndex,
  currentRepeat, repeatCount, startReading, triggerHaptic, pauseMainAudio,
  chalisaData, mantras, bhajans, aartis, stutis, historyData, videos, policyData,
  setIsLyricsVisible
}) => {
  return (
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
                language === 'english' ? 'Go Back' : 'वाપસ जाएं'
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
              pauseMainAudio();
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
              pauseMainAudio();
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
  const [flowerTrigger, setFlowerTrigger] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false); // GUARD STATE

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

  // Ref to track repeatCount without triggering effect re-runs
  const repeatCountRef = useRef(repeatCount);
  useEffect(() => {
    repeatCountRef.current = repeatCount;
  }, [repeatCount]);

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
            title: language === 'gujarati' ? 'આરતી નો સમય' : language === 'english' ? 'Evening Aarti Time' : 'आरતી કા સમય',
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

  // Platform Detection & Android Body Class
  useEffect(() => {
    if (isNativeAndroid) {
      document.body.classList.add('is-android');
    } else {
      document.body.classList.remove('is-android');
    }
  }, []);

  // Splash Screen Logic
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); 
    return () => clearTimeout(splashTimer);
  }, []);

  // RETENTION NOTIFICATIONS LOGIC
  const scheduleRetentionNotifications = async () => {
    if (!isNativeAndroid) return;
    try {
      const hasPerm = await ensureNotificationPermission();
      if (!hasPerm) return;

      await LocalNotifications.cancel({ notifications: [{ id: 10 }, { id: 11 }, { id: 12 }] });

      const messages = {
        'gujarati': {
          day3: { title: "દાદા આપને યાદ કરે છે! 🔱", body: "સોમનાથની ધરતીથી દાદા આપને આશીર્વાદ મોકલી રહ્યા છે. ચાલીસાનો પાઠ શરૂ કરીએ? 🙏" },
          day7: { title: "દાદાના દર્શનનો સમય ✨", body: "એક અઠવાડિયું થઈ ગયું! થોડો સમય કાઢીને દાદાનું સ્મરણ કરો અને સકારાત્મક ઉર્જા મેળવો. 🕉️" },
          day15: { title: "શ્રી સાદેવપીર દાદા કૃપા 🔱", body: "આપની ભક્તિ જ આપની શક્તિ છે. એપ ખોલો અને આજનું વિશેષ ભજન સાંભળો. 🔱🦾" }
        },
        'hindi': {
          day3: { title: "दादा आपको याद कर रहे हैं! 🔱", body: "सोमनाथ की धरती से दादा आपको आशीर्वाद भेज रहे हैं। चालीसा का पाठ शुरू करें? 🙏" },
          day7: { title: "दादा के दर्शन का समय ✨", body: "एक हफ्ता हो गया है! थोड़ा समय निकाल कर दादा का स्मरण कीजिए और सकारात्मक ऊर्जा पाइए। 🕉️" },
          day15: { title: "श्री सादेवपीर दादा कृपा 🔱", body: "आपकी भक्ति ही आपकी शक्ति है। ऐप खोलें और आज का विशेष भजन सुनें। 🔱🦾" }
        },
        'english': {
          day3: { title: "Dada is remembering you! 🔱", body: "Dada is sending blessings from Somnath. Shall we start the Chalisa? 🙏" },
          day7: { title: "Time for Dada's Darshan ✨", body: "It's been a week! Take a moment to remember Dada and get positive energy. 🕉️" },
          day15: { title: "Shri Sodevpir Dada Grace 🔱", body: "Your devotion is your strength. Open the app and listen to today's special Bhajan. 🔱🦾" }
        }
      };

      const lang = language || 'hindi';
      const selected = messages[lang] || messages['hindi'];

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 10,
            title: selected.day3.title,
            body: selected.day3.body,
            schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) },
            sound: 'bell.mp3',
            smallIcon: 'ic_stat_name',
            actionTypeId: 'OPEN_APP'
          },
          {
            id: 11,
            title: selected.day7.title,
            body: selected.day7.body,
            schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) },
            sound: 'bell.mp3',
            smallIcon: 'ic_stat_name',
            actionTypeId: 'OPEN_APP'
          },
          {
            id: 12,
            title: selected.day15.title,
            body: selected.day15.body,
            schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15) },
            sound: 'bell.mp3',
            smallIcon: 'ic_stat_name',
            actionTypeId: 'OPEN_APP'
          }
        ]
      });
      console.log("Retention Notifications: Reset & Scheduled ✅");
    } catch (e) {
      console.error("Retention Notification Error:", e);
    }
  };

  useEffect(() => {
    scheduleRetentionNotifications();
  }, [language]);

  // Initialize AdMob & Show Banner
  useEffect(() => {
    const prepareAds = async () => {
      if (!Capacitor.isNativePlatform()) return;
      try {
        await AdMob.initialize();
        await AdMob.showBanner({
          adId: 'ca-app-pub-5914382038291713/2444272147',
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: false
        });
      } catch (e) { console.warn("AdMob Global Error:", e.message); }
    };
    prepareAds();
  }, []);

  const backgroundImage = '/assets/images/guide_bg1.jpg';

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
    const today = new Date();
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
        if (isNativeAndroid) {
          NativeAudio.pause().catch(error => console.error('Sleep timer pause failed:', error));
        } else if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
        setSleepTimer(null);
        alert("Sleep timer finished. Pooja paused.");
      }, sleepTimer * 60000);
      setTimerId(id);
    }
    return () => { if (timerId) clearTimeout(timerId); };
  }, [sleepTimer, timerId]);

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Shri Sodevpir Dada App',
        text: 'Download Shri Sodevpir Dada app for Daily Quotes, Chalisa and Bhajans!',
        url: 'https://shrisodevpirdada.vercel.app/',
      }).catch(console.error);
    }
  };

  // Audio Instance Managed by Ref
  const audioRef = useRef(null);
  const bellAudioRef = useRef(null);
  const shankhAudioRef = useRef(null);

  const pauseMainAudio = useCallback(async () => {
    if (isNativeAndroid) {
      try { await NativeAudio.pause(); } catch (error) { console.error('Native pause failed:', error); }
      setIsPlaying(false);
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); }
    setIsPlaying(false);
  }, []);

  const ensureNotificationPermission = useCallback(async () => {
    if (!isNativeAndroid) return true;
    try {
      const nativePerm = await NativeAudio.hasNotificationPermission();
      if (!nativePerm?.granted) { await NativeAudio.requestNotificationPermission(); }
      const localPerm = await LocalNotifications.checkPermissions();
      if (localPerm.display !== 'granted') {
        const requested = await LocalNotifications.requestPermissions();
        if (requested.display !== 'granted') return false;
      }
      return true;
    } catch (error) { return false; }
  }, []);

  // GLOBAL AUDIO CLEANUP
  useEffect(() => {
    return () => {
      [audioRef, bellAudioRef, shankhAudioRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = "";
          ref.current = null;
        }
      });
      if (isNativeAndroid) NativeAudio.stop().catch(() => {});
    };
  }, []);

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
  };

  const handleSeekEnd = (e) => {
    const time = Number(e.target.value);
    if (isNativeAndroid) {
      NativeAudio.seekTo({ position: Math.round(time * 1000) }).catch(error => { console.error('Native seek failed:', error); });
    } else if (audioRef.current) {
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

  const startFlowerShower = () => {
    setFlowerTrigger(prev => prev + 1);
  };

  const toggleDiya = () => {
    triggerHaptic();
    setIsDiyaLit(!isDiyaLit);
  };

  const createAudioInstance = (path) => {
    if (!audioRef.current) { audioRef.current = new Audio(); }
    const audio = audioRef.current;
    audio.pause();
    audio.src = path;
    audio.preload = "auto";
    audio.load();
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.ontimeupdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
      }
    };
    audio.onloadedmetadata = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
    };
    audio.onerror = (e) => { setIsPlaying(false); };
    return audio;
  };

  const getCurrentTrackTitle = () => {
    if (currentMode === 'chalisa') return "Dada's Chalisa";
    if (currentMode === 'mantras') return mantras[activeItemIndex]?.name || "Dada's Mantra";
    if (currentMode === 'bhajans') return bhajans[activeItemIndex]?.name || "Dada's Bhajan";
    if (currentMode === 'aartis') return "Dada's Aarti";
    if (currentMode === 'stutis') return "Dada's Stuti";
    return 'Shri Sodevpir Dada';
  };

  const prepareNativeTrack = useCallback(async (path) => {
    try {
      setIsPreparing(true);
      await ensureNotificationPermission();
      const status = await NativeAudio.prepare({
        src: path,
        title: getCurrentTrackTitle(),
        artist: 'Shri Sodevpir Dada',
        repeatCount: repeatCountRef.current
      });
      const statusData = status || {};
      setCurrentTime((statusData.currentTime || 0) / 1000);
      setDuration((statusData.duration || 0) / 1000);
      setCurrentRepeat(Number(statusData.currentRepeat || 0));
      setIsPlaying(Boolean(statusData.isPlaying));
    } catch (error) { 
      console.error('Native prepare failed:', error); 
    } finally {
      setIsPreparing(false);
    }
  }, [currentMode, activeItemIndex, ensureNotificationPermission]);

  const syncNativeStatus = useCallback(async () => {
    if (!isNativeAndroid) return;
    try {
      const status = await NativeAudio.getStatus();
      setIsPlaying(Boolean(status?.isPlaying));
      if (!isSeeking) setCurrentTime((status?.currentTime || 0) / 1000);
      setDuration((status?.duration || 0) / 1000);
    } catch (error) { console.error('Native status sync failed:', error); }
  }, [isSeeking]);

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

  useEffect(() => {
    const audioModes = ['chalisa', 'mantras', 'bhajans', 'aartis', 'stutis'];
    if (!audioModes.includes(currentMode)) return;
    const path = getAudioPath();
    setCurrentTime(0);
    setDuration(0);
    setCurrentRepeat(0);
    setIsPlaying(false);
    if (isNativeAndroid) {
      prepareNativeTrack(path);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = path;
      audioRef.current.load();
    } else { createAudioInstance(path); }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [activeItemIndex, currentMode]);

  useEffect(() => {
    if (isNativeAndroid) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.onended = () => {
      if (currentRepeat + 1 < repeatCount) {
        const nextRepeatIndex = currentRepeat + 1;
        if (nextRepeatIndex === repeatCount - 1 && repeatCount > 1) {
          ringBell();
          setTimeout(() => {
            setCurrentRepeat(nextRepeatIndex);
            if (audio) {
              audio.currentTime = 0;
              audio.play().catch(e => console.error("Final Repeater Error:", e.message));
            }
          }, 1200);
        } else {
          setCurrentRepeat(nextRepeatIndex);
          audio.currentTime = 0;
          setTimeout(() => {
            if (audio) audio.play().catch(e => console.error("Repeater Error:", e.message));
          }, 200);
        }
      } else {
        setIsPlaying(false);
        audio.currentTime = audio.duration || 0;
      }
    };
  }, [currentRepeat, repeatCount]);

  useEffect(() => {
    if (!isNativeAndroid) return;
    let stateListener = null;
    let endedListener = null;
    const setupNativeListeners = async () => {
      stateListener = await NativeAudio.addListener('playbackStateChange', (status) => {
        if (isPreparing) return; // IGNORE STALE EVENTS DURING TRANSITION
        
        setIsPlaying(Boolean(status?.isPlaying));
        if (!isSeeking) setCurrentTime((status?.currentTime || 0) / 1000);
        setDuration((status?.duration || 0) / 1000);
        setCurrentRepeat(Number(status?.currentRepeat || 0));
        if (status?.repeatCount) setRepeatCount(Number(status.repeatCount));
      });
      endedListener = await NativeAudio.addListener('playbackEnded', async () => {
        setIsPlaying(false);
        await syncNativeStatus();
      });
      await syncNativeStatus();
    };
    setupNativeListeners();
    return () => {
      stateListener?.remove();
      endedListener?.remove();
    };
  }, [isSeeking, syncNativeStatus]);

  useEffect(() => {
    if (!isNativeAndroid) return;
    NativeAudio.setRepeatCount({ repeatCount }).catch(error => { console.error('Native repeat count update failed:', error); });
  }, [repeatCount]);

  const ringBell = () => {
    triggerHaptic(ImpactStyle.Heavy);
    setIsBellRinging(true);
    if (isNativeAndroid) {
      NativeAudio.bell().catch(error => console.error('Native bell failed:', error));
    } else {
      if (!bellAudioRef.current) bellAudioRef.current = new Audio("/assets/audio/bell.mp3");
      bellAudioRef.current.currentTime = 0;
      bellAudioRef.current.play().catch(() => { });
    }
    setTimeout(() => setIsBellRinging(false), 500);
  };

  const playShankh = () => {
    triggerHaptic(ImpactStyle.Heavy);
    if (isNativeAndroid) {
      NativeAudio.shankh().catch(error => console.error('Native shankh failed:', error));
    } else {
      if (!shankhAudioRef.current) shankhAudioRef.current = new Audio("/assets/audio/shankh.mp3");
      shankhAudioRef.current.currentTime = 0;
      shankhAudioRef.current.play().catch(() => { });
    }
  };

  const startReading = useCallback((mode) => {
    triggerHaptic(ImpactStyle.Light);
    if (mode === 'history') {
      setHistoryView('menu');
      setActiveIncidentIndex(null);
    }
    const audioModes = ['chalisa', 'mantras', 'bhajans', 'aartis', 'stutis'];
    const isNewModeAudio = audioModes.includes(mode);
    if (currentMode === mode || !isNewModeAudio) {
      setCurrentMode(mode);
      setIsLyricsVisible(true);
      setIsLibraryOpen(false);
      return;
    }
    setCurrentMode(mode);
    setIsLyricsVisible(true);
    setIsLibraryOpen(false);
    setActiveItemIndex(0);
    pauseMainAudio();
  }, [currentMode, pauseMainAudio]);

  return (
    <>
      <div className={`app-container ${isLyricsVisible ? 'view-mode' : 'home-mode'}`}>
        <div className={`diya-container ${isDiyaLit ? 'lit' : ''}`}>
          <div className="diya-glow"></div>
          <div className="diya-base">🪔</div>
        </div>
        <ParticlesBackground />
        <DivineCanvasFlowers triggerCount={flowerTrigger} isAndroid={isNativeAndroid} />
        <div className="background-slider" onClick={() => setIsLyricsVisible(false)}>
          <img src={backgroundImage} alt="SODEV" className="bg-image active" />
          <div className="bg-overlay"></div>
        </div>
        <DivineHeader 
          language={language}
          greeting={getGreeting()}
          isLyricsVisible={isLyricsVisible}
          isFocusMode={isFocusMode}
          dailyQuote={dailyQuote}
          onHomeClick={() => setIsLyricsVisible(false)}
        />
        <div className="bottom-dashboard-container">
          <div className="pooja-dock">
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
                  if (isNativeAndroid) {
                    if (isPlaying) {
                      pauseMainAudio();
                    } else {
                      ensureNotificationPermission().then(() => NativeAudio.play())
                        .then(() => setIsPlaying(true))
                        .catch(err => console.error("Dock Play Error:", err));
                    }
                    return;
                  }
                  if (!audioRef.current) { createAudioInstance(getAudioPath()); }
                  const audio = audioRef.current;
                  if (audio) {
                    if (isPlaying) { audio.pause(); setIsPlaying(false); }
                    else {
                      const playPromise = audio.play();
                      if (playPromise !== undefined) {
                        playPromise.then(() => setIsPlaying(true)).catch(err => console.error("Dock Play Error:", err.message));
                      }
                    }
                  }
                }}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div className="language-pill-container mini">
                  <button className={`lang-pill-btn ${language === 'gujarati' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setLanguage('gujarati'); triggerHaptic(); }}>G</button>
                  <button className={`lang-pill-btn ${language === 'hindi' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setLanguage('hindi'); triggerHaptic(); }}>H</button>
                  <button className={`lang-pill-btn ${language === 'english' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setLanguage('english'); triggerHaptic(); }}>E</button>
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
                  {repeatCount > 1 && <div className="dock-jaap-badge">{currentRepeat + 1}/{repeatCount}</div>}
                </div>
              </div>
              <div className="dock-seek-row">
                <span className="dock-time">{formatTime(currentTime)}</span>
                <div className="seek-container">
                  <div className="seek-fill" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                  <input type="range" className="seek-bar" min="0" max={duration || 0} value={currentTime} onMouseDown={() => setIsSeeking(true)} onTouchStart={() => setIsSeeking(true)} onMouseUp={handleSeekEnd} onTouchEnd={handleSeekEnd} onChange={handleSeek} />
                </div>
                <span className="dock-time">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
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
        {isLyricsVisible && (
          <LyricsViewer 
            currentMode={currentMode}
            language={language}
            activeVerse={activeVerse}
            activeItemIndex={activeItemIndex}
            activeIncidentIndex={activeIncidentIndex}
            setActiveItemIndex={setActiveItemIndex}
            historyView={historyView}
            setHistoryView={setHistoryView}
            setActiveIncidentIndex={setActiveIncidentIndex}
            currentRepeat={currentRepeat}
            repeatCount={repeatCount}
            startReading={startReading}
            triggerHaptic={triggerHaptic}
            pauseMainAudio={pauseMainAudio}
            chalisaData={chalisaData}
            mantras={mantras}
            bhajans={bhajans}
            aartis={aartis}
            stutis={stutis}
            historyData={historyData}
            videos={videos}
            policyData={policyData}
            setIsLyricsVisible={setIsLyricsVisible}
          />
        )}
        <footer style={{ textAlign: 'center', padding: '40px 0 120px 0', opacity: 0.25 }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: '900' }}>
            {language === 'gujarati' ? 'બનાવ્યું: DS Digital\'s' : language === 'english' ? 'CREATED BY: DS DIGITAL\'S' : 'બનાયા ગયા: DS Digital\'s'}
          </div>
          <div style={{ fontSize: '0.5rem', letterSpacing: '2px', marginTop: '5px', opacity: 0.8 }}>DIVINE ENGINE V1.2.0</div>
        </footer>
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
