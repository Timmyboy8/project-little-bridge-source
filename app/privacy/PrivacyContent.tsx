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
            <p className="eyebrow">Effective 10 August 2026</p>
            <h1>Privacy &amp; data use</h1>
            <p>Emotion Sync Online is an educational activity created by Project Little Bridge. It can be used as a browser-only guest or with an adult account for cloud saving across devices.</p>
          </header>

          <section className="privacy-section">
            <h2>What we collect</h2>
            <p>For signed-in use, we collect the adult account email and display name provided through Firebase Authentication. For each child profile, we store only the nickname entered by the adult and activity records such as answers, emotions selected, attempts, response times, timestamps, and session summaries.</p>
            <p>For guest use, the Guest profile and its activity history are stored only in that browser. No email is requested and guest activity history is not uploaded to the Project Little Bridge database.</p>
            <p>Each full website load adds one to an aggregate Firebase visit count. The counter stores only the total count and its latest update time; it is not connected to a child profile or activity answers.</p>
            <p>Do not enter a child’s full legal name, diagnosis, school, address, date of birth, or contact details.</p>
          </section>

          <section className="privacy-section">
            <h2>Why we use it</h2>
            <p>We use activity information to show progress reports and generate requested data exports. Signed-in information also supports saving across devices. The aggregate visit count helps us understand how often the website is opened. Reports describe educational patterns only and must not be treated as a diagnosis or medical advice.</p>
          </section>

          <section className="privacy-section">
            <h2>Storage and sharing</h2>
            <p>Authentication is provided by Google Firebase. Signed-in child profiles, signed-in activity history, and the aggregate visit count are stored in Project Little Bridge’s Cloud Firestore database configured in the Bangkok region. Guest activity history stays in the browser and may disappear if browser data is cleared or the device is lost. We do not sell child or account data. Firebase processes cloud data as our service provider, and authorized Project Little Bridge administrators may access cloud data only when needed for security, support, or system maintenance.</p>
          </section>

          <section className="privacy-section">
            <h2>Adult control</h2>
            <ul>
              <li>Download a child’s complete activity history as an English or Thai CSV from Progress &amp; History.</li>
              <li>Delete a child profile and all of its saved activity history from the account panel.</li>
              <li>Delete all guest progress from this browser using Delete browser data.</li>
              <li>Stop future activity collection by deleting the relevant data and not using tracked activities.</li>
            </ul>
            <p>Signed-in data remains in the account until the adult deletes the child profile or asks Project Little Bridge for account-support deletion. Guest data remains until it is deleted in Emotion Sync Online or the browser’s site data is cleared. Signing in does not automatically upload earlier guest history.</p>
          </section>

          <section className="privacy-section privacy-contact">
            <h2>Questions or deletion help</h2>
            <p>Contact <a href="mailto:projectlittlebridge@gmail.com">projectlittlebridge@gmail.com</a>. We may need to verify account ownership before acting on a request.</p>
          </section>
        </article>
      ) : (
        <article className="privacy-shell privacy-thai" lang="th">
          <header>
            <p className="eyebrow">มีผลตั้งแต่วันที่ 10 สิงหาคม 2569</p>
            <h1>ความเป็นส่วนตัวและการใช้ข้อมูล</h1>
            <p>Emotion Sync Online เป็นกิจกรรมเพื่อการเรียนรู้ที่พัฒนาโดย Project Little Bridge ผู้ใช้สามารถใช้แบบผู้เยี่ยมชมโดยบันทึกในเบราว์เซอร์ หรือใช้บัญชีผู้ใหญ่เพื่อบันทึกบนคลาวด์และเปิดดูข้ามอุปกรณ์</p>
          </header>

          <section className="privacy-section">
            <h2>ข้อมูลที่เราเก็บ</h2>
            <p>เมื่อเข้าสู่ระบบ เราเก็บอีเมลและชื่อที่แสดงของบัญชีผู้ใหญ่ผ่าน Firebase Authentication สำหรับโปรไฟล์เด็ก เราเก็บเฉพาะชื่อเล่นที่ผู้ใหญ่กรอก และข้อมูลกิจกรรม เช่น คำตอบ อารมณ์ที่เลือก จำนวนครั้งที่ลอง เวลาตอบ วันเวลา และสรุปรอบการฝึก</p>
            <p>เมื่อใช้แบบผู้เยี่ยมชม โปรไฟล์ผู้เยี่ยมชมและประวัติกิจกรรมจะเก็บเฉพาะในเบราว์เซอร์นั้น โดยไม่ขออีเมลและไม่อัปโหลดประวัติกิจกรรมผู้เยี่ยมชมไปยังฐานข้อมูลของ Project Little Bridge</p>
            <p>ทุกครั้งที่โหลดเว็บไซต์ใหม่ ระบบจะเพิ่มจำนวนการเข้าชมรวมใน Firebase หนึ่งครั้ง ตัวนับเก็บเฉพาะยอดรวมและเวลาที่อัปเดตล่าสุด โดยไม่เชื่อมกับโปรไฟล์เด็กหรือคำตอบกิจกรรม</p>
            <p>กรุณาอย่ากรอกชื่อ-นามสกุลจริง การวินิจฉัย โรงเรียน ที่อยู่ วันเกิด หรือข้อมูลติดต่อของเด็ก</p>
          </section>

          <section className="privacy-section">
            <h2>เหตุผลที่ใช้ข้อมูล</h2>
            <p>เราใช้ข้อมูลกิจกรรมเพื่อแสดงรายงานความก้าวหน้าและสร้างไฟล์ข้อมูลเมื่อผู้ใช้เลือกดาวน์โหลด ข้อมูลที่เข้าสู่ระบบยังใช้สำหรับบันทึกข้ามอุปกรณ์ ส่วนจำนวนการเข้าชมรวมช่วยให้เราเข้าใจว่าเว็บไซต์ถูกเปิดใช้งานบ่อยเพียงใด รายงานนี้แสดงแนวโน้มเพื่อการเรียนรู้เท่านั้น ไม่ใช่การวินิจฉัยหรือคำแนะนำทางการแพทย์</p>
          </section>

          <section className="privacy-section">
            <h2>การจัดเก็บและการแบ่งปัน</h2>
            <p>ระบบบัญชีให้บริการโดย Google Firebase โปรไฟล์เด็กที่เข้าสู่ระบบ ประวัติกิจกรรมที่เข้าสู่ระบบ และจำนวนการเข้าชมรวมจัดเก็บใน Cloud Firestore ของ Project Little Bridge ซึ่งตั้งค่าฐานข้อมูลไว้ที่ภูมิภาคกรุงเทพฯ ประวัติกิจกรรมผู้เยี่ยมชมเก็บอยู่ในเบราว์เซอร์และอาจหายไปเมื่อล้างข้อมูลเบราว์เซอร์หรืออุปกรณ์สูญหาย เราไม่ขายข้อมูลของเด็กหรือข้อมูลบัญชี Firebase ประมวลผลข้อมูลบนคลาวด์ในฐานะผู้ให้บริการ และผู้ดูแล Project Little Bridge ที่ได้รับอนุญาตอาจเข้าถึงข้อมูลบนคลาวด์เฉพาะเมื่อจำเป็นต่อความปลอดภัย การช่วยเหลือ หรือการดูแลระบบ</p>
          </section>

          <section className="privacy-section">
            <h2>สิทธิของผู้ใหญ่</h2>
            <ul>
              <li>ดาวน์โหลดประวัติกิจกรรมทั้งหมดของเด็กเป็นไฟล์ CSV ภาษาอังกฤษหรือภาษาไทยจากหน้าความก้าวหน้าและประวัติ</li>
              <li>ลบโปรไฟล์เด็กและประวัติกิจกรรมทั้งหมดอย่างถาวรจากส่วนบัญชี</li>
              <li>ลบความก้าวหน้าของผู้เยี่ยมชมทั้งหมดจากเบราว์เซอร์นี้ด้วยปุ่มลบข้อมูลในเบราว์เซอร์</li>
              <li>หยุดการเก็บข้อมูลกิจกรรมในอนาคตด้วยการลบข้อมูลที่เกี่ยวข้องและไม่ใช้กิจกรรมที่มีการติดตาม</li>
            </ul>
            <p>ข้อมูลที่เข้าสู่ระบบจะอยู่ในบัญชีจนกว่าผู้ใหญ่จะลบโปรไฟล์เด็กหรือขอให้ Project Little Bridge ช่วยลบข้อมูลบัญชี ส่วนข้อมูลผู้เยี่ยมชมจะอยู่จนกว่าจะลบใน Emotion Sync Online หรือล้างข้อมูลเว็บไซต์ของเบราว์เซอร์ การเข้าสู่ระบบจะไม่อัปโหลดประวัติผู้เยี่ยมชมเดิมโดยอัตโนมัติ</p>
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
