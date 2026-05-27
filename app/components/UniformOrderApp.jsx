"use client";

import { useState, useRef } from "react";

const SCHOOL_LOGO = "/logo.png";
const QR_IMAGE = "/qr.jpg";
const MALE_UNIFORM = "/male-uniform.jpg";
const FEMALE_UNIFORM = "/female-uniform.jpg";

const PRICES = { male: 3160, female: 2560 };
const DEPOSIT = 1000;

const GRADES = ["ป.4","ป.5","ป.6","ม.1","ม.2","ม.3","ม.4","ม.5","ม.6"];
const ROOMS = ["1","2","3","4","5","6","7","8"];

const GAS_URL = "https://script.google.com/macros/s/AKfycbxXGnNPwLJEAwFOj5yRN-K5SQlOb-o7MGCzRDGBFFqyFz3tMC3i3QDXJPKW4B-U66NBNQ/exec";

const steps = ["ข้อมูลนักเรียน","เลือกชุด","การชำระ","สรุป & ส่ง"];

const SEL_STYLE = {
  width:"100%",
  padding:"12px 14px",
  border:"1.5px solid rgba(255,255,255,0.15)",
  borderRadius:12,
  background:"#1a5490",
  color:"#fff",
  fontFamily:"'Sarabun',sans-serif",
  fontSize:16,
  outline:"none",
  WebkitAppearance:"auto",
  MozAppearance:"auto",
  appearance:"auto",
  cursor:"pointer",
  minHeight:48,
};

