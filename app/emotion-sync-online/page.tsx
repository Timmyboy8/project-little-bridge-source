"use client";
import EmotionFace from "../EmotionFace";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getOrCreateBrowserId } from "../browser-identity";
import { startGuestCloud, syncGuestCloud, readGuestCache, guestCloudEnabled, queueGuestEvent, addGuestProfile, removeGuestProfiles, type GuestCache, type GuestEvent } from "../guest-cloud";
import {
  createAdultWithEmail,
  createFirebaseChild,
  deleteFirebaseChild,
  firebaseConfigured,
  loadChildProfiles,
  loadFirebaseHistory,
  observeAdultAccount,
  saveFirebaseEvent,
  signInAdult,
  signInAdultWithEmail,
  signOutAdult,
  resetAdultPassword,
} from "../firebase-client";

type Language = "en" | "th";
type ExportLanguage = Language;
type EmotionId = "happy" | "calm" | "sad" | "angry";
type ActivityId = "faces" | "listen" | "situations" | "match";
type View = "home" | "guided-menu" | "session" | "results" | "progress" | "device" | "everyday" | "learn";
type SessionKind = "guided" | "check";
type HistoryKind = SessionKind | "everyday" | "learn" | "device";
type Intensity = "small" | "medium" | "big";
type SupportChoice = "space" | "talk" | "help" | "try";
type ReportRange = "all" | "30" | "90";

type Emotion = {
  id: EmotionId;
  en: string;
  th: string;
  color: "yellow" | "black" | "blue" | "red";
  learnEn: string;
  learnTh: string;
};

type Story = {
  id: string;
  emotion: EmotionId;
  en: string;
  th: string;
};

type FaceRef = { emotion: EmotionId; index: number };

type Question = {
  id: string;
  activity: ActivityId;
  emotion: EmotionId;
  face?: FaceRef;
  story?: Story;
  targetFace?: FaceRef;
  options?: FaceRef[];
};

type AnswerRecord = {
  questionId: string;
  activity: ActivityId;
  emotion: EmotionId;
  selected: EmotionId;
  correct: boolean;
  responseMs: number;
  attempts: number;
};

type SavedSession = {
  id: string;
  completedAt: string;
  kind: HistoryKind;
  activity?: ActivityId;
  records: AnswerRecord[];
  durationMs?: number;
  everyday?: {
    sceneId: string;
    category: string;
    promptEn: string;
    promptTh: string;
    selected: EmotionId;
    intensity?: Intensity;
    support?: SupportChoice;
  };
  learnedEmotion?: EmotionId;
  deviceRound?: { prompt: EmotionId; selected: EmotionId; correct: boolean };
};

type ChildProfile = { id: string; nickname: string; createdAt: string };

type EverydayScene = {
  id: string;
  category: "home" | "school" | "friends" | "change" | "sensory" | "achievement";
  image?: string;
  visual: string;
  thaiAudio?: string;
  en: string;
  th: string;
};

const emotions: Emotion[] = [
  { id: "angry", en: "Angry", th: "โกรธ", color: "red", learnEn: "A strong feeling when something seems unfair, upsetting, or needs to stop.", learnTh: "ความรู้สึกแรงเมื่อบางอย่างทำให้ไม่พอใจ ดูไม่ยุติธรรม หรือเราอยากให้หยุด" },
  { id: "happy", en: "Happy", th: "มีความสุข", color: "yellow", learnEn: "A light, good feeling. You might smile or want to share it.", learnTh: "ความรู้สึกดีและเบาสบาย อาจทำให้เราอยากยิ้มหรือแบ่งปันความสุข" },
  { id: "sad", en: "Sad", th: "เศร้า", color: "blue", learnEn: "A heavy or low feeling. You may want comfort or some quiet time.", learnTh: "ความรู้สึกหนักหรือไม่สบายใจ เราอาจอยากได้รับกำลังใจหรืออยู่เงียบ ๆ สักพัก" },
  { id: "calm", en: "Calm", th: "สงบ", color: "black", learnEn: "A quiet, settled feeling. Your body may feel relaxed.", learnTh: "ความรู้สึกนิ่งและผ่อนคลาย ร่างกายอาจรู้สึกสบายขึ้น" },
];

const emotionOrder: EmotionId[] = ["angry", "happy", "sad", "calm"];
const activityOrder: ActivityId[] = ["faces", "listen", "situations", "match"];
const reflectionPageSize = 6;
const historyPageSize = 10;

const thaiAudio: Record<EmotionId | "question" | "retry", string> = {
  question: "/audio/th/question.mp3",
  retry: "/audio/th/retry.mp3",
  angry: "/audio/th/angry.mp3",
  happy: "/audio/th/happy.mp3",
  sad: "/audio/th/sad.mp3",
  calm: "/audio/th/calm.mp3",
};

const stories: Story[] = [
  { id: "h1", emotion: "happy", en: "Nina opens a card from her best friend. She smiles widely and claps her hands. How is Nina likely feeling?", th: "นีน่าเปิดการ์ดจากเพื่อนสนิท เธอยิ้มกว้างและตบมือ นีน่าน่าจะรู้สึกอย่างไร" },
  { id: "h2", emotion: "happy", en: "Pao finishes a model he worked hard on. He grins and runs to show his family. How is Pao likely feeling?", th: "เปาทำโมเดลที่ตั้งใจไว้เสร็จ เขายิ้มและรีบเอาไปให้ครอบครัวดู เปาน่าจะรู้สึกอย่างไร" },
  { id: "h3", emotion: "happy", en: "Mali hears that her class will visit the aquarium. Her eyes brighten and she bounces in her seat. How is Mali likely feeling?", th: "มะลิรู้ว่าห้องเรียนจะไปพิพิธภัณฑ์สัตว์น้ำ ตาของเธอเป็นประกายและขยับตัวด้วยความตื่นเต้น มะลิน่าจะรู้สึกอย่างไร" },
  { id: "h4", emotion: "happy", en: "Arun scores a goal during practice. He smiles and high-fives his teammate. How is Arun likely feeling?", th: "อรุณยิงประตูได้ตอนซ้อม เขายิ้มและแปะมือกับเพื่อนร่วมทีม อรุณน่าจะรู้สึกอย่างไร" },
  { id: "h5", emotion: "happy", en: "Lina's teacher displays her drawing on the wall. Lina beams when she sees it. How is Lina likely feeling?", th: "คุณครูนำรูปวาดของลีน่าไปติดบนผนัง ลีน่ายิ้มกว้างเมื่อเห็นผลงาน ลีน่าน่าจะรู้สึกอย่างไร" },
  { id: "h6", emotion: "happy", en: "Ken's missing pencil case is returned to him. He laughs with relief and thanks his friend. How is Ken likely feeling?", th: "เคนได้กล่องดินสอที่หายไปคืน เขาหัวเราะด้วยความโล่งใจและขอบคุณเพื่อน เคนน่าจะรู้สึกอย่างไร" },
  { id: "h7", emotion: "happy", en: "Yui sees her grandparents waiting at the door. She smiles and runs to hug them. How is Yui likely feeling?", th: "ยุ้ยเห็นคุณตาคุณยายรออยู่ที่ประตู เธอยิ้มและวิ่งเข้าไปกอด ยุ้ยน่าจะรู้สึกอย่างไร" },
  { id: "h8", emotion: "happy", en: "Tee learns that tomorrow is his favorite activity day. He cheers softly. How is Tee likely feeling?", th: "ตี๋รู้ว่าพรุ่งนี้มีกิจกรรมที่เขาชอบ เขาร้องดีใจเบา ๆ ตี๋น่าจะรู้สึกอย่างไร" },
  { id: "s1", emotion: "sad", en: "Mina's friend has to go home early. Mina looks down and her eyes fill with tears. How is Mina likely feeling?", th: "เพื่อนของมีนาต้องกลับบ้านเร็ว มีนาก้มหน้าและน้ำตาคลอ มีนาน่าจะรู้สึกอย่างไร" },
  { id: "s2", emotion: "sad", en: "Ton finds that his favorite plant has wilted. His shoulders drop and he becomes quiet. How is Ton likely feeling?", th: "ต้นเห็นว่าต้นไม้ที่ชอบเหี่ยวลง ไหล่ของเขาตกและเงียบไป ต้นน่าจะรู้สึกอย่างไร" },
  { id: "s3", emotion: "sad", en: "Aom cannot join the class trip because she is sick. She sighs and looks down. How is Aom likely feeling?", th: "อ้อมป่วยจนไปทัศนศึกษากับห้องไม่ได้ เธอถอนหายใจและก้มหน้า อ้อมน่าจะรู้สึกอย่างไร" },
  { id: "s4", emotion: "sad", en: "Ben's ice cream falls onto the ground before he tastes it. His lip trembles. How is Ben likely feeling?", th: "ไอศกรีมของเบนตกพื้นก่อนที่เขาจะได้กิน ริมฝีปากของเขาสั่น เบนน่าจะรู้สึกอย่างไร" },
  { id: "s5", emotion: "sad", en: "Fah's drawing tears by accident. She holds the pieces quietly with tears in her eyes. How is Fah likely feeling?", th: "รูปวาดของฟ้าขาดโดยไม่ตั้งใจ เธอถือเศษกระดาษเงียบ ๆ และมีน้ำตาคลอ ฟ้าน่าจะรู้สึกอย่างไร" },
  { id: "s6", emotion: "sad", en: "Joe waves goodbye after a long visit with his cousin. He wishes they could stay longer. How is Joe likely feeling?", th: "โจโบกมือลาหลังจากญาติมาเยี่ยมนาน เขาอยากให้อยู่ต่อ โจน่าจะรู้สึกอย่างไร" },
  { id: "s7", emotion: "sad", en: "Nok's team loses the final game. She sits quietly and looks at the floor. How is Nok likely feeling?", th: "ทีมของนกแพ้การแข่งขันรอบสุดท้าย เธอนั่งเงียบและมองพื้น นกน่าจะรู้สึกอย่างไร" },
  { id: "s8", emotion: "sad", en: "A story character says goodbye to someone they love. Kim wipes a tear while reading. How is Kim likely feeling?", th: "ตัวละครในเรื่องบอกลาคนที่รัก คิมเช็ดน้ำตาระหว่างอ่าน คิมน่าจะรู้สึกอย่างไร" },
  { id: "a1", emotion: "angry", en: "Pat's classmate grabs his bag after Pat asks them to stop. Pat frowns and his jaw tightens. How is Pat likely feeling?", th: "เพื่อนร่วมชั้นหยิบกระเป๋าของพัทไปทั้งที่พัทขอให้หยุด พัทขมวดคิ้วและกัดกรามแน่น พัทน่าจะรู้สึกอย่างไร" },
  { id: "a2", emotion: "angry", en: "Someone tears May's drawing on purpose. May's eyebrows pull down and she pushes her chair back. How is May likely feeling?", th: "มีคนตั้งใจฉีกรูปวาดของเมย์ เมย์ขมวดคิ้วและเลื่อนเก้าอี้ออกแรง ๆ เมย์น่าจะรู้สึกอย่างไร" },
  { id: "a3", emotion: "angry", en: "The game changes the rules after Beam is almost finished. He clenches his jaw and says that is not fair. How is Beam likely feeling?", th: "เกมเปลี่ยนกติกาตอนบีมใกล้จะเล่นจบ เขากัดกรามแน่นและพูดว่าไม่ยุติธรรม บีมน่าจะรู้สึกอย่างไร" },
  { id: "a4", emotion: "angry", en: "Someone keeps drawing on Pim's work after she says no. Pim grips her pencil and glares. How is Pim likely feeling?", th: "มีคนยังวาดทับงานของพิมต่อทั้งที่เธอบอกว่าไม่ พิมกำดินสอแน่นและจ้องเขม็ง พิมน่าจะรู้สึกอย่างไร" },
  { id: "a5", emotion: "angry", en: "Another child cuts in front of Kit after he has waited a long time. His face tightens and he crosses his arms. How is Kit likely feeling?", th: "เด็กอีกคนแซงคิวกิตหลังจากเขารอมานาน สีหน้าของกิตตึงและเขากอดอก กิตน่าจะรู้สึกอย่างไร" },
  { id: "a6", emotion: "angry", en: "Someone keeps interrupting while Dao is explaining an idea. Dao frowns and says, please let me finish. How is Dao likely feeling?", th: "มีคนพูดแทรกตอนดาวกำลังอธิบายความคิดอยู่หลายครั้ง ดาวขมวดคิ้วและบอกว่าขอพูดให้จบก่อน ดาวน่าจะรู้สึกอย่างไร" },
  { id: "a7", emotion: "angry", en: "A teammate blames Win for something he did not do. Win presses his lips together and stomps once. How is Win likely feeling?", th: "เพื่อนร่วมทีมโทษวินในเรื่องที่เขาไม่ได้ทำ วินเม้มปากและกระทืบเท้าหนึ่งครั้ง วินน่าจะรู้สึกอย่างไร" },
  { id: "a8", emotion: "angry", en: "Someone takes Jan's turn again even after she reminds them. Jan's brows squeeze together and her hands become tense. How is Jan likely feeling?", th: "มีคนแย่งรอบของแจนอีกครั้งทั้งที่เธอเตือนแล้ว แจนขมวดคิ้วและมือเกร็ง แจนน่าจะรู้สึกอย่างไร" },
  { id: "c1", emotion: "calm", en: "Noah sits in a quiet corner, breathing slowly with relaxed shoulders. How is Noah likely feeling?", th: "โนอาห์นั่งในมุมเงียบ ๆ หายใจช้าและผ่อนคลายไหล่ โนอาห์น่าจะรู้สึกอย่างไร" },
  { id: "c2", emotion: "calm", en: "Fern listens to soft rain while resting under a blanket. Her body feels loose and still. How is Fern likely feeling?", th: "เฟิร์นฟังเสียงฝนเบา ๆ ขณะพักใต้ผ้าห่ม ร่างกายของเธอผ่อนคลายและนิ่ง เฟิร์นน่าจะรู้สึกอย่างไร" },
  { id: "c3", emotion: "calm", en: "Mek finishes taking five slow breaths. His hands are open and his face is relaxed. How is Mek likely feeling?", th: "เมฆหายใจช้า ๆ ครบห้าครั้ง มือของเขาคลายและใบหน้าผ่อนคลาย เมฆน่าจะรู้สึกอย่างไร" },
  { id: "c4", emotion: "calm", en: "Suda draws quietly at an empty table. Her breathing is steady. How is Suda likely feeling?", th: "สุดาวาดรูปเงียบ ๆ ที่โต๊ะว่าง ลมหายใจของเธอสม่ำเสมอ สุดาน่าจะรู้สึกอย่างไร" },
  { id: "c5", emotion: "calm", en: "After stretching, Pond sits comfortably with his shoulders down. How is Pond likely feeling?", th: "หลังจากยืดเส้น พอนด์นั่งสบายและปล่อยไหล่ลง พอนด์น่าจะรู้สึกอย่างไร" },
  { id: "c6", emotion: "calm", en: "Belle watches fish swim slowly in a tank. She is quiet and her face is soft. How is Belle likely feeling?", th: "เบลล์มองปลาว่ายช้า ๆ ในตู้ เธอเงียบและสีหน้าผ่อนคลาย เบลล์น่าจะรู้สึกอย่างไร" },
  { id: "c7", emotion: "calm", en: "Korn lies on a mat after exercise and takes an easy breath. How is Korn likely feeling?", th: "กรณ์นอนบนเสื่อหลังออกกำลังกายและหายใจสบาย ๆ กรณ์น่าจะรู้สึกอย่างไร" },
  { id: "c8", emotion: "calm", en: "June reads in a quiet library. Her hands and shoulders are relaxed. How is June likely feeling?", th: "จูนอ่านหนังสือในห้องสมุดที่เงียบ มือและไหล่ของเธอผ่อนคลาย จูนน่าจะรู้สึกอย่างไร" },
];

