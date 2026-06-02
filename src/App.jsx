import { useState, useEffect } from "react";

// ---- Supabase設定 ----
const SUPABASE_URL = "https://gxfcrgzhcjejraljluuv.supabase.co";
const SUPABASE_KEY = "sb_publishable_9LPtDr7H8rYU2O9u3n46UQ_xXsWVF3F";

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const db = {
  // ---- Companies ----
  async getCompanies() {
    const rows = await sbFetch("/companies?select=*&order=id.asc");
    return rows.map(r => ({
      id: r.id, name: r.name, categoryId: r.category_id,
      description: r.description, dates: r.dates || [],
      meetingPlace: r.meeting_place, items: r.items,
      parentVisit: r.parent_visit, parking: r.parking,
      notes: r.notes, extra: r.extra || {},
    }));
  },
  async addCompany(c) {
    const rows = await sbFetch("/companies", {
      method: "POST",
      body: JSON.stringify({
        name: c.name, category_id: c.categoryId,
        description: c.description, dates: c.dates || [],
        meeting_place: c.meetingPlace, items: c.items,
        parent_visit: c.parentVisit, parking: c.parking,
        notes: c.notes, extra: c.extra || {},
      }),
    });
    return rows[0];
  },
  async updateCompany(id, c) {
    await sbFetch(`/companies?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: c.name, category_id: c.categoryId,
        description: c.description, dates: c.dates || [],
        meeting_place: c.meetingPlace, items: c.items,
        parent_visit: c.parentVisit, parking: c.parking,
        notes: c.notes, extra: c.extra || {},
      }),
    });
  },
  async deleteCompany(id) {
    await sbFetch(`/companies?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" });
  },
  // ---- Categories ----
  async getCategories() {
    return sbFetch("/categories?select=*&order=sort_order.asc,id.asc");
  },
  async addCategory(c) {
    const rows = await sbFetch("/categories", {
      method: "POST",
      body: JSON.stringify({ id: "cat_"+Date.now(), label: c.label, emoji: c.emoji, color: c.color, sort_order: 0 }),
    });
    return rows[0];
  },
  async updateCategory(id, c) {
    await sbFetch(`/categories?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ label: c.label, emoji: c.emoji, color: c.color }),
    });
  },
  async deleteCategory(id) {
    await sbFetch(`/categories?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" });
  },
  // ---- Extra Fields ----
  async getExtraFields() {
    return sbFetch("/extra_fields?select=*&order=sort_order.asc,id.asc");
  },
  async addExtraField(f) {
    const rows = await sbFetch("/extra_fields", {
      method: "POST",
      body: JSON.stringify({ id: "field_"+Date.now(), label: f.label, type: f.type, icon: f.icon, sort_order: 0 }),
    });
    return rows[0];
  },
  async updateExtraField(id, f) {
    await sbFetch(`/extra_fields?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ label: f.label, type: f.type, icon: f.icon }),
    });
  },
  async deleteExtraField(id) {
    await sbFetch(`/extra_fields?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" });
  },
};

const ADMIN_PASSWORD = "hida2026";

const DEFAULT_CATEGORIES = [
  { id: "agri", label: "農業・林業", emoji: "🌾", color: "#4a7c59" },
  { id: "food", label: "食品・飲食", emoji: "🍱", color: "#c0764a" },
  { id: "craft", label: "ものづくり・工芸", emoji: "🪵", color: "#6b5b8f" },
  { id: "medical", label: "医療・福祉", emoji: "🏥", color: "#c44d58" },
  { id: "tourism", label: "観光・宿泊", emoji: "🏯", color: "#3b7bbf" },
  { id: "retail", label: "商業・販売", emoji: "🛍", color: "#c49a1a" },
  { id: "const", label: "建設・土木", emoji: "🏗", color: "#7a5c3a" },
  { id: "it", label: "IT・デザイン", emoji: "💻", color: "#2a8a8a" },
];

const FIXED_FIELDS = [
  { id: "dates",        label: "日時",         type: "dates",    icon: "📅" },
  { id: "meetingPlace", label: "集合場所",      type: "textarea", icon: "📍" },
  { id: "items",        label: "持ち物・服装",  type: "textarea", icon: "🎒" },
  { id: "parentVisit",  label: "保護者の見学",  type: "text",     icon: "👨‍👩‍👧" },
  { id: "parking",      label: "駐車場",        type: "text",     icon: "🚗" },
  { id: "notes",        label: "注意事項",      type: "textarea", icon: "⚠️" },
];

const EMOJI_OPTIONS = ["🌾","🍱","🪵","🏥","🏯","🛍","🏗","💻","🎨","🚗","⚡","🌊","🏔","🎭","📚","🔧","🌸","🐄","🍵","🏠","✂️","🎵","🏋","🌿","🦺","🎪","🏦","🧪"];
const COLOR_OPTIONS = ["#4a7c59","#c0764a","#6b5b8f","#c44d58","#3b7bbf","#c49a1a","#7a5c3a","#2a8a8a","#c44d9a","#4a6a9a","#9a4a2a","#2a7a5a"];
const FIELD_ICONS = ["📋","📌","💡","🔖","📎","🗓","👥","💰","⏰","📞","🏷","✅","🎯","📝","🔑"];

const EMPTY_COMPANY = { name:"", categoryId:"", description:"", dates:[""], meetingPlace:"", items:"", parentVisit:"", parking:"", notes:"", extra:{} };

// ---- CSV Import ----
async function importCSV(file, categories, extraFields) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result.replace(/^\uFEFF/, "");
        // 改行を含むセルに対応したCSVパーサー
        const parseCSV = (str) => {
          const rows = []; let row = []; let cur = ""; let inQ = false;
          for (let i = 0; i < str.length; i++) {
            const c = str[i]; const next = str[i+1];
            if (c === '"') {
              if (inQ && next === '"') { cur += '"'; i++; }
              else inQ = !inQ;
            } else if (c === ',' && !inQ) {
              row.push(cur); cur = "";
            } else if ((c === '\n' || (c === '\r' && next === '\n')) && !inQ) {
              if (c === '\r') i++;
              row.push(cur); cur = "";
              rows.push(row); row = [];
            } else {
              cur += c;
            }
          }
          if (cur || row.length) { row.push(cur); rows.push(row); }
          return rows;
        };
        const allRows = parseCSV(text).filter(r => r.some(c => c.trim()));
        if (allRows.length < 2) { reject(new Error("データが空です")); return; }
        const headers = allRows[0];
        const imported = [];
        for (let i = 1; i < allRows.length; i++) {
          const cols = allRows[i];
          if (cols.every(c => !c.trim())) continue;
          const catLabel = cols[headers.indexOf("カテゴリ")] || "";
          const cat = categories.find(c => c.label === catLabel);
          const extra = {};
          extraFields.forEach(f => { const idx = headers.indexOf(f.label); if (idx >= 0) extra[f.id] = cols[idx] || ""; });
          imported.push({
            name: cols[headers.indexOf("企業名")] || "",
            categoryId: cat?.id || "",
            description: cols[headers.indexOf("体験内容")] || "",
            dates: (cols[headers.indexOf("日時")] || "").split(" / ").filter(Boolean),
            meetingPlace: cols[headers.indexOf("集合場所")] || "",
            items: cols[headers.indexOf("持ち物・服装")] || "",
            parentVisit: cols[headers.indexOf("保護者の見学")] || "",
            parking: cols[headers.indexOf("駐車場")] || "",
            notes: cols[headers.indexOf("注意事項")] || "",
            extra,
          });
        }
        resolve(imported);
      } catch(e) { reject(e); }
    };
    reader.onerror = () => reject(new Error("ファイル読み込み失敗"));
    reader.readAsText(file, "utf-8");
  });
}

