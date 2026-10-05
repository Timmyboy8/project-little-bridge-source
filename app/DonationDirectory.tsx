'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { donations, donationPhoto, donationProvinces, type DonationLanguage } from './donations';

export default function DonationDirectory({language, selectedId, onSelect, onLanguage}: {language: DonationLanguage; selectedId: string | null; onSelect: (id: string | null) => void; onLanguage: (lang: DonationLanguage) => void}) {
  const th = language === 'th';
  const [province, setProvince] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const pagingBar = useRef<HTMLDivElement>(null);
  const pageNavigation = useRef(false);
  const changePage = (next: number) => {
    pageNavigation.current = true;
    setPage(next);
  };
  useLayoutEffect(() => {
    if (!pageNavigation.current || !pagingBar.current) return;
    pageNavigation.current = false;
    pagingBar.current.focus({preventScroll: true});
    pagingBar.current.scrollIntoView({block: 'start', behavior: 'instant'});
  }, [page]);
  const selected = donations.find(d => d.id === selectedId);
  const provinces = donationProvinces;
  const filtered = donations.filter(d => (province === 'all' || d.provinceId === province) && `${d.name.en} ${d.name.th} ${d.province.en} ${d.province.th}`.toLowerCase().includes(search.toLowerCase().trim()));
  const pages = Math.max(1, Math.ceil(filtered.length / 4));
  const currentPage = Math.min(page, pages);
  useEffect(() => {
    const element = dialog.current;
    if (!selectedId || !element) return;
    element.showModal();
    element.scrollTop = 0;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element.querySelectorAll('video').forEach(video => video.pause()); element.close(); document.body.style.overflow = previous; };
  }, [selectedId]);
  return <>
    <section className="donation-directory" id="donation-visits" aria-labelledby="donation-directory-title">
      <div className="donation-directory-heading">
        <div className="section-heading"><p className="eyebrow">{th ? 'เรื่องราวจากการส่งมอบ' : 'The places along the way'}</p><h2 id="donation-directory-title">{th ? <>ทุกการส่งมอบ<br/><span>มีเรื่องราว</span></> : <>Small bridges.<br/><span>Real connections.</span></>}</h2><p>{th ? 'รู้จักหน่วยงานที่ได้รับมอบอุปกรณ์จากเรา พร้อมภาพและเรื่องราวจากแต่ละการส่งมอบ' : 'Meet the organizations we’ve donated to. Open a visit for photos and its story.'}</p></div>
        <div className="donation-directory-tally"><strong>{String(donations.length).padStart(2,'0')}</strong><span>{th ? 'หน่วยงานที่ได้รับมอบ' : 'recipient organizations'}<br/><b>{provinces.length} {th ? 'จังหวัด' : provinces.length === 1 ? 'province' : 'provinces'}</b></span></div>
      </div>
      <div className="donation-directory-tools">
        <label><span>{th ? 'ค้นหาหน่วยงาน' : 'Find an organization'}</span><input type="search" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder={th ? 'ชื่อหน่วยงานหรือจังหวัด' : 'Organization or province'} /></label>
        <label><span>{th ? 'จังหวัด' : 'Province'}</span><select value={province} onChange={e=>{setProvince(e.target.value);setPage(1);}}><option value="all">{th ? 'ทุกจังหวัด' : 'All provinces'}</option>{provinces.map(([id,name])=><option key={id} value={id}>{name[language]}</option>)}</select></label>
        <span className="donation-directory-result" role="status">{filtered.length} {th ? 'แห่ง' : 'visits'}</span>
      </div>
      <div className="donation-browse-bar" ref={pagingBar} tabIndex={-1}>
        <p role="status">{filtered.length ? (th ? `แสดง ${(currentPage-1)*4+1}–${Math.min(currentPage*4,filtered.length)} จาก ${filtered.length} แห่ง` : `Showing ${(currentPage-1)*4+1}–${Math.min(currentPage*4,filtered.length)} of ${filtered.length} visits`) : (th ? 'ไม่พบรายการ' : 'No visits found')}</p>
      {pages>1 && <nav className="donation-pagination" aria-label={th?'หน้ารายการส่งมอบ':'Donation pages'}><button disabled={currentPage===1} onClick={()=>changePage(currentPage-1)}>{th?'ก่อนหน้า':'Previous'}</button><span>{currentPage} / {pages}</span><button disabled={currentPage===pages} onClick={()=>changePage(currentPage+1)}>{th?'ถัดไป':'Next'}</button></nav>}
      </div>
      <div className="donation-directory-grid" aria-label={th ? `รายการส่งมอบ หน้า ${currentPage}` : `Donation visits, page ${currentPage}`}>

        {filtered.slice((currentPage-1)*4,currentPage*4).map(visit => <article className="donation-visit-card" key={visit.id}>
          {visit.photos.length ? <div className="donation-card-cover"><img src={donationPhoto(visit,visit.photos[0].file)} alt={visit.photos[0].caption[language]} loading="lazy" width={visit.photos[0].width || 1706} height={visit.photos[0].height || 960} style={{objectPosition:visit.photos[0].coverPosition || "center"}}/><span>{String(visit.number).padStart(2,'0')}</span></div> : <div className="donation-card-first donation-photo-placeholder"><span className="donation-first-number">{String(visit.number).padStart(2,'0')}</span><div><img src="/plb-bridge-mark.png" alt=""/><p>{visit.province[language]}</p><strong>{th ? 'ภาพการส่งมอบจะตามมาเร็ว ๆ นี้' : 'Photos coming soon'}</strong></div></div>}
          <div className="donation-card-body"><p className="donation-card-meta">{visit.province[language]}{visit.dateLabel && <> <span>·</span> <time dateTime={visit.date}>{visit.dateLabel[language]}</time></>}</p><h3>{visit.name[language]}</h3><p>{visit.summary[language]}</p>{visit.childrenSupported && <p className="donation-community"><small>{visit.communityLabel?.[language] || (th ? 'เด็กที่หน่วยงานดูแล' : 'Children supported by the organization')}</small><strong>{visit.childrenSupported[language]}</strong></p>}<button type="button" onClick={()=>onSelect(visit.id)}>{th ? 'ดูเรื่องราวการส่งมอบ' : 'Explore this visit'}<span aria-hidden="true">↗</span></button></div>
        </article>)}
      </div>
      {!filtered.length && <p className="donation-empty">{th ? 'ไม่พบหน่วยงานที่ตรงกับการค้นหา' : 'No organizations match your search.'}</p>}

    </section>
    <dialog ref={dialog} className="donation-detail" aria-labelledby="donation-detail-title" onCancel={()=>onSelect(null)} onClose={()=>onSelect(null)} onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)onSelect(null);}}}>
      {selected && <><header className="donation-detail-bar"><span>{th?'การส่งมอบ':'Visit'} {String(selected.number).padStart(2,'0')} <b>· {selected.province[language]}</b></span><div className="donation-detail-language"><button aria-pressed={language==='en'} onClick={()=>{onLanguage('en');}}>EN</button><button aria-pressed={th} onClick={()=>{onLanguage('th');}}>ไทย</button></div><button className="donation-detail-close" autoFocus onClick={()=>onSelect(null)} aria-label={th?'ปิดรายละเอียด':'Close visit'}>×</button></header>
      <div className="donation-detail-content"><p className="eyebrow">{selected.dateLabel?.[language] || (selected.number === 1 ? (th?'การส่งมอบครั้งแรก':'Our first donation') : selected.province[language])}</p><h2 id="donation-detail-title">{selected.name[language]}</h2>{selected.childrenSupported && <p className="donation-community"><small>{selected.communityLabel?.[language] || (th ? 'เด็กที่หน่วยงานดูแล' : 'Children supported by the organization')}</small><strong>{selected.childrenSupported[language]}</strong></p>}<div className="donation-detail-story">{selected.paragraphs.map((p,i)=><p key={i}>{p[language]}</p>)}</div>
      {!selected.photos.length && <div className="donation-detail-placeholder"><img src="/plb-bridge-mark.png" alt=""/><strong>{th ? 'ภาพการส่งมอบจะตามมาเร็ว ๆ นี้' : 'Photos coming soon'}</strong><p>{th ? 'เราจะเพิ่มภาพจากการส่งมอบที่นี่' : 'We’ll add photos from this donation here.'}</p></div>}
      {selected.video && <figure className="donation-video"><video key={selected.id} controls playsInline preload="none" poster={donationPhoto(selected,selected.video.poster)} aria-label={selected.video.caption[language]}><source src={donationPhoto(selected,selected.video.file)} type="video/mp4"/><a href={donationPhoto(selected,selected.video.file)}>{th ? 'เปิดวิดีโอ' : 'Open video'}</a></video><figcaption>{selected.video.caption[language]}</figcaption></figure>}
      {!!selected.photos.length && <div className="donation-detail-gallery">{selected.photos.map(photo=><figure className={`donation-photo-${photo.orientation}`} key={photo.file}><a href={donationPhoto(selected,photo.file)} target="_blank" rel="noopener noreferrer" aria-label={`${th?'ดูภาพเต็ม: ':'Open full photo: '}${photo.caption[language]}`}><img src={donationPhoto(selected,photo.file)} alt={photo.caption[language]} loading="lazy" width={photo.width || (photo.orientation==='landscape'?1706:1368)} height={photo.height || (photo.orientation==='landscape'?960:1824)}/></a><figcaption>{photo.caption[language]}</figcaption></figure>)}</div>}
      </div></>}
    </dialog>
  </>;
}