const everydayScenes: EverydayScene[] = [
  { id: "tower", category: "achievement", image: "/everyday-scenes/tower.webp", visual: "▦", thaiAudio: "/audio/th/situation-tower.mp3", en: "A tower you built falls down.", th: "หอคอยที่เราต่อไว้ล้มลง" },
  { id: "drawing", category: "achievement", image: "/everyday-scenes/drawing.webp", visual: "✎", thaiAudio: "/audio/th/situation-drawing.mp3", en: "You finish a picture you really like.", th: "เราวาดรูปที่ตัวเองชอบเสร็จแล้ว" },
  { id: "breathe", category: "sensory", image: "/everyday-scenes/breathe.webp", visual: "≈", thaiAudio: "/audio/th/situation-breathe.mp3", en: "You sit somewhere quiet and take a slow breath.", th: "เรานั่งในที่เงียบ ๆ และค่อย ๆ หายใจ" },
  { id: "goodbye", category: "friends", image: "/everyday-scenes/goodbye.webp", visual: "♡", thaiAudio: "/audio/th/situation-goodbye.mp3", en: "A friend goes home and you miss them.", th: "เพื่อนกลับบ้านแล้วเราคิดถึงเพื่อน" },
  { id: "plan-change", category: "change", image: "/everyday-scenes/plan-change.webp", visual: "↻", en: "A plan you were expecting changes suddenly.", th: "แผนที่เรารอคอยเปลี่ยนกะทันหัน" },
  { id: "shared-toy", category: "home", image: "/everyday-scenes/shared-toy.webp", visual: "◇", en: "Someone at home uses something you were playing with.", th: "คนที่บ้านหยิบของที่เรากำลังเล่นไปใช้" },
  { id: "praise", category: "school", image: "/everyday-scenes/praise.webp", visual: "★", en: "A teacher says they are proud of your work.", th: "คุณครูบอกว่าภูมิใจในผลงานของเรา" },
  { id: "cafeteria", category: "sensory", image: "/everyday-scenes/cafeteria.webp", visual: ")))", en: "The cafeteria becomes very loud and crowded.", th: "โรงอาหารเสียงดังและมีคนเยอะมาก" },
  { id: "new-seat", category: "change", image: "/everyday-scenes/new-seat.webp", visual: "↔", en: "You are asked to sit in a different place today.", th: "วันนี้เราต้องเปลี่ยนไปนั่งที่ใหม่" },
  { id: "join-game", category: "friends", image: "/everyday-scenes/join-game.webp", visual: "+", en: "Other children ask you to join their game.", th: "เพื่อนชวนเราไปเล่นด้วยกัน" },
  { id: "lost-turn", category: "friends", image: "/everyday-scenes/lost-turn.webp", visual: "!", en: "Someone takes your turn before you are ready.", th: "มีคนแย่งรอบของเราก่อนที่เราจะพร้อม" },
  { id: "hard-puzzle", category: "achievement", image: "/everyday-scenes/hard-puzzle.webp", visual: "✦", en: "You finish a difficult puzzle after trying many times.", th: "เราต่อปริศนาที่ยากสำเร็จหลังจากลองหลายครั้ง" },
];

