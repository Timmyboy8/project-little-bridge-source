"use client";

import { useEffect, useState, type FormEvent } from "react";
import thailandMap from "@svg-maps/thailand";
import DonationDirectory from "./DonationDirectory";
import { donations } from "./donations";

const IconArrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

const IconHand = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7.5 11V5.5a1.5 1.5 0 0 1 3 0V10M10.5 9V4.5a1.5 1.5 0 0 1 3 0V10M13.5 9V5.5a1.5 1.5 0 0 1 3 0v5M16.5 10V8a1.5 1.5 0 0 1 3 0v6c0 4.4-3.1 7-7.2 7h-.6c-2.2 0-3.8-1-5.1-2.5L3.4 15a1.7 1.7 0 0 1 2.4-2.4L7.5 14V11Z" />
  </svg>
);

const IconPeople = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="9" r="2.3" />
    <path d="M3.5 20v-1.5A5.5 5.5 0 0 1 9 13a5.5 5.5 0 0 1 5.5 5.5V20M15 14.5c3.3 0 5.5 1.8 5.5 4.5v1" />
  </svg>
);

const IconSpark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.5 13.8 8l5.7 1.8-5.7 1.8L12 17l-1.8-5.4-5.7-1.8L10.2 8 12 2.5Z" />
    <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
    <circle cx="12" cy="12" r="4.1" />
    <circle className="social-icon-dot" cx="17.4" cy="6.8" r="1.1" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14.1 21v-8h2.8l.4-3.1h-3.2v-2c0-.9.3-1.6 1.7-1.6h1.7V3.5c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.4H8.3V13H11v8h3.1Z" />
  </svg>
);

const learningSteps = [
  {
    number: "01",
    title: "Recognize",
    cue: "Recognize emotions",
    text: "Simple emoji faces help children practice identifying four basic emotions.",
    icon: <IconEye />,
  },
  {
    number: "02",
    title: "Practice",
    cue: "Answer through touch",
    text: "Physical buttons give children a clear and predictable way to respond.",
    icon: <IconHand />,
  },
  {
    number: "03",
    title: "Connect",
    cue: "Build understanding",
    text: "Immediate feedback and saved results can show adults where more support may help.",
    icon: <IconPeople />,
  },
];

const team = [
  {
    name: "Korarich Kiattanaporn",
    nameTh: "กรฤต เกียรติธนพร",
    role: "Founder",
    detail: "Vision, device design, prototyping, and the evaluation approach.",
    school: "Triam Udom Suksa School",
    image: "/team-korarich.webp",
  },
  {
    name: "Kittichet Maklin",
    nameTh: "กิตติเชษฐ์ มากลิ่น",
    role: "Co-Founder",
    detail: "Assembly, testing, outreach, promotion, and the project website.",
    school: "KPIS International School",
    image: "/team-kittichet.jpg",
  },
  {
    name: "Yossakrit Saengravee",
    nameTh: "ยศกฤต แสงระวี",
    role: "Engineer",
    detail: "Exterior design, enclosure development, and digital experience.",
    school: "Triam Udom Suksa School",
    image: "/team-yosakrit.webp",
  },
];

const supportSymbols = ["↔", "♡", "✦", "◎"] as const;

const emotionChoices = {
  happy: {
    label: "Happy",
    face: "•‿•",
    title: "That joy matters.",
    message: "Noticing good feelings helps children understand what brings them comfort and confidence.",
  },
  calm: {
    label: "Calm",
    face: "–‿–",
    title: "Calm is worth noticing, too.",
    message: "Gentle check-ins build a fuller emotional vocabulary, not only during difficult moments.",
  },
  sad: {
    label: "Sad",
    face: "•︵•",
    title: "It is okay to feel sad.",
    message: "A simple choice can make a difficult feeling easier to name and share with someone trusted.",
  },
  frustrated: {
    label: "Angry",
    face: ">︵<",
    title: "Big feelings can have words.",
    message: "Naming anger creates a small pause—and a clearer first step toward asking for support.",
  },
} as const;

type EmotionChoice = keyof typeof emotionChoices;

const prototypeButtons: Array<{ emotion: EmotionChoice; color: string }> = [
  { emotion: "frustrated", color: "red" },
  { emotion: "happy", color: "yellow" },
  { emotion: "sad", color: "blue" },
  { emotion: "calm", color: "black" },
];

const quizSequence: EmotionChoice[] = ["happy", "sad", "frustrated", "calm"];

type Language = "en" | "th";
type ContactStatus = "idle" | "submitting" | "success" | "error";

