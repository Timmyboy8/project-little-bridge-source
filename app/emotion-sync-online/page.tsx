"use client";

import { useEffect, useMemo, useState } from "react";

type Language = "en" | "th";
type EmotionId = "happy" | "calm" | "sad" | "frustrated";
type Mode = "practice" | "faces" | "listen" | "everyday" | "learn";

const emotions: Array<{
  id: EmotionId;
  face: string;
  en: string;
  th: string;
  color: "yellow" | "black" | "blue" | "red";
  learnEn: string;
  learnTh: string;
}> = [
  { id: "frustrated", face: ">︵<", en: "Frustrated / Angry", th: "หงุดหงิด / โกรธ", color: "red", learnEn: "A tense feeling when something is difficult or does not go as expected.", learnTh: "ความรู้สึกตึงหรือหงุดหงิด เมื่อบางอย่างยากหรือไม่เป็นอย่างที่คิด" },
  { id: "happy", face: "•‿•", en: "Happy", th: "มีความสุข", color: "yellow", learnEn: "A light, good feeling. You might smile or want to share it.", learnTh: "ความรู้สึกดีและเบาสบาย อาจทำให้เราอยากยิ้มหรือแบ่งปันความสุข" },
  { id: "sad", face: "•︵•", en: "Sad", th: "เศร้า", color: "blue", learnEn: "A heavy or low feeling. You may want comfort or some quiet time.", learnTh: "ความรู้สึกหนักหรือไม่สบายใจ เราอาจอยากได้รับกำลังใจหรืออยู่เงียบ ๆ สักพัก" },
  { id: "calm", face: "–‿–", en: "Calm", th: "สงบ", color: "black", learnEn: "A quiet, settled feeling. Your body may feel relaxed.", learnTh: "ความรู้สึกนิ่งและผ่อนคลาย ร่างกายอาจรู้สึกสบายขึ้น" },
];

const situations = [
  { image: "/everyday-scenes/tower.webp", en: "A tower you built falls down.", th: "หอคอยที่เราต่อไว้ล้มลง" },
  { image: "/everyday-scenes/drawing.webp", en: "You finish a picture you really like.", th: "เราวาดรูปที่ตัวเองชอบเสร็จแล้ว" },
  { image: "/everyday-scenes/breathe.webp", en: "You sit somewhere quiet and take a slow breath.", th: "เรานั่งในที่เงียบ ๆ และค่อย ๆ หายใจ" },
  { image: "/everyday-scenes/goodbye.webp", en: "A friend goes home and you miss them.", th: "เพื่อนกลับบ้านแล้วเราคิดถึงเพื่อน" },
];

const faceQuiz = [
  { emotion: "happy" as EmotionId, image: "/emotion-faces/q2-happy.webp" },
  { emotion: "frustrated" as EmotionId, image: "/emotion-faces/q1-frustrated.webp" },
  { emotion: "calm" as EmotionId, image: "/emotion-faces/q6-calm.webp" },
  { emotion: "sad" as EmotionId, image: "/emotion-faces/q3-sad.webp" },
  { emotion: "frustrated" as EmotionId, image: "/emotion-faces/q8-frustrated.webp" },
  { emotion: "calm" as EmotionId, image: "/emotion-faces/q4-calm.webp" },
  { emotion: "happy" as EmotionId, image: "/emotion-faces/q7-happy.webp" },
  { emotion: "sad" as EmotionId, image: "/emotion-faces/q5-sad.webp" },
];

