"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Language = "en" | "th";

export default function PrivacyContent() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    const stored = window.localStorage.getItem("plb-language");
    const initial = requested === "th" || requested === "en" ? requested : stored === "th" ? "th" : "en";
    queueMicrotask(() => setLanguage(initial));
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("plb-language", language);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    window.history.replaceState({}, "", url);
  }, [language]);

  return (
    <main className={`privacy-page${language === "th" ? " privacy-page-thai" : ""}`}>
      <nav className="privacy-nav" aria-label={language === "th" ? "เมนูหน้านโยบายความเป็นส่วนตัว" : "Privacy page navigation"}>
        <Link href="/emotion-sync-online">{language === "th" ? "← กลับไป Emotion Sync Online" : "← Back to Emotion Sync Online"}</Link>
        <div className="privacy-language-links" role="group" aria-label="Language / ภาษา">
          <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
          <button type="button" aria-pressed={language === "th"} onClick={() => setLanguage("th")}>ไทย</button>
        </div>
      </nav>

      {language === "en" ? (
        <article className="privacy-shell" lang="en">
          <header>
            <p className="eyebrow">Effective 24 September 2026</p>
            <h1>Privacy &amp; data use</h1>
            <p>Emotion Sync Online is an educational activity created by Project Little Bridge. It can be used with a private guest account or an adult account. Both can store profiles and activity history online.</p>
          </header>

          <section className="privacy-section">
            <h2>What we collect</h2>
            <p>For signed-in use, we collect the adult account email and display name provided through Firebase Authentication. For each child profile, we store only the nickname entered by the adult and activity records such as answers, emotions selected, attempts, response times, timestamps, and session summaries.</p>
            <p>For guest use, Firebase Authentication assigns a random guest UID without asking for an email. After the responsible adult agrees, guest nicknames, profiles, and activity results are stored under that UID in Firestore. Existing browser progress is imported using its original activity IDs to avoid duplicate results. The browser keeps a local copy and queues results while offline.</p>
            <p>Each full website load adds one to an aggregate Firebase visit count. We also assign this browser a random identifier (UUID) to count returning browsers once. Firebase stores that identifier and its first registration time, plus an aggregate unique-browser count. Neither traffic counter is linked to an account, child nickname, or activity answers. A different browser, private browsing session, or clearing site data may count as another visitor.</p>
            <p>Do not enter a child’s full legal name, diagnosis, school, address, date of birth, or contact details.</p>
          </section>

          <section className="privacy-section">
            <h2>Why we use it</h2>
            <p>We use activity information to show progress reports and generate requested data exports. Signed-in information also supports saving across devices. The traffic counts help us understand how often the website is opened and how many browsers return. Reports describe educational patterns only and must not be treated as a diagnosis or medical advice.</p>
          </section>

          <section className="privacy-section">
            <h2>Storage and sharing</h2>
            <p>Authentication is provided by Google Firebase. Guest and adult profiles, activity history, and browser traffic records are stored in Project Little Bridge’s Cloud Firestore database. The browser retains the guest sign-in credentials. Clearing browser data or losing the device may remove access to the guest account, even though its cloud records remain. We do not sell child or account data. Firebase processes cloud data as our service provider, and authorized Project Little Bridge administrators may access cloud data only when needed for security, support, or system maintenance.</p>
          </section>

          <section className="privacy-section">
            <h2>Adult control</h2>
            <ul>
              <li>Download a child’s complete activity history as an English or Thai CSV from Progress &amp; History.</li>
              <li>Delete a child profile and all of its saved activity history from the account panel.</li>
              <li>Use Manage profile to delete a guest profile and its results, or Delete all guest profiles to remove all guest profiles and results from Firebase and this browser. Deletion needs an internet connection.</li>
              <li>Stop future activity collection by deleting the relevant data and not using tracked activities.</li>
            </ul>
            <p>Guest and adult data remain online until deleted through the app or with help from Project Little Bridge. Clearing browser storage alone does not delete cloud records. The legacy local source is removed only after its upload is acknowledged; an updated browser copy remains. Guest and adult accounts are separate: signing in does not transfer guest results into an adult account. The separate random visitor identifier remains after deleting profiles to prevent duplicate traffic counts. Browser registration records are retained for counting repeat visits; clearing site data removes the identifier from your browser but does not remove an earlier registration from Firebase.</p>
          </section>

          <section className="privacy-section privacy-contact">
            <h2>Questions or deletion help</h2>
            <p>Contact <a href="mailto:projectlittlebridge@gmail.com">projectlittlebridge@gmail.com</a>. We may need to verify account ownership before acting on a request.</p>
          </section>
        </article>
      ) : (
        <article className="privacy-shell privacy-thai" lang="th">
          <header>
            <p className="eyebrow">มีผลตั้งแต่วันที่ 24 กันยายน 2569</p>
            <h1>ความเป็นส่วนตัวและการใช้ข้อมูล</h1>
            <p>Emotion Sync Online เป็นกิจกรรมเพื่อการเรียนรู้ที่พัฒนาโดย Project Little Bridge ผู้ใช้สามารถใช้บัญชีผู้เยี่ยมชมส่วนตัวหรือบัญชีผู้ใหญ่ โดยทั้งสองแบบบันทึกโปรไฟล์และประวัติกิจกรรมออนไลน์ได้</p>
          </header>

          <section className="privacy-section">
            <h2>ข้อมูลที่เราเก็บ</h2>
            <p>เมื่อเข้าสู่ระบบ เราเก็บอีเมลและชื่อที่แสดงของบัญชีผู้ใหญ่ผ่าน Firebase Authentication สำหรับโปรไฟล์เด็ก เราเก็บเฉพาะชื่อเล่นที่ผู้ใหญ่กรอก และข้อมูลกิจกรรม เช่น คำตอบ อารมณ์ที่เลือก จำนวนครั้งที่ลอง เวลาตอบ วันเวลา และสรุปรอบการฝึก</p>
            <p>เมื่อใช้แบบผู้เยี่ยมชม Firebase Authentication จะสร้าง UID โดยไม่ขออีเมล เมื่อผู้ใหญ่ที่รับผิดชอบยินยอม ระบบจะบันทึกชื่อเล่น โปรไฟล์ และผลกิจกรรมใน Firestore ภายใต้ UID นี้ ข้อมูลเดิมในเบราว์เซอร์จะถูกนำเข้าโดยใช้รหัสกิจกรรมเดิมเพื่อไม่ให้ซ้ำ และเบราว์เซอร์จะเก็บสำเนาข้อมูลและรอส่งผลเมื่อกลับมาออนไลน์</p>
            <p>ทุกครั้งที่โหลดเว็บไซต์ใหม่ ระบบจะเพิ่มจำนวนการเข้าชมรวมใน Firebase หนึ่งครั้ง เรายังสร้างรหัสสุ่ม (UUID) สำหรับเบราว์เซอร์นี้เพื่อนับเบราว์เซอร์ที่กลับมาใช้งานเพียงครั้งเดียว Firebase เก็บรหัสนี้และเวลาที่ลงทะเบียนครั้งแรก พร้อมยอดรวมเบราว์เซอร์ที่ไม่ซ้ำ โดยไม่เชื่อมกับบัญชี ชื่อเล่นของเด็ก หรือคำตอบกิจกรรม การใช้เบราว์เซอร์อื่น โหมดส่วนตัว หรือล้างข้อมูลเว็บไซต์อาจถูกนับเป็นผู้เข้าชมใหม่</p>
            <p>กรุณาอย่ากรอกชื่อ-นามสกุลจริง การวินิจฉัย โรงเรียน ที่อยู่ วันเกิด หรือข้อมูลติดต่อของเด็ก</p>
          </section>

          <section className="privacy-section">
            <h2>เหตุผลที่ใช้ข้อมูล</h2>
            <p>เราใช้ข้อมูลกิจกรรมเพื่อแสดงรายงานความก้าวหน้าและสร้างไฟล์ข้อมูลเมื่อผู้ใช้เลือกดาวน์โหลด ข้อมูลที่เข้าสู่ระบบยังใช้สำหรับบันทึกข้ามอุปกรณ์ ส่วนจำนวนการเข้าชมช่วยให้เราเข้าใจว่าเว็บไซต์ถูกเปิดใช้งานบ่อยเพียงใดและมีเบราว์เซอร์กลับมาใช้งานกี่ราย รายงานนี้แสดงแนวโน้มเพื่อการเรียนรู้เท่านั้น ไม่ใช่การวินิจฉัยหรือคำแนะนำทางการแพทย์</p>
          </section>

          <section className="privacy-section">
            <h2>การจัดเก็บและการแบ่งปัน</h2>
            <p>ระบบบัญชีให้บริการโดย Google Firebase โปรไฟล์และผลกิจกรรมของผู้เยี่ยมชมและบัญชีผู้ใหญ่ รวมถึงข้อมูลการเข้าชม จัดเก็บใน Cloud Firestore ของ Project Little Bridge เบราว์เซอร์เก็บสิทธิ์เข้าถึงบัญชีผู้เยี่ยมชม การล้างข้อมูลเบราว์เซอร์หรือทำอุปกรณ์หายอาจทำให้เข้าถึงบัญชีเดิมไม่ได้ แม้ข้อมูลยังอยู่บนคลาวด์ เราไม่ขายข้อมูลของเด็กหรือข้อมูลบัญชี Firebase ประมวลผลข้อมูลบนคลาวด์ในฐานะผู้ให้บริการ และผู้ดูแล Project Little Bridge ที่ได้รับอนุญาตอาจเข้าถึงข้อมูลบนคลาวด์เฉพาะเมื่อจำเป็นต่อความปลอดภัย การช่วยเหลือ หรือการดูแลระบบ</p>
          </section>

          <section className="privacy-section">
            <h2>สิทธิของผู้ใหญ่</h2>
            <ul>
              <li>ดาวน์โหลดประวัติกิจกรรมทั้งหมดของเด็กเป็นไฟล์ CSV ภาษาอังกฤษหรือภาษาไทยจากหน้าความก้าวหน้าและประวัติ</li>
              <li>ลบโปรไฟล์เด็กและประวัติกิจกรรมทั้งหมดอย่างถาวรจากส่วนบัญชี</li>
              <li>ใช้จัดการโปรไฟล์เพื่อลบโปรไฟล์และผลกิจกรรม หรือใช้ลบโปรไฟล์ผู้เยี่ยมชมทั้งหมดเพื่อลบข้อมูลจาก Firebase และเบราว์เซอร์ การลบต้องเชื่อมต่ออินเทอร์เน็ต</li>
              <li>หยุดการเก็บข้อมูลกิจกรรมในอนาคตด้วยการลบข้อมูลที่เกี่ยวข้องและไม่ใช้กิจกรรมที่มีการติดตาม</li>
            </ul>
            <p>ข้อมูลทั้งสองแบบจะอยู่บนคลาวด์จนกว่าจะลบผ่านแอปหรือขอความช่วยเหลือจาก Project Little Bridge การล้างเบราว์เซอร์อย่างเดียวไม่ลบข้อมูลบนคลาวด์ ข้อมูลเดิมจะถูกลบจากรูปแบบเก่าเมื่อ Firebase ยืนยันว่าบันทึกสำเร็จแล้ว โดยยังเก็บสำเนารูปแบบใหม่ในเบราว์เซอร์ บัญชีผู้เยี่ยมชมและบัญชีผู้ใหญ่แยกกัน การเข้าสู่ระบบไม่ย้ายผลผู้เยี่ยมชมไปบัญชีผู้ใหญ่ และยังเก็บรหัสผู้เข้าชมแยกไว้เพื่อไม่ให้นับซ้ำ ข้อมูลลงทะเบียนเบราว์เซอร์จะเก็บไว้สำหรับนับผู้เข้าชมที่กลับมา การล้างข้อมูลเว็บไซต์จะลบรหัสจากเบราว์เซอร์ แต่ไม่ลบข้อมูลลงทะเบียนเดิมใน Firebase</p>
          </section>

          <section className="privacy-section privacy-contact">
            <h2>คำถามหรือความช่วยเหลือในการลบข้อมูล</h2>
            <p>ติดต่อ <a href="mailto:projectlittlebridge@gmail.com">projectlittlebridge@gmail.com</a> เราอาจต้องตรวจสอบว่าเป็นเจ้าของบัญชีก่อนดำเนินการ</p>
          </section>
        </article>
      )}
    </main>
  );
}