const siteCopy = {
  en: {
    nav: { story: "Our story", product: "Emotion Sync", helps: "How it helps", reach: "Our reach", team: "Our team", menu: "Menu", closeMenu: "Close menu" },
    support: {
      trigger: "Support the project", eyebrow: "Ways to help", title: "Choose how you’d like to support Little Bridge.",
      intro: "Partnerships, invitations, and donations help Emotion Sync reach another community.", close: "Close support options",
      options: [
        { title: "Partner with us", text: "For schools, foundations, educators, and community organizations.", subject: "Partnership with Project Little Bridge", body: "Hello Project Little Bridge team,\n\nI would like to discuss a possible partnership.\n\nOrganization:\nHow we may work together:\n\nThank you." },
        { title: "Donate to the project", text: "Ask for current donation details and help us build and distribute more devices.", subject: "Donation to Project Little Bridge", body: "Hello Project Little Bridge team,\n\nI am interested in supporting the project with a donation. Please send me the current donation details and how the funds will be used.\n\nThank you." },
        { title: "Invite our team", text: "Invite us to speak, demonstrate Emotion Sync, or join a community event.", subject: "Invitation for Project Little Bridge", body: "Hello Project Little Bridge team,\n\nI would like to invite your team to: \n\nEvent or organization:\nProposed date:\nDetails:\n\nThank you." },
        { title: "Follow our progress", text: "See prototype updates, donation milestones, and what we build next." },
      ],
      donationNote: "Donations are arranged directly with our team. This website does not collect payment information.",
      unsure: "Not sure where you fit?", general: "Start a general conversation.", generalSubject: "Conversation with Project Little Bridge",
    },
    hero: { summary: "An emotion-learning device for children with autism.", hint: "Press Start on the side, then match the emoji", cta: "How it helps", modelLabel: "Interactive digital model of the Emotion Sync prototype", startAria: "Show a new emoji face", syncAria: "Sync session data locally", groupAria: "Choose which emotion the emoji shows", screenSynced: "SYNCED", screenCorrect: "CORRECT", screenRetry: "TRY AGAIN", screenQuestion: "WHICH EMOTION?", screenStart: "PRESS START" },
    emotions: { happy: "Happy", calm: "Calm", sad: "Sad", frustrated: "Angry" },
    feedback: { syncButton: "White Sync button", green: "Green light", yellow: "Yellow light", synced: "Session data synced.", correct: "Correct!", retry: "Look again and try once more.", syncText: "Session data is prepared for future local use.", correctText: "The answer matches the emoji.", wrongText: "The selected emotion does not match yet." },
    learning: {
      eyebrow: "", titleA: "How Emotion Sync Helps", titleB: "", calm: "Practice without pressure.", calmText: "Clear faces, physical buttons, and simple feedback let each child learn at their own pace.",
      steps: [
        { cue: "Recognize emotions", title: "Recognize", text: "Simple emoji faces help children practice identifying four basic emotions." },
        { cue: "Answer through touch", title: "Practice", text: "Physical buttons give children a clear and predictable way to respond." },
        { cue: "Build understanding", title: "Connect", text: "Immediate feedback and saved results can show adults where more support may help." },
      ],
    },
    session: {
      eyebrow: "", titleA: "How One Session Works", titleB: "", tabs: ["Start", "Match", "Check", "Sync"], step: "Step", of: "of", back: "← Back",
      hints: ["Use the Start button →", "Choose the matching emotion →", "Choose an answer first", "Press the white Sync button →"],
      next: "Choose an answer", retry: "Try another answer", continue: "Continue to Sync", again: "Try again",
      steps: [
        { eyebrow: "Begin the activity", title: "Press Start.", text: "A new emoji face appears when the child or supporting adult presses Start." },
        { eyebrow: "Recognize the emotion", title: "Match the emoji.", text: "The child answers using one of the four colored buttons." },
        { eyebrow: "See the result", title: "The lights give feedback.", text: "Green means correct. Yellow invites the child to look again." },
        { eyebrow: "Keep the learning data", title: "Press Sync.", text: "The white button prepares session data for future local use." },
      ],
      question: "Which emotion is this?", yellowLight: "Yellow", tryAgain: "Try again", greenLight: "Green", correctSmall: "Correct", chooseFirst: "Choose an answer first.", correctAnswer: "Correct! That is happy.", notMatch: "That does not match—look again.", greenConfirm: "The green light confirms the match.", yellowRetry: "The yellow light invites another try.", returnMatch: "Return to Match to answer.", whiteButton: "White Sync button", synced: "Session data synced.", pressSync: "Press to sync the session.", syncedText: "Prepared for future local use.", localText: "Data stays local and is transferred intentionally.",
    },
    story: {
      origin: "Built by students in Bangkok", quote: "Every feeling deserves a way to be understood.", rhythm: ["Listen", "Build", "Share"], feel: "I feel", calm: "calm", proud: "proud", eyebrow: "",
      title: "Why We Built Emotion Sync",
      p1: "Project Little Bridge began with a simple idea: emotional learning should feel approachable, physical, and encouraging. We are building a tool children can use at their own pace.",
      p2: "The goal is not to replace human connection—it is to make that connection easier to begin.",
      student: "Student-led", studentText: "Designed and built by our team", human: "Human-first", humanText: "Technology that supports connection", link: "Meet the people building it",
    },
    product: {
      eyebrow: "", titleA: "Inside Emotion Sync", titleB: "", lede: "Tactile input, instant feedback, and private offline progress tracking work together in one focused device.",
      features: [
        { tag: "Display", title: "See an emoji face", text: "The OLED displays one simple face showing an emotion." },
        { tag: "Touch", title: "Respond through touch", text: "Four physical buttons make answers direct and predictable." },
        { tag: "Local", title: "Sync for later", text: "The white button prepares progress for future local use." },
      ],
      architecture: "Prototype architecture", anywhere: "Built to work anywhere", offline: "Offline-first", map: "Emotion Sync · System map", controller: "Controller", runs: "Runs each session", prompt: "Emotion prompt", buttons: "4 buttons", childAnswer: "Child’s answer", led: "LED feedback", rightRetry: "Right or retry", localSync: "Local sync", progressLater: "Progress for later", privacy: "Privacy-minded by design", privacyText: "Core gameplay works offline. Progress stays local until it is intentionally transferred.",
    },
    prototype: { eyebrow: "", titleA: "The Prototype We Built", titleB: "", lede: "The interactive model mirrors the working prototype our student team built and refined by hand.", facts: ["Tactile emotion responses", "Emoji face on the OLED", "Assembled by our team", "Made to test and improve"], hand: "Hand-built", iterative: "Iterative", link: "Follow the build journey" },
    progress: { eyebrow: "", titleA: "Our Progress So Far", titleB: "", lede: "From our first sketch to sharing Emotion Sync with communities in Bangkok.", current: "Current stage", donating: "Now donating", distribution: "Community distribution", completed: "Completed", here: "We are here", steps: [{ title: "Device design", text: "Shaping the idea into a friendly device." }, { title: "Working prototype", text: "Building the controls and core experience." }, { title: "Testing & refinement", text: "Improving through trials and feedback." }, { title: "Community distribution", text: "Donating devices and learning from two foundations in Bangkok." }] },
    reach: { eyebrow: "Where we donate", titleA: "A little bridge", titleB: "across Thailand.", lede: "Explore the map to see the two foundations where we have donated Emotion Sync.", stat: "recipient organizations", bangkok: "Bangkok", province: "Donation province", recipient: "Recipient organization", recipientPending: "Recipient names will appear here once confirmed.", prompt: "Hover to preview. Click or tap Bangkok to open it, then click again to close.", mapTitle: "Thailand donation map", inProgress: "Devices donated", caption: "We have donated Emotion Sync to two foundations in Bangkok and are using their feedback to improve it.", show: "Bangkok. Show donation locations.", hide: "Bangkok. Hide donation locations." },
    team: { eyebrow: "", titleA: "Meet Our Team", titleB: "", lede: "Students from two Bangkok schools combining engineering, design, and outreach.", roles: ["Founder", "Co-Founder", "Engineer"], schools: ["Triam Udom Suksa School", "KPIS International School", "Triam Udom Suksa School"], details: ["Vision, device design, prototyping, and evaluation.", "Assembly, testing, outreach, promotion, and the website.", "Exterior design, enclosure development, and digital experience."] },
    cta: { eyebrow: "", titleA: "Get Involved", titleB: "", text: "Educators, caregivers, partners, and supporters can help us test, improve, and share Emotion Sync.", conversation: "Start a conversation", follow: "Follow our journey", subject: "Conversation with Project Little Bridge", body: "Hello Project Little Bridge team,\n\nI would like to learn more about the project.\n\nMy message:\n", practiceEyebrow: "Free online practice", practiceTitle: "Practice emotions online", practiceText: "Start as a guest with progress saved in this browser, or create a free adult account to keep it available across devices—without timers or score pressure.", practiceButton: "Practice Online", formTitle: "Send us a message", formIntro: "Choose a reason and tell us how we can help.", name: "Name", email: "Email", organisation: "School or organization (optional)", reason: "I am interested in", message: "Message", messagePlaceholder: "Tell us a little about how you would like to help", submit: "Send message", sending: "Sending…", success: "Thanks—your message has been sent. We’ll get back to you soon.", error: "We couldn’t send your message. Please try again in a moment.", formNote: "Your message will be sent directly to the Project Little Bridge team.", reasons: ["Partner with us", "Support production", "Invite our team", "General question"] },
    footer: { text: "Building understanding, one small connection at a time.", follow: "Follow Project Little Bridge", instagram: "Follow Project Little Bridge on Instagram", facebook: "Follow Project Little Bridge on Facebook", privacy: "Privacy", top: "Back to top ↑" },
    a11y: { home: "Project Little Bridge home", primaryNav: "Primary navigation", mobileNav: "Mobile navigation", sessionSteps: "Session demonstration steps", resultNone: "No answer selected yet", resultCorrect: "Green light: correct answer", resultWrong: "Yellow light: incorrect answer", principles: "Project Little Bridge principles", components: "Emotion Sync component system", prototypeMain: "A student holding the first Emotion Sync prototype, showing its OLED screen and four colored response buttons", prototypeControls: "Close-up view of the handmade Emotion Sync controls and enclosure", prototypeLabel: "Rear view of the prototype showing its Project Little Bridge label", prototypeFeatures: "Prototype features", progressCurrent: "Current stage: community distribution, now donating", reachStat: "Two recipient organizations in Bangkok", mapAlt: "Map of Thailand with Bangkok highlighted as a current donation province", portrait: "Portrait of", mapData: "Map data" },
  },
  th: {
    nav: { story: "เรื่องราวของเรา", product: "Emotion Sync", helps: "วิธีใช้งาน", reach: "พื้นที่ที่เราส่งมอบอุปกรณ์", team: "ทีมของเรา", menu: "เมนู", closeMenu: "ปิดเมนู" },
    support: {
      trigger: "สนับสนุนโครงการ", eyebrow: "ร่วมสนับสนุน", title: "เลือกวิธีร่วมสนับสนุน Project Little Bridge", intro: "ทุกความร่วมมือช่วยให้เราพัฒนาและส่งมอบ Emotion Sync ให้เด็ก ๆ ได้มากขึ้น", close: "ปิดตัวเลือกการสนับสนุน",
      options: [
        { title: "ร่วมมือกับเรา", text: "สำหรับโรงเรียน มูลนิธิ ครู และองค์กรชุมชนที่สนใจร่วมงานกับเรา", subject: "ร่วมมือกับ Project Little Bridge", body: "สวัสดีทีม Project Little Bridge\n\nสนใจพูดคุยเรื่องความร่วมมือกับโครงการ\n\nชื่อองค์กร:\nแนวทางที่อยากร่วมงานกับเรา:\n\nขอบคุณ" },
        { title: "บริจาคให้โครงการ", text: "ติดต่อทีมเพื่อขอรายละเอียดและช่วยเราผลิตและส่งมอบอุปกรณ์เพิ่มเติม", subject: "บริจาคให้ Project Little Bridge", body: "สวัสดีทีม Project Little Bridge\n\nสนใจร่วมสนับสนุนโครงการด้วยการบริจาค จึงขอสอบถามรายละเอียดการบริจาคและการนำเงินไปใช้\n\nขอบคุณ" },
        { title: "เชิญทีมของเรา", text: "เชิญทีมไปนำเสนอ Emotion Sync หรือร่วมกิจกรรมของโรงเรียนและชุมชน", subject: "คำเชิญสำหรับ Project Little Bridge", body: "สวัสดีทีม Project Little Bridge\n\nสนใจเชิญทีมเข้าร่วมกิจกรรม\n\nชื่อองค์กรหรือกิจกรรม:\nวันที่เสนอ:\nรายละเอียด:\n\nขอบคุณ" },
        { title: "ติดตามความคืบหน้า", text: "ติดตามการพัฒนาต้นแบบและความคืบหน้าการส่งมอบอุปกรณ์" },
      ],
      donationNote: "หากต้องการบริจาค กรุณาติดต่อทีมของเราโดยตรง เว็บไซต์นี้ไม่รับหรือเก็บข้อมูลการชำระเงิน", unsure: "ยังไม่แน่ใจว่าจะช่วยแบบไหน?", general: "ติดต่อเรา", generalSubject: "ติดต่อ Project Little Bridge",
    },
    hero: { summary: "อุปกรณ์ฝึกแยกแยะอารมณ์สำหรับเด็กออทิสติก", hint: "กดปุ่ม Start ด้านข้าง แล้วเลือกอารมณ์ที่ตรงกับใบหน้า", cta: "ดูวิธีใช้งาน", modelLabel: "ลองใช้งาน Emotion Sync แบบจำลอง", startAria: "แสดงอีโมจิใหม่", syncAria: "บันทึกข้อมูลไว้ในเครื่อง", groupAria: "กดเลือกอารมณ์ที่อีโมจิแสดง", screenSynced: "บันทึกแล้ว", screenCorrect: "ถูกต้อง", screenRetry: "ลองอีกครั้ง", screenQuestion: "อารมณ์อะไร?", screenStart: "กด START" },
    emotions: { happy: "มีความสุข", calm: "สงบ", sad: "เศร้า", frustrated: "โกรธ" },
    feedback: { syncButton: "ปุ่มบันทึกข้อมูลสีขาว", green: "ไฟสีเขียว", yellow: "ไฟสีเหลือง", synced: "บันทึกข้อมูลแล้ว", correct: "ถูกต้อง!", retry: "ยังไม่ถูก ลองอีกครั้ง", syncText: "บันทึกผลการเล่นรอบนี้ไว้สำหรับดาวน์โหลดในภายหลัง", correctText: "คำตอบตรงกับอีโมจิ", wrongText: "คำตอบที่เลือกยังไม่ตรงกับอีโมจิ" },
    learning: { eyebrow: "", titleA: "Emotion Sync ช่วยอย่างไร", titleB: "", calm: "ฝึกได้โดยไม่กดดัน", calmText: "ภาพอีโมจิที่เข้าใจง่าย ปุ่มกด และไฟบอกผล ช่วยให้เด็กค่อย ๆ ฝึกได้ในแบบของตัวเอง", steps: [{ cue: "ดูหน้าอีโมจิ", title: "สังเกตอารมณ์", text: "เด็กดูหน้าอีโมจิ แล้วฝึกแยกแยะอารมณ์ 4 แบบ" }, { cue: "กดปุ่มสี", title: "เลือกคำตอบ", text: "เด็กกดปุ่มสีเพื่อเลือกอารมณ์ที่คิดว่าใช่" }, { cue: "ดูผลการตอบ", title: "ฝึกต่อได้ตรงจุด", text: "ผลการตอบช่วยให้ครู ผู้ปกครอง และผู้ดูแลเห็นว่าเด็กควรฝึกอารมณ์ไหนเพิ่ม" }] },
    session: { eyebrow: "", titleA: "วิธีใช้งานในหนึ่งรอบ", titleB: "", tabs: ["เริ่ม", "เลือก", "ดูผล", "บันทึก"], step: "ขั้นตอนที่", of: "/", back: "← กลับ", hints: ["กดปุ่ม Start →", "เลือกอารมณ์ที่ตรงกับใบหน้า →", "กลับไปเลือกคำตอบก่อน", "กดปุ่มสีขาว →"], next: "กลับไปเลือกคำตอบ", retry: "ลองอีกครั้ง", continue: "ไปขั้นบันทึกข้อมูล", again: "เริ่มใหม่", steps: [{ eyebrow: "เริ่มใช้งาน", title: "กดปุ่ม Start", text: "เมื่อเด็กหรือผู้ดูแลกด Start หน้าจอจะแสดงอีโมจิ 1 หน้า" }, { eyebrow: "ดูหน้าอีโมจิ", title: "เลือกอารมณ์", text: "ให้เด็กกดปุ่มสี 1 ใน 4 ปุ่มเพื่อเลือกคำตอบ" }, { eyebrow: "ดูผลการตอบ", title: "ดูไฟบอกผล", text: "ถ้าตอบถูก ไฟสีเขียวจะติด หากตอบผิด ไฟสีเหลืองจะติด" }, { eyebrow: "บันทึกข้อมูล", title: "กดปุ่มสีขาว", text: "กดปุ่มสีขาวเพื่อบันทึกผลการเล่นไว้สำหรับดาวน์โหลดในภายหลัง" }], question: "อีโมจินี้แสดงอารมณ์อะไร?", yellowLight: "สีเหลือง", tryAgain: "ลองอีกครั้ง", greenLight: "สีเขียว", correctSmall: "ถูกต้อง", chooseFirst: "กรุณาเลือกคำตอบก่อน", correctAnswer: "ถูกต้อง! อีโมจินี้แสดงความสุข", notMatch: "ยังไม่ถูก ลองอีกครั้ง", greenConfirm: "ตอบถูกแล้ว ไฟสีเขียวจะติด", yellowRetry: "หากตอบผิด ไฟสีเหลืองจะติดเพื่อให้ลองอีกครั้ง", returnMatch: "กลับไปเลือกคำตอบก่อน", whiteButton: "ปุ่มบันทึกข้อมูลสีขาว", synced: "บันทึกข้อมูลแล้ว", pressSync: "กดเพื่อบันทึกข้อมูล", syncedText: "บันทึกผลการเล่นรอบนี้เรียบร้อยแล้ว", localText: "ข้อมูลจะเก็บอยู่ในเครื่อง และส่งออกเมื่อผู้ใช้เลือกเท่านั้น" },
    story: { origin: "สร้างโดยนักเรียนในกรุงเทพฯ", quote: "เราอยากช่วยให้เด็กเข้าใจและบอกความรู้สึกได้ง่ายขึ้น", rhythm: ["รับฟัง", "สร้าง", "แบ่งปัน"], feel: "ฉันรู้สึก", calm: "สงบ", proud: "ภูมิใจ", eyebrow: "", title: "เหตุผลที่เราสร้าง Emotion Sync", p1: "เราเริ่ม Project Little Bridge เพราะอยากทำให้การฝึกเรื่องอารมณ์เข้าใจง่ายและเป็นมิตรกับเด็ก จึงพัฒนาอุปกรณ์ที่เด็กสามารถดู กดตอบ และฝึกซ้ำได้ตามความพร้อม", p2: "อุปกรณ์นี้ไม่ได้มาแทนครู ผู้ปกครอง หรือผู้ดูแล แต่ช่วยให้เริ่มพูดคุยเรื่องอารมณ์กับเด็กได้ง่ายขึ้น", student: "นักเรียนเป็นผู้ลงมือทำ", studentText: "ทีมของเราออกแบบและสร้างอุปกรณ์ด้วยตัวเอง", human: "สร้างเพื่อเด็กและผู้ดูแล", humanText: "ใช้เทคโนโลยีช่วยให้เด็กกับผู้ดูแลเข้าใจกันมากขึ้น", link: "รู้จักทีมผู้สร้าง" },
    product: { eyebrow: "", titleA: "ภายใน Emotion Sync", titleB: "", lede: "Emotion Sync รวมหน้าจอ ปุ่มกด ไฟบอกผล และการบันทึกข้อมูลไว้ในอุปกรณ์เดียว", features: [{ tag: "หน้าจอ", title: "ดูหน้าอีโมจิ", text: "จอ OLED แสดงหน้าอีโมจิ 1 หน้าให้เด็กทายอารมณ์" }, { tag: "ปุ่มกด", title: "เลือกคำตอบ", text: "เด็กกดปุ่มสี 1 ใน 4 ปุ่มเพื่อเลือกคำตอบ" }, { tag: "บันทึก", title: "บันทึกผลการเล่น", text: "ปุ่มสีขาวใช้บันทึกผลไว้สำหรับดาวน์โหลดในภายหลัง" }], architecture: "โครงสร้างต้นแบบ", anywhere: "ใช้งานได้โดยไม่ต้องต่ออินเทอร์เน็ต", offline: "ทำงานออฟไลน์", map: "Emotion Sync · แผนผังระบบ", controller: "ตัวควบคุม", runs: "ควบคุมการทำงานของอุปกรณ์", prompt: "แสดงอารมณ์", buttons: "4 ปุ่ม", childAnswer: "คำตอบของเด็ก", led: "ไฟบอกผล", rightRetry: "ตอบถูก / ลองอีกครั้ง", localSync: "บันทึกในเครื่อง", progressLater: "บันทึกผลการเล่น", privacy: "คำนึงถึงความเป็นส่วนตัว", privacyText: "อุปกรณ์ใช้งานได้โดยไม่ต้องต่ออินเทอร์เน็ต ข้อมูลจะเก็บอยู่ในเครื่องและส่งออกเมื่อผู้ใช้เลือกเท่านั้น" },
    prototype: { eyebrow: "", titleA: "ต้นแบบที่เราสร้าง", titleB: "", lede: "แบบจำลองด้านบนสร้างจากต้นแบบจริงที่ทีมของเราประกอบและปรับปรุงด้วยตัวเอง", facts: ["ปุ่มเลือกคำตอบ 4 ปุ่ม", "หน้าอีโมจิบนจอ OLED", "ประกอบโดยทีมของเรา", "นำผลทดสอบมาพัฒนาต่อ"], hand: "สร้างด้วยมือ", iterative: "ปรับปรุงจากการทดสอบ", link: "ดูขั้นตอนการพัฒนา" },
    progress: { eyebrow: "", titleA: "ความคืบหน้าของเรา", titleB: "", lede: "จากแบบร่างแรก สู่การส่งมอบ Emotion Sync ให้มูลนิธิในกรุงเทพฯ", current: "ขั้นตอนปัจจุบัน", donating: "เริ่มส่งมอบแล้ว", distribution: "ส่งมอบอุปกรณ์ให้ชุมชน", completed: "เสร็จแล้ว", here: "เราอยู่ตรงนี้", steps: [{ title: "ออกแบบอุปกรณ์", text: "เปลี่ยนแนวคิดให้เป็นอุปกรณ์ที่เด็กใช้งานได้ง่าย" }, { title: "ต้นแบบที่ใช้งานได้", text: "ประกอบปุ่ม หน้าจอ และระบบการทำงานหลัก" }, { title: "ทดสอบและปรับปรุง", text: "ทดลองใช้งานและนำคำแนะนำมาปรับปรุง" }, { title: "ส่งมอบอุปกรณ์ให้ชุมชน", text: "ส่งมอบอุปกรณ์ให้มูลนิธิ 2 แห่งในกรุงเทพฯ และรับฟังคำแนะนำเพื่อนำมาปรับปรุง" }] },
    reach: { eyebrow: "พื้นที่ที่เราส่งมอบอุปกรณ์", titleA: "สะพานเล็ก ๆ", titleB: "ทั่วประเทศไทย", lede: "ดูมูลนิธิทั้ง 2 แห่งที่ได้รับมอบ Emotion Sync ผ่านแผนที่ด้านล่าง", stat: "มูลนิธิที่ได้รับมอบ", bangkok: "กรุงเทพมหานคร", province: "จังหวัดที่ส่งมอบอุปกรณ์", recipient: "หน่วยงานที่รับมอบอุปกรณ์", recipientPending: "จะแสดงชื่อหน่วยงานเมื่อได้รับการยืนยัน", prompt: "แตะกรุงเทพฯ เพื่อดูรายละเอียด และแตะอีกครั้งเพื่อปิด", mapTitle: "แผนที่การส่งมอบ Emotion Sync", inProgress: "ส่งมอบอุปกรณ์แล้ว", caption: "เราส่งมอบ Emotion Sync ให้มูลนิธิ 2 แห่งในกรุงเทพฯ และกำลังนำคำแนะนำมาปรับปรุงอุปกรณ์", show: "กรุงเทพฯ แสดงหน่วยงานที่ได้รับมอบอุปกรณ์", hide: "กรุงเทพฯ ซ่อนรายละเอียดหน่วยงาน" },
    team: { eyebrow: "", titleA: "พบกับทีมของเรา", titleB: "", lede: "ทีมของเราประกอบด้วยนักเรียนจาก 2 โรงเรียนในกรุงเทพฯ ที่ร่วมกันดูแลงานด้านวิศวกรรม การออกแบบ และการประชาสัมพันธ์", roles: ["ผู้ก่อตั้ง", "ผู้ร่วมก่อตั้ง", "วิศวกร"], schools: ["โรงเรียนเตรียมอุดมศึกษา", "โรงเรียนนานาชาติ KPIS", "โรงเรียนเตรียมอุดมศึกษา"], details: ["ดูแลแนวคิดหลัก ออกแบบอุปกรณ์ สร้างต้นแบบ และประเมินผล", "ดูแลการประกอบ การทดสอบ การประชาสัมพันธ์ และการพัฒนาเว็บไซต์", "ดูแลรูปลักษณ์ภายนอก ตัวเครื่อง และส่วนใช้งานดิจิทัล"] },
    cta: { eyebrow: "", titleA: "ร่วมสนับสนุนโครงการ", titleB: "", text: "หากคุณเป็นครู ผู้ปกครอง ผู้ดูแล หรือองค์กรที่สนใจ คุณสามารถช่วยทดลอง ให้คำแนะนำ หรือร่วมสนับสนุนการส่งมอบ Emotion Sync ให้เด็ก ๆ ได้", conversation: "ติดต่อเรา", follow: "ติดตามเรา", subject: "ติดต่อ Project Little Bridge", body: "สวัสดีทีม Project Little Bridge\n\nสนใจสอบถามข้อมูลเพิ่มเติมเกี่ยวกับโครงการ Emotion Sync\n\nรายละเอียดที่ต้องการสอบถาม:\n", practiceEyebrow: "ฝึกออนไลน์ฟรี", practiceTitle: "ฝึกอารมณ์ออนไลน์", practiceText: "เริ่มแบบผู้เยี่ยมชมโดยบันทึกความก้าวหน้าในเบราว์เซอร์นี้ หรือสร้างบัญชีผู้ใหญ่ฟรีเพื่อเปิดดูข้อมูลจากอุปกรณ์อื่น โดยไม่มีการจับเวลาหรือแรงกดดันจากคะแนน", practiceButton: "เริ่มฝึกออนไลน์", formTitle: "ส่งข้อความถึงเรา", formIntro: "เลือกหัวข้อแล้วเขียนข้อความสั้น ๆ ถึงทีมของเรา", name: "ชื่อ", email: "อีเมล", organisation: "โรงเรียนหรือองค์กร (ไม่บังคับ)", reason: "เรื่องที่ต้องการติดต่อ", message: "ข้อความ", messagePlaceholder: "บอกเราเพิ่มเติมว่าคุณอยากร่วมสนับสนุนอย่างไร", submit: "ส่งข้อความ", sending: "กำลังส่ง…", success: "ส่งข้อความแล้ว ขอบคุณที่ติดต่อเรา เราจะตอบกลับโดยเร็ว", error: "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", formNote: "ข้อความจะถูกส่งถึงทีม Project Little Bridge โดยตรง", reasons: ["ร่วมเป็นพาร์ตเนอร์", "สนับสนุนค่าอุปกรณ์", "เชิญทีมไปนำเสนอ", "สอบถามทั่วไป"] },
    footer: { text: "ร่วมกันช่วยให้เด็กเข้าใจและสื่อสารความรู้สึกได้ง่ายขึ้น", follow: "ติดตาม Project Little Bridge", instagram: "ติดตาม Project Little Bridge บน Instagram", facebook: "ติดตาม Project Little Bridge บน Facebook", privacy: "ความเป็นส่วนตัว", top: "กลับขึ้นด้านบน ↑" },
    a11y: { home: "หน้าแรก Project Little Bridge", primaryNav: "เมนูหลัก", mobileNav: "เมนูบนมือถือ", sessionSteps: "ขั้นตอนการใช้งานหนึ่งรอบ", resultNone: "ยังไม่ได้เลือกคำตอบ", resultCorrect: "ไฟสีเขียว ตอบถูก", resultWrong: "ไฟสีเหลือง ตอบผิด", principles: "แนวคิดของ Project Little Bridge", components: "ส่วนประกอบของ Emotion Sync", prototypeMain: "นักเรียนถือต้นแบบ Emotion Sync เครื่องแรก ซึ่งมีจอ OLED และปุ่มเลือกคำตอบ 4 ปุ่ม", prototypeControls: "ภาพระยะใกล้ของปุ่มและตัวเครื่อง Emotion Sync ที่ทีมประกอบด้วยมือ", prototypeLabel: "ด้านหลังของต้นแบบพร้อมป้าย Project Little Bridge", prototypeFeatures: "จุดเด่นของต้นแบบ", progressCurrent: "ขั้นตอนปัจจุบัน เริ่มส่งมอบอุปกรณ์ให้ชุมชนแล้ว", reachStat: "มูลนิธิ 2 แห่งในกรุงเทพฯ ที่ได้รับมอบอุปกรณ์", mapAlt: "แผนที่ประเทศไทยที่เน้นกรุงเทพฯ ซึ่งเป็นพื้นที่แรกที่ได้รับมอบอุปกรณ์", portrait: "ภาพของ", mapData: "ข้อมูลแผนที่" },
  },
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionChoice | null>(null);
  const [quizEmotion, setQuizEmotion] = useState<EmotionChoice | null>(null);
  const [quizRound, setQuizRound] = useState(0);
  const [syncComplete, setSyncComplete] = useState(false);
  const [sessionStep, setSessionStep] = useState(0);
  const [sessionEmotion, setSessionEmotion] = useState<EmotionChoice | null>(null);
  const [sessionSynced, setSessionSynced] = useState(false);
  const [hoveredProvinceId, setHoveredProvinceId] = useState<string | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [contactReason, setContactReason] = useState(0);
  const [contactStatus, setContactStatus] = useState<ContactStatus>("idle");
  const c = siteCopy[language];
  const quizPrompt = quizEmotion ? emotionChoices[quizEmotion] : null;
  const quizCorrect = Boolean(quizEmotion && selectedEmotion === quizEmotion);
  const sessionTarget: EmotionChoice = "happy";
  const sessionCorrect = sessionEmotion === sessionTarget;
  const activeProvinceId = hoveredProvinceId ?? selectedProvinceId;
  const provinceDonations = donations.filter(visit => visit.provinceId === activeProvinceId);
  const activeDonation = provinceDonations.length > 0;
  const emotionLabel = (emotion: EmotionChoice) => c.emotions[emotion];

  const resetSession = () => {
    setSessionStep(0);
    setSessionEmotion(null);
    setSessionSynced(false);
  };

  const chooseSessionEmotion = (emotion: EmotionChoice) => {
    setSessionEmotion(emotion);
    setSessionStep(2);
  };

  const startQuiz = () => {
    setQuizEmotion(quizSequence[quizRound % quizSequence.length]);
    setQuizRound((round) => round + 1);
    setSelectedEmotion(null);
    setSyncComplete(false);
  };

  const chooseContactReason = (index: number) => {
    setContactReason(index);
    setContactStatus("idle");
    setSupportOpen(false);
    setMobileMenuOpen(false);
    window.setTimeout(() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("form-name", "project-little-bridge-contact");
    data.set("language", language === "th" ? "Thai" : "English");
    const encoded = new URLSearchParams();
    data.forEach((value, key) => {
      if (typeof value === "string") encoded.append(key, value);
    });

    setContactStatus("submitting");
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encoded.toString(),
      });
      if (!response.ok) throw new Error("Submission failed");
      setContactStatus("success");
      form.reset();
      setContactReason(0);
    } catch {
      setContactStatus("error");
    }
  };

  useEffect(() => {
    document.documentElement.lang = language === "th" ? "th" : "en";
    window.localStorage.setItem("plb-language", language);
  }, [language]);

  useEffect(() => {
    if (!supportOpen && !mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSupportOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [supportOpen, mobileMenuOpen]);

  const navItems = [
    { href: "#story", label: c.nav.story },
    { href: "#emotion-sync", label: c.nav.product },
    { href: "#how-it-works", label: c.nav.helps },
    { href: "#reach", label: c.nav.reach },
    { href: "#team", label: c.nav.team },
  ];

  return (
    <main className={language === "th" ? "lang-th" : undefined}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label={c.a11y.home} onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            <img src="/plb-bridge-mark.png" alt="" />
          </span>
          <span className="brand-words"><strong>Project</strong><small>Little Bridge</small></span>
        </a>
        <nav className="desktop-nav" aria-label={c.a11y.primaryNav}>
          {navItems.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
        </nav>
        <div className="header-tools">
          <div className="language-toggle" role="group" aria-label="Language / ภาษา">
            <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
            <button type="button" aria-pressed={language === "th"} onClick={() => setLanguage("th")}>ไทย</button>
          </div>
          <button
            className="button button-yellow header-action support-trigger"
            type="button"
            aria-label={c.support.trigger}
            aria-haspopup="dialog"
            aria-expanded={supportOpen}
            onClick={() => { setMobileMenuOpen(false); setSupportOpen(true); }}
          >
            <span className="support-label">{c.support.trigger}</span><span aria-hidden="true">♡</span>
          </button>
          <button className="mobile-menu-toggle" type="button" aria-label={mobileMenuOpen ? c.nav.closeMenu : c.nav.menu} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileMenuOpen(false); }}>
          <nav className="mobile-menu" id="mobile-navigation" aria-label={c.a11y.mobileNav}>
            <div className="mobile-menu-top"><span>{c.nav.menu}</span><button type="button" aria-label={c.nav.closeMenu} onClick={() => setMobileMenuOpen(false)}>×</button></div>
            {navItems.map((item, index) => <a href={item.href} key={item.href} onClick={() => setMobileMenuOpen(false)}><span>0{index + 1}</span>{item.label}</a>)}
            <a className="mobile-online-link" href="/emotion-sync-online" onClick={() => setMobileMenuOpen(false)}>{language === "th" ? "ฝึกออนไลน์" : "Practice Online"}<IconArrow /></a>
            <button className="mobile-support-button" type="button" onClick={() => { setMobileMenuOpen(false); setSupportOpen(true); }}>{c.support.trigger}<span>♡</span></button>
          </nav>
        </div>
      )}

      {supportOpen && (
        <div
          className="support-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSupportOpen(false);
          }}
        >
          <section className="support-panel" role="dialog" aria-modal="true" aria-labelledby="support-title">
            <div className="support-panel-heading">
              <span className="support-panel-mark" aria-hidden="true"><img src="/plb-bridge-mark.png" alt="" /></span>
              <div>
                <p className="eyebrow">{c.support.eyebrow}</p>
                <h2 id="support-title">{c.support.title}</h2>
              </div>
              <button className="support-close" type="button" aria-label={c.support.close} autoFocus onClick={() => setSupportOpen(false)}>×</button>
            </div>
            <p className="support-intro">{c.support.intro}</p>
            <div className="support-options">
              {c.support.options.map((option, index) => {
                const contents = <><span className="support-option-icon" aria-hidden="true">{supportSymbols[index]}</span><span><strong>{option.title}</strong><small>{option.text}</small></span><IconArrow /></>;
                if (index === 3) {
                  return (
                    <div className="support-option support-social-option" key={option.title}>
                      <span className="support-option-icon" aria-hidden="true">{supportSymbols[index]}</span>
                      <span>
                        <strong>{option.title}</strong>
                        <small>{option.text}</small>
                        <span className="support-social-actions">
                          <a href="https://www.instagram.com/projectlittlebridge/" target="_blank" rel="noreferrer" aria-label={c.footer.instagram}>
                            <IconInstagram /> Instagram
                          </a>
                          <a href="https://www.facebook.com/profile.php?id=61591540468913" target="_blank" rel="noreferrer" aria-label={c.footer.facebook}>
                            <IconFacebook /> Facebook
                          </a>
                        </span>
                      </span>
                    </div>
                  );
                }
                return <button className={`support-option${index === 1 ? " support-option-donate" : ""}`} type="button" key={option.title} onClick={() => chooseContactReason(index)}>{contents}</button>;
              })}
            </div>
            <p className="donation-disclaimer">{c.support.donationNote}</p>
            <p className="support-note">{c.support.unsure} <button type="button" onClick={() => chooseContactReason(3)}>{c.support.general}</button></p>
          </section>
        </div>
      )}

      <section className={`hero hero-${selectedEmotion ?? "idle"}`} id="top">
        <div className="hero-heading">
          <p className="hero-kicker"><span aria-hidden="true" />Project Little Bridge<span aria-hidden="true" /></p>
          <h1 className="hero-product-title">Emotion Sync<span className="title-spark" aria-hidden="true">✦</span></h1>
          <p className="hero-summary">{c.hero.summary}</p>
          <div className="hero-actions" aria-label={language === "th" ? "การทำงานหลัก" : "Primary actions"}>
            <a className="button button-yellow hero-cta hero-online-cta" href="/emotion-sync-online">
              {c.cta.practiceButton} <IconArrow />
            </a>
            <a className="button button-blue hero-cta" href="#how-it-works">
              {c.hero.cta} <IconArrow />
            </a>
          </div>
        </div>

        <div className="hero-stage">
          <div
            className={`emotion-ripples ripples-${selectedEmotion ?? "idle"}`}
            aria-hidden="true"
            key={selectedEmotion ?? "idle"}
          >
            <span className="emotion-glow" />
            <span className="emotion-ring ring-one" />
            <span className="emotion-ring ring-two" />
            <span className="emotion-ring ring-three" />
            <span className="emotion-ring ring-four" />
          </div>

          <div className={`device-wrap${selectedEmotion ? " has-selection" : ""}`}>
            <div className="device-model" aria-label={c.hero.modelLabel}>
              <span className="device-label" aria-hidden="true">Emotion Sync · Prototype 01</span>
              <div className="speaker" aria-hidden="true"><i /><i /><i /></div>
              <span className={`device-led led-yellow${selectedEmotion && !quizCorrect ? " is-on" : ""}`} aria-hidden="true" />
              <span className={`device-led led-green${selectedEmotion && quizCorrect ? " is-on" : ""}`} aria-hidden="true" />

              <button className="side-start-control" type="button" aria-label={c.hero.startAria} onClick={startQuiz}>
                <span>Start</span>
              </button>

              <button
                className="white-control"
                type="button"
                aria-label={c.hero.syncAria}
                onClick={() => setSyncComplete(true)}
                disabled={!selectedEmotion}
              >
                <span className="sr-only">{c.hero.syncAria}</span>
              </button>

              <div className="oled" aria-live="polite">
                <span className="oled-screw screw-one" aria-hidden="true" />
                <span className="oled-screw screw-two" aria-hidden="true" />
                <span className="oled-screw screw-three" aria-hidden="true" />
                <span className="oled-screw screw-four" aria-hidden="true" />
                <div className="oled-screen">
                  <b>{quizPrompt?.face ?? "•  •"}</b>
                  <span>
                    {syncComplete
                      ? c.hero.screenSynced
                      : selectedEmotion
                        ? quizCorrect ? c.hero.screenCorrect : c.hero.screenRetry
                        : quizPrompt ? c.hero.screenQuestion : c.hero.screenStart}
                  </span>
                </div>
              </div>

              <div className="prototype-controls" role="group" aria-label={c.hero.groupAria}>
                {prototypeButtons.map(({ emotion, color }) => (
                  <button
                    className={`model-button model-${color}`}
                    type="button"
                    key={emotion}
                    data-label={emotionLabel(emotion)}
                    aria-label={emotionLabel(emotion)}
                    aria-pressed={selectedEmotion === emotion}
                    onClick={() => {
                      if (!quizEmotion) return;
                      setSelectedEmotion(emotion);
                      setSyncComplete(false);
                    }}
                    disabled={!quizEmotion}
                  >
                    <span className="sr-only">{emotionLabel(emotion)}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="device-hint"><span aria-hidden="true">↗</span> {c.hero.hint}</p>
            {(selectedEmotion || syncComplete) && (
              <div className="hero-feedback is-active" key={selectedEmotion}>
                <div className="feedback-copy" role="status" aria-live="polite">
                  <span className={`feedback-dot${syncComplete ? " dot-synced" : quizCorrect ? " dot-correct" : " dot-wrong"}`} aria-hidden="true" />
                  <div>
                    <small>{syncComplete ? c.feedback.syncButton : quizCorrect ? c.feedback.green : c.feedback.yellow}</small>
                    <strong>{syncComplete ? c.feedback.synced : quizCorrect ? c.feedback.correct : c.feedback.retry}</strong>
                    <p>
                      {syncComplete
                        ? c.feedback.syncText
                        : quizCorrect
                          ? c.feedback.correctText
                          : c.feedback.wrongText}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      <div className="section-transition transition-cream-blue" aria-hidden="true"><span /></div>

      <section className="learning-loop" id="how-it-works" aria-labelledby="loop-title">
        <div className="loop-intro">
          <div className="section-heading light-heading">
            <h2 id="loop-title">{c.learning.titleA}</h2>
          </div>
          <div className="loop-intro-note">
            <span aria-hidden="true">↻</span>
            <p><strong>{c.learning.calm}</strong><br />{c.learning.calmText}</p>
          </div>
        </div>
        <div className="step-grid">
          {learningSteps.map((step, index) => (
            <article className="step-card" key={step.number}>
              <div className="step-top">
                <span className="step-icon">{step.icon}</span>
                <span className="step-number">{step.number}</span>
              </div>
              <small className="step-cue">{c.learning.steps[index].cue}</small>
              <h3>{c.learning.steps[index].title}</h3>
              <p>{c.learning.steps[index].text}</p>
            </article>
          ))}
        </div>

        <div className="session-demo" aria-labelledby="session-demo-title">
          <div className="session-demo-heading">
            <div>
              <h3 id="session-demo-title">{c.session.titleA}</h3>
            </div>
            <div className="session-step-tabs" aria-label={c.a11y.sessionSteps}>
              {c.session.steps.map((step, index) => (
                <button
                  type="button"
                  className={sessionStep === index ? "is-active" : ""}
                  aria-current={sessionStep === index ? "step" : undefined}
                  onClick={() => setSessionStep(index)}
                  key={step.title}
                >
                  <span>0{index + 1}</span>
                  <small>{c.session.tabs[index]}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="session-demo-body">
            <div className="session-demo-copy" key={`copy-${sessionStep}`}>
              <span className="session-step-count">{c.session.step} {sessionStep + 1} {c.session.of} {c.session.steps.length}</span>
              <p>{c.session.steps[sessionStep].eyebrow}</p>
              <h4>{c.session.steps[sessionStep].title}</h4>
              <p>{c.session.steps[sessionStep].text}</p>

              <div className="session-controls">
                {sessionStep > 0 && (
                  <button type="button" className="session-back" onClick={() => setSessionStep((step) => step - 1)}>
                    {c.session.back}
                  </button>
                )}
                {sessionStep === 0 && <span className="session-action-hint">{c.session.hints[0]}</span>}
                {sessionStep === 1 && <span className="session-action-hint">{c.session.hints[1]}</span>}
                {sessionStep === 2 && !sessionEmotion && (
                  <button type="button" className="session-next" onClick={() => setSessionStep(1)}>
                    {c.session.next} <span aria-hidden="true">→</span>
                  </button>
                )}
                {sessionStep === 2 && sessionEmotion && !sessionCorrect && (
                  <button type="button" className="session-next" onClick={() => { setSessionEmotion(null); setSessionStep(1); }}>
                    {c.session.retry} <span aria-hidden="true">↻</span>
                  </button>
                )}
                {sessionStep === 2 && sessionCorrect && (
                  <button type="button" className="session-next" onClick={() => setSessionStep(3)}>
                    {c.session.continue} <span aria-hidden="true">→</span>
                  </button>
                )}
                {sessionStep === 3 && !sessionSynced && <span className="session-action-hint">{c.session.hints[3]}</span>}
                {sessionStep === 3 && sessionSynced && (
                  <button type="button" className="session-next" onClick={resetSession}>
                    {c.session.again} <span aria-hidden="true">↻</span>
                  </button>
                )}
              </div>
            </div>

            <div className={`session-screen session-screen-${sessionStep}`} key={`screen-${sessionStep}`} aria-live="polite">
              <div className="session-screen-top">
                <span><i /> Emotion Sync</span>
                <small>Session 01</small>
              </div>

              {sessionStep === 0 && (
                <div className="session-start-state">
                  <button type="button" className="session-start-button" onClick={() => setSessionStep(1)}>
                    <span>Start</span>
                  </button>
                </div>
              )}

              {sessionStep === 1 && (
                <div className="session-choice-state">
                  <span className="session-question-emoji">{emotionChoices[sessionTarget].face}</span>
                  <strong>{c.session.question}</strong>
                  <div className="session-emotion-buttons" role="group" aria-label={c.hero.groupAria}>
                    {prototypeButtons.map(({ emotion, color }) => (
                      <button
                        type="button"
                        className={`session-emotion session-emotion-${color}`}
                        aria-label={emotionLabel(emotion)}
                        onClick={() => chooseSessionEmotion(emotion)}
                        key={emotion}
                      >
                        <span>{emotionChoices[emotion].face}</span>
                        <small>{emotionLabel(emotion)}</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sessionStep === 2 && (
                <div className="session-result-state">
                  <div className="session-result-lights" aria-label={sessionEmotion ? sessionCorrect ? c.a11y.resultCorrect : c.a11y.resultWrong : c.a11y.resultNone}>
                    <span className={`session-demo-led demo-led-yellow${sessionEmotion && !sessionCorrect ? " is-on" : ""}`}><i />{c.session.yellowLight}<small>{c.session.tryAgain}</small></span>
                    <span className={`session-demo-led demo-led-green${sessionEmotion && sessionCorrect ? " is-on" : ""}`}><i />{c.session.greenLight}<small>{c.session.correctSmall}</small></span>
                  </div>
                  <span className="session-response-face">{emotionChoices[sessionTarget].face}</span>
                  <strong>{!sessionEmotion ? c.session.chooseFirst : sessionCorrect ? c.session.correctAnswer : c.session.notMatch}</strong>
                  <p>{sessionCorrect ? c.session.greenConfirm : sessionEmotion ? c.session.yellowRetry : c.session.returnMatch}</p>
                </div>
              )}

              {sessionStep === 3 && (
                <div className="session-sync-state">
                  <button type="button" className={`session-sync-button${sessionSynced ? " is-synced" : ""}`} onClick={() => setSessionSynced(true)} aria-label={c.hero.syncAria}>
                    <span aria-hidden="true">{sessionSynced ? "✓" : ""}</span>
                  </button>
                  <small>{c.session.whiteButton}</small>
                  <strong>{sessionSynced ? c.session.synced : c.session.pressSync}</strong>
                  <p>{sessionSynced ? c.session.syncedText : c.session.localText}</p>
                </div>
              )}

              <div className="session-screen-dots" aria-hidden="true">
                {c.session.steps.map((_, index) => <i className={index <= sessionStep ? "is-on" : ""} key={index} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-transition transition-blue-light" aria-hidden="true"><span /></div>

      <section className="story-section" id="story">
        <div className="story-shell">
          <div className="story-visual" aria-hidden="true">
            <div className="story-origin"><i /> {c.story.origin}</div>
            <div className="big-quote">“</div>
            <p>{c.story.quote}</p>
            <div className="story-rhythm">
              <span>{c.story.rhythm[0]}</span><i>→</i><span>{c.story.rhythm[1]}</span><i>→</i><span>{c.story.rhythm[2]}</span>
            </div>
            <div className="paper-note note-one">{c.story.feel}<br /><strong>{c.story.calm}</strong></div>
            <div className="paper-note note-two">{c.story.feel}<br /><strong>{c.story.proud}</strong></div>
          </div>
          <div className="story-copy">
            <h2>{c.story.title}</h2>
            <p>{c.story.p1}</p>
            <p>{c.story.p2}</p>
            <div className="story-proof" aria-label={c.a11y.principles}>
              <div><strong>{c.story.student}</strong><span>{c.story.studentText}</span></div>
              <div><strong>{c.story.human}</strong><span>{c.story.humanText}</span></div>
            </div>
            <a className="text-link" href="#team">{c.story.link}</a>
          </div>
        </div>
      </section>

      <div className="section-transition transition-light-paper" aria-hidden="true"><span /></div>

      <section className="product-section" id="emotion-sync">
        <div className="product-copy">
          <h2>{c.product.titleA}</h2>
          <p className="section-lede">{c.product.lede}</p>
          <div className="feature-list">
            {c.product.features.map((feature, index) => <div key={feature.title}><span>0{index + 1}<small>{feature.tag}</small></span><h3>{feature.title}</h3><p>{feature.text}</p></div>)}
          </div>
        </div>
        <div className="tech-card">
          <div className="tech-card-heading">
            <div>
              <p className="card-kicker">{c.product.architecture}</p>
              <h3>{c.product.anywhere}</h3>
            </div>
            <span>{c.product.offline}</span>
          </div>
          <div className="tech-blueprint" aria-label={c.a11y.components}>
            <span className="blueprint-label">{c.product.map}</span>
            <i className="blueprint-line line-one" aria-hidden="true" />
            <i className="blueprint-line line-two" aria-hidden="true" />
            <i className="blueprint-line line-three" aria-hidden="true" />
            <i className="blueprint-line line-four" aria-hidden="true" />
            <div className="blueprint-hub"><small>{c.product.controller}</small><b>ESP32</b><span>{c.product.runs}</span></div>
            <div className="blueprint-node node-screen"><i>◫</i><b>OLED</b><span>{c.product.prompt}</span></div>
            <div className="blueprint-node node-buttons"><i>●</i><b>{c.product.buttons}</b><span>{c.product.childAnswer}</span></div>
            <div className="blueprint-node node-feedback"><i>••</i><b>{c.product.led}</b><span>{c.product.rightRetry}</span></div>
            <div className="blueprint-node node-sync"><i>↻</i><b>{c.product.localSync}</b><span>{c.product.progressLater}</span></div>
          </div>
          <div className="privacy-note">
            <IconSpark />
            <p><strong>{c.product.privacy}</strong><br />{c.product.privacyText}</p>
          </div>
        </div>
      </section>

      <div className="section-transition transition-paper-ink" aria-hidden="true"><span /></div>

      <section className="prototype-section" id="real-prototype" aria-labelledby="prototype-title">
        <figure className="prototype-gallery">
          <div className="prototype-photo prototype-photo-main">
            <img
              src="/prototype-front.webp"
              alt={c.a11y.prototypeMain}
            />
            <span className="photo-stamp" aria-hidden="true">Prototype 01</span>
          </div>
          <div className="prototype-photo prototype-photo-controls">
            <img
              src="/prototype-controls.webp"
              alt={c.a11y.prototypeControls}
            />
          </div>
          <div className="prototype-photo prototype-photo-label">
            <img
              src="/prototype-label.webp"
              alt={c.a11y.prototypeLabel}
            />
          </div>
        </figure>

        <div className="prototype-copy">
          <h2 id="prototype-title">{c.prototype.titleA}</h2>
          <p className="prototype-lede">{c.prototype.lede}</p>

          <div className="prototype-facts" aria-label={c.a11y.prototypeFeatures}>
            <div><strong>04</strong><span>{c.prototype.facts[0]}</span></div>
            <div><strong>01</strong><span>{c.prototype.facts[1]}</span></div>
            <div><strong>{c.prototype.hand}</strong><span>{c.prototype.facts[2]}</span></div>
            <div><strong>{c.prototype.iterative}</strong><span>{c.prototype.facts[3]}</span></div>
          </div>

          <a className="prototype-link" href="#progress">
            {c.prototype.link} <IconArrow />
          </a>
        </div>
      </section>

      <div className="section-transition transition-ink-light" aria-hidden="true"><span /></div>

      <section className="progress-section" id="progress" aria-labelledby="progress-title">
        <div className="progress-intro">
          <div className="section-heading">
            <h2 id="progress-title">{c.progress.titleA}</h2>
            <p>{c.progress.lede}</p>
          </div>
          <div className="progress-now" aria-label={c.a11y.progressCurrent}>
            <span className="progress-live-dot" aria-hidden="true" />
            <div><small>{c.progress.current}</small><strong>{c.progress.donating}</strong><span>{c.progress.distribution}</span></div>
          </div>
        </div>
        <div className="progress-track">
          <article className="milestone complete">
            <div className="milestone-top"><span className="milestone-icon" aria-hidden="true">✎</span><small>{c.progress.completed}</small></div>
            <span className="milestone-number">01</span>
            <h3>{c.progress.steps[0].title}</h3><p>{c.progress.steps[0].text}</p>
          </article>
          <article className="milestone complete">
            <div className="milestone-top"><span className="milestone-icon" aria-hidden="true">⚙</span><small>{c.progress.completed}</small></div>
            <span className="milestone-number">02</span>
            <h3>{c.progress.steps[1].title}</h3><p>{c.progress.steps[1].text}</p>
          </article>
          <article className="milestone complete">
            <div className="milestone-top"><span className="milestone-icon" aria-hidden="true">✦</span><small>{c.progress.completed}</small></div>
            <span className="milestone-number">03</span>
            <h3>{c.progress.steps[2].title}</h3><p>{c.progress.steps[2].text}</p>
          </article>
          <article className="milestone active">
            <span className="milestone-ribbon">{c.progress.here}</span>
            <div className="milestone-top"><span className="milestone-icon" aria-hidden="true">♡</span><small>{c.progress.donating}</small></div>
            <span className="milestone-number">04</span>
            <h3>{c.progress.steps[3].title}</h3><p>{c.progress.steps[3].text}</p>
          </article>
        </div>
      </section>

      <div className="section-transition transition-light-sky" aria-hidden="true"><span /></div>

      <section className="reach-section" id="reach" aria-labelledby="reach-title">
        <div className="reach-copy">
          <p className="eyebrow">{c.reach.eyebrow}</p>
          <h2 id="reach-title">{c.reach.titleA}<br />{c.reach.titleB}</h2>
          <p className="reach-lede">{c.reach.lede}</p>

          <div className="reach-stat" aria-label={c.a11y.reachStat}>
            <strong>{String(donations.length).padStart(2, "0")}</strong>
            <span>{c.reach.stat}<br /><b>{c.reach.bangkok}</b></span>
          </div>

          <div className={`donation-card${activeDonation ? " is-visible" : ""}`} aria-live="polite">
            {activeDonation ? (
              <>
                <div className="donation-card-top">
                  <span className="donation-pin" aria-hidden="true">●</span>
                  <p><small>{c.reach.province}</small><strong>{provinceDonations[0]?.province[language]}</strong></p>
                </div>
                <div className="donation-places">
                  <small>{c.reach.recipient}</small>
                  <ol className="donation-location-list">{provinceDonations.map((visit, index) => <li key={visit.id}><span aria-hidden="true">{index + 1}.</span><button type="button" onClick={() => setSelectedVisitId(visit.id)}>{visit.name[language]}</button></li>)}</ol>
                </div>
              </>
            ) : (
              <p className="donation-prompt"><span aria-hidden="true">↗</span> {c.reach.prompt}</p>
            )}
          </div>
        </div>

        <div className="map-panel">
          <div className="map-panel-heading">
            <div><small>Project Little Bridge</small><strong>{c.reach.mapTitle}</strong></div>
            <span><i aria-hidden="true" /> {c.reach.inProgress}</span>
          </div>
          <svg
            className="thailand-map"
            viewBox={thailandMap.viewBox}
            role="img"
            aria-label={c.a11y.mapAlt}
            onMouseLeave={() => setHoveredProvinceId(null)}
          >
            {(thailandMap.locations as Array<{ id: string; name: string; path: string }>).map((location) => (
              <path
                className={`map-province${donations.some(visit => visit.provinceId === location.id) ? " is-donated" : ""}`}
                d={location.path}
                key={location.id}
                role={donations.some(visit => visit.provinceId === location.id) ? "button" : undefined}
                tabIndex={donations.some(visit => visit.provinceId === location.id) ? 0 : undefined}
                aria-label={donations.find(visit => visit.provinceId === location.id)?.province[language]}
                aria-hidden={donations.some(visit => visit.provinceId === location.id) ? undefined : true}
                onClick={() => { if (donations.some(visit => visit.provinceId === location.id)) { setSelectedProvinceId(location.id); setHoveredProvinceId(null); } }}
                onFocus={() => { if (donations.some(visit => visit.provinceId === location.id)) setHoveredProvinceId(location.id); }}
                onBlur={() => setHoveredProvinceId(null)}
                onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && donations.some(visit => visit.provinceId === location.id)) { event.preventDefault(); setSelectedProvinceId(location.id); setHoveredProvinceId(null); } }}
              />
            ))}
            <g
              className="bangkok-hotspot"
              role="button"
              tabIndex={0}
              aria-label={selectedProvinceId === "bkk" ? c.reach.hide : c.reach.show}
              aria-pressed={selectedProvinceId === "bkk"}
              onMouseEnter={() => setHoveredProvinceId("bkk")}
              onFocus={() => setHoveredProvinceId("bkk")}
              onBlur={() => setHoveredProvinceId(null)}
              onClick={() => {
                const isClosing = selectedProvinceId === "bkk";
                setSelectedProvinceId(isClosing ? null : "bkk");
                if (isClosing) setHoveredProvinceId(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  const isClosing = selectedProvinceId === "bkk";
                  setSelectedProvinceId(isClosing ? null : "bkk");
                  if (isClosing) setHoveredProvinceId(null);
                }
              }}
            >
              <circle className="hotspot-ring" cx="227" cy="474" r="24" />
              <circle className="hotspot-dot" cx="227" cy="474" r="7" />
            </g>
          </svg>
          <p className="map-caption"><span aria-hidden="true">✦</span> {c.reach.caption}</p>
          <small className="map-credit">{c.a11y.mapData}: @svg-maps/thailand, CC BY 4.0.</small>
        </div>
      </section>

      <DonationDirectory language={language} selectedId={selectedVisitId} onSelect={setSelectedVisitId} onLanguage={setLanguage} />

      <section className="team-section" id="team">
        <div className="section-heading">
          <h2>{c.team.titleA}</h2>
          <p>{c.team.lede}</p>
        </div>
        <div className="team-grid">
          {team.map((member, index) => (
            <article className={`team-card team-card-${index + 1}`} key={member.name}>
              <div className="team-photo">
                <img src={member.image} alt={`${c.a11y.portrait} ${member.name}`} />
                <span className="team-number" aria-hidden="true">0{index + 1}</span>
              </div>
              <div className="team-card-copy">
                <p className="role">{c.team.roles[index]}</p>
                <h3>{language === "th" ? member.nameTh : member.name}</h3>
                <p className="team-school"><span aria-hidden="true" />{c.team.schools[index]}</p>
                <p className="team-detail">{c.team.details[index]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="section-transition transition-sky-blue" aria-hidden="true"><span /></div>

      <section className="cta-section" id="get-involved">
        <div className="cta-shell">
          <div className="cta-intro">
            <div className="cta-mark" aria-hidden="true"><IconPeople /></div>
            <h2>{c.cta.titleA}</h2>
            <p>{c.cta.text}</p>
            <div className="contact-reasons" role="group" aria-label={c.cta.reason}>
              {c.cta.reasons.slice(0, 3).map((reason, index) => (
                <button className={contactReason === index ? "is-active" : undefined} type="button" aria-pressed={contactReason === index} key={reason} onClick={() => chooseContactReason(index)}>
                  <span>0{index + 1}</span>{reason}<IconArrow />
                </button>
              ))}
            </div>
            <div className="social-follow social-follow-light">
              <span>{c.cta.follow}</span>
              <div className="social-links" aria-label={c.footer.follow}>
                <a className="social-link social-instagram" href="https://www.instagram.com/projectlittlebridge/" target="_blank" rel="noreferrer" aria-label={c.footer.instagram}>
                  <IconInstagram />
                </a>
                <a className="social-link social-facebook" href="https://www.facebook.com/profile.php?id=61591540468913" target="_blank" rel="noreferrer" aria-label={c.footer.facebook}>
                  <IconFacebook />
                </a>
              </div>
            </div>
          </div>

          <form className="contact-form" id="contact-form" name="project-little-bridge-contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={submitContact}>
            <input type="hidden" name="form-name" value="project-little-bridge-contact" />
            <input type="hidden" name="language" value={language === "th" ? "Thai" : "English"} />
            <p className="contact-bot-field" aria-hidden="true">
              <label>Do not fill this field<input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
            </p>
            <div className="contact-form-heading">
              <span>{c.cta.formTitle}</span>
              <strong>{c.cta.reasons[contactReason]}</strong>
            </div>
            <div className="contact-form-grid">
              <label><span>{c.cta.name}</span><input name="name" autoComplete="name" required /></label>
              <label><span>{c.cta.email}</span><input name="email" type="email" autoComplete="email" required /></label>
              <label className="contact-field-wide"><span>{c.cta.organisation}</span><input name="organisation" autoComplete="organization" /></label>
              <label className="contact-field-wide"><span>{c.cta.reason}</span><select name="reason" value={c.cta.reasons[contactReason]} onChange={(event) => setContactReason(c.cta.reasons.findIndex((reason) => reason === event.target.value))}>{c.cta.reasons.map((reason) => <option value={reason} key={reason}>{reason}</option>)}</select></label>
              <label className="contact-field-wide"><span>{c.cta.message}</span><textarea name="message" placeholder={c.cta.messagePlaceholder} rows={5} required /></label>
            </div>
            <button className="button button-yellow contact-submit" type="submit" disabled={contactStatus === "submitting"}>{contactStatus === "submitting" ? c.cta.sending : c.cta.submit}<IconArrow /></button>
            {contactStatus !== "idle" && contactStatus !== "submitting" && (
              <p className={`contact-status is-${contactStatus}`} role="status" aria-live="polite">
                {contactStatus === "success" ? c.cta.success : c.cta.error}
              </p>
            )}
            <small className="contact-form-note">{c.cta.formNote}</small>
          </form>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top" aria-label={c.a11y.home}>
          <span className="brand-mark" aria-hidden="true">
            <img src="/plb-bridge-mark.png" alt="" />
          </span>
          <span className="brand-words"><strong>Project</strong><small>Little Bridge</small></span>
        </a>
        <p>{c.footer.text}</p>
        <div className="footer-links">
          <div className="social-links" aria-label={c.footer.follow}>
            <a className="social-link social-instagram" href="https://www.instagram.com/projectlittlebridge/" target="_blank" rel="noreferrer" aria-label={c.footer.instagram}>
              <IconInstagram />
            </a>
            <a className="social-link social-facebook" href="https://www.facebook.com/profile.php?id=61591540468913" target="_blank" rel="noreferrer" aria-label={c.footer.facebook}>
              <IconFacebook />
            </a>
          </div>
          <a href="#top">{c.footer.top}</a>
          <a href="/privacy">{c.footer.privacy}</a>
        </div>
        <small>© 2026 Project Little Bridge</small>
      </footer>
    </main>
  );
}
