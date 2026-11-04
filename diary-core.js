// Read-only journal rendering. This module has no persistence, upload or publishing operation.
(() => {
 'use strict';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
 function validate(input){
  if(!Array.isArray(input))throw Error('日记必须是记录列表。');
  const ids=new Set();
  return input.map(e=>{
   if(!e||typeof e.id!=='string'||!e.id||ids.has(e.id))throw Error('记录编号为空或重复。');ids.add(e.id);
   if(typeof e.title!=='string'||e.title.length>60||typeof e.text!=='string'||e.text.length>100000)throw Error('标题最多 60 字，正文最多 100000 字。');
   if(typeof e.date!=='string'||!validDate(e.date))throw Error('请填写有效的记录日期。');
   if(!Array.isArray(e.images)||e.images.length>16)throw Error('每条记录最多支持 16 张照片。');
   const images=e.images.map(p=>{
    if(!p||typeof p.src!=='string'||!/^data:image\/(?:jpeg|png|webp|gif|avif);base64,[A-Za-z0-9+/]+=*$/.test(p.src))throw Error('图片必须是导出文件内的有效照片数据。');
    return {src:p.src,alt:typeof p.alt==='string'?p.alt.slice(0,300):'日记照片'};
   });
   if(!e.text.trim()&&!images.length)throw Error('记录需要文字或照片。');
   return {id:e.id,title:e.title,text:e.text,date:e.date,images};
  });
 }
 function stack(entry,key){return entry.images.length?`<button class="photo-stack" data-gallery="${esc(key)}" aria-label="放大查看 ${entry.images.length} 张照片">${entry.images.slice(0,3).map((p,i)=>`<span class="photo-card"><img src="${esc(p.src)}" alt="${esc(p.alt)}" draggable="false"><span class="photo-label">a little piece of life · ${String(i+1).padStart(2,'0')}</span></span>`).join('')}<span class="photo-count">${String(entry.images.length).padStart(2,'0')} 张 ↗</span></button>`:'';}
 function html(page,{editable=false,key}={}){
  if(!page)return '<div class="empty-page"><h2 tabindex="-1">随心杂记</h2><p>✧<br>下一页，留给值得记住的瞬间。</p></div>';
  const {entry,text,part,images,number=1}=page,type=images.length?(text?'mixed':'photo-only'):'text-only';
  return `<div class="entry-content entry-${type}"><div class="entry-running"><span>随心杂记</span><span>${part?'CONTINUED':'A MOMENT, KEPT'}</span></div><span class="entry-number">${String(number).padStart(2,'0')}<small>${part?'续页 '+part:''}</small></span>${entry.title?`<h2 class="entry-title" tabindex="-1">${esc(entry.title)}</h2>`:''}${text?`<p class="entry-body">${esc(text)}</p>`:''}${stack({...entry,images},key||entry.id)}${editable?`<button class="entry-edit" data-edit="${esc(entry.id)}">编辑这则 ↗</button>`:''}<time class="entry-date" datetime="${esc(entry.date)}">${esc(entry.date.replaceAll('-',' . '))}</time></div>`;
 }
 function paginate(entry,width,height,{number=1,paperClass='diary-paper'}={}){
  const measure=document.createElement('article');measure.className=paperClass;
  Object.assign(measure.style,{position:'fixed',left:'-10000px',top:'0',width:width+'px',height:height+'px',visibility:'hidden',display:'block'});document.body.append(measure);
  const pages=[];let chars=Array.from(entry.text),part=0;
  try{do{
   const images=part?[]:entry.images;
   const fits=n=>{measure.innerHTML=html({entry,text:chars.slice(0,n).join(''),part,images,number});const content=measure.querySelector('.photo-stack')||measure.querySelector('.entry-body')||measure.querySelector('.entry-title');return !content||content.getBoundingClientRect().bottom<=measure.getBoundingClientRect().bottom-70;};
   let lo=0,hi=chars.length,best=0;
   while(lo<=hi){const mid=Math.floor((lo+hi)/2);if(fits(mid)){best=mid;lo=mid+1;}else hi=mid-1;}
   if(!best&&chars.length&&!images.length)best=1;
   if(best<chars.length&&best>0){for(let at=best;at>best*.65;at--)if(/[\n。！？.!?]/.test(chars[at-1])){best=at;break;}}
   pages.push({entry,text:chars.splice(0,best).join(''),part,images,number});part++;
  }while(chars.length);}finally{measure.remove();}
  return pages;
 }
 function createGallery(resolve){
  const dialog=document.createElement('dialog');dialog.id='photo-viewer';dialog.setAttribute('aria-label','放大照片');
  dialog.innerHTML='<div class="viewer-top"><span id="photo-title"></span><button id="photo-close" aria-label="关闭照片">关闭 ×</button></div><div class="photo-stage" id="photo-stage"><button id="photo-prev" aria-label="上一张照片">‹</button><figure class="enlarged-photo"><img id="large-photo" alt=""><figcaption id="photo-caption"></figcaption></figure><button id="photo-next" aria-label="下一张照片">›</button></div><div class="viewer-bottom"><span id="photo-position" aria-live="polite"></span><span>左右滑动 · 方向键切换 · Esc 关闭</span></div>';
  document.body.append(dialog);const $=s=>dialog.querySelector(s);let images=[],index=0,start;
  function show(){const p=images[index];$('#large-photo').src=p.src;$('#large-photo').alt=p.alt;$('#photo-caption').textContent=p.alt;$('#photo-position').textContent=`${String(index+1).padStart(2,'0')} / ${String(images.length).padStart(2,'0')}`;$('#photo-prev').disabled=index===0;$('#photo-next').disabled=index===images.length-1;}
  function step(d){if(index+d<0||index+d>=images.length)return;index+=d;show();}
  document.addEventListener('click',e=>{const button=e.target.closest('[data-gallery]');if(!button||button.closest('[inert]'))return;const entry=resolve(button.dataset.gallery);if(!entry?.images.length)return;images=entry.images;index=0;$('#photo-title').textContent=entry.title||'这一天的照片';show();dialog.showModal();});
  $('#photo-close').onclick=()=>dialog.close();$('#photo-prev').onclick=()=>step(-1);$('#photo-next').onclick=()=>step(1);
  dialog.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();e.stopPropagation();step(e.key==='ArrowRight'?1:-1);}});
  const stage=$('#photo-stage');stage.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY};});stage.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)step(dx<0?1:-1);});stage.addEventListener('pointercancel',()=>start=null);
  return {get open(){return dialog.open;},close(){dialog.close();}};
 }
 window.Diary={esc,validDate,validate,html,paginate,createGallery};
})();