// ---- CSV Export ----
function exportCSV(companies, categories, extraFields) {
  const getCat = id => categories.find(c => c.id === id) || { label: id||"未設定" };
  // 改行をスペースに置換して安全にする
  const safe = v => String(v||"").replace(/\r?\n/g, " ").replace(/\r/g, " ");
  const fixedHeaders = ["企業名","カテゴリ","体験内容","日時","集合場所","持ち物・服装","保護者の見学","駐車場","注意事項"];
  const headers = [...fixedHeaders, ...extraFields.map(f => f.label)];
  const rows = companies.map(c => [
    safe(c.name), getCat(c.categoryId).label, safe(c.description),
    safe((c.dates||[]).join(" / ")), safe(c.meetingPlace), safe(c.items),
    safe(c.parentVisit), safe(c.parking), safe(c.notes),
    ...extraFields.map(f => safe((c.extra||{})[f.id])),
  ]);
  const escape = v => `"${String(v).replace(/"/g,'""')}"`;
  const csv = [headers,...rows].map(r=>r.map(escape).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `お仕事発見隊_企業データ_${new Date().toLocaleDateString("ja-JP").replace(/\//g,"-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- Icons ----
const SearchIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const BackIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EditIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const LockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

export default function App() {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [extraFields, setExtraFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("home");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [adminTab, setAdminTab] = useState("companies");
  const [editTarget, setEditTarget] = useState(undefined);
  const [formData, setFormData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [catEditTarget, setCatEditTarget] = useState(undefined);
  const [catForm, setCatForm] = useState({});
  const [catDeleteConfirm, setCatDeleteConfirm] = useState(null);
  const [fieldEditTarget, setFieldEditTarget] = useState(undefined);
  const [fieldForm, setFieldForm] = useState({});
  const [fieldDeleteConfirm, setFieldDeleteConfirm] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null); // プレビューデータ
  const [importMode, setImportMode] = useState("add"); // add | replace

  const loadAll = async () => {
    try {
      setLoading(true); setError(null);
      const [cos, cats, efs] = await Promise.all([db.getCompanies(), db.getCategories(), db.getExtraFields()]);
      setCompanies(cos);
      setCategories(cats.length ? cats : DEFAULT_CATEGORIES);
      setExtraFields(efs);
      // カテゴリが空なら初期データを投入
      if (!cats.length) {
        for (const c of DEFAULT_CATEGORIES) {
          await sbFetch("/categories", { method:"POST", body: JSON.stringify(c) }).catch(()=>{});
        }
      }
    } catch(e) {
      setError("データの読み込みに失敗しました: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const getCat = id => categories.find(c => c.id === id) || { label: id||"未設定", emoji:"🏢", color:"#888" };
  const flash = msg => { setSaveMsg(msg); setTimeout(()=>setSaveMsg(""), 2000); };

  const filtered = companies.filter(c => {
    const matchCat = selectedCategoryId ? c.categoryId === selectedCategoryId : true;
    const matchText = searchText ? c.name.includes(searchText)||c.description.includes(searchText) : true;
    return matchCat && matchText;
  });

  const handleLogin = () => {
    if (loginPass === ADMIN_PASSWORD) { setLoginPass(""); setLoginError(false); setView("admin"); }
    else setLoginError(true);
  };

  // ---- Company ----
  const startEdit = c => {
    setEditTarget(c ? c.id : null);
    setFormData(c ? {...c, dates:[...(c.dates||[""])], extra:{...(c.extra||{})}} : {...EMPTY_COMPANY, categoryId:categories[0]?.id||""});
  };
  const updateDate = (i,val) => { const d=[...(formData.dates||[""])]; d[i]=val; setFormData({...formData,dates:d}); };
  const addDate = () => setFormData({...formData, dates:[...(formData.dates||[""]),""]}); 
  const removeDate = i => { const d=(formData.dates||[""]).filter((_,idx)=>idx!==i); setFormData({...formData,dates:d.length?d:[""]}); };

  const saveCompany = async () => {
    setSaving(true);
    try {
      const cleaned = {...formData, dates:(formData.dates||[""]).filter(d=>d.trim())};
      if (editTarget===null) {
        const newC = await db.addCompany(cleaned);
        setCompanies([...companies, {...cleaned, id:newC.id}]);
      } else {
        await db.updateCompany(editTarget, cleaned);
        setCompanies(companies.map(c=>c.id===editTarget?{...cleaned,id:editTarget}:c));
      }
      setEditTarget(undefined); flash("保存しました！");
    } catch(e) { flash("エラー: "+e.message); }
    setSaving(false);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await importCSV(file, categories, extraFields);
      setImportPreview(data);
    } catch(err) { flash("読み込みエラー: " + err.message); }
    e.target.value = "";
  };

  const executeImport = async () => {
    if (!importPreview) return;
    setImporting(true);
    try {
      if (importMode === "replace") {
        for (const c of companies) { await db.deleteCompany(c.id).catch(()=>{}); }
      }
      const added = [];
      for (const c of importPreview) {
        const newC = await db.addCompany(c);
        added.push({...c, id: newC.id});
      }
      setCompanies(importMode === "replace" ? added : [...companies, ...added]);
      setImportPreview(null);
      flash(`${added.length}件インポートしました！`);
    } catch(err) { flash("インポートエラー: " + err.message); }
    setImporting(false);
  };

  const deleteCompany = async id => {
    try { await db.deleteCompany(id); setCompanies(companies.filter(c=>c.id!==id)); }
    catch(e) { flash("エラー: "+e.message); }
    setDeleteConfirm(null);
  };

  // ---- Category ----
  const startCatEdit = cat => { setCatEditTarget(cat?cat.id:null); setCatForm(cat?{...cat}:{label:"",emoji:"🏢",color:"#4a7c59"}); };
  const saveCat = async () => {
    if (!catForm.label.trim()) return;
    setSaving(true);
    try {
      if (catEditTarget===null) {
        const newC = await db.addCategory(catForm);
        setCategories([...categories, newC]);
      } else {
        await db.updateCategory(catEditTarget, catForm);
        setCategories(categories.map(c=>c.id===catEditTarget?{...catForm,id:catEditTarget}:c));
      }
      setCatEditTarget(undefined); flash("保存しました！");
    } catch(e) { flash("エラー: "+e.message); }
    setSaving(false);
  };
  const deleteCat = async id => {
    try { await db.deleteCategory(id); setCategories(categories.filter(c=>c.id!==id)); }
    catch(e) { flash("エラー: "+e.message); }
    setCatDeleteConfirm(null);
  };

  // ---- Extra Fields ----
  const startFieldEdit = f => { setFieldEditTarget(f?f.id:null); setFieldForm(f?{...f}:{label:"",type:"text",icon:"📋"}); };
  const saveField = async () => {
    if (!fieldForm.label.trim()) return;
    setSaving(true);
    try {
      if (fieldEditTarget===null) {
        const newF = await db.addExtraField(fieldForm);
        setExtraFields([...extraFields, newF]);
      } else {
        await db.updateExtraField(fieldEditTarget, fieldForm);
        setExtraFields(extraFields.map(f=>f.id===fieldEditTarget?{...fieldForm,id:fieldEditTarget}:f));
      }
      setFieldEditTarget(undefined); flash("保存しました！");
    } catch(e) { flash("エラー: "+e.message); }
    setSaving(false);
  };
  const deleteField = async id => {
    try {
      await db.deleteExtraField(id);
      setExtraFields(extraFields.filter(f=>f.id!==id));
      // 企業データからも削除
      const updated = companies.map(c=>{ const extra={...(c.extra||{})}; delete extra[id]; return {...c,extra}; });
      for (const c of updated) { await db.updateCompany(c.id, c).catch(()=>{}); }
      setCompanies(updated);
    } catch(e) { flash("エラー: "+e.message); }
    setFieldDeleteConfirm(null);
  };

  if (loading) return <div style={S.center}><div style={S.spinner}/><p style={{color:"#888"}}>読み込み中...</p></div>;
  if (error) return <div style={S.center}><p style={{color:"#e05",padding:20,textAlign:"center"}}>{error}</p><button style={S.saveBtn} onClick={loadAll}>再読み込み</button></div>;

  // ========== LOGIN ==========
  if (view==="admin-login") return (
    <div style={S.loginWrap}>
      <div style={S.loginCard}>
        <div style={S.loginIconWrap}><LockIcon/></div>
        <h2 style={S.loginTitle}>管理者ログイン</h2>
        <p style={S.loginSub}>お仕事発見隊　管理システム</p>
        <input style={{...S.loginInput,borderColor:loginError?"#e05":"#d0c9b8"}}
          type="password" placeholder="パスワードを入力" value={loginPass}
          onChange={e=>{setLoginPass(e.target.value);setLoginError(false);}}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        {loginError && <p style={S.loginError}>パスワードが違います</p>}
        <button style={S.loginBtn} onClick={handleLogin}>ログイン</button>
        <button style={S.loginBack} onClick={()=>setView("home")}>← 戻る</button>
      </div>
    </div>
  );

  // ========== ADMIN ==========
  if (view==="admin") return (
    <div style={S.adminWrap}>
      <div style={S.adminHeader}>
        <div>
          <p style={S.adminLabel}>管理画面</p>
          <h1 style={S.adminTitle}>お仕事発見隊　管理システム</h1>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {saveMsg && <span style={S.saveMsg}>{saveMsg}</span>}
          <button style={S.csvBtn} onClick={()=>exportCSV(companies,categories,extraFields)}>📥 CSV書き出し</button>
          <label style={S.importBtn}>
            📤 CSVインポート
            <input type="file" accept=".csv" style={{display:"none"}} onChange={handleImportFile}/>
          </label>
          <button style={S.logoutBtn} onClick={()=>setView("home")}>← サイトへ戻る</button>
          <button style={S.logoutBtn2} onClick={()=>setView("home")}>ログアウト</button>
        </div>
      </div>

      <div style={S.tabs}>
        {[{key:"companies",label:"🏢 企業"},{key:"categories",label:"🏷 カテゴリ"},{key:"fields",label:"📋 項目"}].map(t=>(
          <button key={t.key} style={{...S.tab,...(adminTab===t.key?S.tabActive:{})}}
            onClick={()=>{setAdminTab(t.key);setEditTarget(undefined);setCatEditTarget(undefined);setFieldEditTarget(undefined);}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== 企業タブ ===== */}
      {adminTab==="companies" && (
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
            <button style={S.addBtn} onClick={()=>startEdit(null)}><PlusIcon/> 企業を追加</button>
          </div>
          {editTarget!==undefined && (
            <div style={S.formCard}>
              <h3 style={S.formTitle}>{editTarget===null?"新規追加":"企業を編集"}</h3>
              <div style={S.formGrid}>
                <FR label="企業名"><input style={S.inp} value={formData.name||""} onChange={e=>setFormData({...formData,name:e.target.value})}/></FR>
                <FR label="カテゴリ">
                  <select style={S.inp} value={formData.categoryId||""} onChange={e=>setFormData({...formData,categoryId:e.target.value})}>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                </FR>
                <FR label="体験内容"><input style={S.inp} value={formData.description||""} onChange={e=>setFormData({...formData,description:e.target.value})}/></FR>
                {FIXED_FIELDS.map(f=>{
                  if(f.type==="dates") return (
                    <FR key={f.id} label={`${f.icon} ${f.label}`}>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {(formData.dates||[""]).map((d,i)=>(
                          <div key={i} style={{display:"flex",gap:6}}>
                            <input style={{...S.inp,flex:1}} value={d} placeholder={`例: ① 7/12(土) 9:00-12:00`} onChange={e=>updateDate(i,e.target.value)}/>
                            {(formData.dates||[""]).length>1 && <button style={S.removeDateBtn} onClick={()=>removeDate(i)}>✕</button>}
                          </div>
                        ))}
                        <button style={S.addDateBtn} onClick={addDate}><PlusIcon/> 日時を追加</button>
                      </div>
                    </FR>
                  );
                  if(f.type==="textarea") return <FR key={f.id} label={`${f.icon} ${f.label}`}><textarea style={S.ta} value={formData[f.id]||""} onChange={e=>setFormData({...formData,[f.id]:e.target.value})}/></FR>;
                  return <FR key={f.id} label={`${f.icon} ${f.label}`}><input style={S.inp} value={formData[f.id]||""} onChange={e=>setFormData({...formData,[f.id]:e.target.value})}/></FR>;
                })}
                {extraFields.length>0 && (
                  <div style={S.extraSection}>
                    <p style={S.extraSectionLabel}>追加項目</p>
                    {extraFields.map(f=>(
                      <FR key={f.id} label={`${f.icon} ${f.label}`}>
                        {f.type==="textarea"
                          ? <textarea style={S.ta} value={(formData.extra||{})[f.id]||""} onChange={e=>setFormData({...formData,extra:{...(formData.extra||{}),[f.id]:e.target.value}})}/>
                          : <input style={S.inp} value={(formData.extra||{})[f.id]||""} onChange={e=>setFormData({...formData,extra:{...(formData.extra||{}),[f.id]:e.target.value}})}/>}
                      </FR>
                    ))}
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:10,marginTop:18}}>
                <button style={S.saveBtn} onClick={saveCompany} disabled={saving}>{saving?"保存中...":"保存"}</button>
                <button style={S.cancelBtn} onClick={()=>setEditTarget(undefined)}>キャンセル</button>
              </div>
            </div>
          )}
          <div style={S.adminList}>
            {companies.map(c=>{
              const cat=getCat(c.categoryId);
              return (
                <div key={c.id} style={S.adminRow}>
                  <span style={{...S.catBadge,background:cat.color+"22",color:cat.color}}>{cat.emoji} {cat.label}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={S.adminName}>{c.name}</p>
                    <p style={S.adminDesc}>{c.description}</p>
                  </div>
                  <div style={{display:"flex",gap:7,flexShrink:0}}>
                    <button style={S.editBtn} onClick={()=>startEdit(c)}><EditIcon/> 編集</button>
                    <button style={S.deleteBtn} onClick={()=>setDeleteConfirm(c.id)}><TrashIcon/> 削除</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== カテゴリタブ ===== */}
      {adminTab==="categories" && (
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
            <button style={S.addBtn} onClick={()=>startCatEdit(null)}><PlusIcon/> カテゴリを追加</button>
          </div>
          {catEditTarget!==undefined && (
            <div style={S.formCard}>
              <h3 style={S.formTitle}>{catEditTarget===null?"新規カテゴリ":"カテゴリを編集"}</h3>
              <div style={S.formGrid}>
                <FR label="カテゴリ名"><input style={S.inp} value={catForm.label||""} onChange={e=>setCatForm({...catForm,label:e.target.value})}/></FR>
                <FR label="絵文字"><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{EMOJI_OPTIONS.map(em=><button key={em} onClick={()=>setCatForm({...catForm,emoji:em})} style={{...S.emojiBtn,background:catForm.emoji===em?"#2a5c3f":"#f0ede4",color:catForm.emoji===em?"#fff":"#333"}}>{em}</button>)}</div></FR>
                <FR label="カラー"><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{COLOR_OPTIONS.map(col=><button key={col} onClick={()=>setCatForm({...catForm,color:col})} style={{...S.colorBtn,background:col,outline:catForm.color===col?"3px solid #333":"none"}}/>)}</div></FR>
                <FR label="プレビュー"><span style={{...S.catBadge,background:(catForm.color||"#888")+"22",color:catForm.color||"#888"}}>{catForm.emoji} {catForm.label||"カテゴリ名"}</span></FR>
              </div>
              <div style={{display:"flex",gap:10,marginTop:18}}>
                <button style={S.saveBtn} onClick={saveCat} disabled={saving}>{saving?"保存中...":"保存"}</button>
                <button style={S.cancelBtn} onClick={()=>setCatEditTarget(undefined)}>キャンセル</button>
              </div>
            </div>
          )}
          <div style={S.adminList}>
            {categories.map(cat=>(
              <div key={cat.id} style={S.adminRow}>
                <span style={{...S.catBadge,background:cat.color+"22",color:cat.color,fontSize:14}}>{cat.emoji} {cat.label}</span>
                <p style={{fontSize:12,color:"#888",margin:0}}>{companies.filter(c=>c.categoryId===cat.id).length}件</p>
                <div style={{display:"flex",gap:7,marginLeft:"auto"}}>
                  <button style={S.editBtn} onClick={()=>startCatEdit(cat)}><EditIcon/> 編集</button>
                  <button style={S.deleteBtn} onClick={()=>setCatDeleteConfirm(cat.id)}><TrashIcon/> 削除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 項目タブ ===== */}
      {adminTab==="fields" && (
        <div>
          <div style={S.fixedFieldsCard}>
            <p style={S.fixedFieldsTitle}>🔒 固定項目（削除不可）</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{FIXED_FIELDS.map(f=><span key={f.id} style={S.fixedBadge}>{f.icon} {f.label}</span>)}</div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <p style={{margin:0,fontSize:14,fontWeight:700,color:"#1a1a1a"}}>追加項目</p>
            <button style={S.addBtn} onClick={()=>startFieldEdit(null)}><PlusIcon/> 項目を追加</button>
          </div>
          {fieldEditTarget!==undefined && (
            <div style={S.formCard}>
              <h3 style={S.formTitle}>{fieldEditTarget===null?"新規項目":"項目を編集"}</h3>
              <div style={S.formGrid}>
                <FR label="項目名"><input style={S.inp} value={fieldForm.label||""} onChange={e=>setFieldForm({...fieldForm,label:e.target.value})} placeholder="例: 申込み締切"/></FR>
                <FR label="入力タイプ"><select style={S.inp} value={fieldForm.type||"text"} onChange={e=>setFieldForm({...fieldForm,type:e.target.value})}><option value="text">1行テキスト</option><option value="textarea">複数行テキスト</option></select></FR>
                <FR label="アイコン"><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{FIELD_ICONS.map(ic=><button key={ic} onClick={()=>setFieldForm({...fieldForm,icon:ic})} style={{...S.emojiBtn,background:fieldForm.icon===ic?"#2a5c3f":"#f0ede4",color:fieldForm.icon===ic?"#fff":"#333"}}>{ic}</button>)}</div></FR>
              </div>
              <div style={{display:"flex",gap:10,marginTop:18}}>
                <button style={S.saveBtn} onClick={saveField} disabled={saving}>{saving?"保存中...":"保存"}</button>
                <button style={S.cancelBtn} onClick={()=>setFieldEditTarget(undefined)}>キャンセル</button>
              </div>
            </div>
          )}
          {extraFields.length===0 && fieldEditTarget===undefined && <div style={S.emptyFieldState}><p style={{margin:0,color:"#aaa",fontSize:14}}>追加項目はまだありません</p></div>}
          <div style={S.adminList}>
            {extraFields.map(f=>(
              <div key={f.id} style={S.adminRow}>
                <span style={{fontSize:20}}>{f.icon}</span>
                <div style={{flex:1}}><p style={S.adminName}>{f.label}</p><p style={S.adminDesc}>{f.type==="textarea"?"複数行":"1行"}</p></div>
                <div style={{display:"flex",gap:7}}>
                  <button style={S.editBtn} onClick={()=>startFieldEdit(f)}><EditIcon/> 編集</button>
                  <button style={S.deleteBtn} onClick={()=>setFieldDeleteConfirm(f.id)}><TrashIcon/> 削除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {importPreview && <Overlay>
        <p style={S.confirmText}>CSVインポート確認</p>
        <p style={{fontSize:13,color:"#444",margin:"0 0 12px"}}>{importPreview.length}件のデータが見つかりました</p>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
          <button style={{...S.cancelBtn,background:importMode==="add"?"#2a5c3f":"#f0ede4",color:importMode==="add"?"#fff":"#555"}} onClick={()=>setImportMode("add")}>追加する</button>
          <button style={{...S.cancelBtn,background:importMode==="replace"?"#c00":"#f0ede4",color:importMode==="replace"?"#fff":"#555"}} onClick={()=>setImportMode("replace")}>全て置き換え</button>
        </div>
        {importMode==="replace" && <p style={{fontSize:12,color:"#e05",margin:"0 0 12px"}}>⚠️ 既存の企業データが全て削除されます</p>}
        <div style={{maxHeight:160,overflowY:"auto",marginBottom:16,textAlign:"left"}}>
          {importPreview.map((c,i)=><p key={i} style={{fontSize:12,margin:"2px 0",color:"#444"}}>・{c.name || "（名前なし）"}</p>)}
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button style={S.saveBtn} onClick={executeImport} disabled={importing}>{importing?"処理中...":"インポートする"}</button>
          <button style={S.cancelBtn} onClick={()=>setImportPreview(null)}>キャンセル</button>
        </div>
      </Overlay>}

      {deleteConfirm && <Overlay><p style={S.confirmText}>本当に削除しますか？</p><p style={S.confirmName}>{companies.find(c=>c.id===deleteConfirm)?.name}</p><div style={{display:"flex",gap:12,justifyContent:"center"}}><button style={S.deleteConfirmBtn} onClick={()=>deleteCompany(deleteConfirm)}>削除する</button><button style={S.cancelBtn} onClick={()=>setDeleteConfirm(null)}>キャンセル</button></div></Overlay>}
      {catDeleteConfirm && <Overlay><p style={S.confirmText}>カテゴリを削除しますか？</p><p style={S.confirmName}>{categories.find(c=>c.id===catDeleteConfirm)?.label}</p><p style={{fontSize:12,color:"#e05",margin:"0 0 16px"}}>※このカテゴリの企業はカテゴリなしになります</p><div style={{display:"flex",gap:12,justifyContent:"center"}}><button style={S.deleteConfirmBtn} onClick={()=>deleteCat(catDeleteConfirm)}>削除する</button><button style={S.cancelBtn} onClick={()=>setCatDeleteConfirm(null)}>キャンセル</button></div></Overlay>}
      {fieldDeleteConfirm && <Overlay><p style={S.confirmText}>項目を削除しますか？</p><p style={S.confirmName}>{extraFields.find(f=>f.id===fieldDeleteConfirm)?.label}</p><p style={{fontSize:12,color:"#e05",margin:"0 0 16px"}}>※全企業のこの項目データも削除されます</p><div style={{display:"flex",gap:12,justifyContent:"center"}}><button style={S.deleteConfirmBtn} onClick={()=>deleteField(fieldDeleteConfirm)}>削除する</button><button style={S.cancelBtn} onClick={()=>setFieldDeleteConfirm(null)}>キャンセル</button></div></Overlay>}
    </div>
  );

  // ========== DETAIL ==========
  if (view==="detail" && selectedCompany) {
    const c=selectedCompany; const cat=getCat(c.categoryId);
    const allFields=[
      ...FIXED_FIELDS.map(f=>({label:`${f.icon} ${f.label}`,val:f.type==="dates"?(c.dates?.length?c.dates.join("\n"):""):(c[f.id]||"")})),
      ...extraFields.map(f=>({label:`${f.icon} ${f.label}`,val:(c.extra||{})[f.id]||""})),
    ].filter(r=>r.val.trim());
    return (
      <div style={S.detailWrap}>
        <div style={{...S.detailHeader,background:cat.color}}>
          <button style={S.backBtn} onClick={()=>setView("home")}><BackIcon/></button>
          <span style={S.detailCat}>{cat.emoji} {cat.label}</span>
          <h1 style={S.detailName}>{c.name}</h1>
          <p style={S.detailDesc}>{c.description}</p>
        </div>
        <div style={S.detailBody}>
          {allFields.map(({label,val})=>(
            <div key={label} style={S.detailCard}>
              <p style={{...S.detailCardLabel,color:cat.color}}>{label}</p>
              <p style={S.detailCardVal}>{val}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ========== HOME ==========
  return (
    <div style={S.homeWrap}>
      <div style={S.homeHeader}>
        <div>
          <p style={S.homeSubtitle}>飛騨高山フューチャープロジェクト</p>
          <h1 style={S.homeTitle}>お仕事発見隊</h1>
          <p style={S.homeTagline}>体験企業を探してみよう！</p>
        </div>
        <button style={S.adminAccessBtn} onClick={()=>setView("admin-login")}>管理者</button>
      </div>
      <div style={S.searchWrap}>
        <div style={S.searchBox}>
          <SearchIcon/>
          <input style={S.searchInput} placeholder="企業名・体験内容で検索..." value={searchText} onChange={e=>setSearchText(e.target.value)}/>
        </div>
      </div>
      <div style={S.catScroll}>
        <button style={{...S.catChip,...(selectedCategoryId===null?S.catChipActive:{})}} onClick={()=>setSelectedCategoryId(null)}>すべて</button>
        {categories.map(cat=>(
          <button key={cat.id} style={{...S.catChip,...(selectedCategoryId===cat.id?{background:cat.color,color:"#fff",borderColor:cat.color}:{})}} onClick={()=>setSelectedCategoryId(selectedCategoryId===cat.id?null:cat.id)}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>
      <p style={S.countText}>{filtered.length}件の企業</p>
      <div style={S.cardGrid}>
        {filtered.length===0 && <div style={S.emptyState}><p>該当する企業が見つかりません</p></div>}
        {filtered.map(c=>{
          const cat=getCat(c.categoryId);
          return (
            <button key={c.id} style={S.card} onClick={()=>{setSelectedCompany(c);setView("detail");}}>
              <div style={{...S.cardAccent,background:cat.color}}/>
              <div style={S.cardBody}>
                <span style={{...S.catBadge,color:cat.color,background:cat.color+"18",marginBottom:8,display:"inline-block"}}>{cat.emoji} {cat.label}</span>
                <h2 style={S.cardName}>{c.name}</h2>
                <p style={S.cardDesc}>{c.description}</p>
                {c.dates?.length>0 && <p style={S.cardDate}>📅 {c.dates[0]}{c.dates.length>1?` 他${c.dates.length-1}日程`:""}</p>}
              </div>
              <div style={{...S.cardArrow,color:cat.color}}>›</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FR({label,children}){return <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:12,fontWeight:600,color:"#666"}}>{label}</label>{children}</div>;}
function Overlay({children}){return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}><div style={{background:"#fff",borderRadius:16,padding:32,textAlign:"center",maxWidth:320,width:"90%"}}>{children}</div></div>;}

const S = {
  center:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:16},
  spinner:{width:36,height:36,border:"3px solid #e8e0d0",borderTop:"3px solid #4a7c59",borderRadius:"50%",animation:"spin 0.8s linear infinite"},
  loginWrap:{minHeight:"100vh",background:"#f5f0e8",display:"flex",alignItems:"center",justifyContent:"center"},
  loginCard:{background:"#fff",borderRadius:16,padding:"40px 36px",maxWidth:380,width:"90%",boxShadow:"0 8px 32px rgba(0,0,0,0.10)",textAlign:"center"},
  loginIconWrap:{width:52,height:52,background:"#f0ede4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"#555"},
  loginTitle:{fontSize:22,fontWeight:700,color:"#2a2a2a",margin:"0 0 4px",fontFamily:"serif"},
  loginSub:{fontSize:13,color:"#888",margin:"0 0 24px"},
  loginInput:{width:"100%",padding:"12px 14px",border:"1.5px solid #d0c9b8",borderRadius:10,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:8},
  loginError:{color:"#e05",fontSize:13,margin:"0 0 12px"},
  loginBtn:{width:"100%",padding:12,background:"#2a5c3f",color:"#fff",border:"none",borderRadius:10,fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10},
  loginBack:{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:13},
  adminWrap:{minHeight:"100vh",background:"#f5f0e8",padding:"22px 14px"},
  adminHeader:{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18,flexWrap:"wrap",gap:10},
  adminLabel:{fontSize:11,color:"#2a5c3f",fontWeight:700,margin:"0 0 4px",textTransform:"uppercase",letterSpacing:1},
  adminTitle:{fontSize:18,fontWeight:800,color:"#1a1a1a",margin:0,fontFamily:"serif"},
  importBtn:{padding:"8px 14px",background:"#e3f2fd",border:"1.5px solid #90caf9",borderRadius:10,cursor:"pointer",fontSize:12,color:"#1565c0",fontWeight:600},
  csvBtn:{padding:"8px 14px",background:"#e8f5e9",border:"1.5px solid #a5d6a7",borderRadius:10,cursor:"pointer",fontSize:12,color:"#2a5c3f",fontWeight:600},
  logoutBtn:{padding:"8px 14px",background:"#fff",border:"1.5px solid #ddd",borderRadius:10,cursor:"pointer",fontSize:12,color:"#2a5c3f",fontWeight:600},
  logoutBtn2:{padding:"8px 14px",background:"#fff",border:"1.5px solid #ddd",borderRadius:10,cursor:"pointer",fontSize:12,color:"#888"},
  saveMsg:{color:"#2a5c3f",fontWeight:600,fontSize:13},
  tabs:{display:"flex",gap:3,marginBottom:18,background:"#e8e0d0",borderRadius:12,padding:3},
  tab:{flex:1,padding:"9px 8px",border:"none",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600,background:"transparent",color:"#666"},
  tabActive:{background:"#fff",color:"#2a5c3f",boxShadow:"0 2px 6px rgba(0,0,0,0.08)"},
  addBtn:{display:"flex",alignItems:"center",gap:5,padding:"9px 16px",background:"#2a5c3f",color:"#fff",border:"none",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:13},
  adminList:{display:"flex",flexDirection:"column",gap:7},
  adminRow:{background:"#fff",borderRadius:12,padding:"11px 14px",display:"flex",alignItems:"center",gap:9,flexWrap:"wrap",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},
  adminName:{fontWeight:700,fontSize:13,color:"#1a1a1a",margin:"0 0 2px"},
  adminDesc:{fontSize:11,color:"#888",margin:0},
  editBtn:{display:"flex",alignItems:"center",gap:3,padding:"5px 10px",background:"#f0ede4",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,color:"#444"},
  deleteBtn:{display:"flex",alignItems:"center",gap:3,padding:"5px 10px",background:"#fde8e8",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,color:"#c00"},
  formCard:{background:"#fff",borderRadius:14,padding:18,marginBottom:18,boxShadow:"0 4px 16px rgba(0,0,0,0.08)"},
  formTitle:{fontSize:14,fontWeight:700,margin:"0 0 14px",color:"#1a1a1a"},
  formGrid:{display:"flex",flexDirection:"column",gap:11},
  inp:{padding:"8px 11px",border:"1.5px solid #ddd",borderRadius:8,fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"},
  ta:{padding:"8px 11px",border:"1.5px solid #ddd",borderRadius:8,fontSize:13,outline:"none",minHeight:56,resize:"vertical",width:"100%",boxSizing:"border-box"},
  saveBtn:{padding:"9px 22px",background:"#2a5c3f",color:"#fff",border:"none",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:13},
  cancelBtn:{padding:"9px 18px",background:"#f0ede4",color:"#555",border:"none",borderRadius:10,cursor:"pointer",fontSize:13},
  addDateBtn:{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",background:"#f0ede4",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,color:"#2a5c3f",fontWeight:600,width:"fit-content"},
  removeDateBtn:{padding:"0 9px",background:"#fde8e8",border:"none",borderRadius:7,cursor:"pointer",fontSize:13,color:"#c00"},
  emojiBtn:{width:34,height:34,border:"none",borderRadius:7,cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"},
  colorBtn:{width:26,height:26,border:"2px solid transparent",borderRadius:"50%",cursor:"pointer",outlineOffset:2},
  extraSection:{borderTop:"1.5px dashed #e0d8cc",paddingTop:12,display:"flex",flexDirection:"column",gap:11},
  extraSectionLabel:{fontSize:11,fontWeight:700,color:"#aaa",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1},
  fixedFieldsCard:{background:"#f7f3ec",borderRadius:12,padding:"12px 16px",marginBottom:18,border:"1.5px dashed #d8d0c0"},
  fixedFieldsTitle:{fontSize:12,fontWeight:700,color:"#888",margin:"0 0 10px"},
  fixedBadge:{padding:"4px 10px",borderRadius:20,background:"#e8e0d0",fontSize:12,color:"#666"},
  emptyFieldState:{textAlign:"center",padding:"32px 20px",background:"#fff",borderRadius:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},
  confirmText:{fontSize:15,fontWeight:600,margin:"0 0 8px",color:"#1a1a1a"},
  confirmName:{fontSize:13,color:"#888",margin:"0 0 18px"},
  deleteConfirmBtn:{padding:"9px 22px",background:"#cc0000",color:"#fff",border:"none",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:13},
  detailWrap:{minHeight:"100vh",background:"#f5f0e8"},
  detailHeader:{padding:"30px 18px 22px",color:"#fff",position:"relative"},
  backBtn:{position:"absolute",top:13,left:13,background:"rgba(255,255,255,0.2)",border:"none",borderRadius:9,padding:7,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center"},
  detailCat:{fontSize:11,opacity:0.85,display:"block",marginBottom:5,paddingTop:4},
  detailName:{fontSize:22,fontWeight:800,margin:"0 0 5px",fontFamily:"serif"},
  detailDesc:{fontSize:13,opacity:0.85,margin:0},
  detailBody:{padding:"14px",display:"flex",flexDirection:"column",gap:9},
  detailCard:{background:"#fff",borderRadius:13,padding:"13px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},
  detailCardLabel:{fontSize:11,fontWeight:700,margin:"0 0 5px"},
  detailCardVal:{fontSize:13,color:"#2a2a2a",margin:0,lineHeight:1.7,whiteSpace:"pre-line"},
  homeWrap:{minHeight:"100vh",background:"#f5f0e8",paddingBottom:40},
  homeHeader:{background:"#2a5c3f",color:"#fff",padding:"26px 16px 22px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"},
  homeSubtitle:{fontSize:10,opacity:0.7,margin:"0 0 4px",letterSpacing:1},
  homeTitle:{fontSize:24,fontWeight:900,margin:"0 0 3px",fontFamily:"serif"},
  homeTagline:{fontSize:12,opacity:0.85,margin:0},
  adminAccessBtn:{background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.35)",color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:11,fontWeight:600},
  searchWrap:{padding:"13px 13px 0"},
  searchBox:{background:"#fff",borderRadius:11,display:"flex",alignItems:"center",gap:9,padding:"10px 13px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",color:"#888"},
  searchInput:{border:"none",outline:"none",fontSize:13,flex:1,background:"transparent",color:"#2a2a2a"},
  catScroll:{display:"flex",gap:6,padding:"11px 13px",overflowX:"auto",scrollbarWidth:"none"},
  catChip:{whiteSpace:"nowrap",padding:"6px 12px",borderRadius:20,border:"1.5px solid #ddd",background:"#fff",cursor:"pointer",fontSize:11,fontWeight:500,color:"#555"},
  catChipActive:{background:"#2a5c3f",color:"#fff",borderColor:"#2a5c3f"},
  countText:{padding:"0 15px 5px",fontSize:11,color:"#999"},
  cardGrid:{display:"flex",flexDirection:"column",gap:8,padding:"0 13px"},
  emptyState:{textAlign:"center",padding:40,color:"#aaa"},
  card:{background:"#fff",borderRadius:12,display:"flex",alignItems:"stretch",boxShadow:"0 2px 10px rgba(0,0,0,0.07)",cursor:"pointer",border:"none",textAlign:"left",overflow:"hidden",padding:0},
  cardAccent:{width:5,flexShrink:0},
  cardBody:{flex:1,padding:"13px 11px"},
  cardName:{fontSize:15,fontWeight:800,margin:"0 0 3px",color:"#1a1a1a",fontFamily:"serif"},
  cardDesc:{fontSize:11,color:"#666",margin:"0 0 6px"},
  cardDate:{fontSize:10,color:"#888"},
  cardArrow:{fontSize:24,padding:"13px 11px",display:"flex",alignItems:"center",fontWeight:300},
  catBadge:{padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700},
};
