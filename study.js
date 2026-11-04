(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const personal = { id:'personal', title:'ScatterMemory的人生', color:'#33483b', art:'eye', number:0, notes:['','',''] };
  const books = window.STUDY_BOOKS;
  const allBooks = [personal, ...books];
  let current = personal, switching = false;
  const journal=window.StudyReader.create();
  const reduced = false;
  let personalParked = false;
  let toastTimer, svgId = 0;
  const animations = new Set();
  const audio = $('#audio');
  let tracks = [...(window.STUDY_TRACKS || [])], trackIndex = -1;
  const urls = [];
  const coverObserver = new ResizeObserver(entries => entries.forEach(({target,contentRect}) => target.style.setProperty('--cover-scale',contentRect.width/480)));

  function art(book) {
    const id = 'iris-' + (++svgId);
    const paths = {
      network: '<circle cx="70" cy="70" r="50" opacity=".4"/><path d="m20 70 32-36 50 14 18 43-51 29-49-50 82-22-33 72-17-86 68 57-100-21m32-36 17 86M20 70l49-10 51 31M69 60l33-12"/><g fill="currentColor"><circle cx="20" cy="70" r="3"/><circle cx="52" cy="34" r="3"/><circle cx="102" cy="48" r="3"/><circle cx="120" cy="91" r="3"/><circle cx="69" cy="120" r="3"/><circle cx="69" cy="60" r="4"/></g>',
      human: '<circle cx="70" cy="28" r="10"/><path d="M70 38v55m-30-34 30-12 30 12M70 93l-24 30m24-30 24 30M42 10q-27 45-13 95m82-95q27 45 13 95"/><circle cx="70" cy="70" r="57" opacity=".35"/><path d="M23 74h94M70 8v124" opacity=".25"/>',
      orbit: '<circle cx="70" cy="70" r="51"/><circle cx="70" cy="70" r="34" opacity=".4"/><ellipse cx="70" cy="70" rx="60" ry="22" transform="rotate(-40 70 70)"/><ellipse cx="70" cy="70" rx="60" ry="22" transform="rotate(40 70 70)"/><path d="M70 4v132M4 70h132" opacity=".35"/><circle cx="70" cy="70" r="7" fill="currentColor"/><circle cx="108" cy="36" r="4" fill="currentColor"/>',
      geometry: '<path d="m70 12 51 30v61l-51 29-51-29V42Zm0 0v60l51 31M19 42l51 30v60m0-60 51-30M19 103l51-31"/><path d="m70 32 34 20v40l-34 19-34-19V52Z" opacity=".4"/><circle cx="70" cy="72" r="47" opacity=".3"/>',
      landscape: '<path d="M10 104q35-10 58 0t62 0M18 114q55-8 103 2M42 87V66m-7 12 7-9 9 9m-9 9-6 13m6-13 8 11M67 96q-8-19 4-15 7 3 5 13m12 1q-9-14-1-16l10 8 9-5m-12 14 5-9m12 8q-5-27 3-32l10 5-7 7v22m-8-32 1-10 6 9"/><circle cx="42" cy="59" r="5"/><circle cx="92" cy="28" r="13" opacity=".5"/><path d="M19 39h28m-16-6h25" opacity=".4"/>',
      leaves: '<circle cx="70" cy="70" r="55" opacity=".3"/><path d="M70 124Q55 85 77 48l-7-30M67 94Q28 91 33 66q30 3 34 28Zm5-20q-4-31 28-35 0 27-28 35Zm-3-25Q45 40 55 18q24 8 14 31Zm-3 62q11-29 38-24-10 27-38 24Z"/><path d="m25 36 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" opacity=".5"/>'
    };
    if (book.art === 'eye') return `<svg viewBox="0 0 140 140" aria-hidden="true"><defs><radialGradient id="${id}"><stop stop-color="#a9cba0"/><stop offset=".6" stop-color="#448b75"/><stop offset="1" stop-color="#163f35"/></radialGradient></defs><g fill="none" stroke="currentColor"><circle cx="70" cy="70" r="59" opacity=".35"/><circle cx="70" cy="70" r="51" stroke-dasharray="1 5" opacity=".45"/><path d="M8 70Q70 9 132 70Q70 131 8 70Z" fill="#192d25"/><path d="M15 70Q70 21 125 70Q70 119 15 70Z" fill="#8d9f7d"/></g><g class="pupil"><circle cx="70" cy="70" r="24" fill="url(#${id})"/><circle cx="70" cy="70" r="11" fill="#071b14"/><circle cx="63" cy="61" r="4" fill="#e3f0cf" opacity=".8"/><circle cx="77" cy="78" r="2" fill="#b9d8b4"/></g><path d="M70 4v9m0 114v9M4 70h9m114 0h9" stroke="currentColor"/></svg>`;
    return `<svg viewBox="0 0 140 140" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">${paths[book.art] || paths.geometry}</svg>`;
  }
  function coverMarkup(book) {
    if(book.id==='personal')return '<iframe class="original-cover" src="original-book/cover.html" tabindex="-1" aria-hidden="true" title="原版皮革书封"></iframe>';
    if(book.cover)return `<img class="illustrated-cover" src="${book.cover}" alt="${esc(book.title)}的私人手记封面">`;
    return `<small>${book.id === 'personal' ? 'A BOOK OF FLEETING MOMENTS' : 'SCATTERMEMORY · READING NOTES'}</small><h2>${book.id === 'personal' ? '<span>ScatterMemory</span>的人生' : esc(book.title)}</h2><span class="cover-art">${art(book)}</span><span class="cover-bottom">${book.id === 'personal' ? 'VOLUME I · 未完待续' : '私人藏书 · ' + String(book.number).padStart(2,'0')}</span>`;
  }
  function paintCover(node, book) {
    node.className = 'cover-face' + (book.id === 'personal' ? ' personal' : '') + (book.art === 'landscape' ? ' light-cover' : '') + (book.cover ? ' illustrated' : '');
    node.style.setProperty('--book-color', book.color); node.innerHTML = coverMarkup(book);
    if(book===personal)coverObserver.observe(node);else coverObserver.unobserve(node);
    if(node.parentElement)paintSolid(node.parentElement,book);

  }
  function renderShelf() {
    $('#shelf-rows').innerHTML = [books.slice(0,12),books.slice(12,24),books.slice(24)].map(row => `<div class="shelf-row">${row.map(book => `<button class="shelf-book" data-book="${book.id}" style="--book-color:${book.color};--height:${88 + book.number % 4 * 3}%;--spine-width:${2 + book.thickness * .15}%;--spine-min:${book.title.length > 8 ? 29 : 18}px;--mobile-spine-min:${book.title.length > 9 ? 18 : 11}px" aria-label="取阅《${esc(book.title)}》" title="${esc(book.title)}"><span class="spine-title">${esc(book.title)}</span></button>`).join('')}</div>`).join('');
    updateSelection();
  }
  function updateSelection() {
    document.querySelectorAll('[data-book]').forEach(node => {
      const selected = node.dataset.book === current.id;
      node.classList.toggle('on-desk', selected);
      if (selected) node.setAttribute('aria-current','true'); else node.removeAttribute('aria-current');
    });
    $('#current-title').textContent = current.title;
    $('#desk-book').setAttribute('aria-label','翻开《' + current.title + '》');
    $('#return-home').disabled = (current === personal && !personalParked) || switching;
    $('#park-book').hidden = current !== personal || personalParked;
    $('#park-book').disabled = switching;
    $('#parked-personal-book').classList.toggle('occupied',personalParked || current !== personal);
    $('#parked-personal-book').disabled = switching || (current === personal && !personalParked);
    $('.parked-hint').style.opacity = personalParked || current !== personal ? '1' : '0';
    $('.desk-book-space').classList.toggle('is-empty',current === personal && personalParked);
    if(current === personal && personalParked)$('#current-title').textContent='暂且留白';
  }
  function renderLibrary() {
    const q = $('#book-search').value.trim();
    const matches = books.filter(book => book.title.includes(q));
    $('#library-list').innerHTML = matches.length ? matches.map(book => `<button class="library-item ${current.id === book.id ? 'on-desk' : ''}" data-book="${book.id}"><span class="mini-spine" style="--book-color:${book.color}"></span><span>${esc(book.title)}</span>${current.id === book.id ? '<small>正在桌上</small>' : ''}</button>`).join('') : '<p class="dialog-note">书架里暂时没有这本书。</p>';
  }
  function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'),4000); }
  function showDialog(dialog) { if (!dialog.open) dialog.showModal(); }
  function closeDialog(dialog) { dialog.close(); }
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click',() => closeDialog(button.closest('dialog'))));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click',event => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) closeDialog(dialog); } }));

  function paintSolid(node,book) {
    const slot=document.querySelector(`.shelf-book[data-book="${book.id}"]`);
    const height=$('#desk-book').offsetHeight;
    const ratio=slot?height/slot.offsetHeight:1;
    // Shelf labels stay wide for legibility; each physical book keeps its own chosen binding thickness.
    node.style.setProperty('--thickness',(book.thickness ? book.thickness*height/252 : 18)+'px');
    node.style.setProperty('--book-color',book===personal?'#312c23':book.color);
    const spine=node.querySelector('.solid-spine');if(!spine)return;
    spine.innerHTML='<span class="spine-title">'+esc(book.title)+'</span>';
    if(slot){const style=getComputedStyle(slot.querySelector('.spine-title'));
      spine.style.setProperty('--spine-font',Math.min(parseFloat(style.fontSize)*ratio,12*height/252)+'px');
      spine.style.setProperty('--spine-spacing','.7px');
    }
  }
  function poseFor(rect,kind,width,height) {
    // A +90deg Y turn presents the left (lettered) spine to the camera, with page edges facing inward.
    const z=kind==='shelf'?900*(1-height/rect.height)-width/2:0;
    return {x:rect.left+rect.width/2,y:rect.top+rect.height/2,z,rx:kind==='shelf'?0:40,ry:kind==='shelf'?90:0,rz:kind==='shelf'?0:-8};
  }
  async function flyBook(book,from,to,fromKind='desk',toKind='shelf') {
    const w=$('#desk-book').offsetWidth,h=$('#desk-book').offsetHeight,roomRect=$('#room').getBoundingClientRect();
    const viewport=document.createElement('div');viewport.className='flight-viewport';
    Object.assign(viewport.style,{left:roomRect.left+'px',top:roomRect.top+'px',width:roomRect.width+'px',height:roomRect.height+'px'});
    const mount=document.createElement('div');mount.className='flight-camera';Object.assign(mount.style,{width:w+'px',height:h+'px'});
    const node=document.createElement('div');node.className='rigid-book';node.dataset.book=book.id;
    node.innerHTML='<span class="solid-spine"></span><span class="solid-pages"></span><span class="solid-bottom"></span><span class="solid-top"></span><span class="solid-back"></span>';
    const face=document.createElement('span');node.append(face);paintCover(face,book);mount.append(node);viewport.append(mount);document.body.append(viewport);
    const a=poseFor(from,fromKind,w,h),b=poseFor(to,toKind,w,h);
    const deskThickness=parseFloat(getComputedStyle(node).getPropertyValue('--thickness'));
    const shelfRect=fromKind==='shelf'?from:toKind==='shelf'?to:null;
    // Shelf spines are widened for readable titles. Undo their projected height scale
    // at the handoff, then blend to the desk binding only while the book is rotating.
    const shelfThickness=shelfRect?shelfRect.width*h/shelfRect.height:deskThickness;
    if(shelfRect){
      const slot=document.querySelector(`.shelf-book[data-book="${book.id}"]`),skin=slot.cloneNode(true);
      skin.className='shelf-book flight-spine-skin';skin.removeAttribute('data-book');skin.removeAttribute('aria-current');skin.setAttribute('aria-hidden','true');skin.tabIndex=-1;skin.inert=true;
      Object.assign(skin.style,{width:shelfRect.width+'px',height:shelfRect.height+'px',transform:`scale(${h/shelfRect.height})`});
      const label=skin.querySelector('.spine-title'),labelStyle=getComputedStyle(slot.querySelector('.spine-title'));
      for(const property of ['fontSize','lineHeight','letterSpacing','textAlign'])label.style[property]=labelStyle[property];
      node.querySelector('.solid-spine').append(skin);
    }
    const pos=p=>`translate(${p.x-w/2-roomRect.left}px,${p.y-h/2-roomRect.top}px)`;
    const rot=p=>`translateZ(${p.z}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg)`;
    let poses;
    if(fromKind==='shelf'){
      // Clear the shelf straight outward before turning the cover toward the reader.
      const clear={...a,z:a.z+260};
      poses=[{...a,offset:0},{...clear,offset:.27},{x:(a.x+b.x)/2,y:(a.y+b.y)/2-35,z:70,rx:20,ry:36,rz:-5,offset:.66},{...b,offset:1}];
    }else if(toKind==='shelf'){
      // Finish the turn in front of the slot, then insert without changing orientation.
      const clear={...b,z:b.z+260};
      poses=[{...a,offset:0},{x:(a.x+b.x)/2,y:(a.y+b.y)/2-35,z:70,rx:20,ry:36,rz:-5,offset:.34},{...clear,offset:.73},{...b,offset:1}];
    }else poses=[{...a,offset:0},{...b,offset:1}];
    const options={duration:fromKind==='shelf'||toKind==='shelf'?1200:650,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'};
    const moving=mount.animate(poses.map(p=>({transform:pos(p),offset:p.offset})),options);
    const rotating=node.animate(poses.map(p=>{
      const atShelf=(fromKind==='shelf'&&p.offset<=.27)||(toKind==='shelf'&&p.offset>=.73);
      return {transform:rot(p),'--thickness':(atShelf?shelfThickness:deskThickness)+'px','--shelf-ink':atShelf?1:0,offset:p.offset};
    }),options);
    try{await Promise.all([moving.finished,rotating.finished]);}finally{coverObserver.unobserve(face);viewport.remove();}
  }
  // Untransformed camera bounds prevent a jump when a perspective-projected book hands off to an animation.
  const deskRect=()=>$('.desk-book-space').getBoundingClientRect();
  const sideRect=()=>$('.parked-book-space').getBoundingClientRect();
  async function parkPersonal() {
    if(switching || current!==personal || personalParked)return;
    switching=true;updateSelection();$('#desk-book').style.visibility='hidden';
    try{await flyBook(personal,deskRect(),sideRect(),'desk','side');personalParked=true;$('#scene-status').textContent='人生之书已移到书桌左侧，轻触露出的书封即可移回中央。';}
    finally{switching=false;$('#desk-book').style.visibility='';updateSelection();$('#parked-personal-book').focus({preventScroll:true});}
  }
  async function selectBook(id) {
    if(switching)return;
    const next=allBooks.find(book=>book.id===id);if(!next)return;
    $('#library-dialog').close();
    if(next===current && !(next===personal && personalParked)){openReader();return;}
    switching=true;updateSelection();$('#room').setAttribute('aria-busy','true');
    const desk=$('#desk-book'),targetRect=deskRect();desk.style.visibility='hidden';
    try{
      if(!(current===personal && personalParked)){
        $('#scene-status').textContent='正在收好《'+current.title+'》…';
        const oldSlot=document.querySelector(`.shelf-book[data-book="${current.id}"]`);
        await flyBook(current,targetRect,oldSlot?.getBoundingClientRect()||sideRect(),'desk',oldSlot?'shelf':'side');
        if(current===personal)personalParked=true;
        oldSlot?.classList.remove('on-desk');
      }
      if(personalParked){$('#parked-personal-book').classList.add('occupied');$('.parked-hint').style.opacity='1';}
      const slot=document.querySelector(`.shelf-book[data-book="${next.id}"]`);slot?.classList.add('on-desk');
      if(next===personal)$('#parked-personal-book').classList.remove('occupied');
      await flyBook(next,slot?.getBoundingClientRect()||sideRect(),targetRect,slot?'shelf':'side','desk');
      current=next;if(next===personal)personalParked=false;paintCover($('#desk-cover'),current);
      $('#scene-status').textContent='《'+current.title+'》已放到桌上，轻触书封开始阅读。';
    }finally{switching=false;desk.style.visibility='';$('#room').removeAttribute('aria-busy');updateSelection();desk.focus({preventScroll:true});}
  }
  document.addEventListener('click',event=>{const button=event.target.closest('[data-book]');if(button)selectBook(button.dataset.book);});
  $('#return-home').addEventListener('click',()=>selectBook('personal'));
  $('#parked-personal-book').addEventListener('click',()=>selectBook('personal'));
  $('#park-book').addEventListener('click',parkPersonal);
  $('#personal-back').addEventListener('click',()=>$('#personal-dialog').close());
  $('#personal-dialog').addEventListener('close',()=>document.body.classList.remove('reading-personal'));
  $('#personal-music').addEventListener('click',()=>showDialog($('#music-dialog')));
  $('#personal-park').addEventListener('click',()=>{
    $('#personal-park').disabled=true;
    $('#personal-frame').contentWindow.postMessage({type:'study-stow'},location.protocol==='file:'?'*':location.origin);
  });
  window.addEventListener('message',event=>{
    if(event.source!==$('#personal-frame').contentWindow || (event.origin!==location.origin&&event.origin!=='null') || event.data?.type!=='study-stowed')return;
    $('#personal-park').disabled=false;$('#personal-dialog').close();parkPersonal();
  });
  $('#open-library').addEventListener('click',()=>{renderLibrary();showDialog($('#library-dialog'));});
  $('#book-search').addEventListener('input',renderLibrary);

  function openReader() {
    if(switching || (current===personal && personalParked))return;
    if(current===personal){document.body.classList.add('reading-personal');showDialog($('#personal-dialog'));return;}
    journal.open(current);
  }
  $('#desk-book').addEventListener('click',openReader);

  function renderTracks() {
    $('#track-list').innerHTML=tracks.length?tracks.map((track,i)=>`<button class="track-row ${i===trackIndex?'active':''}" data-track="${i}"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(track.title)}</strong></button>`).join(''):'<div class="empty-tracks">第一首作品，即将在这里响起。<br><small>先选择一首 MP3，试试这台留声机。</small></div>';
    updatePlayer();
  }
  const time=n=>Number.isFinite(n)?String(Math.floor(n/60)).padStart(2,'0')+':'+String(Math.floor(n%60)).padStart(2,'0'):'00:00';
  function updatePlayer() {
    const playing=!audio.paused;
    $('#gramophone').classList.toggle('is-playing',playing);$('#vinyl').classList.toggle('playing',playing);
    $('#play').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',playing?'暂停':'播放');
    $('#needle').setAttribute('aria-label',playing?'唱针：暂停':'唱针：播放');
    $('#track-title').textContent=trackIndex>=0?tracks[trackIndex].title:'等待第一首旋律';
    $('#gram-status').textContent=trackIndex<0?'等待一段旋律':playing?'旋律正在流转':'旋律暂歇';
    $('#elapsed').textContent=time(audio.currentTime);$('#duration').textContent=time(audio.duration);
    const seekable=Number.isFinite(audio.duration)&&audio.duration>0;
    $('#seek').disabled=!seekable;$('#seek').value=seekable?audio.currentTime/audio.duration*1000:0;
    ['#play','#previous-track','#next-track','#repeat'].forEach(s=>$(s).disabled=!tracks.length);
  }
  async function playTrack(index) {
    if(!tracks.length)return;
    if(index!==trackIndex){trackIndex=index;audio.src=tracks[index].src;audio.load();}
    try{await audio.play();}catch(error){if(error.name!=='AbortError')toast('这首音乐无法播放，请重新选择有效的 MP3 文件。');}
    renderTracks();
  }
  function togglePlay() {
    if(!tracks.length){showDialog($('#music-dialog'));toast('先选择一首 MP3，再轻触唱针试听。');return;}
    if(audio.paused)playTrack(trackIndex<0?0:trackIndex);else audio.pause();
  }
  function nextTrack(delta) {if(tracks.length)playTrack((Math.max(trackIndex,0)+delta+tracks.length)%tracks.length);}
  $('#open-music').addEventListener('click',()=>showDialog($('#music-dialog')));
  $('#needle').addEventListener('click',togglePlay);$('#play').addEventListener('click',togglePlay);
  $('#previous-track').addEventListener('click',()=>nextTrack(-1));$('#next-track').addEventListener('click',()=>nextTrack(1));
  $('#track-list').addEventListener('click',event=>{const row=event.target.closest('[data-track]');if(row)playTrack(Number(row.dataset.track));});
  $('#repeat').addEventListener('click',()=>{audio.loop=!audio.loop;$('#repeat').setAttribute('aria-pressed',String(audio.loop));});
  $('#seek').addEventListener('input',event=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(event.target.value)/1000;});
  $('#volume').addEventListener('input',event=>{audio.volume=Number(event.target.value);});
  $('#choose-music').addEventListener('click',()=>$('#audio-files').click());
  $('#audio-files').addEventListener('change',event=>{
    const added=[...event.target.files].filter(file=>/\.mp3$/i.test(file.name)||file.type==='audio/mpeg');
    for(const file of added){const src=URL.createObjectURL(file);urls.push(src);tracks.push({title:file.name.replace(/\.mp3$/i,''),src});}
    renderTracks();event.target.value='';if(added.length)toast('已加入 '+added.length+' 首本地音乐，点击播放或轻触唱针。');
  });
  ['play','pause','timeupdate','loadedmetadata','durationchange','emptied'].forEach(name=>audio.addEventListener(name,updatePlayer));
  audio.addEventListener('ended',()=>{if(!audio.loop)nextTrack(1);});
  audio.addEventListener('error',()=>{updatePlayer();toast('音乐文件暂时无法读取，请检查文件或路径。');});audio.volume=.65;
  window.addEventListener('pagehide',()=>audio.pause());window.addEventListener('beforeunload',()=>urls.forEach(url=>URL.revokeObjectURL(url)));

  function applyMotion() {
    document.documentElement.classList.toggle('reduce-motion',reduced);document.documentElement.classList.toggle('allow-motion',!reduced);
    if(reduced){animations.forEach(animation=>animation.finish());}
  }
  window.addEventListener('pointermove',event=>{
    if(current!==personal||reduced||switching)return;
    const pupil=$('#desk-cover .pupil');if(!pupil)return;
    const rect=$('#desk-cover .cover-art').getBoundingClientRect();const dx=event.clientX-rect.left-rect.width/2,dy=event.clientY-rect.top-rect.height/2,d=Math.hypot(dx,dy)||1;
    pupil.setAttribute('transform',`translate(${dx/d*Math.min(6,d/45)} ${dy/d*Math.min(4,d/60)})`);
  },{passive:true});
  window.addEventListener('resize',()=>{paintSolid($('#desk-book'),current);paintSolid($('#parked-personal-book'),personal);});
  renderShelf();paintCover($('#desk-cover'),current);paintCover($('#parked-cover'),personal);renderTracks();applyMotion();
})();
