import { loadDraft, createAutoSaver } from './db.js';

const $ = (selector) => document.querySelector(selector);
const state = { id: `draft-${Date.now()}`, title: '', author: '', category: 'Novel', chapters: [], activeChapter: 0 };
const makeId = () => `ch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const snapshot = () => JSON.parse(JSON.stringify(state));
const setStatus = (text) => { $('#saveStatus').textContent = text; };
const scheduleSave = createAutoSaver(snapshot, setStatus, 3000);

async function loadTemplate(category) {
  try {
    const response = await fetch(`assets/templates/${category.toLowerCase()}.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Template not found');
    return await response.json();
  } catch (error) {
    return { title: `নতুন ${category} বই`, category, chapters: [
      { id: makeId(), title: 'প্রাক-কথা', content: '' },
      { id: makeId(), title: 'অধ্যায় ১', content: '' },
      { id: makeId(), title: 'উপসংহার', content: '' }
    ] };
  }
}
const normalize = (template) => (template.chapters || []).map((c) => ({ id: c.id || makeId(), title: c.title || 'অধ্যায়', content: c.content || '' }));

function syncActive() { const c = state.chapters[state.activeChapter]; if (c) { c.title = $('#chapterTitle').value; c.content = $('#chapterContent').value; } }
function preview() { $('#livePreview').innerHTML = `<h2>${escapeHTML($('#chapterTitle').value || 'অধ্যায়ের নাম')}</h2><p>${escapeHTML($('#chapterContent').value || 'এখানে প্রিভিউ দেখা যাবে...').replace(/\n/g,'<br>')}</p>`; }
function renderList() {
  $('#chapterList').innerHTML = state.chapters.map((c,i) => `<li class="chapter-item" draggable="true" data-index="${i}"><button class="chapter-select ${i===state.activeChapter?'active':''}" type="button">${i+1}. ${escapeHTML(c.title)}</button><button class="rename-chapter" type="button">✎</button><button class="delete-chapter" type="button">×</button></li>`).join('');
  $('#chapterList').querySelectorAll('.chapter-select').forEach((b,i)=>b.onclick=()=>selectChapter(i));
  $('#chapterList').querySelectorAll('.rename-chapter').forEach((b,i)=>b.onclick=()=>renameChapter(i));
  $('#chapterList').querySelectorAll('.delete-chapter').forEach((b,i)=>b.onclick=()=>deleteChapter(i));
  $('#chapterList').querySelectorAll('.chapter-item').forEach((item)=>{
    item.addEventListener('dragover',(e)=>e.preventDefault());
    item.addEventListener('drop',(e)=>{e.preventDefault(); const from=state.activeChapter,to=Number(item.dataset.index); if(from===to)return; const [m]=state.chapters.splice(from,1); state.chapters.splice(to,0,m); state.activeChapter=to; renderList(); renderActive(); scheduleSave();});
  });
}
function renderActive(){const c=state.chapters[state.activeChapter]; if(!c)return; $('#chapterTitle').value=c.title; $('#chapterContent').value=c.content; preview();}
function selectChapter(i){syncActive();state.activeChapter=i;renderList();renderActive();}
function renameChapter(i){const name=prompt('নতুন অধ্যায়ের নাম:',state.chapters[i].title);if(name?.trim()){state.chapters[i].title=name.trim();renderList();renderActive();scheduleSave();}}
function deleteChapter(i){if(state.chapters.length<=1){alert('কমপক্ষে একটি অধ্যায় রাখতে হবে।');return;}if(!confirm('এই অধ্যায়টি মুছে ফেলবেন?'))return;state.chapters.splice(i,1);state.activeChapter=Math.min(state.activeChapter,state.chapters.length-1);renderList();renderActive();scheduleSave();}
function addChapter(){syncActive();state.chapters.push({id:makeId(),title:`অধ্যায় ${state.chapters.length+1}`,content:''});state.activeChapter=state.chapters.length-1;renderList();renderActive();scheduleSave();}
function buildBook(){syncActive();return{bookId:state.id.replace('draft-','book-'),title:state.title||'নতুন বই',author:state.author||'অজানা লেখক',category:state.category,chapters:state.chapters.map((c,i)=>({chapterId:i+1,title:c.title,content:c.content}))};}
function download(book){const blob=new Blob([JSON.stringify(book,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${book.bookId}.json`;a.click();URL.revokeObjectURL(url);}
function publishGuide(book){const entry={id:book.bookId,title:book.title,author:book.author,category:book.category,coverImage:'',filePath:`data/books/${book.bookId}.json`,publishDate:new Date().toISOString().slice(0,10)};$('#publisherPanel').hidden=false;$('#publishOutput').hidden=false;$('#publishOutput').innerHTML=`<h2>Publish package প্রস্তুত</h2><p>বইটি <code>data/books/${escapeHTML(book.bookId)}.json</code>-এ আপলোড করুন এবং নিচের entry-টি <code>data/catalog.json</code>-এ যুক্ত করুন।</p><pre>${escapeHTML(JSON.stringify(entry,null,2))}</pre><p>Advanced GitHub API/PAT publishing workflow-এর জন্য repository owner/name এবং একটি GitHub PAT ব্যবহার করে GitHub-এর Contents API দিয়ে এই দুই ফাইল commit করা যায়। PAT ব্রাউজারে সংরক্ষণ করবেন না।</p>`;}

async function initialize(){
  const template=await loadTemplate(state.category); state.title=template.title||''; state.category=template.category||state.category; state.chapters=normalize(template);
  const saved=await loadDraft(state.id).catch(()=>null);
  if(saved?.chapters?.length && confirm('আপনার আগের অসমাপ্ত ড্রাফট পাওয়া গেছে, এটি কি রিস্টোর করতে চান?')) Object.assign(state,saved);
  $('#bookTitle').value=state.title;$('#bookAuthor').value=state.author;$('#bookCategory').value=state.category;renderList();renderActive();
}
$('#bookTitle').oninput=()=>{state.title=$('#bookTitle').value;scheduleSave();};
$('#bookAuthor').oninput=()=>{state.author=$('#bookAuthor').value;scheduleSave();};
$('#bookCategory').onchange=async()=>{state.category=$('#bookCategory').value;if(confirm('নতুন টেমপ্লেট দিয়ে বর্তমান চ্যাপ্টার কাঠামো প্রতিস্থাপন করবেন?')){const t=await loadTemplate(state.category);state.chapters=normalize(t);state.activeChapter=0;renderList();renderActive();}scheduleSave();};
$('#chapterTitle').oninput=()=>{syncActive();renderList();preview();scheduleSave();};
$('#chapterContent').oninput=()=>{syncActive();preview();scheduleSave();};
$('#addChapter').onclick=addChapter;
$('#exportButton').onclick=()=>download(buildBook());
$('#publishButton').onclick=()=>publishGuide(buildBook());
document.querySelectorAll('[data-format]').forEach((button)=>button.onclick=()=>{const area=$('#chapterContent'),format=button.dataset.format,start=area.selectionStart,end=area.selectionEnd,selected=area.value.slice(start,end)||'লিখুন',wrap={bold:['**','**'],italic:['*','*'],heading:['# ',''],code:['```\n','\n```'],paragraph:['','']}[format]||['',''];area.setRangeText(`${wrap[0]}${selected}${wrap[1]}`,start,end,'select');area.dispatchEvent(new Event('input'));area.focus();});
initialize().catch((e)=>{console.error(e);setStatus('Editor initialization failed');});
