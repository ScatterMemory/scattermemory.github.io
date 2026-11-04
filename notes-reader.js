(() => {
  const $=s=>document.querySelector(s);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.StudyReader={create(){
    let book,pages=[],index=0,turning=false,finishTurn,resizeTimer;
    const dialog=$('#reader-dialog'),spread=$('#reading-book'),left=$('#reading-left'),right=$('#reading-right'),leaf=$('#reading-turn');
    const sectionNames=['阅读笔记','读后感','留下的问题'];
    const intro=()=>`<span class="eyebrow">SCATTERMEMORY · PRIVATE LIBRARY</span><img class="journal-cover" src="${book.cover}" alt="${esc(book.title)}的私人手记封面"><p>读过的书，成为看世界的另一双眼睛。</p><span class="eyebrow">NOTES & REFLECTIONS</span>`;
    function pageHtml(section,text){
      return `<span class="eyebrow">${String(section+1).padStart(2,'0')} / SCATTERMEMORY'S NOTES</span><h2 tabindex="-1">${sectionNames[section]}</h2><p class="journal-book-name">${esc(book.title)}</p>${text?`<div class="written-note">${esc(text)}</div>`:'<div class="empty-note"><span>✧</span>这一页，留给读过之后的自己。<small>读书笔记与感想待补充</small></div>'}`;
    }
    function paginate(section,note){
      if(!note.trim())return [{section,text:''}];
      const measure=right.cloneNode(false);measure.removeAttribute('id');measure.setAttribute('aria-hidden','true');
      Object.assign(measure.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',width:right.offsetWidth+'px',height:right.offsetHeight+'px',top:'0',left:'0',overflow:'hidden'});spread.append(measure);
      const chunks=[];
      try{
        for(const part of note.split(/\r?\n[ \t]*---[ \t]*\r?\n/)){
          let chars=Array.from(part.trim());
          while(chars.length){
            let lo=1,hi=chars.length,best=0;
            while(lo<=hi){const mid=Math.floor((lo+hi)/2);measure.innerHTML=pageHtml(section,chars.slice(0,mid).join(''));if(measure.scrollHeight<=measure.clientHeight+1){best=mid;lo=mid+1;}else hi=mid-1;}
            best=Math.max(best,1);
            // Prefer a paragraph or sentence boundary, without dropping any text.
            if(best<chars.length){for(let at=best;at>best*.65;at--){if(/[\n。！？.!?]/.test(chars[at-1])){best=at;break;}}}
            chunks.push({section,text:chars.splice(0,best).join('')});
          }
        }
      }finally{measure.remove();}
      return chunks.length?chunks:[{section,text:''}];
    }
    function buildPages(){pages=[{section:-1,text:''}];for(let section=0;section<3;section++)pages.push(...paginate(section,book.notes[section]||''));}
    function content(n){
      if(n===0)return {left:intro(),right:`<span class="eyebrow">NOTES & REFLECTIONS</span><h2 tabindex="-1">阅读手记</h2><p class="journal-book-name">${esc(book.title)}</p><div class="note-index">${sectionNames.map((title,s)=>{const start=pages.findIndex(p=>p.section===s);return `<button data-note="${start}"><span>0${s+1}</span>${title}<i>${String(start+1).padStart(2,'0')}</i></button>`;}).join('')}</div><p class="journal-colophon">收藏的是读过的书，翻开的是自己的思考。</p>`};
      const page=pages[n];return {left:intro(),right:pageHtml(page.section,page.text)};
    }
    function render(){const c=content(index);left.innerHTML=c.left;right.innerHTML=c.right;$('#reader-position').textContent=String(index+1).padStart(2,'0')+' / '+String(pages.length).padStart(2,'0');$('#reader-prev').disabled=index===0;$('#reader-next').disabled=index===pages.length-1;}
    function turn(target){
      if(turning||target===index||target<0||target>=pages.length)return;
      turning=true;const backward=target<index,mobile=matchMedia('(max-width:700px)').matches;
      const source=(backward&&!mobile?left:right).cloneNode(true),c=content(target);
      const destination=(backward||mobile?right:left).cloneNode(false);destination.innerHTML=backward||mobile?c.right:c.left;
      // The old stationary page stays intact until the curved back face lands.
      if(backward&&!mobile)left.innerHTML=c.left;else right.innerHTML=c.right;
      left.inert=true;right.inert=true;
      finishTurn=BookPageTurn.run({turn:leaf,book:spread,source,destination,width:right.offsetWidth,height:right.offsetHeight,backward,onFinish:()=>{index=target;render();turning=false;left.inert=false;right.inert=false;finishTurn=null;right.querySelector('h2')?.focus({preventScroll:true});}});
    }
    dialog.addEventListener('click',e=>{const link=e.target.closest('[data-note]');if(link)turn(Number(link.dataset.note));});
    $('#reader-prev').addEventListener('click',()=>turn(index-1));$('#reader-next').addEventListener('click',()=>turn(index+1));
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();turn(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();turn(index-1);}});
    dialog.addEventListener('close',()=>{finishTurn?.();spread.classList.remove('entering');$('#desk-book').focus({preventScroll:true});});
    spread.addEventListener('animationend',e=>{if(e.target===spread)spread.classList.remove('entering');});
    window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!dialog.open)return;finishTurn?.();const section=pages[index].section;buildPages();index=Math.max(0,pages.findIndex(p=>p.section===section));render();},180);});
    return {open(next){book=next;index=0;$('#reader-title').textContent=book.title;if(!dialog.open)dialog.showModal();buildPages();render();spread.classList.add('entering');}};
  }};
})();