const copy = {
  en: {
    back: "Project Little Bridge",
    eyebrow: "Free digital practice",
    title: "Emotion Sync Online",
    intro: "Practice recognizing and talking about feelings at your own pace. No account or timer needed.",
    modes: { practice: "Device practice", faces: "Real faces", listen: "Listen & choose", everyday: "Everyday feelings", learn: "Learn feelings" },
    practiceTitle: "Practice with Emotion Sync",
    practiceText: "Use the digital device just like the physical Emotion Sync: start a round, look at the face, then choose the matching feeling.",
    pressStart: "Press Start",
    which: "Which feeling is this?",
    choose: "Choose a feeling",
    startHint: "Start a new round when you are ready.",
    correct: "That matches!",
    correctDetail: "Great noticing. Take your time, then start another round when you are ready.",
    retry: "Take another look.",
    retryDetail: "That one does not match this face yet. You can try another button.",
    voicePrompt: "Hear the instruction",
    speakQuestion: "Which feeling is this?",
    facesTitle: "Read a real face",
    facesText: "Complete 8 face questions using different people. Choose from the same four Emotion Sync feelings, then see your score at the end.",
    faceQuestion: "What feeling does this face show?",
    faceAlt: "Person showing a facial expression for an emotion practice question",
    nextFace: "Next question",
    questionOf: "Question",
    quizScore: "Your score",
    quizScoreDetail: "Each question uses a different face so you can practise noticing expressions across different people.",
    restartQuiz: "Practice again",
    faceCorrect: "You got it!",
    faceCorrectDetail: "Nice noticing. Look at the eyes, eyebrows, and mouth together.",
    faceRetry: "Look once more.",
    faceRetryDetail: "The correct answer is highlighted in green. Take another look, then continue when you are ready.",
    listenTitle: "Listen & choose",
    listenText: "Hear a feeling word, then choose the face that matches it. You can replay the word as many times as you need.",
    listenButton: "Play feeling",
    listenAgain: "Hear it again",
    listenPrompt: "Which face matches the word you heard?",
    listenStart: "Press play to hear a feeling.",
    listenCorrect: "That matches the word!",
    listenRetry: "Try another face.",
    newWord: "New feeling",
    learnTitle: "Learn the four feelings",
    learnText: "Explore each face and name first. There is nothing to get right or wrong here.",
    hear: "Hear",
    everydayTitle: "Everyday feelings",
    everydayText: "Feelings can be different for different people. Choose how this situation might feel to you—there is no score.",
    mightFeel: "How might you feel?",
    hearSituation: "Hear the situation",
    reflection: "That feeling can make sense.",
    reflectionText: "Different people can feel differently in the same situation. Naming your feeling is the important part.",
    another: "Another situation",
    audioUnavailable: "A matching voice is not available on this device.",
  },
  th: {
    back: "Project Little Bridge",
    eyebrow: "ฝึกออนไลน์ฟรี",
    title: "Emotion Sync Online",
    intro: "ฝึกสังเกตและทำความเข้าใจอารมณ์ได้ตามจังหวะของตัวเอง โดยไม่ต้องสมัครบัญชีและไม่มีเวลาแข่ง",
    modes: { practice: "ฝึกกับอุปกรณ์", faces: "ดูสีหน้าจริง", listen: "ฟังแล้วเลือก", everyday: "อารมณ์ในชีวิตประจำวัน", learn: "เรียนรู้อารมณ์" },
    practiceTitle: "ฝึกกับ Emotion Sync",
    practiceText: "ใช้งานเหมือน Emotion Sync เครื่องจริง: กดเริ่ม ดูใบหน้า แล้วเลือกอารมณ์ที่ตรงกัน",
    pressStart: "กด Start",
    which: "ใบหน้านี้แสดงอารมณ์อะไร?",
    choose: "เลือกอารมณ์",
    startHint: "พร้อมเมื่อไหร่ กด Start เพื่อเริ่มรอบใหม่ได้เลย",
    correct: "ตรงกันแล้ว!",
    correctDetail: "เก่งมาก ค่อย ๆ ดูและเริ่มรอบใหม่เมื่อพร้อม",
    retry: "ลองดูอีกครั้ง",
    retryDetail: "คำตอบนี้ยังไม่ตรงกับใบหน้า ลองเลือกปุ่มอื่นได้เลย",
    voicePrompt: "ฟังคำแนะนำ",
    speakQuestion: "ใบหน้านี้แสดงอารมณ์อะไร?",
    facesTitle: "สังเกตสีหน้าจากภาพคนจริง",
    facesText: "ทำแบบฝึก 8 ข้อจากใบหน้าของคนหลายแบบ เลือกจากอารมณ์หลัก 4 แบบของ Emotion Sync แล้วดูคะแนนเมื่อทำครบ",
    faceQuestion: "สีหน้านี้แสดงอารมณ์อะไร?",
    faceAlt: "ภาพบุคคลแสดงสีหน้าสำหรับฝึกสังเกตอารมณ์",
    nextFace: "ข้อถัดไป",
    questionOf: "ข้อ",
    quizScore: "คะแนนของเรา",
    quizScoreDetail: "แต่ละข้อใช้ใบหน้าที่แตกต่างกัน เพื่อฝึกสังเกตสีหน้าจากคนหลายแบบ",
    restartQuiz: "ฝึกอีกครั้ง",
    faceCorrect: "ถูกต้อง!",
    faceCorrectDetail: "เก่งมาก ลองสังเกตดวงตา คิ้ว และปากไปพร้อมกัน",
    faceRetry: "ลองดูอีกครั้ง",
    faceRetryDetail: "คำตอบที่ถูกจะไฮไลต์เป็นสีเขียว ลองสังเกตอีกครั้งแล้วค่อยไปข้อถัดไปเมื่อพร้อม",
    listenTitle: "ฟังแล้วเลือก",
    listenText: "ฟังชื่ออารมณ์ แล้วเลือกใบหน้าที่ตรงกัน กดฟังซ้ำได้ทุกเมื่อ",
    listenButton: "ฟังชื่ออารมณ์",
    listenAgain: "ฟังอีกครั้ง",
    listenPrompt: "ใบหน้าไหนตรงกับคำที่ได้ยิน?",
    listenStart: "กดฟังเพื่อเริ่มฝึก",
    listenCorrect: "ตรงกับคำที่ได้ยินแล้ว!",
    listenRetry: "ลองเลือกใบหน้าอื่น",
    newWord: "อารมณ์ถัดไป",
    learnTitle: "เรียนรู้อารมณ์ 4 แบบ",
    learnText: "ค่อย ๆ ดูใบหน้า ชื่ออารมณ์ และความหมาย โหมดนี้ไม่มีถูกหรือผิด",
    hear: "ฟังเสียง",
    everydayTitle: "อารมณ์ในชีวิตประจำวัน",
    everydayText: "แต่ละคนอาจรู้สึกต่างกันในสถานการณ์เดียวกัน เลือกความรู้สึกที่ใกล้กับเราได้เลย โดยไม่มีคะแนน",
    mightFeel: "เราอาจรู้สึกอย่างไร?",
    hearSituation: "ฟังสถานการณ์",
    reflection: "ความรู้สึกแบบนี้เกิดขึ้นได้",
    reflectionText: "แต่ละคนอาจรู้สึกไม่เหมือนกันในสถานการณ์เดียวกัน สิ่งสำคัญคือการสังเกตและบอกความรู้สึกของตัวเอง",
    another: "สถานการณ์ถัดไป",
    audioUnavailable: "อุปกรณ์นี้ยังไม่มีเสียงภาษาไทยที่รองรับ",
  },
} as const;