export default function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    studentName:"", grade:"", room:"", studentId:"", studentPhone:"",
    parentName:"", parentPhone:"",
    uniformType:"", paymentType:"",
    slipFile:null, slipPreview:null, slipName:""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const fileRef = useRef();

  const price = form.uniformType ? PRICES[form.uniformType] : 0;
  const payAmount = form.paymentType === "deposit" ? DEPOSIT : price;
  const remaining = form.paymentType === "deposit" ? price - DEPOSIT : 0;

  const set = (k, v) => setForm(f => ({...f, [k]: v}));
  const clearErr = k => setErrors(e => {const n={...e}; delete n[k]; return n;});

  const validate = () => {
    const e = {};
    if (!form.studentName.trim()) e.studentName = "กรุณากรอกชื่อ-นามสกุล";
    if (!form.grade) e.grade = "กรุณาเลือกระดับชั้น";
    if (!form.room) e.room = "กรุณาเลือกห้อง";
    if (!form.studentId.trim()) e.studentId = "กรุณากรอกเลขประจำตัว";
    if (!form.studentPhone.trim()) e.studentPhone = "กรุณากรอกเบอร์โทร";
    if (!form.parentName.trim()) e.parentName = "กรุณากรอกชื่อผู้ปกครอง";
    if (!form.parentPhone.trim()) e.parentPhone = "กรุณากรอกเบอร์ผู้ปกครอง";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 0 && !validate()) return;
    if (step === 1 && !form.uniformType) { alert("กรุณาเลือกประเภทชุด"); return; }
    if (step === 2 && !form.paymentType) { alert("กรุณาเลือกรูปแบบการชำระ"); return; }
    setStep(s => Math.min(s+1, 3));
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    set("slipFile", file);
    set("slipName", file.name);
    const reader = new FileReader();
    reader.onload = ev => set("slipPreview", ev.target.result);
    reader.readAsDataURL(file);
  };

  const toBase64 = file => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const submit = async () => {
    if (!form.slipFile) { alert("กรุณาอัปโหลดสลิปการชำระเงิน"); return; }
    setSubmitting(true);
    try {
      let slipBase64 = "", slipType = "";
      if (form.slipFile) {
        slipBase64 = await toBase64(form.slipFile);
        slipType = form.slipFile.type;
      }
      const payload = {
        studentName: form.studentName,
        grade: form.grade,
        room: form.room,
        studentId: form.studentId,
        studentPhone: form.studentPhone,
        parentName: form.parentName,
        parentPhone: form.parentPhone,
        uniformType: form.uniformType === "male" ? "ชุดพิธีการชาย" : "ชุดพิธีการหญิง",
        paymentType: form.paymentType === "deposit" ? "มัดจำ 1,000 บาท" : "ชำระเต็มจำนวน",
        payAmount,
        remaining,
        slipBase64,
        slipType,
        slipName: form.slipName
      };
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" }
      });
      setSuccess(true);
    } catch(e) {
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const fmtPrice = n => n.toLocaleString("th-TH");

  if (success) return <SuccessModal name={form.studentName} uniformType={form.uniformType} />;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0F3D68 0%,#1a5490 40%,#0d2d4e 100%)",fontFamily:"'Sarabun',sans-serif",paddingBottom:"3rem"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .inp { width:100%; padding:12px 14px; border:1.5px solid rgba(255,255,255,0.15); border-radius:12px; background:rgba(255,255,255,0.08); color:#fff; font-family:'Sarabun',sans-serif; font-size:15px; outline:none; }
        .inp::placeholder { color:rgba(255,255,255,0.4); }
        .inp:focus { border-color:#D4A017; }
        .inp.err { border-color:#ef4444; }
        .btn-primary { background:linear-gradient(135deg,#D4A017,#e8b520); color:#0F3D68; border:none; padding:16px 32px; border-radius:14px; font-size:16px; font-weight:700; font-family:'Sarabun',sans-serif; cursor:pointer; box-shadow:0 4px 20px rgba(212,160,23,0.4); width:100%; }
        .btn-secondary { background:rgba(255,255,255,0.1); color:#fff; border:1.5px solid rgba(255,255,255,0.2); padding:14px 24px; border-radius:12px; font-size:15px; font-family:'Sarabun',sans-serif; cursor:pointer; }
        .uniform-card { border-radius:16px; border:2px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06); cursor:pointer; overflow:hidden; }
        .uniform-card.selected { border-color:#D4A017; background:rgba(212,160,23,0.12); }
        .pay-card { border-radius:14px; border:2px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06); cursor:pointer; padding:18px; }
        .pay-card.selected { border-color:#D4A017; background:rgba(212,160,23,0.1); }
        .step-dot { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; }
        .step-dot.active { background:#D4A017; color:#0F3D68; }
        .step-dot.done { background:rgba(212,160,23,0.3); color:#D4A017; border:2px solid #D4A017; }
        .step-dot.todo { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.4); border:2px solid rgba(255,255,255,0.15); }
        .glass { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:24px; }
        .err-msg { color:#f87171; font-size:12px; margin-top:4px; }
        .label { color:rgba(255,255,255,0.75); font-size:13px; font-weight:500; margin-bottom:6px; display:block; }
        .section-title { font-size:17px; font-weight:700; color:#DFF4F8; margin-bottom:16px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1); }
        .summary-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.07); }
        .summary-row:last-child { border-bottom:none; }
        .upload-zone { border:2px dashed rgba(255,255,255,0.2); border-radius:14px; padding:32px 20px; text-align:center; cursor:pointer; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn 0.4s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(15,61,104,0.95)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 16px"}}>
        <div style={{maxWidth:600,margin:"0 auto",display:"flex",alignItems:"center",gap:12}}>
          <img src={SCHOOL_LOGO} alt="โลโก้" style={{width:44,height:44,objectFit:"contain",borderRadius:6}} onError={e=>e.target.style.display="none"} />
          <div>
            <div style={{color:"#D4A017",fontWeight:700,fontSize:13}}>ระบบสั่งจองชุดพิธีการ</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:11}}>โรงเรียนวรราชาทินัดดามาตุวิทยา</div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:600,margin:"0 auto",padding:"0 16px"}}>
        {/* Hero */}
        <div style={{textAlign:"center",padding:"36px 0 24px"}} className="fade-in">
          <img src={SCHOOL_LOGO} alt="โลโก้" style={{width:90,height:90,objectFit:"contain",marginBottom:16}} onError={e=>e.target.style.display="none"} />
          <h1 style={{color:"#DFF4F8",fontSize:22,fontWeight:700,lineHeight:1.5,margin:"0 0 8px"}}>ระบบสั่งจองชุดพิธีการ</h1>
          <div style={{color:"#D4A017",fontSize:16,fontWeight:600,marginBottom:6}}>โรงเรียนวรราชาทินัดดามาตุวิทยา</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>ปีการศึกษา 2569</div>
          <div style={{background:"rgba(212,160,23,0.08)",border:"1px solid rgba(212,160,23,0.2)",borderRadius:12,padding:"10px 20px",marginTop:16,color:"rgba(255,255,255,0.65)",fontSize:13,lineHeight:1.7}}>
            เครื่องแบบพิธีการ สัญลักษณ์แห่งความสง่างาม<br/>หลอมรวมคุณค่าแห่งเกียรติยศและความภาคภูมิใจ
          </div>
        </div>

        {/* Steps */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:28}}>
          {steps.map((s,i) => (
            <div key={i} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div className={`step-dot ${i < step ? "done" : i === step ? "active" : "todo"}`}>{i < step ? "✓" : i+1}</div>
                <span style={{fontSize:10,color:i===step?"#D4A017":i<step?"rgba(212,160,23,0.6)":"rgba(255,255,255,0.3)",textAlign:"center",maxWidth:64,lineHeight:1.3}}>{s}</span>
              </div>
              {i < steps.length-1 && <div style={{width:28,height:2,background:i<step?"rgba(212,160,23,0.5)":"rgba(255,255,255,0.1)",marginBottom:20,marginLeft:2,marginRight:2}} />}
            </div>
          ))}
        </div>

        {/* STEP 0 */}
        {step === 0 && (
          <div className="glass fade-in">
            <div className="section-title">📋 ข้อมูลนักเรียน</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Field label="ชื่อ-นามสกุลนักเรียน *" error={errors.studentName}>
                <input className={`inp ${errors.studentName?"err":""}`} placeholder="เช่น นายสมชาย ใจดี" value={form.studentName} onChange={e=>{set("studentName",e.target.value);clearErr("studentName")}} />
              </Field>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <Field label="ระดับชั้น *" error={errors.grade}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {GRADES.map(g=>(
                      <button key={g} type="button" onClick={()=>{set("grade",g);clearErr("grade")}} style={{padding:"10px 16px",borderRadius:10,border:`2px solid ${form.grade===g?"#D4A017":"rgba(255,255,255,0.2)"}`,background:form.grade===g?"rgba(212,160,23,0.2)":"rgba(255,255,255,0.05)",color:form.grade===g?"#D4A017":"#fff",fontFamily:"'Sarabun',sans-serif",fontSize:15,cursor:"pointer",fontWeight:form.grade===g?700:400}}>
                        {g}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="ห้อง *" error={errors.room}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {ROOMS.map(r=>(
                      <button key={r} type="button" onClick={()=>{set("room",r);clearErr("room")}} style={{padding:"10px 16px",borderRadius:10,border:`2px solid ${form.room===r?"#D4A017":"rgba(255,255,255,0.2)"}`,background:form.room===r?"rgba(212,160,23,0.2)":"rgba(255,255,255,0.05)",color:form.room===r?"#D4A017":"#fff",fontFamily:"'Sarabun',sans-serif",fontSize:15,cursor:"pointer",fontWeight:form.room===r?700:400}}>
                        ห้อง {r}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="เลขประจำตัวนักเรียน *" error={errors.studentId}>
                <input className={`inp ${errors.studentId?"err":""}`} placeholder="รหัสนักเรียน" value={form.studentId} onChange={e=>{set("studentId",e.target.value);clearErr("studentId")}} />
              </Field>
              <Field label="เบอร์โทรนักเรียน *" error={errors.studentPhone}>
                <input className={`inp ${errors.studentPhone?"err":""}`} placeholder="0xx-xxx-xxxx" value={form.studentPhone} onChange={e=>{set("studentPhone",e.target.value);clearErr("studentPhone")}} type="tel" />
              </Field>
              <div style={{height:1,background:"rgba(255,255,255,0.08)"}} />
              <div className="section-title" style={{marginBottom:8}}>👨‍👩‍👧 ข้อมูลผู้ปกครอง</div>
              <Field label="ชื่อผู้ปกครอง *" error={errors.parentName}>
                <input className={`inp ${errors.parentName?"err":""}`} placeholder="ชื่อ-นามสกุลผู้ปกครอง" value={form.parentName} onChange={e=>{set("parentName",e.target.value);clearErr("parentName")}} />
              </Field>
              <Field label="เบอร์โทรผู้ปกครอง *" error={errors.parentPhone}>
                <input className={`inp ${errors.parentPhone?"err":""}`} placeholder="0xx-xxx-xxxx" value={form.parentPhone} onChange={e=>{set("parentPhone",e.target.value);clearErr("parentPhone")}} type="tel" />
              </Field>
            </div>
            <div style={{marginTop:24}}>
              <button className="btn-primary" onClick={nextStep}>ถัดไป →</button>
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="fade-in">
            <div className="glass">
              <div className="section-title">🎽 เลือกประเภทชุดพิธีการ</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[
                  {id:"male",label:"ชุดพิธีการชาย",price:3160,img:MALE_UNIFORM,icon:"👨‍🎓"},
                  {id:"female",label:"ชุดพิธีการหญิง",price:2560,img:FEMALE_UNIFORM,icon:"👩‍🎓"}
                ].map(u => (
                  <div key={u.id} className={`uniform-card ${form.uniformType===u.id?"selected":""}`} onClick={()=>set("uniformType",u.id)}>
                    <div style={{position:"relative",paddingTop:"120%",overflow:"hidden"}}>
                      <img src={u.img} alt={u.label} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}} onError={e=>{e.target.parentElement.style.paddingTop="0";e.target.parentElement.style.height="140px";e.target.parentElement.style.display="flex";e.target.parentElement.style.alignItems="center";e.target.parentElement.style.justifyContent="center";e.target.style.display="none";e.target.parentElement.innerHTML=`<span style="font-size:48px">${u.icon}</span>`;}} />
                      {form.uniformType===u.id && <div style={{position:"absolute",top:8,right:8,background:"#D4A017",borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#0F3D68"}}>✓</div>}
                    </div>
                    <div style={{padding:"12px 12px 14px"}}>
                      <div style={{color:"#DFF4F8",fontWeight:700,fontSize:14,marginBottom:4}}>{u.label}</div>
                      <div style={{color:"#D4A017",fontWeight:700,fontSize:18}}>{fmtPrice(u.price)}</div>
                      <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>บาท</div>
                    </div>
                  </div>
                ))}
              </div>
              {form.uniformType && (
                <div style={{marginTop:16,background:"rgba(212,160,23,0.1)",borderRadius:12,padding:"12px 16px",border:"1px solid rgba(212,160,23,0.25)"}}>
                  <div style={{color:"rgba(255,255,255,0.6)",fontSize:13}}>ชุดที่เลือก</div>
                  <div style={{color:"#D4A017",fontWeight:700,fontSize:16}}>{form.uniformType==="male"?"ชุดพิธีการชาย":"ชุดพิธีการหญิง"} — {fmtPrice(price)} บาท</div>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:12,marginTop:16}}>
              <button className="btn-secondary" onClick={()=>setStep(0)}>← ย้อนกลับ</button>
              <button className="btn-primary" onClick={nextStep}>ถัดไป →</button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="fade-in">
            <div className="glass" style={{marginBottom:16}}>
              <div className="section-title">💳 รูปแบบการชำระเงิน</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[
                  {id:"deposit",label:"มัดจำ 1,000 บาท",sub:`ยอดคงเหลือ ${fmtPrice(price-DEPOSIT)} บาท`,amount:fmtPrice(DEPOSIT)},
                  {id:"full",label:"ชำระเต็มจำนวน",sub:"ไม่มียอดค้างชำระ",amount:fmtPrice(price)}
                ].map(p => (
                  <div key={p.id} className={`pay-card ${form.paymentType===p.id?"selected":""}`} onClick={()=>set("paymentType",p.id)}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${form.paymentType===p.id?"#D4A017":"rgba(255,255,255,0.3)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {form.paymentType===p.id && <div style={{width:10,height:10,borderRadius:"50%",background:"#D4A017"}} />}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{color:"#DFF4F8",fontWeight:600,fontSize:15}}>{p.label}</div>
                        <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginTop:2}}>{p.sub}</div>
                      </div>
                      <div style={{color:"#D4A017",fontWeight:700,fontSize:18}}>{p.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass" style={{marginBottom:16,textAlign:"center"}}>
              <div className="section-title" style={{textAlign:"left"}}>📱 QR PromptPay</div>
              <div style={{background:"#fff",borderRadius:16,padding:20,display:"inline-block"}}>
                <img src={QR_IMAGE} alt="QR" style={{width:220,height:"auto",display:"block"}} onError={e=>{e.target.parentElement.innerHTML='<div style="width:220px;height:220px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#666;font-size:13px">QR Code</div>';}} />
              </div>
              <div style={{marginTop:16,color:"rgba(255,255,255,0.6)",fontSize:13}}>กรุณาสแกนเพื่อชำระเงิน</div>
              <div style={{color:"#DFF4F8",fontWeight:700,fontSize:15,marginTop:4}}>นาย คณัฐนันท์ พูลประดิษฐ์</div>
              {form.paymentType && (
                <div style={{background:"rgba(212,160,23,0.15)",borderRadius:10,padding:"10px 16px",marginTop:12,border:"1px solid rgba(212,160,23,0.3)"}}>
                  <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>ยอดที่ต้องชำระ</div>
                  <div style={{color:"#D4A017",fontWeight:700,fontSize:22}}>{fmtPrice(payAmount)} บาท</div>
                </div>
              )}
              <div style={{display:"flex",gap:8,marginTop:12,justifyContent:"center"}}>
                <button className="btn-secondary" style={{padding:"8px 16px",fontSize:13}} onClick={()=>setQrOpen(true)}>🔍 ดูภาพเต็ม</button>
                <a href={QR_IMAGE} download="QR_PromptPay.jpg" style={{textDecoration:"none"}}>
                  <button className="btn-secondary" style={{padding:"8px 16px",fontSize:13}}>⬇️ ดาวน์โหลด QR</button>
                </a>
              </div>
            </div>

            <div className="glass" style={{marginBottom:16}}>
              <div className="section-title">📎 อัปโหลดสลิปการโอนเงิน</div>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{display:"none"}} onChange={handleFile} />
              {!form.slipPreview ? (
                <div className="upload-zone" onClick={()=>fileRef.current.click()}>
                  <div style={{fontSize:36,marginBottom:8}}>📤</div>
                  <div style={{color:"#DFF4F8",fontWeight:600,marginBottom:4}}>คลิกเพื่ออัปโหลดสลิป</div>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>รองรับ JPG, PNG, PDF</div>
                </div>
              ) : (
                <div style={{textAlign:"center"}}>
                  {form.slipFile?.type === "application/pdf" ? (
                    <div style={{background:"rgba(212,160,23,0.1)",borderRadius:12,padding:20}}>
                      <div style={{fontSize:48}}>📄</div>
                      <div style={{color:"#DFF4F8",fontSize:13,marginTop:8}}>{form.slipName}</div>
                    </div>
                  ) : (
                    <img src={form.slipPreview} alt="สลิป" style={{maxWidth:"100%",maxHeight:200,borderRadius:12,objectFit:"contain"}} />
                  )}
                  <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginTop:8}}>{form.slipName}</div>
                  <button className="btn-secondary" style={{marginTop:8,padding:"8px 16px",fontSize:13}} onClick={()=>{set("slipFile",null);set("slipPreview",null);set("slipName","");}}>เปลี่ยนไฟล์</button>
                </div>
              )}
            </div>

            <div style={{display:"flex",gap:12}}>
              <button className="btn-secondary" onClick={()=>setStep(1)}>← ย้อนกลับ</button>
              <button className="btn-primary" onClick={nextStep}>ถัดไป →</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="fade-in">
            <div className="glass" style={{marginBottom:16}}>
              <div className="section-title">📋 สรุปการสั่งจอง</div>
              <SummaryRow label="ชื่อนักเรียน" value={form.studentName} />
              <SummaryRow label="ชั้น/ห้อง" value={`${form.grade}/${form.room}`} />
              <SummaryRow label="เลขประจำตัว" value={form.studentId} />
              <SummaryRow label="เบอร์นักเรียน" value={form.studentPhone} />
              <SummaryRow label="ผู้ปกครอง" value={form.parentName} />
              <SummaryRow label="เบอร์ผู้ปกครอง" value={form.parentPhone} />
              <div style={{height:1,background:"rgba(255,255,255,0.1)",margin:"8px 0"}} />
              <SummaryRow label="ประเภทชุด" value={form.uniformType==="male"?"ชุดพิธีการชาย ♂":"ชุดพิธีการหญิง ♀"} gold />
              <SummaryRow label="รูปแบบชำระ" value={form.paymentType==="deposit"?"มัดจำ 1,000 บาท":"ชำระเต็มจำนวน"} />
              <SummaryRow label="ยอดชำระ" value={`${fmtPrice(payAmount)} บาท`} gold large />
              {form.paymentType==="deposit" && <SummaryRow label="ยอดคงเหลือ" value={`${fmtPrice(remaining)} บาท`} />}
              <div style={{height:1,background:"rgba(255,255,255,0.1)",margin:"8px 0"}} />
              <SummaryRow label="สลิปการชำระ" value={form.slipName || "ไม่มีไฟล์"} />
            </div>
            {form.slipPreview && form.slipFile?.type !== "application/pdf" && (
              <div className="glass" style={{marginBottom:16,textAlign:"center"}}>
                <div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginBottom:10}}>ตัวอย่างสลิป</div>
                <img src={form.slipPreview} alt="สลิป" style={{maxWidth:"100%",maxHeight:160,borderRadius:10,objectFit:"contain"}} />
              </div>
            )}
            <div style={{display:"flex",gap:12,marginBottom:12}}>
              <button className="btn-secondary" onClick={()=>setStep(2)}>← ย้อนกลับ</button>
            </div>
            <button className="btn-primary" onClick={submit} disabled={submitting} style={{fontSize:17,padding:"18px 32px",opacity:submitting?0.6:1}}>
              {submitting ? "⏳ กำลังส่งข้อมูล..." : "✅ ยืนยันการสั่งจองชุดพิธีการ"}
            </button>
          </div>
        )}
      </div>

      {qrOpen && (
        <div onClick={()=>setQrOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,padding:24,maxWidth:380,width:"100%",textAlign:"center"}}>
            <img src={QR_IMAGE} alt="QR" style={{width:"100%",height:"auto",borderRadius:12}} />
            <button onClick={()=>setQrOpen(false)} style={{marginTop:16,padding:"10px 28px",background:"#0F3D68",color:"#fff",border:"none",borderRadius:10,fontSize:15,cursor:"pointer",fontFamily:"'Sarabun',sans-serif"}}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({label, error, children}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <div className="err-msg">⚠️ {error}</div>}
    </div>
  );
}

function SummaryRow({label, value, gold, large}) {
  return (
    <div className="summary-row">
      <span style={{color:"rgba(255,255,255,0.55)",fontSize:14}}>{label}</span>
      <span style={{color:gold?"#D4A017":"#DFF4F8",fontWeight:large?700:500,fontSize:large?17:14,textAlign:"right",maxWidth:"60%"}}>{value}</span>
    </div>
  );
}

function SuccessModal({name, uniformType}) {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0F3D68,#1a5490)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Sarabun',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');`}</style>
      <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:24,padding:40,textAlign:"center",maxWidth:400,width:"100%"}}>
        <div style={{fontSize:72,marginBottom:16}}>🎉</div>
        <div style={{color:"#D4A017",fontWeight:700,fontSize:24,marginBottom:8}}>สั่งจองสำเร็จ!</div>
        <div style={{color:"#DFF4F8",fontSize:16,marginBottom:6}}>ขอบคุณ {name}</div>
        <div style={{color:"rgba(255,255,255,0.6)",fontSize:13,lineHeight:1.7,marginBottom:24}}>
          การสั่งจอง{uniformType==="male"?"ชุดพิธีการชาย":"ชุดพิธีการหญิง"}ของคุณ<br/>ได้รับการบันทึกเรียบร้อยแล้ว<br/>ทางโรงเรียนจะติดต่อกลับเพื่อยืนยัน
        </div>
        <div style={{background:"rgba(212,160,23,0.1)",border:"1px solid rgba(212,160,23,0.2)",borderRadius:12,padding:"12px 20px",marginBottom:24,color:"rgba(255,255,255,0.6)",fontSize:13,lineHeight:1.6}}>
          📞 สอบถามเพิ่มเติมได้ที่ครูคณัฐนันท์ (ห้องนาฏศิลป์)<br/>โรงเรียนวรราชาทินัดดามาตุวิทยา
        </div>
        <button onClick={()=>window.location.reload()} style={{background:"linear-gradient(135deg,#D4A017,#e8b520)",color:"#0F3D68",border:"none",padding:"14px 32px",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Sarabun',sans-serif",width:"100%"}}>สั่งจองใหม่</button>
      </div>
    </div>
  );
}