const copy = {
  en: {
    back: "Project Little Bridge", eyebrow: "Structured emotion learning", title: "Emotion Sync Online",
    intro: "Build emotion-recognition skills through guided practice, varied examples, and gentle progress checks.",
    homeTitle: "Choose how to practice", homeText: "Start with support, check independent progress, or explore feelings without a score.",
    guided: "Guided Practice", guidedText: "8 balanced questions with immediate feedback, helpful cues, and another try when needed.",
    check: "Progress Check", checkText: "16 balanced questions across four skills. One answer each, then a clear session summary.",
    explore: "Explore feelings", exploreText: "Learn the four feelings with simple explanations and audio.",
    everyday: "Everyday feelings", everydayText: "Explore how the child may feel across home, school, friendships, change, sensory moments, and achievements. There are no right or wrong answers.",
    device: "Device practice", deviceText: "Use the online model like the physical Emotion Sync device.",
    progress: "Progress & history", progressText: "See the full picture across scored practice, everyday reflections, Explore Feelings, and Device Practice.",
    start: "Start", chooseActivity: "Choose a guided activity", chooseActivityText: "Each activity gives two questions for every emotion, so one feeling is not practiced more than another.",
    activities: {
      faces: { title: "Real Faces", text: "Recognize feelings across unfamiliar people and varied expressions." },
      listen: { title: "Hear & Match", text: "Hear a feeling name, then choose the matching face." },
      situations: { title: "Situation Stories", text: "Use words, body cues, and context to identify a likely feeling." },
      match: { title: "Same Emotion Match", text: "Find the two different people showing the same feeling." },
    },
    questions: "questions", question: "Question", of: "of", backHome: "Back to activities", quit: "End session", next: "Next question", finish: "See results",
    facePrompt: "What feeling does this face show?", listenPrompt: "Which face matches the feeling you hear?", play: "Play feeling", playAgain: "Hear it again",
    storyPrompt: "What is the person likely feeling?", listenStory: "Listen to the story", listenStoryAgain: "Hear the story again", matchPrompt: "Which person shows the same feeling as the face above?",
    choose: "Choose an answer", correct: "That matches!", correctDetail: "Nice noticing. You can continue when you are ready.", retry: "Take another look.", retryDetail: "That answer does not match yet. Try another choice.",
    selected: "Answer recorded", selectedDetail: "Progress Check gives no hints during the session. Continue when you are ready.",
    results: "Session summary", resultsText: "This result describes this practice session. It is educational progress information, not a diagnosis.",
    accuracy: "Accuracy", response: "Median response time", seconds: "sec", byEmotion: "By emotion", byActivity: "By activity", responses: "responses",
    morePractice: "More practice will make trends clearer.", again: "Start another check", home: "Choose another activity",
    report: "Comprehensive progress report", reportIntro: "This report combines every activity the child completes. It supports adult observation and learning decisions; it is not a diagnosis.", noHistory: "Complete any activity to begin the report.", totalSessions: "Activities completed", totalQuestions: "Scored answers", recentTrend: "Recent scored accuracy", history: "Complete activity history", needsPractice: "Suggested focus", balanced: "More sessions are needed before suggesting one focus", confusion: "Most common mix-up", noConfusion: "No repeated mix-up yet", reportNotice: "Activity history is saved to the selected account or browser profile.", saveStatus: "Saved to account", savingActivity: "Saving to account…", saveFailed: "This activity could not be saved. Check the internet connection and try it again.", openReport: "View progress", allSessions: "All scored skills", guidedSession: "Guided practice", checkSession: "Progress check", everydaySession: "Everyday feelings", learnSession: "Explore feelings", deviceSession: "Device practice", activityCoverage: "Activity coverage", reflectionsTitle: "Feelings in everyday situations", reflectionsText: "Each entry connects the situation with the feeling the child chose, how strong it felt, and what they thought might help. These are personal responses—not right or wrong answers.", reflectionResponses: "responses", reflectionStrength: "Strength", reflectionSupport: "Might help", noReflections: "Complete Everyday Feelings to connect feelings with situations.", allFeelings: "All feelings", allTime: "All time", last30Days: "Last 30 days", last90Days: "Last 90 days", showing: "Showing", entries: "entries", previous: "Previous", nextPage: "Next", noFilteredReflections: "No responses match these filters.", exportTitle: "Download progress data", exportText: "Download every saved activity for this child as a CSV file that opens directly in Google Sheets, Microsoft Excel, or another spreadsheet app.", exportButton: "Download CSV", exportIncludes: "Includes scored answers, response times, Everyday Feelings selections, Explore Feelings, and Device Practice.", exportReady: "CSV downloaded.", exportLanguageTitle: "Choose the spreadsheet language", exportLanguageText: "Column headings and readable responses will use the language you choose.", exportEnglish: "Download in English", exportThai: "ดาวน์โหลดภาษาไทย", exportCancel: "Cancel", adultAccount: "Progress storage", account: "Account", signIn: "Sign in or create account", signInProvider: "Continue with Google", setupRequired: "Online accounts are not configured yet.", signInText: "A parent, teacher, or therapist can sign in for cloud saving across devices.", syncAcross: "Choose how to save progress", syncAcrossText: "Guests can save profiles and results privately online without an email. Sign in to access an adult account across devices.", signedInAs: "Signed in as", tracking: "Currently tracking", syncedAcross: "Every completed activity is saved online to this child profile and appears on your other devices.", childProfile: "Child profile", selectedChild: "Selected child", switchChild: "Switch child", manageChild: "Manage profile", profileOptions: "Profile options", addChild: "Add another child", nickname: "Child nickname", nicknameHint: "Use a nickname only. Do not enter a full legal name.", create: "Create profile", createFirst: "Create the first child profile", signOut: "Sign out", cloudPrivate: "Private account storage", accountRequired: "Choose guest mode or sign in", accountRequiredText: "Guest profiles and results are saved to a private guest account. This browser keeps the key to that account.", guestButton: "Continue as guest", guestName: "Guest profile", guestLocal: "Guest cloud saving", guestDeviceOnly: "Guest profiles and results sync to Firebase. Keep this browser’s data: clearing it can remove access to your guest account.", signInCloud: "Sign in for cloud sync", deleteGuest: "Delete all guest profiles", deleteGuestConfirm: "Delete all profiles and results from this guest account and its browser copy? This cannot be undone.", syncError: "We could not reach the online account. Your cloud activity was not saved.", deleteChild: "Delete profile & data", deleteConfirm: "Permanently delete this child profile and all of its activity history? This cannot be undone.", consent: "I am an adult responsible for this child and consent to storing this nickname and activity history online.", privacy: "Privacy & data use", intensityTitle: "How strong is the feeling?", supportTitle: "What might help?", intensities: ["A little", "In the middle", "A lot"], supports: ["Quiet space", "Talk to someone", "Ask for help", "Try again"], saveReflection: "Save & see another situation", category: "Situation type", categories: { home: "Home", school: "School", friends: "Friends", change: "Change", sensory: "Sensory", achievement: "Achievement" },
    authSignInTitle: "Adult sign in", authCreateTitle: "Create an adult account", authIntro: "Sign in to keep each child's activity history private and available across devices.", authGoogle: "Continue with Google", authOr: "or use email", authEmail: "Email address", authPassword: "Password", authConfirm: "Confirm password", authEmailSignIn: "Sign in with email", authCreate: "Create account", authNeedAccount: "New to Emotion Sync?", authHaveAccount: "Already have an account?", authCreateLink: "Create an account", authSignInLink: "Sign in", authForgot: "Forgot password?", authResetSent: "Password reset email sent. Check your inbox.", authEnterEmail: "Enter your email address first.", authMismatch: "The passwords do not match.", authInvalid: "The email or password is incorrect.", authEmailUsed: "An account already exists for this email.", authWeak: "Use a password with at least 6 characters.", authDomain: "This website still needs to be added to Firebase Authorized domains.", authGeneric: "We could not complete sign-in. Please try again.", authClose: "Close sign in",
    learnTitle: "Learn the four feelings", hear: "Hear", mightFeel: "How might you feel?", reflection: "That feeling can make sense.", reflectionText: "Different people can feel differently in the same situation. Naming your feeling is the important part.", another: "Another situation",
    pressStart: "Press Start", which: "Which feeling is this?", startHint: "Start a new round when you are ready.", audioError: "The audio could not play. Please try again.",
    guidedLabel: "Feedback and retries", checkLabel: "One answer per question", unscoredLabel: "No right or wrong answer",
  },
  th: {
    back: "Project Little Bridge", eyebrow: "ฝึกเรียนรู้อารมณ์อย่างเป็นขั้นตอน", title: "Emotion Sync Online",
    intro: "พัฒนาทักษะการสังเกตอารมณ์ผ่านแบบฝึกที่มีคำแนะนำ ตัวอย่างที่หลากหลาย และแบบตรวจความก้าวหน้าอย่างสบายใจ",
    homeTitle: "เลือกวิธีฝึก", homeText: "เริ่มฝึกพร้อมคำแนะนำ ตรวจความก้าวหน้าด้วยตัวเอง หรือสำรวจความรู้สึกโดยไม่มีคะแนน",
    guided: "ฝึกพร้อมคำแนะนำ", guidedText: "คำถามสมดุล 8 ข้อ พร้อมคำแนะนำทันทีและลองตอบใหม่ได้เมื่อจำเป็น",
    check: "ตรวจความก้าวหน้า", checkText: "คำถามสมดุล 16 ข้อจาก 4 ทักษะ ตอบข้อละครั้ง แล้วดูสรุปของรอบนี้",
    explore: "เรียนรู้อารมณ์", exploreText: "ทำความรู้จักอารมณ์ทั้ง 4 แบบด้วยคำอธิบายง่าย ๆ และเสียงอ่าน",
    everyday: "อารมณ์ในชีวิตประจำวัน", everydayText: "สำรวจว่าเด็กอาจรู้สึกอย่างไรในสถานการณ์ที่บ้าน โรงเรียน เพื่อน การเปลี่ยนแปลง สิ่งกระตุ้นรอบตัว และความสำเร็จ โดยไม่มีคำตอบถูกหรือผิด",
    device: "ฝึกกับอุปกรณ์", deviceText: "ลองใช้งานออนไลน์เหมือน Emotion Sync เครื่องจริง",
    progress: "ความก้าวหน้าและประวัติ", progressText: "ดูภาพรวมจากแบบฝึกที่มีคะแนน การสำรวจความรู้สึก การเรียนรู้อารมณ์ และการฝึกกับอุปกรณ์",
    start: "เริ่ม", chooseActivity: "เลือกกิจกรรมฝึก", chooseActivityText: "แต่ละกิจกรรมมีคำถามอารมณ์ละ 2 ข้อ เพื่อฝึกทุกอารมณ์อย่างสมดุล",
    activities: {
      faces: { title: "ดูสีหน้าจริง", text: "ฝึกสังเกตอารมณ์จากคนและสีหน้าที่หลากหลาย" },
      listen: { title: "ฟังแล้วจับคู่", text: "ฟังชื่ออารมณ์แล้วเลือกใบหน้าที่ตรงกัน" },
      situations: { title: "เรื่องราวสถานการณ์", text: "ใช้คำพูด ท่าทาง และบริบทเพื่อสังเกตอารมณ์ที่เป็นไปได้" },
      match: { title: "จับคู่อารมณ์เดียวกัน", text: "หาคนสองคนที่แสดงอารมณ์เดียวกัน" },
    },
    questions: "ข้อ", question: "ข้อ", of: "จาก", backHome: "กลับไปเลือกกิจกรรม", quit: "จบรอบ", next: "ข้อถัดไป", finish: "ดูผลลัพธ์",
    facePrompt: "สีหน้านี้แสดงอารมณ์อะไร?", listenPrompt: "ใบหน้าไหนตรงกับอารมณ์ที่ได้ยิน?", play: "ฟังชื่ออารมณ์", playAgain: "ฟังอีกครั้ง",
    storyPrompt: "คนในเรื่องน่าจะรู้สึกอย่างไร?", listenStory: "ฟังเรื่องราว", listenStoryAgain: "ฟังเรื่องราวอีกครั้ง", matchPrompt: "คนไหนแสดงอารมณ์เดียวกับใบหน้าด้านบน?",
    choose: "เลือกคำตอบ", correct: "ตรงกันแล้ว!", correctDetail: "สังเกตได้ดีมาก ไปข้อต่อไปเมื่อพร้อม", retry: "ลองดูอีกครั้ง", retryDetail: "คำตอบนี้ยังไม่ตรง ลองเลือกคำตอบอื่นได้เลย",
    selected: "บันทึกคำตอบแล้ว", selectedDetail: "โหมดตรวจความก้าวหน้าจะไม่บอกคำใบ้ระหว่างทำ ไปข้อต่อไปเมื่อพร้อม",
    results: "สรุปรอบการฝึก", resultsText: "ผลนี้แสดงการฝึกในรอบนี้ เป็นข้อมูลเพื่อการเรียนรู้ ไม่ใช่การวินิจฉัย",
    accuracy: "ความแม่นยำ", response: "เวลาตอบค่ากลาง", seconds: "วินาที", byEmotion: "แยกตามอารมณ์", byActivity: "แยกตามกิจกรรม", responses: "คำตอบ",
    morePractice: "ฝึกเพิ่มอีกหลายรอบเพื่อให้เห็นแนวโน้มชัดขึ้น", again: "ตรวจความก้าวหน้าอีกครั้ง", home: "เลือกกิจกรรมอื่น",
    report: "รายงานความก้าวหน้าแบบละเอียด", reportIntro: "รายงานนี้รวมทุกกิจกรรมที่เด็กทำ เพื่อช่วยผู้ใหญ่สังเกตและวางแผนการเรียนรู้ ไม่ใช่การวินิจฉัย", noHistory: "ทำกิจกรรมใดก็ได้เพื่อเริ่มสร้างรายงาน", totalSessions: "กิจกรรมที่ทำเสร็จ", totalQuestions: "คำตอบที่มีคะแนน", recentTrend: "ความแม่นยำล่าสุด", history: "ประวัติกิจกรรมทั้งหมด", needsPractice: "อารมณ์ที่ควรฝึกเพิ่ม", balanced: "ต้องมีผลจากหลายรอบมากขึ้นก่อนแนะนำอารมณ์ที่ควรเน้น", confusion: "คำตอบที่มักสับสน", noConfusion: "ยังไม่พบรูปแบบที่สับสนซ้ำ", reportNotice: "ประวัติกิจกรรมจะบันทึกในบัญชีหรือโปรไฟล์เบราว์เซอร์ที่เลือก", saveStatus: "บันทึกในบัญชีแล้ว", savingActivity: "กำลังบันทึกในบัญชี…", saveFailed: "บันทึกกิจกรรมนี้ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วทำกิจกรรมอีกครั้ง", openReport: "ดูความก้าวหน้า", allSessions: "ทักษะที่มีคะแนนทั้งหมด", guidedSession: "ฝึกพร้อมคำแนะนำ", checkSession: "ตรวจความก้าวหน้า", everydaySession: "อารมณ์ในชีวิตประจำวัน", learnSession: "เรียนรู้อารมณ์", deviceSession: "ฝึกกับอุปกรณ์", activityCoverage: "กิจกรรมที่ทำ", reflectionsTitle: "ความรู้สึกในแต่ละสถานการณ์", reflectionsText: "แต่ละรายการเชื่อมโยงสถานการณ์กับอารมณ์ที่เด็กเลือก ระดับความรู้สึก และสิ่งที่เด็กคิดว่าอาจช่วยได้ คำตอบเหล่านี้ไม่มีถูกหรือผิด", reflectionResponses: "คำตอบ", reflectionStrength: "ระดับความรู้สึก", reflectionSupport: "สิ่งที่อาจช่วย", noReflections: "ทำกิจกรรมอารมณ์ในชีวิตประจำวันเพื่อเชื่อมโยงความรู้สึกกับสถานการณ์", allFeelings: "ทุกอารมณ์", allTime: "ตลอดเวลา", last30Days: "30 วันที่ผ่านมา", last90Days: "90 วันที่ผ่านมา", showing: "แสดง", entries: "รายการ", previous: "ก่อนหน้า", nextPage: "ถัดไป", noFilteredReflections: "ไม่มีคำตอบที่ตรงกับตัวกรองนี้", exportTitle: "ดาวน์โหลดข้อมูลความก้าวหน้า", exportText: "ดาวน์โหลดทุกกิจกรรมที่บันทึกไว้ของเด็กคนนี้เป็นไฟล์ CSV ซึ่งเปิดใน Google Sheets, Microsoft Excel หรือแอปตารางคำนวณอื่นได้ทันที", exportButton: "ดาวน์โหลด CSV", exportIncludes: "ประกอบด้วยคำตอบที่มีคะแนน เวลาตอบ อารมณ์ในชีวิตประจำวัน การเรียนรู้อารมณ์ และการฝึกกับอุปกรณ์", exportReady: "ดาวน์โหลดไฟล์ CSV แล้ว", exportLanguageTitle: "เลือกภาษาของตารางข้อมูล", exportLanguageText: "หัวตารางและคำตอบที่อ่านได้จะแสดงเป็นภาษาที่เลือก", exportEnglish: "Download in English", exportThai: "ดาวน์โหลดภาษาไทย", exportCancel: "ยกเลิก", adultAccount: "การบันทึกความก้าวหน้า", account: "บัญชี", signIn: "เข้าสู่ระบบหรือสร้างบัญชี", signInProvider: "เข้าสู่ระบบด้วย Google", setupRequired: "ยังไม่ได้ตั้งค่าบัญชีออนไลน์", signInText: "ผู้ปกครอง ครู หรือนักบำบัดสามารถเข้าสู่ระบบเพื่อบันทึกข้อมูลบนคลาวด์และใช้ข้ามอุปกรณ์", syncAcross: "เลือกวิธีบันทึกความก้าวหน้า", syncAcrossText: "ผู้เยี่ยมชมสามารถบันทึกโปรไฟล์และผลกิจกรรมออนไลน์โดยไม่ใช้อีเมล หรือเข้าสู่บัญชีผู้ใหญ่เพื่อใช้ข้ามอุปกรณ์", signedInAs: "เข้าสู่ระบบในชื่อ", tracking: "กำลังบันทึกให้", syncedAcross: "ทุกกิจกรรมที่ทำเสร็จจะบันทึกออนไลน์ในโปรไฟล์นี้และเปิดดูได้จากอุปกรณ์อื่น", childProfile: "โปรไฟล์เด็ก", selectedChild: "โปรไฟล์ที่เลือก", switchChild: "เปลี่ยนโปรไฟล์เด็ก", manageChild: "จัดการโปรไฟล์", profileOptions: "ตัวเลือกโปรไฟล์", addChild: "เพิ่มโปรไฟล์เด็ก", nickname: "ชื่อเล่นของเด็ก", nicknameHint: "ใช้ชื่อเล่นเท่านั้น ไม่ควรกรอกชื่อ-นามสกุลจริง", create: "สร้างโปรไฟล์", createFirst: "สร้างโปรไฟล์เด็กคนแรก", signOut: "ออกจากระบบ", cloudPrivate: "จัดเก็บอย่างเป็นส่วนตัวในบัญชี", accountRequired: "เลือกใช้แบบผู้เยี่ยมชมหรือเข้าสู่ระบบ", accountRequiredText: "โปรไฟล์และผลกิจกรรมผู้เยี่ยมชมบันทึกในบัญชีส่วนตัว โดยเบราว์เซอร์นี้เก็บสิทธิ์เข้าถึงบัญชี", guestButton: "ใช้แบบผู้เยี่ยมชม", guestName: "โปรไฟล์ผู้เยี่ยมชม", guestLocal: "บันทึกบนคลาวด์สำหรับผู้เยี่ยมชม", guestDeviceOnly: "โปรไฟล์และผลกิจกรรมซิงค์กับ Firebase การล้างข้อมูลเบราว์เซอร์อาจทำให้ไม่สามารถเข้าถึงบัญชีผู้เยี่ยมชมเดิมได้", signInCloud: "เข้าสู่ระบบเพื่อบันทึกบนคลาวด์", deleteGuest: "ลบโปรไฟล์ผู้เยี่ยมชมทั้งหมด", deleteGuestConfirm: "ลบโปรไฟล์และผลกิจกรรมทั้งหมดจากบัญชีผู้เยี่ยมชมและเบราว์เซอร์นี้หรือไม่ การดำเนินการนี้ย้อนกลับไม่ได้", syncError: "ไม่สามารถเชื่อมต่อบัญชีออนไลน์ได้ กิจกรรมบนคลาวด์ไม่ได้ถูกบันทึก", deleteChild: "ลบโปรไฟล์และข้อมูล", deleteConfirm: "ลบโปรไฟล์เด็กนี้และประวัติกิจกรรมทั้งหมดอย่างถาวรหรือไม่ การดำเนินการนี้ย้อนกลับไม่ได้", consent: "ฉันเป็นผู้ใหญ่ที่รับผิดชอบเด็กคนนี้และยินยอมให้จัดเก็บชื่อเล่นและประวัติกิจกรรมทางออนไลน์", privacy: "ความเป็นส่วนตัวและการใช้ข้อมูล", intensityTitle: "ความรู้สึกนี้แรงแค่ไหน?", supportTitle: "อะไรอาจช่วยได้?", intensities: ["เล็กน้อย", "ปานกลาง", "มาก"], supports: ["อยู่ในที่เงียบ", "คุยกับใครสักคน", "ขอความช่วยเหลือ", "ลองอีกครั้ง"], saveReflection: "บันทึกและดูสถานการณ์ถัดไป", category: "ประเภทสถานการณ์", categories: { home: "ที่บ้าน", school: "โรงเรียน", friends: "เพื่อน", change: "การเปลี่ยนแปลง", sensory: "สิ่งกระตุ้นรอบตัว", achievement: "ความสำเร็จ" },
    authSignInTitle: "เข้าสู่ระบบสำหรับผู้ใหญ่", authCreateTitle: "สร้างบัญชีผู้ใหญ่", authIntro: "เข้าสู่ระบบเพื่อเก็บประวัติกิจกรรมของเด็กแต่ละคนอย่างเป็นส่วนตัวและเปิดดูได้จากทุกอุปกรณ์", authGoogle: "ดำเนินการต่อด้วย Google", authOr: "หรือใช้อีเมล", authEmail: "อีเมล", authPassword: "รหัสผ่าน", authConfirm: "ยืนยันรหัสผ่าน", authEmailSignIn: "เข้าสู่ระบบด้วยอีเมล", authCreate: "สร้างบัญชี", authNeedAccount: "ยังไม่มีบัญชี Emotion Sync?", authHaveAccount: "มีบัญชีอยู่แล้ว?", authCreateLink: "สร้างบัญชี", authSignInLink: "เข้าสู่ระบบ", authForgot: "ลืมรหัสผ่าน?", authResetSent: "ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบกล่องจดหมาย", authEnterEmail: "กรุณากรอกอีเมลก่อน", authMismatch: "รหัสผ่านทั้งสองช่องไม่ตรงกัน", authInvalid: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", authEmailUsed: "มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว", authWeak: "กรุณาใช้รหัสผ่านอย่างน้อย 6 ตัวอักษร", authDomain: "ยังต้องเพิ่มเว็บไซต์นี้ใน Authorized domains ของ Firebase", authGeneric: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองอีกครั้ง", authClose: "ปิดหน้าต่างเข้าสู่ระบบ",
    learnTitle: "เรียนรู้อารมณ์ 4 แบบ", hear: "ฟังเสียง", mightFeel: "เราอาจรู้สึกอย่างไร?", reflection: "ความรู้สึกแบบนี้เกิดขึ้นได้", reflectionText: "แต่ละคนอาจรู้สึกไม่เหมือนกันในสถานการณ์เดียวกัน สิ่งสำคัญคือการสังเกตและบอกความรู้สึกของตัวเอง", another: "สถานการณ์ถัดไป",
    pressStart: "กด Start", which: "ใบหน้านี้แสดงอารมณ์อะไร?", startHint: "พร้อมเมื่อไหร่ กด Start เพื่อเริ่มรอบใหม่ได้เลย", audioError: "ไม่สามารถเล่นเสียงได้ กรุณาลองอีกครั้ง",
    guidedLabel: "มีคำแนะนำและลองใหม่ได้", checkLabel: "ตอบได้ข้อละหนึ่งครั้ง", unscoredLabel: "ไม่มีคำตอบถูกหรือผิด",
  },
} as const;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function randomFace(emotion: EmotionId, used: Set<string>): FaceRef {
  const available = Array.from({ length: 12 }, (_, index) => index).filter((index) => !used.has(`${emotion}-${index}`));
  const index = available[Math.floor(Math.random() * available.length)] ?? Math.floor(Math.random() * 12);
  used.add(`${emotion}-${index}`);
  return { emotion, index };
}

function makeQuestion(activity: ActivityId, emotion: EmotionId, serial: number, used: Set<string>): Question {
  if (activity === "faces") return { id: `faces-${emotion}-${serial}-${Date.now()}`, activity, emotion, face: randomFace(emotion, used) };
  if (activity === "listen") return { id: `listen-${emotion}-${serial}-${Date.now()}`, activity, emotion };
  if (activity === "situations") {
    const pool = stories.filter((story) => story.emotion === emotion);
    const story = pool[serial % pool.length];
    return { id: `story-${story.id}-${Date.now()}`, activity, emotion, story };
  }
  const targetFace = randomFace(emotion, used);
  const options = shuffle(emotionOrder.map((id) => randomFace(id, used)));
  return { id: `match-${emotion}-${serial}-${Date.now()}`, activity, emotion, targetFace, options };
}

function createGuided(activity: ActivityId): Question[] {
  const used = new Set<string>();
  return shuffle(emotionOrder.flatMap((emotion) => [makeQuestion(activity, emotion, Math.floor(Math.random() * 4), used), makeQuestion(activity, emotion, 4 + Math.floor(Math.random() * 4), used)]));
}

function createCheck(): Question[] {
  const used = new Set<string>();
  return shuffle(activityOrder.flatMap((activity) => emotionOrder.map((emotion, index) => makeQuestion(activity, emotion, index + Math.floor(Math.random() * 4), used))));
}

function emotionById(id: EmotionId) {
  return emotions.find((emotion) => emotion.id === id) as Emotion;
}

function emotionName(id: EmotionId, language: Language) {
  const emotion = emotionById(id);
  return language === "th" ? emotion.th : emotion.en;
}