function pickNext(current: EmotionId | null): EmotionId {
  const pool = emotions.filter((emotion) => emotion.id !== current);
  return pool[Math.floor(Math.random() * pool.length)].id;
}

function spokenEmotionName(emotion: (typeof emotions)[number], language: Language) {
  if (language === "th" && emotion.id === "frustrated") return "หงุดหงิด หรือ โกรธ";
  return language === "th" ? emotion.th : emotion.en;
}

export default function EmotionSyncOnlinePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [mode, setMode] = useState<Mode>("practice");
  const [prompt, setPrompt] = useState<EmotionId | null>(null);
  const [answer, setAnswer] = useState<EmotionId | null>(null);
  const [situationIndex, setSituationIndex] = useState(0);
  const [everydayAnswer, setEverydayAnswer] = useState<EmotionId | null>(null);
  const [faceIndex, setFaceIndex] = useState(0);
  const [faceAnswer, setFaceAnswer] = useState<EmotionId | null>(null);
  const [faceScore, setFaceScore] = useState(0);
  const [faceComplete, setFaceComplete] = useState(false);
  const [listenEmotion, setListenEmotion] = useState<EmotionId | null>(null);
  const [listenAnswer, setListenAnswer] = useState<EmotionId | null>(null);
  const [audioError, setAudioError] = useState(false);

  const c = copy[language];
  const activeEmotion = useMemo(() => emotions.find((emotion) => emotion.id === prompt) ?? null, [prompt]);
  const correct = Boolean(prompt && answer === prompt);
  const situation = situations[situationIndex];
  const activeFace = faceQuiz[faceIndex];
  const faceCorrect = faceAnswer === activeFace.emotion;
  const activeListenEmotion = emotions.find((emotion) => emotion.id === listenEmotion) ?? null;
  const listenCorrect = Boolean(listenEmotion && listenAnswer === listenEmotion);

  useEffect(() => {
    const stored = window.localStorage.getItem("plb-language");
    if (stored === "th" || stored === "en") setLanguage(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("plb-language", language);
  }, [language]);

  const speak = (text: string) => {
    setAudioError(false);
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setAudioError(true);
      return;
    }

    const synth = window.speechSynthesis;
    let didSpeak = false;
    const speakNow = () => {
      if (didSpeak) return;
      didSpeak = true;
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const target = language === "th" ? "th-TH" : "en-US";
        const prefix = language === "th" ? "th" : "en";
        const voices = synth.getVoices();
        const matchingVoices = voices.filter((item) => item.lang.toLowerCase() === target.toLowerCase())
          .concat(voices.filter((item) => item.lang.toLowerCase().startsWith(prefix) && item.lang.toLowerCase() !== target.toLowerCase()));
        const qualityWords = ["natural", "neural", "premium", "enhanced", "google", "microsoft", "online", "siri"];
        const voice = matchingVoices.sort((a, b) => {
          const score = (item: SpeechSynthesisVoice) => qualityWords.reduce((total, word) => total + (item.name.toLowerCase().includes(word) ? 1 : 0), 0);
          return score(b) - score(a);
        })[0];
        if (language === "th" && !voice) {
          setAudioError(true);
          return;
        }
        utterance.lang = voice?.lang ?? target;
        if (voice) utterance.voice = voice;
        utterance.rate = language === "th" ? 0.92 : 0.96;
        utterance.pitch = 1.02;
        utterance.onerror = () => setAudioError(true);
        synth.cancel();
        synth.speak(utterance);
      } catch {
        setAudioError(true);
      }
    };

    if (synth.getVoices().length) {
      speakNow();
      return;
    }

    const onVoices = () => {
      synth.removeEventListener("voiceschanged", onVoices);
      speakNow();
    };
    synth.addEventListener("voiceschanged", onVoices, { once: true });
    window.setTimeout(() => {
      synth.removeEventListener("voiceschanged", onVoices);
      speakNow();
    }, 450);
  };

  const startRound = () => {
    setPrompt((current) => pickNext(current));
    setAnswer(null);
  };

  const setAppMode = (next: Mode) => {
    setMode(next);
    setAnswer(null);
    setEverydayAnswer(null);
    setFaceAnswer(null);
    setListenAnswer(null);
    window.speechSynthesis?.cancel();
  };

  const playListenEmotion = (next = false) => {
    let id = listenEmotion;
    if (next || !id) {
      id = pickNext(listenEmotion);
      setListenEmotion(id);
      setListenAnswer(null);
    }
    const emotion = emotions.find((item) => item.id === id);
    if (emotion) speak(spokenEmotionName(emotion, language));
  };

  const answerFaceQuestion = (emotion: EmotionId) => {
    if (faceAnswer || faceComplete) return;
    setFaceAnswer(emotion);
    if (emotion === activeFace.emotion) setFaceScore((score) => score + 1);
  };

  const nextFaceQuestion = () => {
    if (faceIndex === faceQuiz.length - 1) {
      setFaceComplete(true);
      return;
    }
    setFaceIndex((index) => index + 1);
    setFaceAnswer(null);
  };

  const restartFaceQuiz = () => {
    setFaceIndex(0);
    setFaceAnswer(null);
    setFaceScore(0);
    setFaceComplete(false);
  };

  return (
    <main className={`online-page${language === "th" ? " lang-th" : ""}`}>
      <header className="site-header online-header">
        <a className="brand" href="/" aria-label="Project Little Bridge home">
          <span className="brand-mark" aria-hidden="true"><img src="/plb-bridge-mark.png" alt="" /></span>
          <span className="brand-words"><strong>Project</strong><small>Little Bridge</small></span>
        </a>
        <a className="online-back-link" href="/">← {c.back}</a>
        <div className="language-toggle" role="group" aria-label="Language / ภาษา">
          <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
          <button type="button" aria-pressed={language === "th"} onClick={() => setLanguage("th")}>ไทย</button>
        </div>
      </header>

      <section className="online-intro">
        <p className="eyebrow">{c.eyebrow}</p>
        <h1>{c.title}</h1>
        <p>{c.intro}</p>
      </section>

      <section className="online-workspace" aria-label="Emotion Sync Online practice area">
        <div className="online-mode-tabs" role="tablist" aria-label="Practice modes">
          {(["practice", "faces", "listen", "everyday", "learn"] as const).map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={mode === item}
              className={mode === item ? "is-active" : ""}
              onClick={() => setAppMode(item)}
              key={item}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>{c.modes[item]}
            </button>
          ))}
        </div>

        {mode === "practice" && (
          <div className="online-practice-grid">
            <div className="online-copy-panel">
              <span className="online-mode-number">01</span>
              <h2>{c.practiceTitle}</h2>
              <p>{c.practiceText}</p>
              <button className="online-voice-link" type="button" onClick={() => speak(c.speakQuestion)}>
                <span aria-hidden="true">◖))</span> {c.voicePrompt}
              </button>
              {audioError && <small className="online-audio-error" role="status">{c.audioUnavailable}</small>}
            </div>

            <div className="online-device-stage">
              <div className="emotion-ripples online-ripples" aria-hidden="true">
                <span className="emotion-glow" />
                <span className="emotion-ring ring-one" />
                <span className="emotion-ring ring-two" />
                <span className="emotion-ring ring-three" />
              </div>
              <div className="online-device-wrap">
                <div className="device-model online-device" aria-label="Digital Emotion Sync device">
                  <span className="device-label" aria-hidden="true">Emotion Sync · Online</span>
                  <div className="speaker" aria-hidden="true"><i /><i /><i /></div>
                  <span className={`device-led led-yellow${answer && !correct ? " is-on" : ""}`} aria-hidden="true" />
                  <span className={`device-led led-green${correct ? " is-on" : ""}`} aria-hidden="true" />

                  <button className="side-start-control" type="button" onClick={startRound} aria-label={c.pressStart}>
                    <span>Start</span>
                  </button>

                  <div className="oled" aria-live="polite">
                    <span className="oled-screw screw-one" aria-hidden="true" />
                    <span className="oled-screw screw-two" aria-hidden="true" />
                    <span className="oled-screw screw-three" aria-hidden="true" />
                    <span className="oled-screw screw-four" aria-hidden="true" />
                    <div className="oled-screen">
                      <b>{activeEmotion?.face ?? "•  •"}</b>
                      <span>{prompt ? c.which : c.pressStart}</span>
                    </div>
                  </div>

                  <div className="prototype-controls" role="group" aria-label={c.choose}>
                    {emotions.map((emotion) => (
                      <button
                        type="button"
                        className={`model-button model-${emotion.color}`}
                        key={emotion.id}
                        data-label={language === "th" ? emotion.th : emotion.en}
                        aria-label={language === "th" ? emotion.th : emotion.en}
                        aria-pressed={answer === emotion.id}
                        disabled={!prompt}
                        onClick={() => {
                          setAnswer(emotion.id);
                          if (emotion.id === prompt) {
                            speak(language === "th" ? `ถูกต้อง ${spokenEmotionName(emotion, language)}` : `Correct. ${emotion.en}.`);
                          } else {
                            speak(language === "th" ? "ลองดูอีกครั้ง" : "Take another look.");
                          }
                        }}
                      ><span className="sr-only">{language === "th" ? emotion.th : emotion.en}</span></button>
                    ))}
                  </div>
                </div>
                <div className={`online-feedback${answer ? " is-visible" : ""}`} role="status" aria-live="polite">
                  {!prompt ? (
                    <><strong>{c.pressStart}</strong><span>{c.startHint}</span></>
                  ) : !answer ? (
                    <><strong>{c.choose}</strong><span>{c.which}</span></>
                  ) : correct ? (
                    <><strong>{c.correct}</strong><span>{c.correctDetail}</span></>
                  ) : (
                    <><strong>{c.retry}</strong><span>{c.retryDetail}</span></>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === "faces" && (
          <div className="online-faces-mode">
            <div className="online-section-heading">
              <span className="online-mode-number">02</span>
              <h2>{c.facesTitle}</h2>
              <p>{c.facesText}</p>
            </div>
            {faceComplete ? (
              <div className="online-score-card" role="status" aria-live="polite">
                <span className="online-score-kicker">{c.quizScore}</span>
                <strong>{faceScore}<small> / {faceQuiz.length}</small></strong>
                <div className="online-score-bar" aria-hidden="true"><span style={{ width: `${(faceScore / faceQuiz.length) * 100}%` }} /></div>
                <p>{c.quizScoreDetail}</p>
                <button type="button" className="button button-blue" onClick={restartFaceQuiz}>{c.restartQuiz} <span aria-hidden="true">↻</span></button>
              </div>
            ) : (
              <div className="online-face-quiz">
                <div className="online-photo-wrap">
                  <img src={activeFace.image} alt={c.faceAlt} />
                  <span>{c.questionOf} {faceIndex + 1} / {faceQuiz.length}</span>
                </div>
                <div className="online-face-question">
                  <div className="online-question-row">
                    <p>{c.faceQuestion}</p>
                    <button className="online-question-audio" type="button" aria-label={c.voicePrompt} onClick={() => speak(c.faceQuestion)}>◖))</button>
                  </div>
                  <div className="online-answer-grid" role="group" aria-label={c.faceQuestion}>
                    {emotions.map((emotion) => (
                      <button
                        type="button"
                        disabled={Boolean(faceAnswer)}
                        className={`${faceAnswer === emotion.id ? "is-selected" : ""}${faceAnswer && emotion.id === activeFace.emotion ? " is-correct-answer" : ""}${faceAnswer === emotion.id && emotion.id === activeFace.emotion ? " is-correct" : ""}`}
                        onClick={() => answerFaceQuestion(emotion.id)}
                        key={emotion.id}
                      >
                        <span className={`answer-dot dot-${emotion.color}`} aria-hidden="true" />
                        {language === "th" ? emotion.th : emotion.en}
                      </button>
                    ))}
                  </div>
                  {faceAnswer && (
                    <div className={`online-quiz-feedback ${faceCorrect ? "is-correct" : "is-retry"}`} role="status">
                      <strong>{faceCorrect ? c.faceCorrect : c.faceRetry}</strong>
                      <p>{faceCorrect ? c.faceCorrectDetail : c.faceRetryDetail}</p>
                    </div>
                  )}
                  {faceAnswer && (
                    <button type="button" className="button button-blue online-another" onClick={nextFaceQuestion}>
                      {faceIndex === faceQuiz.length - 1 ? c.quizScore : c.nextFace} <span aria-hidden="true">→</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "listen" && (
          <div className="online-listen-mode">
            <div className="online-section-heading">
              <span className="online-mode-number">03</span>
              <h2>{c.listenTitle}</h2>
              <p>{c.listenText}</p>
            </div>
            <div className="online-listen-card">
              <div className="online-listen-prompt">
                <button className="online-play-button" type="button" onClick={() => playListenEmotion(false)}>
                  <span aria-hidden="true">◖))</span>
                  {activeListenEmotion ? c.listenAgain : c.listenButton}
                </button>
                <p>{activeListenEmotion ? c.listenPrompt : c.listenStart}</p>
                {audioError && <small className="online-audio-error" role="status">{c.audioUnavailable}</small>}
              </div>
              <div className="online-listen-faces" role="group" aria-label={c.listenPrompt}>
                {emotions.map((emotion) => (
                  <button
                    type="button"
                    disabled={!activeListenEmotion}
                    className={`${listenAnswer === emotion.id ? "is-selected" : ""}${listenAnswer === emotion.id && emotion.id === listenEmotion ? " is-correct" : ""}`}
                    onClick={() => setListenAnswer(emotion.id)}
                    key={emotion.id}
                    aria-label={language === "th" ? emotion.th : emotion.en}
                  >
                    <span aria-hidden="true">{emotion.face}</span>
                  </button>
                ))}
              </div>
              {listenAnswer && (
                <div className={`online-quiz-feedback ${listenCorrect ? "is-correct" : "is-retry"}`} role="status">
                  <strong>{listenCorrect ? c.listenCorrect : c.listenRetry}</strong>
                </div>
              )}
              {activeListenEmotion && (
                <button className="online-text-action" type="button" onClick={() => playListenEmotion(true)}>{c.newWord} →</button>
              )}
            </div>
          </div>
        )}

        {mode === "learn" && (
          <div className="online-learn-mode">
            <div className="online-section-heading">
              <span className="online-mode-number">05</span>
              <h2>{c.learnTitle}</h2>
              <p>{c.learnText}</p>
            </div>
            <div className="online-emotion-grid">
              {emotions.map((emotion) => {
                const name = language === "th" ? emotion.th : emotion.en;
                const description = language === "th" ? emotion.learnTh : emotion.learnEn;
                return (
                  <article className={`online-emotion-card emotion-${emotion.color}`} key={emotion.id}>
                    <span className="online-face" aria-hidden="true">{emotion.face}</span>
                    <h3>{name}</h3>
                    <p>{description}</p>
                    <button type="button" onClick={() => speak(`${spokenEmotionName(emotion, language)}. ${description}`)}>
                      <span aria-hidden="true">◖))</span> {c.hear}
                    </button>
                  </article>
                );
              })}
            </div>
            {audioError && <small className="online-audio-error" role="status">{c.audioUnavailable}</small>}
          </div>
        )}

        {mode === "everyday" && (
          <div className="online-everyday-mode">
            <div className="online-section-heading">
              <span className="online-mode-number">04</span>
              <h2>{c.everydayTitle}</h2>
              <p>{c.everydayText}</p>
            </div>
            <div className="online-situation-card">
              <div className="online-situation-visual">
                <img src={situation.image} alt="" />
                <span aria-hidden="true">{situationIndex + 1} / {situations.length}</span>
              </div>
              <div className="online-situation-copy">
                <h3>{c.mightFeel}</h3>
                <p className="online-situation-prompt">{language === "th" ? situation.th : situation.en}</p>
                <button className="online-voice-link online-situation-audio" type="button" onClick={() => speak(`${language === "th" ? situation.th : situation.en}. ${c.mightFeel}`)}>
                  <span aria-hidden="true">◖))</span> {c.hearSituation}
                </button>
                <div className="online-feeling-choices">
                  {emotions.map((emotion) => (
                    <button
                      type="button"
                      className={everydayAnswer === emotion.id ? "is-selected" : ""}
                      onClick={() => setEverydayAnswer(emotion.id)}
                      key={emotion.id}
                    >
                      <span aria-hidden="true">{emotion.face}</span>
                      {language === "th" ? emotion.th : emotion.en}
                    </button>
                  ))}
                </div>
                {everydayAnswer && (
                  <div className="online-reflection" role="status">
                    <strong>{c.reflection}</strong>
                    <p>{c.reflectionText}</p>
                  </div>
                )}
                <button
                  type="button"
                  className="button button-blue online-another"
                  onClick={() => {
                    setSituationIndex((index) => (index + 1) % situations.length);
                    setEverydayAnswer(null);
                  }}
                >
                  {c.another} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

    </main>
  );
}
