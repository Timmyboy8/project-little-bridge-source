export type DonationLanguage = 'en' | 'th';
type Text = Record<DonationLanguage, string>;
export type Donation = { id: string; number: number; provinceId: string; province: Text; name: Text; date?: string; dateLabel?: Text; summary: Text; paragraphs: Text[]; photos: { file: string; width?: number; height?: number; coverPosition?: string; caption: Text; orientation: 'landscape' | 'portrait' }[] };
export const donations: Donation[] = [
  {
    id: 'first-prototype', number: 1, provinceId: 'bkk', province: {en:'Bangkok',th:'กรุงเทพมหานคร'},
    name: {en:'The Foundation of the Welfare of the Mentally Retarded of Thailand Under the Royal Patronage of H.M.The Queen',th:'มูลนิธิช่วยคนปัญญาอ่อนแห่งประเทศไทย ในพระบรมราชินูปถัมภ์'},
    summary: {en:'Our first Emotion Sync prototype, donated for testing and feedback.',th:'ส่งมอบต้นแบบ Emotion Sync เครื่องแรก เพื่อทดลองใช้งานและรับฟังคำแนะนำ'},
    paragraphs: [{en:'We donated our first Emotion Sync prototype to the foundation in Bangkok, which supports people with intellectual disabilities. This was the first donation in Project Little Bridge’s journey.',th:'เราส่งมอบต้นแบบ Emotion Sync เครื่องแรกให้มูลนิธิในกรุงเทพฯ ซึ่งดูแลและสนับสนุนผู้มีความบกพร่องทางสติปัญญา นับเป็นการส่งมอบครั้งแรกของ Project Little Bridge'}, {en:'The prototype was provided for testing, giving us a starting point to learn from use outside our team and improve the device.',th:'เรามอบต้นแบบเพื่อให้ทดลองใช้งาน เป็นจุดเริ่มต้นในการเรียนรู้จากการใช้งานนอกทีมและพัฒนาอุปกรณ์ต่อไป'}], photos: [{file:'donation.jpg',orientation:'landscape',width:1477,height:1108,coverPosition:'center 65%',caption:{en:'Donating our first Emotion Sync prototype to the foundation',th:'ส่งมอบต้นแบบ Emotion Sync เครื่องแรกให้มูลนิธิ'}}]
  },
  {
    id:'autistic-thai-foundation',number:2,provinceId:'bkk',province:{en:'Bangkok',th:'กรุงเทพมหานคร'},name:{en:'Autistic Thai Foundation',th:'มูลนิธิออทิสติกไทย'},date:'2026-08-29',dateLabel:{en:'29 August 2026',th:'29 สิงหาคม 2569'},
    summary:{en:'Sharing Emotion Sync and learning from the people who work with children every day.',th:'ส่งมอบ Emotion Sync และรับฟังคำแนะนำจากทีมที่ทำงานกับเด็กโดยตรง'},
    paragraphs:[{en:'We visited the Autistic Thai Foundation to donate an Emotion Sync device and introduce Emotion Sync Online. We had the chance to demonstrate both and hear feedback directly from the team.',th:'เราไปมอบอุปกรณ์ Emotion Sync 1 เครื่อง และแนะนำ Emotion Sync Online ให้ทีมมูลนิธิได้ลองใช้งาน พร้อมรับฟังคำแนะนำจากทีมโดยตรง'}, {en:'Their suggestions included a bigger screen, cuter emotion faces, and more color to make the device more engaging for children. We’ll use what we learned to improve the next version.',th:'ทีมมูลนิธิแนะนำให้ใช้หน้าจอที่ใหญ่ขึ้น ปรับใบหน้าแสดงอารมณ์ให้น่ารักขึ้น และเพิ่มสีสันให้เด็กสนใจ เราจะนำคำแนะนำเหล่านี้ไปพัฒนาอุปกรณ์รุ่นถัดไป'}, {en:'The team also shared that they would introduce Emotion Sync and Emotion Sync Online internally to explore possible future opportunities.',th:'ทีมมูลนิธิยังแจ้งว่าจะนำ Emotion Sync และ Emotion Sync Online ไปแนะนำภายในองค์กร เพื่อพิจารณาโอกาสในการร่วมงานกันต่อไป'}],
    photos:[
      {file:'donation.jpg',orientation:'landscape',caption:{en:'Handing over Emotion Sync and introducing the online activities',th:'ส่งมอบ Emotion Sync และแนะนำกิจกรรมออนไลน์'}},
      {file:'feedback.jpg',orientation:'portrait',caption:{en:'Trying the device and discussing improvements',th:'ทดลองใช้อุปกรณ์และพูดคุยเพื่อปรับปรุงการใช้งาน'}},
      {file:'team.jpg',orientation:'portrait',caption:{en:'Our team at the foundation',th:'ทีมของเราที่มูลนิธิ'}},
      {file:'building.jpg',orientation:'portrait',caption:{en:'Autistic Thai Foundation, Bangkok',th:'มูลนิธิออทิสติกไทย กรุงเทพมหานคร'}}
    ]
  }
];
export const donationPhoto = (visit: Donation, file: string) => `/donations/${visit.id}/${file}`;