function FaceTile({ face, className = "", label }: { face: FaceRef; className?: string; label?: string }) {
  return <img className={`v2-face-tile ${className}`} src={`/v2-faces-hd/${face.emotion}-${face.index + 1}.webp`} alt={label || ""} loading="eager" decoding="async" />;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function nowMs() {
  return Date.now();
}

function newSessionId() {
  const randomPart = globalThis.crypto?.randomUUID?.().slice(0, 8)
    || Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${randomPart}`;
}

function randomEmotionFrom(pool: EmotionId[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}

const exportColumns = [
  "schema_version", "exported_at_iso", "child_nickname", "row_type", "event_id", "completed_at_iso",
  "activity_kind", "activity_id", "question_id", "target_emotion", "selected_emotion", "correct",
  "attempts", "response_time_ms", "session_correct_answers", "session_answer_count",
  "session_accuracy_percent", "session_median_response_ms", "session_duration_ms", "situation_id",
  "situation_category", "situation_text", "feeling_intensity", "support_choice", "learned_emotion",
  "device_prompt", "device_selected", "raw_event_json",
] as const;

type ExportColumn = (typeof exportColumns)[number];
type ExportRow = Partial<Record<ExportColumn, unknown>>;

const exportColumnLabels: Record<ExportLanguage, Record<ExportColumn, string>> = {
  en: {
    schema_version: "Schema version", exported_at_iso: "Exported at (ISO)", child_nickname: "Child nickname",
    row_type: "Row type", event_id: "Event ID", completed_at_iso: "Completed at (ISO)", activity_kind: "Activity type",
    activity_id: "Activity", question_id: "Question ID", target_emotion: "Target emotion", selected_emotion: "Selected emotion",
    correct: "Correct", attempts: "Attempts", response_time_ms: "Response time (ms)", session_correct_answers: "Session correct answers",
    session_answer_count: "Session answer count", session_accuracy_percent: "Session accuracy (%)",
    session_median_response_ms: "Session median response time (ms)", session_duration_ms: "Session duration (ms)",
    situation_id: "Situation ID", situation_category: "Situation category", situation_text: "Situation text",
    feeling_intensity: "Feeling intensity", support_choice: "Support choice", learned_emotion: "Explored emotion",
    device_prompt: "Device prompt", device_selected: "Device answer", raw_event_json: "Raw event JSON",
  },
  th: {
    schema_version: "เวอร์ชันโครงสร้างข้อมูล", exported_at_iso: "เวลาที่ส่งออก (ISO)", child_nickname: "ชื่อเล่นของเด็ก",
    row_type: "ประเภทแถว", event_id: "รหัสกิจกรรม", completed_at_iso: "เวลาที่ทำเสร็จ (ISO)", activity_kind: "ประเภทกิจกรรม",
    activity_id: "กิจกรรม", question_id: "รหัสคำถาม", target_emotion: "อารมณ์เป้าหมาย", selected_emotion: "อารมณ์ที่เลือก",
    correct: "ตอบถูก", attempts: "จำนวนครั้งที่ลอง", response_time_ms: "เวลาตอบ (มิลลิวินาที)", session_correct_answers: "จำนวนคำตอบที่ถูกในรอบ",
    session_answer_count: "จำนวนคำตอบในรอบ", session_accuracy_percent: "ความแม่นยำในรอบ (%)",
    session_median_response_ms: "ค่ากลางเวลาตอบในรอบ (มิลลิวินาที)", session_duration_ms: "ระยะเวลารอบ (มิลลิวินาที)",
    situation_id: "รหัสสถานการณ์", situation_category: "ประเภทสถานการณ์", situation_text: "ข้อความสถานการณ์",
    feeling_intensity: "ระดับความรู้สึก", support_choice: "สิ่งที่อาจช่วย", learned_emotion: "อารมณ์ที่สำรวจ",
    device_prompt: "อารมณ์ที่อุปกรณ์แสดง", device_selected: "คำตอบจากอุปกรณ์", raw_event_json: "ข้อมูลกิจกรรมดิบ (JSON)",
  },
};

const exportValueLabels = {
  en: {
    kinds: { guided: "Guided practice", check: "Progress check", everyday: "Everyday feelings", learn: "Explore feelings", device: "Device practice" },
    activities: { faces: "Real Faces", listen: "Hear & Match", situations: "Situation Stories", match: "Same Emotion Match" },
    rowTypes: { scored_answer: "Scored answer", reflection: "Everyday feeling reflection", explored_emotion: "Explored emotion", device_answer: "Device answer" },
    categories: { home: "Home", school: "School", friends: "Friends", change: "Change", sensory: "Sensory", achievement: "Achievement" },
    intensities: { small: "A little", medium: "In the middle", big: "A lot" },
    supports: { space: "Quiet space", talk: "Talk to someone", help: "Ask for help", try: "Try again" },
    boolean: { true: "Yes", false: "No" },
  },
  th: {
    kinds: { guided: "ฝึกพร้อมคำแนะนำ", check: "ตรวจความก้าวหน้า", everyday: "อารมณ์ในชีวิตประจำวัน", learn: "เรียนรู้อารมณ์", device: "ฝึกกับอุปกรณ์" },
    activities: { faces: "สังเกตอารมณ์จากใบหน้า", listen: "ฟังและจับคู่", situations: "เรื่องราวสถานการณ์", match: "จับคู่ใบหน้าที่แสดงอารมณ์เดียวกัน" },
    rowTypes: { scored_answer: "คำตอบที่มีคะแนน", reflection: "การบันทึกความรู้สึกในชีวิตประจำวัน", explored_emotion: "อารมณ์ที่สำรวจ", device_answer: "คำตอบจากอุปกรณ์" },
    categories: { home: "ที่บ้าน", school: "โรงเรียน", friends: "เพื่อน", change: "การเปลี่ยนแปลง", sensory: "สิ่งกระตุ้นรอบตัว", achievement: "ความสำเร็จ" },
    intensities: { small: "เล็กน้อย", medium: "ปานกลาง", big: "มาก" },
    supports: { space: "อยู่ในที่เงียบ", talk: "คุยกับใครสักคน", help: "ขอความช่วยเหลือ", try: "ลองอีกครั้ง" },
    boolean: { true: "ใช่", false: "ไม่ใช่" },
  },
} as const;

function csvCell(value: unknown) {
  if (value === null || value === undefined) return "\"\"";
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function exportEmotion(id: EmotionId | "", language: ExportLanguage) {
  return id ? emotionName(id, language) : "";
}

function progressCsv(history: SavedSession[], childNickname: string, language: ExportLanguage) {
  const exportedAt = new Date().toISOString();
  const labels = exportValueLabels[language];
  const rows = history.flatMap<ExportRow>((session): ExportRow[] => {
    const sessionCorrect = session.records.filter((record) => record.correct).length;
    const sessionTotal = session.records.length;
    const sessionAccuracy = sessionTotal ? Math.round((sessionCorrect / sessionTotal) * 100) : "";
    const sessionMedian = sessionTotal ? Math.round(median(session.records.map((record) => record.responseMs))) : "";
    const raw = JSON.stringify(session);
    const base = {
      schema_version: "2", exported_at_iso: exportedAt, child_nickname: childNickname, event_id: session.id,
      completed_at_iso: session.completedAt, activity_kind: labels.kinds[session.kind], activity_id: session.activity ? labels.activities[session.activity] : "",
      session_correct_answers: sessionTotal ? sessionCorrect : "", session_answer_count: sessionTotal || "",
      session_accuracy_percent: sessionAccuracy, session_median_response_ms: sessionMedian,
      session_duration_ms: session.durationMs ?? "", situation_id: session.everyday?.sceneId || "",
      situation_category: session.everyday?.category ? labels.categories[session.everyday.category as keyof typeof labels.categories] : "",
      situation_text: session.everyday ? (language === "th" ? session.everyday.promptTh : session.everyday.promptEn) : "",
      feeling_intensity: session.everyday?.intensity ? labels.intensities[session.everyday.intensity] : "",
      support_choice: session.everyday?.support ? labels.supports[session.everyday.support] : "",
      learned_emotion: exportEmotion(session.learnedEmotion || "", language),
      device_prompt: exportEmotion(session.deviceRound?.prompt || "", language),
      device_selected: exportEmotion(session.deviceRound?.selected || "", language),
      raw_event_json: raw,
    };
    if (session.records.length) {
      return session.records.map((record) => ({
        ...base, row_type: labels.rowTypes.scored_answer, activity_id: labels.activities[record.activity], question_id: record.questionId,
        target_emotion: exportEmotion(record.emotion, language), selected_emotion: exportEmotion(record.selected, language), correct: labels.boolean[String(record.correct) as "true" | "false"],
        attempts: record.attempts, response_time_ms: record.responseMs,
      }));
    }
    return [{
      ...base,
      row_type: session.kind === "everyday" ? labels.rowTypes.reflection : session.kind === "learn" ? labels.rowTypes.explored_emotion : labels.rowTypes.device_answer,
      question_id: "", target_emotion: exportEmotion(session.deviceRound?.prompt || "", language),
      selected_emotion: exportEmotion(session.everyday?.selected || session.deviceRound?.selected || session.learnedEmotion || "", language),
      correct: session.deviceRound ? labels.boolean[String(session.deviceRound.correct) as "true" | "false"] : "", attempts: "", response_time_ms: "",
    }];
  });
  return [exportColumns.map((column) => csvCell(exportColumnLabels[language][column])).join(","), ...rows.map((row) => exportColumns.map((column) => csvCell(row[column as keyof typeof row] ?? "")).join(","))].join("\r\n");
}

function exportFilename(nickname: string, language: ExportLanguage) {
  const safeName = nickname.normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "child";
  return `emotion-sync-${safeName}-progress-${language}-${new Date().toISOString().slice(0, 10)}.csv`;
}

const guestStorageKey = "emotion-sync-guest-progress-v1";
function getGuestProfile(): ChildProfile {
  return { id: getOrCreateBrowserId(), nickname: "Guest", createdAt: "browser-only" };
}

function readGuestHistory(): SavedSession[] | null {
  try {
    const stored = window.localStorage.getItem(guestStorageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { history?: SavedSession[] };
    return Array.isArray(parsed.history) ? parsed.history : [];
  } catch {
    return [];
  }
}

function writeGuestHistory(history: SavedSession[]) {
  window.localStorage.setItem(guestStorageKey, JSON.stringify({
    version: 1,
    profile: getGuestProfile(),
    history,
    updatedAt: new Date().toISOString(),
  }));
}

export default function EmotionSyncOnlinePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [view, setView] = useState<View>("home");
  const [sessionKind, setSessionKind] = useState<SessionKind>("guided");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<EmotionId | null>(null);
  const [firstAnswer, setFirstAnswer] = useState<EmotionId | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [currentActivity, setCurrentActivity] = useState<ActivityId | undefined>();
  const [questionStarted, setQuestionStarted] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [devicePrompt, setDevicePrompt] = useState<EmotionId | null>(null);
  const [deviceAnswer, setDeviceAnswer] = useState<EmotionId | null>(null);
  const [everydayIndex, setEverydayIndex] = useState(0);
  const [everydayAnswer, setEverydayAnswer] = useState<EmotionId | null>(null);
  const [everydayIntensity, setEverydayIntensity] = useState<Intensity | null>(null);
  const [everydaySupport, setEverydaySupport] = useState<SupportChoice | null>(null);
  const [everydayStarted, setEverydayStarted] = useState(0);
  const [learnedThisVisit, setLearnedThisVisit] = useState<EmotionId[]>([]);
  const [authState, setAuthState] = useState<"loading" | "unconfigured" | "anonymous" | "authenticated">("loading");
  const [guestMode, setGuestMode] = useState(false);
  const [adultId, setAdultId] = useState("");
  const [adultName, setAdultName] = useState("");
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [profileConsent, setProfileConsent] = useState(false);
  const [accountBusy, setAccountBusy] = useState(false);
  const [profileComposerOpen, setProfileComposerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileMenuPosition, setProfileMenuPosition] = useState({ top: 0, left: 0 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [cloudError, setCloudError] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "create">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirm, setAuthConfirm] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [exportNotice, setExportNotice] = useState(false);
  const [exportLanguageOpen, setExportLanguageOpen] = useState(false);
  const [reflectionEmotion, setReflectionEmotion] = useState<"all" | EmotionId>("all");
  const [reflectionRange, setReflectionRange] = useState<ReportRange>("all");
  const [reflectionPage, setReflectionPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const profileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const closeProfileMenu = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setProfileMenuOpen(false);
        return;
      }

      if (!profileMenuRef.current?.contains(event.target as Node)
        && !profileMenuTriggerRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeProfileMenu);
    document.addEventListener("keydown", closeProfileMenu);
    return () => {
      document.removeEventListener("mousedown", closeProfileMenu);
      document.removeEventListener("keydown", closeProfileMenu);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const positionProfileMenu = () => {
      const trigger = profileMenuTriggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const menuWidth = Math.min(224, window.innerWidth - 24);
      const menuHeight = profileMenuRef.current?.offsetHeight ?? 96;
      const left = Math.min(
        Math.max(12, rect.right - menuWidth),
        window.innerWidth - menuWidth - 12,
      );
      const hasRoomBelow = rect.bottom + 8 + menuHeight <= window.innerHeight - 12;
      const top = hasRoomBelow
        ? rect.bottom + 8
        : Math.max(12, rect.top - menuHeight - 8);

      setProfileMenuPosition({ top, left });
    };

    positionProfileMenu();
    window.addEventListener("resize", positionProfileMenu);
    window.addEventListener("scroll", positionProfileMenu, true);
    return () => {
      window.removeEventListener("resize", positionProfileMenu);
      window.removeEventListener("scroll", positionProfileMenu, true);
    };
  }, [profileMenuOpen, language]);
  const c = copy[language];
  const question = questions[questionIndex];
  const isCorrect = Boolean(question && selected === question.emotion);

  useEffect(() => {
    const stored = window.localStorage.getItem("plb-language");
    if (stored === "en" || stored === "th") queueMicrotask(() => setLanguage(stored));
    if (!firebaseConfigured) {
      queueMicrotask(() => setAuthState("unconfigured"));
      return;
    }
    let accountRequest = 0;
    let disposed = false;
    const unsubscribe = observeAdultAccount((adult) => {
      const request = ++accountRequest;
      setProfiles([]);
      setActiveChildId("");
      setHistory([]);
      setSaveState("idle");
      setProfileMenuOpen(false);
      if (!adult) {
        const guestHistory = readGuestHistory();
        const guestProfile = getGuestProfile();
        setAuthState("anonymous");
        setAdultId("");
        setAdultName("");
        setGuestMode(guestHistory !== null);
        setProfiles(guestHistory !== null ? [guestProfile] : []);
        setActiveChildId(guestHistory !== null ? guestProfile.id : "");
        setHistory(guestHistory || []);
        setProfileComposerOpen(false);
        if (guestCloudEnabled()) {
          setAccountBusy(true);
          void startGuestCloud().then((cache) => {
            if (disposed || request !== accountRequest) return;
            applyGuestCache(cache); setSaveState("saved"); setCloudError(false);
          }).catch(() => {
            if (disposed || request !== accountRequest) return;
            let cache: GuestCache | null = null; try { cache = readGuestCache(); } catch { /* Keep original storage for recovery. */ } if (cache) applyGuestCache(cache);
            setCloudError(true); setSaveState("error");
          }).finally(() => { if (!disposed && request === accountRequest) setAccountBusy(false); });
        }
        return;
      }
      setAuthState("authenticated");
      setGuestMode(false);
      setAuthModalOpen(false);
      setAdultId(adult.uid);
      setAdultName(adult.displayName);
      setCloudError(false);
      void loadChildProfiles(adult.uid).then((nextProfiles) => {
        if (disposed || request !== accountRequest) return;
        setProfiles(nextProfiles);
        setActiveChildId(nextProfiles[0]?.id || "");
        setLearnedThisVisit([]);
        setProfileComposerOpen(nextProfiles.length === 0);
      }).catch(() => { if (!disposed && request === accountRequest) setCloudError(true); });
    }, () => {
      setAuthState("anonymous");
      setCloudError(true);
    });
    return () => { disposed = true; unsubscribe(); };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("plb-language", language);
  }, [language]);

  useEffect(() => {
    if (!authModalOpen && !exportLanguageOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (exportLanguageOpen) setExportLanguageOpen(false);
        else setAuthModalOpen(false);
      }
    };
    document.body.classList.add("auth-modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("auth-modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [authModalOpen, exportLanguageOpen]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      document.querySelector(".v2-page > .v2-shell, .v2-page > .v2-session-shell, .v2-page > .v2-results-shell")?.scrollIntoView({ block: "start" });
    });
  }, [view]);

  useEffect(() => {
    if (guestMode || !adultId || !activeChildId || authState !== "authenticated") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setCloudError(false);
      setHistoryLoading(true);
      setHistory([]);
    });
    void loadFirebaseHistory(adultId, activeChildId)
      .then((storedEvents) => {
        if (cancelled) return;
        const events = storedEvents as SavedSession[];
        setHistory(events);
      })
      .catch(() => { if (!cancelled) setCloudError(true); })
      .finally(() => { if (!cancelled) setHistoryLoading(false); });
    return () => { cancelled = true; };
  }, [activeChildId, adultId, authState, guestMode]);

  useEffect(() => {
    if (!guestMode || !adultId || !activeChildId) return;
    const cache = readGuestCache();
    if (cache?.uid === adultId) setHistory((cache.history[activeChildId] || []) as unknown as SavedSession[]);
  }, [guestMode, adultId, activeChildId]);

  useEffect(() => {
    if (!guestMode || !adultId) return;
    let cancelled = false;
    const retry = () => { void syncGuestCloud().then((cache) => {
      if (cancelled) return; applyGuestCache(cache, activeChildId); setSaveState("saved"); setCloudError(false);
    }).catch(() => { if (!cancelled) { setSaveState("error"); setCloudError(true); } }); };
    window.addEventListener("online", retry);
    return () => { cancelled = true; window.removeEventListener("online", retry); };
  }, [guestMode, adultId, activeChildId]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
  };

  const speakEmotion = (emotion: EmotionId) => {
    setAudioError(false);
    stopAudio();
    if (language === "th") {
      const audio = new Audio(thaiAudio[emotion]);
      audioRef.current = audio;
      audio.onerror = () => setAudioError(true);
      void audio.play().catch(() => setAudioError(true));
      return;
    }
    if (!("speechSynthesis" in window)) {
      setAudioError(true);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(emotionName(emotion, language));
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.onerror = () => setAudioError(true);
    window.speechSynthesis.speak(utterance);
  };

  const playBundledAudio = (source: string) => {
    setAudioError(false);
    stopAudio();
    const audio = new Audio(source);
    audioRef.current = audio;
    audio.onerror = () => setAudioError(true);
    void audio.play().catch(() => setAudioError(true));
  };

  const speakText = (text: string, bundledThaiAudio?: string) => {
    if (language === "th" && bundledThaiAudio) {
      playBundledAudio(bundledThaiAudio);
      return;
    }
    setAudioError(false);
    stopAudio();
    if (!("speechSynthesis" in window)) {
      setAudioError(true);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "th" ? "th-TH" : "en-US";
    utterance.rate = language === "th" ? 0.82 : 0.9;
    if (language === "th") {
      const thaiVoice = voicesRef.current.find((voice) => voice.lang.toLowerCase().startsWith("th"));
      if (!thaiVoice) {
        setAudioError(true);
        return;
      }
      utterance.voice = thaiVoice;
    }
    utterance.onerror = () => setAudioError(true);
    window.speechSynthesis.speak(utterance);
  };

  const openHome = () => {
    stopAudio();
    setView("home");
    setSelected(null);
    setFirstAnswer(null);
    setQuestions([]);
    setRecords([]);
  };

  const recordActivity = (saved: SavedSession) => {
    if (guestMode && activeChildId) {
      setHistory((current) => [saved, ...current.filter((event) => event.id !== saved.id)]);
      if (!adultId) {
        try { writeGuestHistory([saved, ...history.filter((event) => event.id !== saved.id)]); setSaveState("idle"); }
        catch { setSaveState("error"); }
        return;
      }
      setSaveState("saving");
      void queueGuestEvent(activeChildId, saved as unknown as GuestEvent)
        .then(() => syncGuestCloud())
        .then(() => { setSaveState("saved"); setCloudError(false); })
        .catch(() => { setSaveState("error"); setCloudError(true); });
      return;
    }
    if (!adultId || !activeChildId || authState !== "authenticated") {
      setCloudError(true);
      setSaveState("error");
      if (authState === "anonymous") openAuth();
      else setProfileComposerOpen(true);
      return;
    }
    setHistory((current) => {
      return [saved, ...current.filter((event) => event.id !== saved.id)];
    });
    setCloudError(false);
    setSaveState("saving");
    void saveFirebaseEvent(adultId, activeChildId, saved as unknown as Record<string, unknown>)
      .then(() => setSaveState("saved"))
      .catch(() => {
        setHistory((current) => current.filter((event) => event.id !== saved.id));
        setCloudError(true);
        setSaveState("error");
      });
  };

  const createChildProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newNickname.trim() || !profileConsent) return;
    setAccountBusy(true);
    setCloudError(false);
    try {
      if (!adultId) throw new Error("account");
      const cache = guestMode ? await addGuestProfile(newNickname) : null;
      const profile = cache ? cache.profiles[cache.profiles.length - 1] : await createFirebaseChild(adultId, newNickname);
      if (cache) void syncGuestCloud().then(() => { setSaveState("saved"); setCloudError(false); }).catch(() => { setSaveState("error"); setCloudError(true); });
      setProfiles((current) => [...current, profile]);
      setActiveChildId(profile.id);
      setNewNickname("");
      setProfileConsent(false);
      setProfileComposerOpen(false);
    } catch {
      setCloudError(true);
    } finally {
      setAccountBusy(false);
    }
  };

  const handleDeleteChild = async () => {
    if (!adultId || !activeProfile || !window.confirm(c.deleteConfirm)) return;
    setAccountBusy(true);
    setCloudError(false);
    try {
      if (guestMode) await removeGuestProfiles([activeProfile.id]);
      else await deleteFirebaseChild(adultId, activeProfile.id);
      const remaining = profiles.filter((profile) => profile.id !== activeProfile.id);
      setProfiles(remaining);
      setActiveChildId(remaining[0]?.id || "");
      setHistory([]);
      setLearnedThisVisit([]);
      setSaveState("idle");
      setProfileComposerOpen(remaining.length === 0);
      setProfileMenuOpen(false);
    } catch {
      setCloudError(true);
    } finally {
      setAccountBusy(false);
    }
  };

  const authErrorText = (error: unknown) => {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"].includes(code)) return c.authInvalid;
    if (code === "auth/email-already-in-use") return c.authEmailUsed;
    if (code === "auth/weak-password") return c.authWeak;
    if (code === "auth/invalid-email" || code === "auth/missing-email") return c.authEnterEmail;
    if (code === "auth/unauthorized-domain") return c.authDomain;
    return c.authGeneric;
  };

  const openAuth = () => {
    if (accountBusy) return;
    if (!firebaseConfigured) return;
    setAuthMode("signin");
    setAuthPassword("");
    setAuthConfirm("");
    setAuthMessage("");
    setAuthNotice("");
    setAuthModalOpen(true);
  };

  const handleGoogleSignIn = async () => {
    setAccountBusy(true);
    setAuthMessage("");
    setAuthNotice("");
    try {
      await signInAdult();
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") setAuthMessage(authErrorText(error));
    } finally {
      setAccountBusy(false);
    }
  };

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage("");
    setAuthNotice("");
    if (authMode === "create" && authPassword !== authConfirm) {
      setAuthMessage(c.authMismatch);
      return;
    }
    setAccountBusy(true);
    try {
      if (authMode === "create") await createAdultWithEmail(authEmail, authPassword);
      else await signInAdultWithEmail(authEmail, authPassword);
    } catch (error) {
      setAuthMessage(authErrorText(error));
    } finally {
      setAccountBusy(false);
    }
  };

  const handlePasswordReset = async () => {
    setAuthMessage("");
    setAuthNotice("");
    if (!authEmail.trim()) {
      setAuthMessage(c.authEnterEmail);
      return;
    }
    setAccountBusy(true);
    try {
      await resetAdultPassword(authEmail);
      setAuthNotice(c.authResetSent);
    } catch (error) {
      setAuthMessage(authErrorText(error));
    } finally {
      setAccountBusy(false);
    }
  };

  const handleAdultSignOut = async () => {
    setAccountBusy(true);
    try {
      await signOutAdult();
      setHistory([]);
      setLearnedThisVisit([]);
      setSaveState("idle");
    } catch {
      setCloudError(true);
    } finally {
      setAccountBusy(false);
    }
  };

  function applyGuestCache(cache: GuestCache, preferred = "") {
    const childId = cache.profiles.some((p) => p.id === preferred) ? preferred : cache.profiles[0]?.id || "";
    setGuestMode(true); setAuthState("authenticated"); setAdultId(cache.uid); setAdultName("");
    setProfiles(cache.profiles); setActiveChildId(childId);
    setHistory((cache.history[childId] || []) as unknown as SavedSession[]);
    setProfileComposerOpen(!cache.profiles.length);
  }

  const startGuestMode = async () => {
    if (!guestCloudEnabled() && !window.confirm(language === "th"
      ? "ระบบจะบันทึกชื่อเล่นและประวัติกิจกรรม รวมถึงข้อมูลเดิมในเบราว์เซอร์ ไปยังบัญชีผู้เยี่ยมชมส่วนตัวบน Firebase คุณเป็นผู้ใหญ่ที่รับผิดชอบและยินยอมหรือไม่?"
      : "Guest profiles and activity history, including existing browser progress, will be saved privately in Firebase. Are you the responsible adult and do you agree?")) return false;
    setAccountBusy(true); setCloudError(false); setSaveState("saving");
    try { applyGuestCache(await startGuestCloud()); setSaveState("saved"); return true; }
    catch { let cache: GuestCache | null = null; try { cache = readGuestCache(); } catch { /* Keep original storage for recovery. */ } if (cache) applyGuestCache(cache); setCloudError(true); setSaveState("error"); return false; }
    finally { setAccountBusy(false); }
  };

  const deleteGuestHistory = async () => {
    if (!window.confirm(c.deleteGuestConfirm)) return;
    setAccountBusy(true);
    try {
      if (adultId) applyGuestCache(await removeGuestProfiles(profiles.map((p) => p.id)));
      else { window.localStorage.removeItem(guestStorageKey); setGuestMode(false); setProfiles([]); setActiveChildId(""); setHistory([]); }
      setSaveState("idle"); setCloudError(false); setView("home");
    } catch { setCloudError(true); setSaveState("error"); }
    finally { setAccountBusy(false); }
  };

  const requestTrackingAccount = () => {
    if (authState === "anonymous" || authState === "unconfigured") {
      startGuestMode();
      return;
    }
    if (authState === "authenticated") {
      setProfileComposerOpen(true);
      window.requestAnimationFrame(() => document.querySelector(".v2-account-hub")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
  };

  const startSession = async (kind: SessionKind, activity?: ActivityId) => {
    if (accountBusy || authState === "loading") return;
    if (!activeChildId && (authState === "anonymous" || authState === "unconfigured")) {
      if (!await startGuestMode()) return;
    } else if ((!guestMode && authState !== "authenticated") || !activeChildId) {
      requestTrackingAccount();
      return;
    }
    const nextQuestions = kind === "check" ? createCheck() : createGuided(activity as ActivityId);
    setSessionKind(kind);
    setQuestions(nextQuestions);
    setQuestionIndex(0);
    setSelected(null);
    setFirstAnswer(null);
    setAttempts(0);
    setRecords([]);
    setCurrentActivity(activity);
    setQuestionStarted(nowMs());
    setView("session");
  };

  const chooseAnswer = (emotion: EmotionId) => {
    if (!question) return;
    if (sessionKind === "check" && selected) return;
    const nextAttempt = attempts + 1;
    const initialAnswer = firstAnswer ?? emotion;
    if (!firstAnswer) setFirstAnswer(emotion);
    setAttempts(nextAttempt);
    setSelected(emotion);
    if (sessionKind === "check" || emotion === question.emotion) {
      setRecords((current) => [...current, {
        questionId: question.id,
        activity: question.activity,
        emotion: question.emotion,
        selected: initialAnswer,
        correct: initialAnswer === question.emotion,
        responseMs: Math.max(250, nowMs() - questionStarted),
        attempts: nextAttempt,
      }]);
    }
  };

  const nextQuestion = () => {
    if (!question) return;
    if (questionIndex === questions.length - 1) {
      const saved: SavedSession = {
        id: newSessionId(),
        completedAt: new Date().toISOString(),
        kind: sessionKind,
        activity: currentActivity,
        records,
      };
      recordActivity(saved);
      setView("results");
      return;
    }
    stopAudio();
    setQuestionIndex((index) => index + 1);
    setSelected(null);
    setFirstAnswer(null);
    setAttempts(0);
    setQuestionStarted(nowMs());
  };

  const openEveryday = async () => {
    if (accountBusy || authState === "loading") return;
    if (!activeChildId && (authState === "anonymous" || authState === "unconfigured")) {
      if (!await startGuestMode()) return;
    } else if ((!guestMode && authState !== "authenticated") || !activeChildId) {
      requestTrackingAccount();
      return;
    }
    setEverydayAnswer(null);
    setEverydayIntensity(null);
    setEverydaySupport(null);
    setEverydayStarted(nowMs());
    setView("everyday");
  };

  const saveEverydayReflection = () => {
    if (!everydayAnswer) return;
    recordActivity({
      id: newSessionId(),
      completedAt: new Date().toISOString(),
      kind: "everyday",
      records: [],
      durationMs: nowMs() - everydayStarted,
      everyday: {
        sceneId: everyday.id,
        category: everyday.category,
        promptEn: everyday.en,
        promptTh: everyday.th,
        selected: everydayAnswer,
        intensity: everydayIntensity || undefined,
        support: everydaySupport || undefined,
      },
    });
    setEverydayIndex((index) => (index + 1) % everydayScenes.length);
    setEverydayAnswer(null);
    setEverydayIntensity(null);
    setEverydaySupport(null);
    setEverydayStarted(nowMs());
  };

  const exploreEmotion = (emotion: EmotionId) => {
    speakEmotion(emotion);
    if (learnedThisVisit.includes(emotion)) return;
    setLearnedThisVisit((current) => [...current, emotion]);
    recordActivity({
      id: newSessionId(),
      completedAt: new Date().toISOString(),
      kind: "learn",
      records: [],
      learnedEmotion: emotion,
    });
  };

  const chooseDeviceAnswer = (selectedEmotion: EmotionId) => {
    if (!devicePrompt || deviceAnswer) return;
    setDeviceAnswer(selectedEmotion);
    recordActivity({
      id: newSessionId(),
      completedAt: new Date().toISOString(),
      kind: "device",
      records: [],
      deviceRound: { prompt: devicePrompt, selected: selectedEmotion, correct: selectedEmotion === devicePrompt },
    });
  };

  const answerButtons = (compact = false) => (
    <div className={`v2-answer-grid${compact ? " is-compact" : ""}`} role="group" aria-label={c.choose}>
      {emotions.map((emotion) => (
        <button
          type="button"
          key={emotion.id}
          disabled={sessionKind === "check" && Boolean(selected)}
          className={`${selected === emotion.id ? "is-selected" : ""}${sessionKind === "guided" && selected && emotion.id === question?.emotion ? " is-answer" : ""}`}
          onClick={() => chooseAnswer(emotion.id)}
        >
          <span className={`answer-dot dot-${emotion.color}`} aria-hidden="true" />
          {emotionName(emotion.id, language)}
        </button>
      ))}
    </div>
  );

  const resultsByEmotion = useMemo(() => emotionOrder.map((emotion) => {
    const items = records.filter((record) => record.emotion === emotion);
    return { emotion, total: items.length, correct: items.filter((item) => item.correct).length, time: median(items.map((item) => item.responseMs)) };
  }), [records]);

  const resultsByActivity = useMemo(() => activityOrder.map((activity) => {
    const items = records.filter((record) => record.activity === activity);
    return { activity, total: items.length, correct: items.filter((item) => item.correct).length };
  }), [records]);

  const historyRecords = useMemo(() => history.flatMap((session) => session.records), [history]);
  const historyByEmotion = useMemo(() => emotionOrder.map((emotion) => {
    const items = historyRecords.filter((record) => record.emotion === emotion);
    return { emotion, total: items.length, correct: items.filter((item) => item.correct).length, time: median(items.map((item) => item.responseMs)) };
  }), [historyRecords]);
  const historyByActivity = useMemo(() => activityOrder.map((activity) => {
    const items = historyRecords.filter((record) => record.activity === activity);
    return { activity, total: items.length, correct: items.filter((item) => item.correct).length, time: median(items.map((item) => item.responseMs)) };
  }), [historyRecords]);
  const scoredHistory = history.filter((session) => session.kind === "guided" || session.kind === "check");
  const recentSessions = scoredHistory.slice(0, 8).reverse();
  const rankedEmotions = [...historyByEmotion].filter((item) => item.total > 0).sort((a, b) => (a.correct / a.total) - (b.correct / b.total));
  const suggestedEmotion = scoredHistory.length >= 3 && rankedEmotions.length > 1 && (rankedEmotions[0].correct / rankedEmotions[0].total) < (rankedEmotions[rankedEmotions.length - 1].correct / rankedEmotions[rankedEmotions.length - 1].total) ? rankedEmotions[0] : undefined;
  const commonConfusion = useMemo(() => {
    const counts = new Map<string, number>();
    historyRecords.filter((record) => !record.correct).forEach((record) => {
      const key = `${record.emotion}|${record.selected}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!top) return null;
    const [target, selectedEmotion] = top[0].split("|") as [EmotionId, EmotionId];
    return { target, selected: selectedEmotion, count: top[1] };
  }, [historyRecords]);

  const overallCorrect = records.filter((record) => record.correct).length;
  const overallAccuracy = records.length ? Math.round((overallCorrect / records.length) * 100) : 0;
  const overallTime = median(records.map((record) => record.responseMs)) / 1000;
  const historyAccuracy = historyRecords.length ? Math.round((historyRecords.filter((record) => record.correct).length / historyRecords.length) * 100) : 0;
  const everyday = everydayScenes[everydayIndex];
  const deviceCorrect = Boolean(devicePrompt && deviceAnswer === devicePrompt);
  const activeProfile = profiles.find((profile) => profile.id === activeChildId);
  const everydayHistory = history.filter((event) => event.kind === "everyday" && event.everyday);
  const exploreHistory = history.filter((event) => event.kind === "learn");
  const deviceHistory = history.filter((event) => event.kind === "device" && event.deviceRound);
  const activityCoverage = [
    { key: "guided", label: c.guidedSession, count: history.filter((event) => event.kind === "guided").length, symbol: "✦" },
    { key: "check", label: c.checkSession, count: history.filter((event) => event.kind === "check").length, symbol: "✓" },
    { key: "everyday", label: c.everydaySession, count: everydayHistory.length, symbol: "♡" },
    { key: "learn", label: c.learnSession, count: exploreHistory.length, symbol: "◌" },
    { key: "device", label: c.deviceSession, count: deviceHistory.length, symbol: "▣" },
  ];
  const datedReflections = useMemo(() => {
    if (reflectionRange === "all") return everydayHistory;
    const cutoff = Date.now() - Number(reflectionRange) * 24 * 60 * 60 * 1000;
    return everydayHistory.filter((event) => new Date(event.completedAt).getTime() >= cutoff);
  }, [everydayHistory, reflectionRange]);
  const filteredReflections = datedReflections.filter((event) => reflectionEmotion === "all" || event.everyday?.selected === reflectionEmotion);
  const reflectionPageCount = Math.max(1, Math.ceil(filteredReflections.length / reflectionPageSize));
  const visibleReflections = filteredReflections.slice((reflectionPage - 1) * reflectionPageSize, reflectionPage * reflectionPageSize);
  const historyPageCount = Math.max(1, Math.ceil(history.length / historyPageSize));
  const visibleHistory = history.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize);

  useEffect(() => {
    setReflectionPage(1);
  }, [reflectionEmotion, reflectionRange, activeChildId]);

  useEffect(() => {
    setHistoryPage(1);
  }, [activeChildId]);

  useEffect(() => {
    if (reflectionPage > reflectionPageCount) setReflectionPage(reflectionPageCount);
  }, [reflectionPage, reflectionPageCount]);

  useEffect(() => {
    if (historyPage > historyPageCount) setHistoryPage(historyPageCount);
  }, [historyPage, historyPageCount]);
  const intensityLabel = (intensity?: Intensity) => {
    if (!intensity) return "";
    return c.intensities[{ small: 0, medium: 1, big: 2 }[intensity]];
  };
  const supportLabel = (support?: SupportChoice) => {
    if (!support) return "";
    return c.supports[{ space: 0, talk: 1, help: 2, try: 3 }[support]];
  };
  const historyTitle = (event: SavedSession) => {
    if (event.kind === "check") return c.checkSession;
    if (event.kind === "guided") return c.guidedSession;
    if (event.kind === "everyday") return c.everydaySession;
    if (event.kind === "learn") return c.learnSession;
    return c.deviceSession;
  };
  const historyDetail = (event: SavedSession) => {
    if (event.activity) return c.activities[event.activity].title;
    if (event.everyday) return `${emotionName(event.everyday.selected, language)} · ${language === "th" ? event.everyday.promptTh : event.everyday.promptEn}`;
    if (event.learnedEmotion) return emotionName(event.learnedEmotion, language);
    if (event.deviceRound) return `${emotionName(event.deviceRound.prompt, language)} → ${emotionName(event.deviceRound.selected, language)}`;
    return c.allSessions;
  };

  const downloadProgressCsv = (exportLanguage: ExportLanguage) => {
    if (!activeProfile || !history.length) return;
    const blob = new Blob(["\uFEFF", progressCsv(history, activeProfile.nickname, exportLanguage)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportFilename(activeProfile.nickname, exportLanguage);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportLanguageOpen(false);
    setExportNotice(true);
    window.setTimeout(() => setExportNotice(false), 3000);
  };

  const openTrackedView = async (nextView: "guided-menu" | "learn" | "device") => {
    if (accountBusy || authState === "loading") return;
    if (!activeChildId && (authState === "anonymous" || authState === "unconfigured")) {
      if (!await startGuestMode()) return;
    } else if ((!guestMode && authState !== "authenticated") || !activeChildId) {
      requestTrackingAccount();
      return;
    }
    setView(nextView);
  };

  const guestStatus = !adultId ? (language === "th" ? "ข้อมูลยังอยู่ในเบราว์เซอร์" : "Existing progress is still in this browser") : saveState === "saving" ? c.savingActivity : saveState === "error" ? (language === "th" ? "ยังไม่ซิงค์ — เก็บข้อมูลในเบราว์เซอร์ไว้ก่อน และลองซิงค์อีกครั้ง" : "Not synced — keep this browser's data and retry") : c.saveStatus;
  const renderAccountHub = (compact = false) => (
    <section className={`v2-account-hub${compact ? " is-compact" : ""}${activeProfile ? " is-ready" : ""}`}>
      <div className="v2-account-hub-main">
        <div className="v2-account-hub-icon" aria-hidden="true"><span>●</span><i>{activeProfile ? "✓" : "↗"}</i></div>
        <div className="v2-account-hub-copy">
          <small>{c.adultAccount}</small>
          {authState === "loading" && <><h2>{c.account}</h2><p>{c.signInText}</p></>}
          {authState === "unconfigured" && !guestMode && <><h2>{c.setupRequired}</h2><p>{c.syncAcrossText}</p></>}
          {authState === "anonymous" && !guestMode && <><h2>{c.syncAcross}</h2><p>{c.syncAcrossText}</p></>}
          {guestMode && <><h2>{c.guestName}</h2><p>{c.guestDeviceOnly}</p></>}
          {authState === "authenticated" && !guestMode && !activeProfile && <><h2>{c.createFirst}</h2><p>{c.accountRequiredText}</p></>}
          {authState === "authenticated" && !guestMode && activeProfile && <><h2>{c.tracking} {activeProfile.nickname}</h2><p>{c.syncedAcross}</p></>}
        </div>
        {activeProfile && <span className={`v2-cloud-badge${guestMode ? " is-local" : ""}`}><i aria-hidden="true">●</i>{guestMode ? guestStatus : saveState === "saving" ? c.savingActivity : c.cloudPrivate}</span>}
      </div>

      {(authState === "anonymous" || authState === "unconfigured") && !guestMode && (
        <div className="v2-account-welcome-actions">
          <div className="v2-account-benefits" aria-label={c.guestLocal}>
            <span><i>✓</i>{c.guestLocal}</span><span><i>✓</i>{c.openReport}</span><span><i>✓</i>{c.exportButton}</span>
          </div>
          <div className="v2-account-choice-actions">
            <button className="button button-yellow v2-account-guest" type="button" disabled={accountBusy} onClick={startGuestMode}>{accountBusy ? "…" : c.guestButton}<span>→</span></button>
            <button className="button button-blue v2-account-primary" type="button" disabled={accountBusy || !firebaseConfigured} onClick={openAuth}>{authState === "unconfigured" ? c.setupRequired : c.signInCloud}<span>→</span></button>
          </div>
        </div>
      )}

      {(authState === "authenticated" || guestMode) && activeProfile && (
        <div className="v2-active-profile">
          <div className="v2-profile-avatar" aria-hidden="true">{guestMode ? "G" : activeProfile.nickname.slice(0, 1).toUpperCase()}</div>
          <div className="v2-active-profile-name"><small>{c.selectedChild}</small><strong>{activeProfile.nickname}</strong><span>✓ {guestMode ? guestStatus : c.saveStatus}</span></div>
          <label className="v2-profile-select"><span>{c.switchChild}</span><select value={activeChildId} onChange={(event) => { setActiveChildId(event.target.value); setLearnedThisVisit([]); setProfileMenuOpen(false); }}>{profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.nickname}</option>)}</select></label>
          <div className="v2-profile-actions">
            <button className="v2-profile-progress" type="button" onClick={() => setView("progress")}>{c.openReport}<span>→</span></button>
            {adultId && (
              <div className="v2-profile-manage">
                <button ref={profileMenuTriggerRef} className="v2-profile-manage-trigger" type="button" aria-haspopup="menu" aria-expanded={profileMenuOpen} aria-controls="profile-management-actions" onClick={() => setProfileMenuOpen((open) => !open)}><span aria-hidden="true">•••</span>{c.manageChild}</button>
                {profileMenuOpen && createPortal(
                  <div ref={profileMenuRef} className="v2-profile-manage-menu" id="profile-management-actions" role="menu" aria-label={c.manageChild} style={{ top: profileMenuPosition.top, left: profileMenuPosition.left }}>
                    <button className="v2-profile-add" type="button" role="menuitem" onClick={() => { setProfileComposerOpen((open) => !open); setProfileMenuOpen(false); }}><span aria-hidden="true">+</span>{c.addChild}</button>
                    <button className="v2-profile-delete" type="button" role="menuitem" disabled={accountBusy} onClick={handleDeleteChild}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></svg>{c.deleteChild}</button>
                  </div>,
                  document.body,
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {authState === "authenticated" && (!activeProfile || profileComposerOpen) && (
        <form className="v2-profile-composer" onSubmit={createChildProfile}>
          <div><label htmlFor={compact ? "report-child-nickname" : "home-child-nickname"}>{activeProfile ? c.addChild : c.createFirst}</label><small>{c.nicknameHint}</small></div>
          <input id={compact ? "report-child-nickname" : "home-child-nickname"} value={newNickname} maxLength={40} onChange={(event) => setNewNickname(event.target.value)} placeholder={c.nickname} autoComplete="off" />
          <button type="submit" disabled={accountBusy || !newNickname.trim() || !profileConsent}>{accountBusy ? "…" : c.create}<span>→</span></button>
          <label className="v2-profile-consent"><input type="checkbox" checked={profileConsent} onChange={(event) => setProfileConsent(event.target.checked)} /><span>{c.consent} <a href={`/privacy?lang=${language}`} target="_blank" rel="noreferrer">{c.privacy}</a></span></label>
        </form>
      )}

      {authState === "authenticated" && !guestMode && <div className="v2-account-footer"><span>{c.signedInAs} <strong>{adultName}</strong></span><div><a href={`/privacy?lang=${language}`}>{c.privacy}</a><button type="button" disabled={accountBusy} onClick={handleAdultSignOut}>{c.signOut}</button></div></div>}
      {guestMode && <div className="v2-account-footer"><span>{adultId ? `Guest UID: ${adultId}` : guestStatus}</span><div><button type="button" disabled={accountBusy} onClick={startGuestMode}>{adultId ? (language === "th" ? "ลองซิงค์อีกครั้ง" : "Retry sync") : (language === "th" ? "บันทึกข้อมูลเดิมบนคลาวด์" : "Save existing progress online")}</button><button type="button" onClick={openAuth}>{c.signIn}</button><a href={`/privacy?lang=${language}`}>{c.privacy}</a><button className="is-danger" type="button" disabled={accountBusy} onClick={deleteGuestHistory}>{c.deleteGuest}</button></div></div>}
      {cloudError && <p className="v2-cloud-error" role="alert">{guestMode ? guestStatus : c.syncError}</p>}
    </section>
  );

  return (
    <main className={`online-page v2-page${language === "th" ? " lang-th" : ""}`}>
      <header className="site-header online-header">
        <Link className="brand" href="/" aria-label="Project Little Bridge home">
          <span className="brand-mark" aria-hidden="true"><img src="/plb-bridge-mark.png" alt="" /></span>
          <span className="brand-words"><strong>Project</strong><small>Little Bridge</small></span>
        </Link>
        <Link className="online-back-link" href="/">← {c.back}</Link>
        {(authState === "anonymous" || authState === "unconfigured") && !guestMode ? (
          <button className="v2-account-link" type="button" disabled={accountBusy || !firebaseConfigured} onClick={openAuth}><span className="v2-header-avatar" aria-hidden="true">↗</span><strong>{c.signIn}</strong></button>
        ) : (
          <button className={`v2-account-link${activeProfile ? " is-synced" : ""}`} type="button" onClick={() => setView("progress")}><span className="v2-header-avatar" aria-hidden="true">{guestMode ? "G" : activeProfile ? activeProfile.nickname.slice(0, 1).toUpperCase() : "+"}</span><strong>{guestMode ? c.guestName : activeProfile ? activeProfile.nickname : c.childProfile}</strong><i aria-hidden="true">→</i></button>
        )}
        <div className="language-toggle" role="group" aria-label="Language / ภาษา">
          <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
          <button type="button" aria-pressed={language === "th"} onClick={() => setLanguage("th")}>ไทย</button>
        </div>
      </header>

      <section className="v2-hero">
        <p className="eyebrow">{c.eyebrow}</p>
        <h1>{c.title}</h1>
        <p>{c.intro}</p>
      </section>

      {view === "home" && (
        <section className="v2-shell">
          {renderAccountHub()}
          <div className="v2-section-heading"><h2>{c.homeTitle}</h2><p>{c.homeText}</p></div>
          {!activeProfile && authState !== "loading" && <div className="v2-account-required"><span aria-hidden="true">i</span><div><strong>{c.accountRequired}</strong><p>{c.accountRequiredText}</p></div></div>}
          <div className="v2-primary-grid">
            <button className={`v2-path-card is-guided${!activeProfile ? " is-locked" : ""}`} type="button" onClick={() => openTrackedView("guided-menu")}>
              <div className="v2-path-visual v2-face-collage" aria-hidden="true"><img src="/v2-faces-hd/happy-2.webp" alt="" /><img src="/v2-faces-hd/calm-4.webp" alt="" /><img src="/v2-faces-hd/angry-3.webp" alt="" /></div>
              <span className="v2-card-number">01</span><small>{c.guidedLabel}</small><h3>{c.guided}</h3><p>{c.guidedText}</p><b className="activity-start"><span aria-hidden="true">▶</span> {c.start}</b>
            </button>
            <button className={`v2-path-card is-check${!activeProfile ? " is-locked" : ""}`} type="button" onClick={() => startSession("check")}>
              <div className="v2-path-visual v2-check-visual" aria-hidden="true"><div><strong>16</strong><span>{c.questions}</span></div><span className="dot-red" /><span className="dot-yellow" /><span className="dot-blue" /><span className="dot-black" /></div>
              <span className="v2-card-number">02</span><small>{c.checkLabel}</small><h3>{c.check}</h3><p>{c.checkText}</p><b className="activity-start"><span aria-hidden="true">▶</span> {c.start}</b>
            </button>
          </div>
          <button className="v2-report-entry" type="button" onClick={() => setView("progress")}>
            <span>↗</span><div><small>{history.length ? `${history.length} ${c.totalSessions}` : c.report}</small><h3>{c.progress}</h3><p>{c.progressText}</p></div><b>{c.openReport} →</b>
          </button>
          <div className="v2-secondary-grid">
            <button type="button" className={!activeProfile ? "is-locked" : ""} onClick={() => openTrackedView("learn")}><div className="v2-secondary-art is-emotions" aria-hidden="true">{emotions.map((emotion) => <span className={`dot-${emotion.color}`} key={emotion.id}><EmotionFace emotion={emotion.id} /></span>)}</div><div><h3>{c.explore}</h3><p>{c.exploreText}</p></div><b>→</b></button>
            <button type="button" className={!activeProfile ? "is-locked" : ""} onClick={openEveryday}><div className="v2-secondary-art is-scenes" aria-hidden="true"><img src="/everyday-scenes/tower.webp" alt="" /><img src="/everyday-scenes/drawing.webp" alt="" /></div><div><h3>{c.everyday}</h3><p>{c.everydayText}</p><small>{c.unscoredLabel}</small></div><b>→</b></button>
            <button type="button" className={!activeProfile ? "is-locked" : ""} onClick={() => openTrackedView("device")}><div className="v2-secondary-art is-device" aria-hidden="true"><img src="/emotion-sync-hero.png" alt="" /></div><div><h3>{c.device}</h3><p>{c.deviceText}</p></div><b>→</b></button>
          </div>
        </section>
      )}

      {view === "guided-menu" && (
        <section className="v2-shell">
          <button className="v2-back-button" type="button" onClick={openHome}>← {c.backHome}</button>
          <div className="v2-section-heading"><h2>{c.chooseActivity}</h2><p>{c.chooseActivityText}</p></div>
          <div className="v2-activity-grid">
            {activityOrder.map((activity, index) => (
              <button type="button" key={activity} onClick={() => startSession("guided", activity)}>
                <div className={`guided-art guided-art-${activity}`} aria-hidden="true">
                  {activity === "faces" && <><img src="/v2-faces-hd/happy-2.webp" alt="" /><img src="/v2-faces-hd/calm-4.webp" alt="" /><img src="/v2-faces-hd/angry-3.webp" alt="" /></>}
                  {activity === "listen" && <><span className="guided-audio-symbol">◖))</span><EmotionFace emotion="happy" /><EmotionFace emotion="sad" /></>}
                  {activity === "situations" && <><img src="/everyday-scenes/tower.webp" alt="" /><img src="/everyday-scenes/drawing.webp" alt="" /></>}
                  {activity === "match" && <><img src="/v2-faces-hd/happy-2.webp" alt="" /><span className="guided-match-symbol">=</span><img src="/v2-faces-hd/happy-4.webp" alt="" /></>}
                </div>
                <span>{String(index + 1).padStart(2, "0")}</span><h3>{c.activities[activity].title}</h3><p>{c.activities[activity].text}</p><small>8 {c.questions}</small><b className="activity-start"><span aria-hidden="true">▶</span> {c.start}</b>
              </button>
            ))}
          </div>
        </section>
      )}

      {view === "session" && question && (
        <section className="v2-session-shell">
          <div className="v2-session-top">
            <button type="button" onClick={openHome}>← {c.quit}</button>
            <div><span>{sessionKind === "guided" ? c.guided : c.check}</span><strong>{c.question} {questionIndex + 1} {c.of} {questions.length}</strong></div>
            <span>{Math.round(((questionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="v2-progress" aria-hidden="true"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
          <div className="v2-question-card">
            {question.activity === "faces" && (
              <><h2>{c.facePrompt}</h2><FaceTile face={question.face as FaceRef} className="is-large" label="Facial expression practice image" />{answerButtons()}</>
            )}
            {question.activity === "listen" && (
              <><h2>{c.listenPrompt}</h2><button className="v2-audio-orb" type="button" onClick={() => speakEmotion(question.emotion)}><span>◖))</span>{selected ? c.playAgain : c.play}</button>{audioError && <small className="online-audio-error">{c.audioError}</small>}<div className="v2-emoji-options">{emotions.map((emotion) => <button type="button" key={emotion.id} disabled={sessionKind === "check" && Boolean(selected)} className={selected === emotion.id ? "is-selected" : ""} onClick={() => chooseAnswer(emotion.id)}><span><EmotionFace emotion={emotion.id} /></span><small className="sr-only">{emotionName(emotion.id, language)}</small></button>)}</div></>
            )}
            {question.activity === "situations" && (
              <><h2>{c.storyPrompt}</h2><div className="v2-story-prompt"><span>“</span><div><p>{language === "th" ? question.story?.th : question.story?.en}</p><button className="v2-story-audio" type="button" onClick={() => speakText(language === "th" ? question.story?.th || "" : question.story?.en || "")}><span aria-hidden="true">◖))</span>{selected ? c.listenStoryAgain : c.listenStory}</button></div></div>{audioError && <small className="online-audio-error">{c.audioError}</small>}{answerButtons()}</>
            )}
            {question.activity === "match" && (
              <><h2>{c.matchPrompt}</h2><div className="v2-match-target"><FaceTile face={question.targetFace as FaceRef} label="Target facial expression" /></div><div className="v2-face-options">{question.options?.map((option) => <button type="button" key={`${option.emotion}-${option.index}`} disabled={sessionKind === "check" && Boolean(selected)} className={selected === option.emotion ? "is-selected" : ""} onClick={() => chooseAnswer(option.emotion)}><FaceTile face={option} label="Answer facial expression" /></button>)}</div></>
            )}

            {selected && (
              <div className={`v2-feedback ${sessionKind === "check" ? "is-recorded" : isCorrect ? "is-correct" : "is-retry"}`} role="status">
                <strong>{sessionKind === "check" ? c.selected : isCorrect ? c.correct : c.retry}</strong>
                <p>{sessionKind === "check" ? c.selectedDetail : isCorrect ? c.correctDetail : c.retryDetail}</p>
              </div>
            )}
            {selected && (sessionKind === "check" || isCorrect) && (
              <button className="button button-blue v2-next" type="button" onClick={nextQuestion}>{questionIndex === questions.length - 1 ? c.finish : c.next} →</button>
            )}
          </div>
        </section>
      )}

      {view === "results" && (
        <section className="v2-results-shell">
          <p className="eyebrow">{sessionKind === "guided" ? c.guided : c.check}</p><h2>{c.results}</h2><p className="v2-results-intro">{c.resultsText}</p>
          <div className="v2-result-overview">
            <div><small>{c.accuracy}</small><strong>{overallAccuracy}%</strong><span>{overallCorrect} / {records.length} {c.responses}</span></div>
            <div><small>{c.response}</small><strong>{overallTime.toFixed(1)}</strong><span>{c.seconds}</span></div>
          </div>
          <div className="v2-result-sections">
            <section><h3>{c.byEmotion}</h3>{resultsByEmotion.map((item) => { const pct = item.total ? Math.round((item.correct / item.total) * 100) : 0; return <div className="v2-metric" key={item.emotion}><div><span className={`answer-dot dot-${emotionById(item.emotion).color}`} /><b>{emotionName(item.emotion, language)}</b><small>{item.correct}/{item.total}</small></div><div className="v2-metric-bar"><span style={{ width: `${pct}%` }} /></div><strong>{pct}%</strong></div>; })}</section>
            <section><h3>{c.byActivity}</h3>{resultsByActivity.map((item) => { const pct = item.total ? Math.round((item.correct / item.total) * 100) : 0; return <div className="v2-metric" key={item.activity}><div><b>{c.activities[item.activity].title}</b><small>{item.correct}/{item.total}</small></div><div className="v2-metric-bar"><span style={{ width: `${pct}%` }} /></div><strong>{pct}%</strong></div>; })}</section>
          </div>
          <p className="v2-trend-note">✦ {c.morePractice}</p>
          <div className="v2-result-actions"><button className="button button-blue" type="button" onClick={() => setView("progress")}>{c.openReport}</button><button className="button button-yellow" type="button" onClick={() => startSession("check")}>{c.again}</button><button className="button button-yellow" type="button" onClick={openHome}>{c.home}</button></div>
        </section>
      )}

      {view === "progress" && (
        <section className="v2-results-shell v2-report-shell">
          <button className="v2-back-button" type="button" onClick={openHome}>← {c.backHome}</button>
          <p className="eyebrow">{c.progress}</p><h2>{c.report}</h2><p className="v2-results-intro">{c.reportIntro}</p>
          {renderAccountHub(true)}
          {activeProfile && <div className={`v2-save-status${guestMode ? " is-local" : " is-cloud"}${saveState === "error" ? " is-error" : ""}`} role="status"><span aria-hidden="true">●</span><div><strong>{guestMode ? guestStatus : saveState === "saving" ? c.savingActivity : saveState === "error" ? c.saveFailed : `${c.saveStatus} · ${activeProfile.nickname}`}</strong><p>{c.reportNotice}</p></div></div>}
          {activeProfile && (
            <section className="v2-export-panel" aria-labelledby="progress-export-title">
              <span className="v2-export-icon" aria-hidden="true">↓</span>
              <div>
                <small>CSV · GOOGLE SHEETS · EXCEL</small>
                <h3 id="progress-export-title">{c.exportTitle}</h3>
                <p>{c.exportText}</p>
                <em>{c.exportIncludes}</em>
              </div>
              <button type="button" disabled={historyLoading || !history.length} onClick={() => setExportLanguageOpen(true)}><span aria-hidden="true">↓</span>{c.exportButton}</button>
              {exportNotice && <strong className="v2-export-notice" role="status">✓ {c.exportReady}</strong>}
            </section>
          )}
          {historyLoading ? (
            <div className="v2-report-empty"><span>↻</span><h3>{c.savingActivity}</h3></div>
          ) : !history.length ? (
            <div className="v2-report-empty"><span>↗</span><h3>{c.noHistory}</h3><button className="button button-blue" type="button" onClick={() => startSession("check")}>{c.check}</button></div>
          ) : (
            <>
              <div className="v2-report-overview">
                <div><small>{c.totalSessions}</small><strong>{history.length}</strong></div>
                <div><small>{c.totalQuestions}</small><strong>{historyRecords.length}</strong></div>
                <div><small>{c.accuracy}</small><strong>{historyAccuracy}%</strong></div>
                <div><small>{c.response}</small><strong>{(median(historyRecords.map((record) => record.responseMs)) / 1000).toFixed(1)}<em>{c.seconds}</em></strong></div>
              </div>
              <section className="v2-coverage-section">
                <div><h3>{c.activityCoverage}</h3><p>{c.progressText}</p></div>
                <div className="v2-coverage-grid">{activityCoverage.map((item) => <article key={item.key}><span>{item.symbol}</span><strong>{item.count}</strong><small>{item.label}</small></article>)}</div>
              </section>
              <div className="v2-report-insights">
                <section>
                  <h3>{c.byEmotion}</h3>
                  {historyByEmotion.map((item) => { const pct = item.total ? Math.round((item.correct / item.total) * 100) : 0; return <div className="v2-metric" key={item.emotion}><div><span className={`answer-dot dot-${emotionById(item.emotion).color}`} /><b>{emotionName(item.emotion, language)}</b><small>{item.correct}/{item.total}</small></div><div className="v2-metric-bar"><span style={{ width: `${pct}%` }} /></div><strong>{pct}%</strong></div>; })}
                </section>
                <section>
                  <h3>{c.byActivity}</h3>
                  {historyByActivity.map((item) => { const pct = item.total ? Math.round((item.correct / item.total) * 100) : 0; return <div className="v2-metric" key={item.activity}><div><b>{c.activities[item.activity].title}</b><small>{item.correct}/{item.total}</small></div><div className="v2-metric-bar"><span style={{ width: `${pct}%` }} /></div><strong>{pct}%</strong></div>; })}
                </section>
              </div>
              <div className="v2-focus-grid">
                <article><small>{c.needsPractice}</small><strong>{suggestedEmotion ? emotionName(suggestedEmotion.emotion, language) : c.balanced}</strong><p>{suggestedEmotion ? `${suggestedEmotion.correct}/${suggestedEmotion.total} ${c.responses}` : c.morePractice}</p></article>
                <article><small>{c.confusion}</small><strong>{commonConfusion ? `${emotionName(commonConfusion.target, language)} → ${emotionName(commonConfusion.selected, language)}` : c.noConfusion}</strong><p>{commonConfusion ? `${commonConfusion.count} ${c.responses}` : c.morePractice}</p></article>
              </div>
              <section className="v2-reflection-report">
                <div className="v2-reflection-heading"><div><h3>{c.reflectionsTitle}</h3><p>{c.reflectionsText}</p></div><strong><b>{everydayHistory.length}</b><small>{c.reflectionResponses}</small></strong></div>
                {!everydayHistory.length ? <p className="v2-empty-inline">{c.noReflections}</p> : (
                  <div className="v2-reflection-browser">
                    <div className="v2-reflection-filters">
                      <div className="v2-feeling-filter" role="group" aria-label={c.reflectionsTitle}>
                        <button type="button" className={reflectionEmotion === "all" ? "is-active" : ""} onClick={() => setReflectionEmotion("all")}>
                          {c.allFeelings}<strong>{datedReflections.length}</strong>
                        </button>
                        {emotionOrder.map((emotion) => {
                          const count = datedReflections.filter((event) => event.everyday?.selected === emotion).length;
                          return (
                            <button type="button" className={reflectionEmotion === emotion ? "is-active" : ""} onClick={() => setReflectionEmotion(emotion)} key={emotion}>
                              <span className={`answer-dot dot-${emotionById(emotion).color}`} />{emotionName(emotion, language)}<strong>{count}</strong>
                            </button>
                          );
                        })}
                      </div>
                      <label className="v2-report-range">
                        <select value={reflectionRange} onChange={(event) => setReflectionRange(event.target.value as ReportRange)} aria-label={c.allTime}>
                          <option value="all">{c.allTime}</option>
                          <option value="30">{c.last30Days}</option>
                          <option value="90">{c.last90Days}</option>
                        </select>
                      </label>
                    </div>
                    {!filteredReflections.length ? <p className="v2-empty-inline">{c.noFilteredReflections}</p> : (
                      <>
                        <div className="v2-reflection-list">
                          {visibleReflections.map((event) => {
                            const entry = event.everyday!;
                            const scene = everydayScenes.find((item) => item.id === entry.sceneId);
                            return (
                              <section className="v2-situation-feeling" key={event.id}>
                                {scene?.image && <img src={scene.image} alt="" width="1254" height="1254" />}
                                <div className="v2-situation-feeling-copy">
                                  <div className="v2-situation-labels">
                                    <strong><span className={`answer-dot dot-${emotionById(entry.selected).color}`} />{emotionName(entry.selected, language)}</strong>
                                    <span>{c.categories[entry.category as keyof typeof c.categories]}</span>
                                  </div>
                                  <p>{language === "th" ? entry.promptTh : entry.promptEn}</p>
                                  <div>
                                    {entry.intensity && <small><b>{c.reflectionStrength}</b>{intensityLabel(entry.intensity)}</small>}
                                    {entry.support && <small><b>{c.reflectionSupport}</b>{supportLabel(entry.support)}</small>}
                                  </div>
                                </div>
                                <time>{new Date(event.completedAt).toLocaleDateString(language === "th" ? "th-TH" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>
                              </section>
                            );
                          })}
                        </div>
                        <div className="v2-report-pagination">
                          <span>{c.showing} {(reflectionPage - 1) * reflectionPageSize + 1}–{Math.min(reflectionPage * reflectionPageSize, filteredReflections.length)} {c.of} {filteredReflections.length} {c.entries}</span>
                          <div>
                            <button type="button" disabled={reflectionPage === 1} onClick={() => setReflectionPage((page) => page - 1)}>← {c.previous}</button>
                            <strong>{reflectionPage} / {reflectionPageCount}</strong>
                            <button type="button" disabled={reflectionPage === reflectionPageCount} onClick={() => setReflectionPage((page) => page + 1)}>{c.nextPage} →</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </section>
              <section className="v2-trend-section">
                <h3>{c.recentTrend}</h3>
                <div className="v2-trend-chart">{recentSessions.map((session) => { const pct = session.records.length ? Math.round((session.records.filter((record) => record.correct).length / session.records.length) * 100) : 0; return <div key={session.id}><span style={{ height: `${Math.max(pct, 4)}%` }}><b>{pct}%</b></span><small>{new Date(session.completedAt).toLocaleDateString(language === "th" ? "th-TH" : "en-GB", { day: "numeric", month: "short" })}</small></div>; })}</div>
              </section>
              <section className="v2-history-section">
                <h3>{c.history}</h3>
                <div>{visibleHistory.map((session) => { const correct = session.records.filter((record) => record.correct).length; const pct = session.records.length ? Math.round((correct / session.records.length) * 100) : 0; return <article key={session.id}><div><strong>{historyTitle(session)}</strong><span>{historyDetail(session)}</span></div><div>{session.records.length ? <><b>{pct}%</b><small>{correct}/{session.records.length} · {(median(session.records.map((record) => record.responseMs)) / 1000).toFixed(1)} {c.seconds}</small></> : session.deviceRound ? <><b>{session.deviceRound.correct ? "✓" : "—"}</b><small>{session.deviceRound.correct ? c.correct : c.retry}</small></> : <><b>✓</b><small>{session.kind === "everyday" ? c.unscoredLabel : historyDetail(session)}</small></>}</div><time>{new Date(session.completedAt).toLocaleString(language === "th" ? "th-TH" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}</time></article>; })}</div>
                <div className="v2-report-pagination">
                  <span>{c.showing} {(historyPage - 1) * historyPageSize + 1}–{Math.min(historyPage * historyPageSize, history.length)} {c.of} {history.length} {c.entries}</span>
                  <div>
                    <button type="button" disabled={historyPage === 1} onClick={() => setHistoryPage((page) => page - 1)}>← {c.previous}</button>
                    <strong>{historyPage} / {historyPageCount}</strong>
                    <button type="button" disabled={historyPage === historyPageCount} onClick={() => setHistoryPage((page) => page + 1)}>{c.nextPage} →</button>
                  </div>
                </div>
              </section>
            </>
          )}
        </section>
      )}

      {view === "learn" && (
        <section className="v2-shell"><button className="v2-back-button" type="button" onClick={openHome}>← {c.backHome}</button><div className="v2-section-heading"><h2>{c.learnTitle}</h2></div><div className="online-emotion-grid">{emotions.map((emotion) => <article className={`online-emotion-card emotion-${emotion.color}`} key={emotion.id}><span className="online-face" aria-hidden="true"><EmotionFace emotion={emotion.id} /></span><h3>{emotionName(emotion.id, language)}</h3><p>{language === "th" ? emotion.learnTh : emotion.learnEn}</p><button type="button" onClick={() => exploreEmotion(emotion.id)}><span aria-hidden="true">◖))</span> {c.hear}</button></article>)}</div>{audioError && <small className="online-audio-error">{c.audioError}</small>}</section>
      )}

      {view === "everyday" && (
        <section className="v2-shell"><button className="v2-back-button" type="button" onClick={openHome}>← {c.backHome}</button><div className="v2-section-heading"><h2>{c.everyday}</h2><p>{c.everydayText}</p></div><div className="online-situation-card"><div className={`online-situation-visual category-${everyday.category}`}>{everyday.image ? <img src={everyday.image} alt="" width="1254" height="1254" /> : <div className="online-situation-symbol" aria-hidden="true"><i>{everyday.visual}</i><span>{c.categories[everyday.category]}</span></div>}<span>{everydayIndex + 1} / {everydayScenes.length}</span><small>{c.categories[everyday.category]}</small></div><div className="online-situation-copy"><h3>{c.mightFeel}</h3><p className="online-situation-prompt">{language === "th" ? everyday.th : everyday.en}</p>{(language === "en" || everyday.thaiAudio) && <button className="v2-story-audio online-situation-audio" type="button" onClick={() => speakText(language === "th" ? everyday.th : everyday.en, everyday.thaiAudio)}><span aria-hidden="true">◖))</span>{c.listenStory}</button>}{audioError && <small className="online-audio-error">{c.audioError}</small>}<div className="online-feeling-choices">{emotions.map((emotion) => <button type="button" className={everydayAnswer === emotion.id ? "is-selected" : ""} onClick={() => setEverydayAnswer(emotion.id)} key={emotion.id}><span><EmotionFace emotion={emotion.id} /></span>{emotionName(emotion.id, language)}</button>)}</div>{everydayAnswer && <div className="v2-reflection-followup"><div><strong>{c.intensityTitle}</strong><div>{(["small", "medium", "big"] as Intensity[]).map((value, index) => <button type="button" className={everydayIntensity === value ? "is-selected" : ""} onClick={() => setEverydayIntensity(value)} key={value}>{c.intensities[index]}</button>)}</div></div><div><strong>{c.supportTitle}</strong><div>{(["space", "talk", "help", "try"] as SupportChoice[]).map((value, index) => <button type="button" className={everydaySupport === value ? "is-selected" : ""} onClick={() => setEverydaySupport(value)} key={value}>{c.supports[index]}</button>)}</div></div><p><b>{c.reflection}</b> {c.reflectionText}</p></div>}<button className="button button-blue online-another" type="button" disabled={!everydayAnswer} onClick={saveEverydayReflection}>{c.saveReflection} →</button></div></div></section>
      )}

      {view === "device" && (
        <section className="v2-shell v2-device-shell"><button className="v2-back-button" type="button" onClick={openHome}>← {c.backHome}</button><div className="v2-section-heading"><h2>{c.device}</h2><p>{c.deviceText}</p></div><div className="v2-device-area"><div className="v2-device-frame"><div className="device-model online-device"><span className="device-label">Emotion Sync · Prototype 03</span><div className="speaker"><i /><i /><i /></div><span className={`device-led led-yellow${deviceAnswer && !deviceCorrect ? " is-on" : ""}`} /><span className={`device-led led-green${deviceCorrect ? " is-on" : ""}`} /><button className="side-start-control" type="button" onClick={() => { const pool = emotionOrder.filter((item) => item !== devicePrompt); setDevicePrompt(randomEmotionFrom(pool)); setDeviceAnswer(null); }}><span>Start</span></button><div className="oled"><span className="oled-screw screw-one" /><span className="oled-screw screw-two" /><span className="oled-screw screw-three" /><span className="oled-screw screw-four" /><div className="oled-screen"><b>{devicePrompt ? <EmotionFace emotion={devicePrompt} /> : <span className="device-ready-symbol" aria-hidden="true">▶</span>}</b><span>{devicePrompt ? c.which : c.pressStart}</span></div></div><div className="prototype-controls">{emotions.map((emotion) => <button type="button" className={`model-button model-${emotion.color}`} key={emotion.id} disabled={!devicePrompt || Boolean(deviceAnswer)} onClick={() => chooseDeviceAnswer(emotion.id)}><span className="sr-only">{emotionName(emotion.id, language)}</span></button>)}</div></div></div><div className="online-feedback"><strong>{!devicePrompt ? c.pressStart : !deviceAnswer ? c.choose : deviceCorrect ? c.correct : c.retry}</strong><span>{!devicePrompt ? c.startHint : deviceCorrect ? c.correctDetail : deviceAnswer ? c.retryDetail : c.which}</span></div></div></section>
      )}

      {exportLanguageOpen && (
        <div className="v2-auth-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setExportLanguageOpen(false); }}>
          <section className="v2-auth-dialog v2-export-dialog" role="dialog" aria-modal="true" aria-labelledby="v2-export-language-title">
            <button className="v2-auth-close" type="button" aria-label={c.exportCancel} onClick={() => setExportLanguageOpen(false)}>×</button>
            <div className="v2-export-dialog-mark" aria-hidden="true">↓</div>
            <h2 id="v2-export-language-title">{c.exportLanguageTitle}</h2>
            <p>{c.exportLanguageText}</p>
            <div className="v2-export-language-options">
              <button type="button" onClick={() => downloadProgressCsv("en")}>
                <span aria-hidden="true">EN</span><strong>{c.exportEnglish}</strong><small>English CSV</small>
              </button>
              <button type="button" onClick={() => downloadProgressCsv("th")}>
                <span aria-hidden="true">TH</span><strong>{c.exportThai}</strong><small>ไฟล์ CSV ภาษาไทย</small>
              </button>
            </div>
            <button className="v2-export-cancel" type="button" onClick={() => setExportLanguageOpen(false)}>{c.exportCancel}</button>
          </section>
        </div>
      )}

      {authModalOpen && (
        <div className="v2-auth-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthModalOpen(false); }}>
          <section className="v2-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="v2-auth-title">
            <button className="v2-auth-close" type="button" aria-label={c.authClose} onClick={() => setAuthModalOpen(false)}>×</button>
            <div className="v2-auth-mark" aria-hidden="true"><img src="/plb-bridge-mark.png" alt="" /></div>
            <h2 id="v2-auth-title">{authMode === "signin" ? c.authSignInTitle : c.authCreateTitle}</h2>
            <p>{c.authIntro}</p>
            <a className="v2-auth-privacy" href={`/privacy?lang=${language}`} target="_blank" rel="noreferrer">{c.privacy} ↗</a>
            <button className="v2-google-button" type="button" disabled={accountBusy} onClick={handleGoogleSignIn}>
              <span aria-hidden="true">G</span>{c.authGoogle}
            </button>
            <div className="v2-auth-divider"><span>{c.authOr}</span></div>
            <form className="v2-auth-form" onSubmit={handleEmailAuth}>
              <label><span>{c.authEmail}</span><input type="email" autoComplete="email" required value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} /></label>
              <label><span>{c.authPassword}</span><input type="password" autoComplete={authMode === "create" ? "new-password" : "current-password"} required minLength={6} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} /></label>
              {authMode === "create" && <label><span>{c.authConfirm}</span><input type="password" autoComplete="new-password" required minLength={6} value={authConfirm} onChange={(event) => setAuthConfirm(event.target.value)} /></label>}
              {authMode === "signin" && <button className="v2-auth-forgot" type="button" disabled={accountBusy} onClick={handlePasswordReset}>{c.authForgot}</button>}
              {authMessage && <p className="v2-auth-message is-error" role="alert">{authMessage}</p>}
              {authNotice && <p className="v2-auth-message is-success" role="status">{authNotice}</p>}
              <button className="button button-blue v2-auth-submit" type="submit" disabled={accountBusy}>{accountBusy ? "…" : authMode === "signin" ? c.authEmailSignIn : c.authCreate}</button>
            </form>
            <p className="v2-auth-switch">{authMode === "signin" ? c.authNeedAccount : c.authHaveAccount} <button type="button" onClick={() => { setAuthMode(authMode === "signin" ? "create" : "signin"); setAuthMessage(""); setAuthNotice(""); setAuthPassword(""); setAuthConfirm(""); }}>{authMode === "signin" ? c.authCreateLink : c.authSignInLink}</button></p>
          </section>
        </div>
      )}
    </main>
  );
}
