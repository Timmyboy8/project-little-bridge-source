export type DonationLanguage = 'en' | 'th';
type Text = Record<DonationLanguage, string>;
export type Donation = { id: string; number: number; provinceId: string; province: Text; name: Text; date?: string; dateLabel?: Text; summary: Text; childrenSupported?: Text; communityLabel?: Text; video?: { file: string; poster: string; caption: Text }; paragraphs: Text[]; photos: { file: string; width?: number; height?: number; coverPosition?: string; caption: Text; orientation: 'landscape' | 'portrait' }[] };
export const donations: Donation[] = [
  {
    id: 'first-prototype', number: 1, provinceId: 'bkk', province: {en:'Bangkok',th:'กรุงเทพมหานคร'},
    name: {en:'The Foundation of the Welfare of the Mentally Retarded of Thailand Under the Royal Patronage of H.M.The Queen',th:'มูลนิธิช่วยคนปัญญาอ่อนแห่งประเทศไทย ในพระบรมราชินูปถัมภ์'},
    summary: {en:'Our first Emotion Sync donation, entrusted to the foundation for onward donation on our behalf.',th:'ส่งมอบ Emotion Sync ครั้งแรกให้มูลนิธิ เพื่อช่วยส่งต่ออุปกรณ์ไปบริจาคแทนทีมของเรา'},
    paragraphs: [{en:'The foundation supports individuals with intellectual disabilities, developmental delays, and related cognitive impairments. It is not a children’s residential care facility.',th:'มูลนิธิสนับสนุนบุคคลที่มีความบกพร่องทางสติปัญญา พัฒนาการล่าช้า และความบกพร่องด้านการรู้คิดที่เกี่ยวข้อง โดยไม่ได้เป็นสถานดูแลเด็กแบบพักอาศัย'}, {en:'The foundation received our Emotion Sync device to arrange an onward donation on our behalf. This was the first donation in Project Little Bridge’s journey.',th:'มูลนิธิรับอุปกรณ์ Emotion Sync ของเราไว้ เพื่อช่วยส่งต่อไปบริจาคแทนทีม นับเป็นการส่งมอบครั้งแรกของ Project Little Bridge'}], photos: [{file:'donation.jpg',orientation:'landscape',width:1477,height:1108,coverPosition:'center 65%',caption:{en:'Donating our first Emotion Sync prototype to the foundation',th:'ส่งมอบต้นแบบ Emotion Sync เครื่องแรกให้มูลนิธิ'}}]
  },
  {
    id:'autistic-thai-foundation',number:2,provinceId:'bkk',province:{en:'Bangkok',th:'กรุงเทพมหานคร'},name:{en:'Autistic Thai Foundation',th:'มูลนิธิออทิสติกไทย'},date:'2026-08-29',dateLabel:{en:'29 August 2026',th:'29 สิงหาคม 2569'},
    summary:{en:'Sharing Emotion Sync and learning from the people who work with children every day.',th:'ส่งมอบ Emotion Sync และรับฟังคำแนะนำจากทีมที่ทำงานกับเด็กโดยตรง'},
    childrenSupported: {en:'Around 200–300 children per week',th:'เด็กประมาณ 200–300 คนต่อสัปดาห์'},
    communityLabel: {en:'Weekly activity attendance',th:'เด็กที่มาร่วมกิจกรรมในแต่ละสัปดาห์'},
    paragraphs:[{en:'The foundation welcomes around 200–300 children each week to take part in activities.',th:'มูลนิธิต้อนรับเด็กประมาณ 200–300 คนต่อสัปดาห์เพื่อเข้าร่วมกิจกรรมต่าง ๆ'}, {en:'We visited the Autistic Thai Foundation to donate an Emotion Sync device and introduce Emotion Sync Online. We had the chance to demonstrate both and hear feedback directly from the team.',th:'เราไปมอบอุปกรณ์ Emotion Sync 1 เครื่อง และแนะนำ Emotion Sync Online ให้ทีมมูลนิธิได้ลองใช้งาน พร้อมรับฟังคำแนะนำจากทีมโดยตรง'}, {en:'Their suggestions included a bigger screen, cuter emotion faces, and more color to make the device more engaging for children. We’ll use what we learned to improve the next version.',th:'ทีมมูลนิธิแนะนำให้ใช้หน้าจอที่ใหญ่ขึ้น ปรับใบหน้าแสดงอารมณ์ให้น่ารักขึ้น และเพิ่มสีสันให้เด็กสนใจ เราจะนำคำแนะนำเหล่านี้ไปพัฒนาอุปกรณ์รุ่นถัดไป'}, {en:'The team also shared that they would introduce Emotion Sync and Emotion Sync Online internally to explore possible future opportunities.',th:'ทีมมูลนิธิยังแจ้งว่าจะนำ Emotion Sync และ Emotion Sync Online ไปแนะนำภายในองค์กร เพื่อพิจารณาโอกาสในการร่วมงานกันต่อไป'}],
    photos:[
      {file:'donation.jpg',orientation:'landscape',caption:{en:'Handing over Emotion Sync and introducing the online activities',th:'ส่งมอบ Emotion Sync และแนะนำกิจกรรมออนไลน์'}},
      {file:'feedback.jpg',orientation:'portrait',caption:{en:'Trying the device and discussing improvements',th:'ทดลองใช้อุปกรณ์และพูดคุยเพื่อปรับปรุงการใช้งาน'}},
      {file:'team.jpg',orientation:'portrait',caption:{en:'Our team at the foundation',th:'ทีมของเราที่มูลนิธิ'}},
      {file:'building.jpg',orientation:'portrait',caption:{en:'Autistic Thai Foundation, Bangkok',th:'มูลนิธิออทิสติกไทย กรุงเทพมหานคร'}}
    ]
  },
  {
    id: 'camillian-home', number: 3, provinceId: 'bkk', province: {en:'Bangkok',th:'กรุงเทพมหานคร'},
    name: {en:'Camillian Home For Disabled Children – Lat Krabang',th:'สถานสงเคราะห์เด็กบ้านคามิลเลียนเพื่อเด็กพิการลาดกระบัง'},
    summary: {en:'Bringing Emotion Sync to Camillian Home in Lat Krabang, Bangkok.',th:'ส่งมอบ Emotion Sync ให้บ้านคามิลเลียนในเขตลาดกระบัง กรุงเทพมหานคร'},
    childrenSupported: {en:'32 children with autism',th:'เด็กออทิสติก 32 คน'},
    paragraphs: [{en:'We donated Emotion Sync to Camillian Home For Disabled Children in Lat Krabang, Bangkok. The home supports 32 children with autism.',th:'เราส่งมอบ Emotion Sync ให้สถานสงเคราะห์เด็กบ้านคามิลเลียนเพื่อเด็กพิการลาดกระบัง กรุงเทพมหานคร ซึ่งดูแลเด็กออทิสติก 32 คน'}],
    video: {file:'visit.mp4',poster:'video-poster.jpg',caption:{en:'Trying Emotion Sync with support at Camillian Home',th:'ทดลองใช้ Emotion Sync โดยมีผู้ดูแลช่วยแนะนำที่บ้านคามิลเลียน'}},
    photos: [
      {file:'photo-1.jpg',width:1478,height:1108,orientation:'landscape',coverPosition:'center 55%',caption:{en:'Sharing an Emotion Sync activity at Camillian Home',th:'ร่วมกิจกรรม Emotion Sync ที่บ้านคามิลเลียน'}},
      {file:'photo-2.jpg',width:1108,height:1478,orientation:'portrait',caption:{en:'Trying the device’s emotion buttons',th:'ทดลองกดปุ่มอารมณ์บนอุปกรณ์'}},
      {file:'photo-3.jpg',width:499,height:1080,orientation:'portrait',caption:{en:'A parcel prepared for Camillian Home',th:'พัสดุที่จัดเตรียมสำหรับบ้านคามิลเลียน'}}
    ]
  },
  {
    id: 'sakon-nakhon-special-education-center', number: 4, provinceId: 'snk', province: {en:'Sakon Nakhon',th:'สกลนคร'},
    name: {en:'Sakon Nakhon Special Education Center',th:'ศูนย์การศึกษาพิเศษ ประจำจังหวัดสกลนคร'},
    summary: {en:'Sharing Emotion Sync with a special education center in Sakon Nakhon.',th:'ส่งมอบ Emotion Sync ให้ศูนย์การศึกษาพิเศษ ประจำจังหวัดสกลนคร'},
    childrenSupported: {en:'60 children',th:'เด็ก 60 คน'},
    paragraphs: [{en:'We donated Emotion Sync to Sakon Nakhon Special Education Center, which supports 60 children. The center is one of our donation locations in Sakon Nakhon.',th:'เราส่งมอบ Emotion Sync ให้ศูนย์การศึกษาพิเศษ ประจำจังหวัดสกลนคร ซึ่งดูแลเด็ก 60 คน โดยศูนย์ฯ เป็นหนึ่งในสถานที่รับมอบอุปกรณ์ของเราในจังหวัดสกลนคร'}],
    photos: [
      {file:'photo-1.jpg',width:1882,height:869,orientation:'landscape',coverPosition:'center 60%',caption:{en:'Emotion Sync at Sakon Nakhon Special Education Center',th:'Emotion Sync ที่ศูนย์การศึกษาพิเศษ ประจำจังหวัดสกลนคร'}},
      {file:'photo-2.jpg',width:1706,height:960,orientation:'landscape',caption:{en:'At the entrance of Sakon Nakhon Special Education Center',th:'บริเวณทางเข้าศูนย์การศึกษาพิเศษ ประจำจังหวัดสกลนคร'}}
    ]
  },
  {
    id: 'sakon-nakhon-hospital', number: 5, provinceId: 'snk', province: {en:'Sakon Nakhon',th:'สกลนคร'},
    name: {en:'Sakon Nakhon Hospital',th:'โรงพยาบาลสกลนคร'},
    summary: {en:'Bringing Emotion Sync to the team caring for children at Sakon Nakhon Hospital.',th:'ส่งมอบ Emotion Sync ให้ทีมที่ดูแลเด็ก ณ โรงพยาบาลสกลนคร'},
    childrenSupported: {en:'Around 50 children with autism',th:'เด็กออทิสติกประมาณ 50 คน'},
    paragraphs: [{en:'We donated Emotion Sync to Sakon Nakhon Hospital. The hospital cares for around 50 children with autism.',th:'เราส่งมอบ Emotion Sync ให้โรงพยาบาลสกลนคร ซึ่งดูแลเด็กออทิสติกประมาณ 50 คน'}],
    photos: [
      {file:'photo-1.jpg',width:1477,height:1108,orientation:'landscape',coverPosition:'center 45%',caption:{en:'Handing over Emotion Sync and its information sheet at Sakon Nakhon Hospital',th:'ส่งมอบ Emotion Sync พร้อมเอกสารแนะนำที่โรงพยาบาลสกลนคร'}},
      {file:'photo-2.jpg',width:1477,height:1108,orientation:'landscape',caption:{en:'Our donation visit to Sakon Nakhon Hospital',th:'การส่งมอบอุปกรณ์ที่โรงพยาบาลสกลนคร'}},
      {file:'photo-3.jpg',width:869,height:1882,orientation:'portrait',caption:{en:'The Emotion Sync device and printed introduction',th:'อุปกรณ์ Emotion Sync และเอกสารแนะนำ'}}
    ]
  }

];
export const donationPhoto = (visit: Donation, file: string) => `/donations/${visit.id}/${file}`;

export const donationProvinces = [...new Map(donations.map(visit => [visit.provinceId, visit.province])).entries()];
