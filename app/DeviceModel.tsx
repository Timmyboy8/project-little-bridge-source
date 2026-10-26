import EmotionFace from './EmotionFace';
type Emotion = 'angry' | 'happy' | 'sad' | 'calm';
const controls = [
  {id:'angry',color:'red',en:'Angry',th:'โกรธ'},
  {id:'happy',color:'yellow',en:'Happy',th:'สุข'},
  {id:'sad',color:'blue',en:'Sad',th:'เศร้า'},
  {id:'calm',color:'white',en:'Calm',th:'สงบ'},
] as const;
export default function DeviceModel({preview=false,language,prompt=null,answer=null,synced=false,onStart,onAnswer,onSync}:{preview?:boolean;language:'en'|'th';prompt?:Emotion|null;answer?:Emotion|null;synced?:boolean;onStart?:()=>void;onAnswer?:(emotion:Emotion)=>void;onSync?:()=>void}) {
  const th=language==='th';
  const face=preview?'happy':prompt;
  const correct=!!prompt && answer===prompt;
  const syncLabel=th?'ปุ่มสีดำ: สาธิตการบันทึกข้อมูล':'Black button: demonstrate Sync';
  return <div className={`device-model ${preview?'device-thumbnail':'online-device'}`}>
    <span className="device-label">Emotion Sync · Prototype 03</span>
    <div className="speaker" aria-hidden="true"><i/><i/><i/></div>
    <span className={`device-led led-yellow${answer&&!correct?' is-on':''}`} aria-hidden="true"/>
    <span className={`device-led led-green${correct?' is-on':''}`} aria-hidden="true"/>
    {preview?<span className="side-start-control"><span>Start</span></span>:<button className="side-start-control" type="button" onClick={onStart} aria-label={th?'เริ่มรอบใหม่':'Start a new round'}><span>Start</span></button>}
    {preview?<span className="sync-control"/>:<button className="sync-control" type="button" onClick={onSync} disabled={!answer} aria-label={syncLabel} aria-pressed={synced}><span className="sr-only">{syncLabel}</span></button>}
    <div className="oled"><span className="oled-screw screw-one"/><span className="oled-screw screw-two"/><span className="oled-screw screw-three"/><span className="oled-screw screw-four"/><div className="oled-screen"><b>{face?<EmotionFace emotion={face}/>:<span className="device-ready-symbol" aria-hidden="true">▶</span>}</b><span>{synced?(th?'สาธิตแล้ว':'SYNC DEMO'):face?(th?'อารมณ์อะไร?':'Which emotion?'):(th?'กด START':'Press Start')}</span></div></div>
    <div className="prototype-controls">{controls.map(control=>preview?<span key={control.id} className={`model-button model-${control.color}`} data-label={control[language]}/>:<button key={control.id} className={`model-button model-${control.color}`} data-label={control[language]} type="button" disabled={!prompt||!!answer} onClick={()=>onAnswer?.(control.id)} aria-label={control[language]}><span className="sr-only">{control[language]}</span></button>)}</div>
  </div>;
}
