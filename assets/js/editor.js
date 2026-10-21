import { loadDraft, createAutoSaver } from './db.js';

const $ = (selector) => document.querySelector(selector);
const state = { id: 'draft-current', title: '', author: '', category: 'Novel', coverImage: '', chapters: [], activeChapter: 0 };
const makeId = () => `ch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const snapshot = () => JSON.parse(JSON.stringify(state));
const setStatus = (text) => { $('#saveStatus').textContent = text; };
const scheduleSave = createAutoSaver(snapshot, setStatus, 1000);

function markdownToHTML(source = '') {
  const lines = String(source).replace(/\r/g, '').split('\n');
  const output = [];
  let inCode = false;
  let codeLines = [];
  let inList = false;
  const inline = (text) => {
    let value = escapeHTML(text);
    value = value.replace(/`([^`]+)`/g, '<code>$1</code>');
    value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    value = value.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    value = value.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    value = value.replace(/_([^_]+)_/g, '<em>$1</em>');
    value = value.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return value;
  };
  const closeList = () => { if (inList) { output.push('</ul>'); inList = false; } };
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) { output.push(`<pre><code>${escapeHTML(codeLines.join('\n'))}</code></pre>`); codeLines = []; inCode = false; }
      else { closeList(); inCode = true; }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }
    if (!line.trim()) { closeList(); continue; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { closeList(); const level = heading[1].length; output.push(`<h${level}>${inline(heading[2])}</h${level}>`); continue; }
    const list = line.match(/^\s*[-*]\s+(.+)$/);
    if (list) { if (!inList) { output.push('<ul>'); inList = true; } output.push(`<li>${inline(list[1])}</li>`); continue; }
    closeList();
    output.push(`<p>${inline(line)}</p>`);
  }
  if (inCode) output.push(`<pre><code>${escapeHTML(codeLines.join('\n'))}</code></pre>`);
  closeList();
  return output.join('\n');
}

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
function syncActive(){const c=state.chapters[state.activeChapter];if(c){c.title=$('#chapterTitle').value;c.content=$('#chapterContent').value;}}
function preview(){
  const title = escapeHTML($('#chapterTitle').value || 'অধ্যায়ের নাম');
  $('#livePreview').innerHTML = `<h2>${title}</h2>${markdownToHTML($('#chapterContent').value || 'এখানে প্রিভিউ দেখা যাবে...')}`;
}
function renderCover(){const image=$('#coverPreview');if(!image)return;if(state.coverImage){image.src=state.coverImage;image.hidden=false;}else{image.removeAttribute('src');image.hidden=true;}}
function renderList(){
  $('#chapterList').innerHTML=state.chapters.map((c,i)=>`<li class="chapter-item" draggable="true" data-index="${i}"><button class="chapter-select ${i===state.activeChapter?'active':''}" type="button">${i+1}. ${escapeHTML(c.title)}</button><button class="rename-chapter" type="button" aria-label="Rename chapter">✎</button><button class="delete-chapter" type="button" aria-label="Delete chapter">×</button></li>`).join('');
  $('#chapterList').querySelectorAll('.chapter-select').forEach((b,i)=>b.onclick=()=>selectChapter(i));
  $('#chapterList').querySelectorAll('.rename-chapter').forEach((b,i)=>b.onclick=()=>renameChapter(i));
  $('#chapterList').querySelectorAll('.delete-chapter').forEach((b,i)=>b.onclick=()=>deleteChapter(i));
  $('#chapterList').querySelectorAll('.chapter-item').forEach((item)=>{item.addEventListener('dragover',(e)=>e.preventDefault());item.addEventListener('drop',(e)=>{e.preventDefault();syncActive();const from=state.activeChapter,to=Number(item.dataset.index);if(from===to)return;const [m]=state.chapters.splice(from,1);state.chapters.splice(to,0,m);state.activeChapter=to;renderList();renderActive();scheduleSave();});});
}
function renderActive(){const c=state.chapters[state.activeChapter];if(!c)return;$('#chapterTitle').value=c.title;$('#chapterContent').value=c.content;preview();}
function selectChapter(i){syncActive();state.activeChapter=i;renderList();renderActive();}
function renameChapter(i){const name=prompt('নতুন অধ্যায়ের নাম:',state.chapters[i].title);if(name?.trim()){state.chapters[i].title=name.trim();renderList();renderActive();scheduleSave();}}
function deleteChapter(i){if(state.chapters.length<=1){alert('কমপক্ষে একটি অধ্যায় রাখতে হবে।');return;}if(!confirm('এই অধ্যায়টি মুছে ফেলবেন?'))return;state.chapters.splice(i,1);state.activeChapter=Math.min(state.activeChapter,state.chapters.length-1);renderList();renderActive();scheduleSave();}
function addChapter(){syncActive();state.chapters.push({id:makeId(),title:`অধ্যায় ${state.chapters.length+1}`,content:''});state.activeChapter=state.chapters.length-1;renderList();renderActive();scheduleSave();}
function buildBook(){syncActive();return{bookId:`book-${Date.now()}`,title:state.title||'নতুন বই',author:state.author||'অজানা লেখক',category:state.category,coverImage:state.coverImage,chapters:state.chapters.map((c,i)=>({chapterId:i+1,title:c.title,content:c.content}))};}
function downloadBlob(blob, filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

function exportPDF(){
  const book=buildBook();
  const win=window.open('', '_blank', 'noopener,noreferrer');
  if(!win){setStatus('PDF window blocked');return;}
  const cover=book.coverImage?`<img class="cover" src="${escapeHTML(book.coverImage)}" alt="">`:'';
  win.document.write(`<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>${escapeHTML(book.title)}</title><style>@page{margin:18mm}body{font-family:Georgia,serif;line-height:1.8;color:#111}h1{font-size:28pt}h2{font-size:20pt;break-before:page}.cover{max-width:70%;max-height:45vh;display:block;margin:20px auto}p{orphans:3;widows:3}pre{white-space:pre-wrap}</style></head><body>${cover}<h1>${escapeHTML(book.title)}</h1><p>${escapeHTML(book.author)}</p>${book.chapters.map((c)=>`<section><h2>${escapeHTML(c.title)}</h2>${markdownToHTML(c.content)}</section>`).join('')}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(()=>win.print(),250);
}

function crc32(bytes){let crc=0xffffffff;for(let i=0;i<bytes.length;i++){crc^=bytes[i];for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return(crc^0xffffffff)>>>0;}
function u16(value){return new Uint8Array([value&255,(value>>>8)&255]);}
function u32(value){return new Uint8Array([value&255,(value>>>8)&255,(value>>>16)&255,(value>>>24)&255]);}
function concatBytes(parts){const total=parts.reduce((sum,p)=>sum+p.length,0);const out=new Uint8Array(total);let offset=0;for(const part of parts){out.set(part,offset);offset+=part.length;}return out;}
function zipStored(entries){
  const enc=new TextEncoder();const local=[];const central=[];let offset=0;
  entries.forEach(({name,data})=>{
    const nameBytes=enc.encode(name);const bytes=typeof data==='string'?enc.encode(data):data;const crc=crc32(bytes);
    const header=concatBytes([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(bytes.length),u32(bytes.length),u16(nameBytes.length),u16(0),nameBytes,bytes]);
    local.push(header);
    const centralHeader=concatBytes([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(bytes.length),u32(bytes.length),u16(nameBytes.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nameBytes]);
    central.push(centralHeader);offset+=header.length;
  });
  const centralBytes=concatBytes(central);const localBytes=concatBytes(local);const eocd=concatBytes([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(centralBytes.length),u32(localBytes.length),u16(0)]);
  return new Blob([localBytes,centralBytes,eocd],{type:'application/epub+zip'});
}
function exportEPUB(){
  const book=buildBook();
  const id=book.bookId;
  const chapterFiles=book.chapters.map((chapter,index)=>({name:`OEBPS/chapter-${index+1}.xhtml`,data:`<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" lang="bn"><head><title>${escapeHTML(chapter.title)}</title><link rel="stylesheet" href="style.css"/></head><body><h1>${escapeHTML(chapter.title)}</h1>${markdownToHTML(chapter.content)}</body></html>`}));
  const manifest=book.chapters.map((_,index)=>`<item id="chapter-${index+1}" href="chapter-${index+1}.xhtml" media-type="application/xhtml+xml"/>`).join('');
  const spine=book.chapters.map((_,index)=>`<itemref idref="chapter-${index+1}"/>`).join('');
  const nav=book.chapters.map((c,index)=>`<li><a href="chapter-${index+1}.xhtml">${escapeHTML(c.title)}</a></li>`).join('');
  const coverEntry=book.coverImage?`<item id="cover" href="cover.${book.coverImage.startsWith('data:image/png')?'png':book.coverImage.startsWith('data:image/webp')?'webp':'jpg'}" media-type="image/${book.coverImage.startsWith('data:image/png')?'png':book.coverImage.startsWith('data:image/webp')?'webp':'jpeg'}" properties="cover-image"/>`:'';
  const entries=[
    {name:'mimetype',data:'application/epub+zip'},
    {name:'META-INF/container.xml',data:'<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'},
    {name:'OEBPS/style.css',data:'body{font-family:Georgia,serif;line-height:1.7}h1{margin-bottom:1.5em}pre{white-space:pre-wrap}'},
    {name:'OEBPS/nav.xhtml',data:`<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>${escapeHTML(book.title)}</title></head><body><nav epub:type="toc"><h1>${escapeHTML(book.title)}</h1><ol>${nav}</ol></nav></body></html>`},
    {name:'OEBPS/content.opf',data:`<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">${escapeHTML(id)}</dc:identifier><dc:title>${escapeHTML(book.title)}</dc:title><dc:creator>${escapeHTML(book.author)}</dc:creator><dc:language>bn</dc:language></metadata><manifest><item id="nav" properties="nav" href="nav.xhtml" media-type="application/xhtml+xml"/>${coverEntry}${manifest}</manifest><spine>${spine}</spine></package>`},
    ...chapterFiles
  ];
  if(book.coverImage){const base64=book.coverImage.split(',')[1]||'';const binary=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const ext=book.coverImage.startsWith('data:image/png')?'png':book.coverImage.startsWith('data:image/webp')?'webp':'jpg';entries.splice(3,0,{name:`OEBPS/cover.${ext}`,data:binary});}
  downloadBlob(zipStored(entries),`${id}.epub`);
}

function publishGuide(book){const entry={id:book.bookId,title:book.title,author:book.author,category:book.category,coverImage:'',filePath:`data/books/${book.bookId}.json`,publishDate:new Date().toISOString().slice(0,10)};$('#publisherPanel').hidden=false;$('#publishOutput').hidden=false;$('#publishOutput').innerHTML=`<h2>Publish package প্রস্তুত</h2><p>বইটি <code>data/books/${escapeHTML(book.bookId)}.json</code>-এ আপলোড করুন এবং নিচের entry-টি <code>data/catalog.json</code>-এ যুক্ত করুন।</p><pre>${escapeHTML(JSON.stringify(entry,null,2))}</pre><p>এই static client কোনো GitHub token সংরক্ষণ করে না।</p>`;}

async function handleCover(file){if(!file)return;if(!/^image\/(png|jpeg|webp)$/.test(file.type)){setStatus('Unsupported cover format');return;}if(file.size>5*1024*1024){setStatus('Cover must be 5 MB or smaller');return;}const reader=new FileReader();reader.onload=()=>{state.coverImage=String(reader.result);renderCover();scheduleSave();setStatus('Cover saved locally');};reader.onerror=()=>setStatus('Cover read failed');reader.readAsDataURL(file);}

async function initialize(){
  const saved=await loadDraft(state.id).catch(()=>null);
  if(saved?.chapters?.length&&confirm('আপনার আগের অসমাপ্ত ড্রাফট পাওয়া গেছে, এটি কি রিস্টোর করতে চান?')) Object.assign(state,saved); else {const template=await loadTemplate(state.category);state.title=template.title||'';state.category=template.category||state.category;state.chapters=normalize(template);}
  $('#bookTitle').value=state.title;$('#bookAuthor').value=state.author;$('#bookCategory').value=state.category;renderList();renderActive();renderCover();
}
$('#bookTitle').oninput=()=>{state.title=$('#bookTitle').value;scheduleSave();};
$('#bookAuthor').oninput=()=>{state.author=$('#bookAuthor').value;scheduleSave();};
$('#bookCategory').onchange=async()=>{state.category=$('#bookCategory').value;if(confirm('নতুন টেমপ্লেট দিয়ে বর্তমান চ্যাপ্টার কাঠামো প্রতিস্থাপন করবেন?')){const t=await loadTemplate(state.category);state.chapters=normalize(t);state.activeChapter=0;renderList();renderActive();}scheduleSave();};
$('#chapterTitle').oninput=()=>{syncActive();renderList();preview();scheduleSave();};
$('#chapterContent').oninput=()=>{syncActive();preview();scheduleSave();};
$('#coverInput')?.addEventListener('change',(event)=>handleCover(event.target.files?.[0]));
$('#addChapter').onclick=addChapter;$('#exportPdfButton').onclick=exportPDF;$('#exportEpubButton').onclick=exportEPUB;$('#publishButton').onclick=()=>publishGuide(buildBook());
document.querySelectorAll('[data-format]').forEach((button)=>button.onclick=()=>{const area=$('#chapterContent'),format=button.dataset.format,start=area.selectionStart,end=area.selectionEnd,selected=area.value.slice(start,end)||'লিখুন',wrap={bold:['**','**'],italic:['*','*'],heading:['# ',''],code:['```\n','\n```'],paragraph:['','']}[format]||['',''];area.setRangeText(`${wrap[0]}${selected}${wrap[1]}`,start,end,'select');area.dispatchEvent(new Event('input'));area.focus();});
initialize().catch((e)=>{console.error(e);setStatus('Editor initialization failed');});
