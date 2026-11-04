(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const book = $('#book'), world = $('#world'), spread = $('#spread'), audio = $('#audio');
  const left = $('#left-page'), right = $('#right-page'), turn = $('#turnsheet');
  const chapters = ['toc', 'life', 'video', 'notes'];
  const names = { toc: '序章 · 记忆的索引', life: '第一章 · 生活记录', music: '第二章 · 音乐创作', video: '第二章 · 视频分享', notes: '第三章 · 随心杂记' };
  const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s).replace(/[&<>"']/g, c => escapes[c]);
  const icon = name => `<svg aria-hidden="true"><use href="#${name}"/></svg>`;
  let chapter = 'toc', opened = false, busy = false, selected = -1, shuffle = false;
  const reduced = false;
  let toastTimer, settleTimer, coverAnimationFinish, objectURLs = [];
  const cover = $('#cover'), coverBack = $('.cover-back');
  const endpaper = coverBack.innerHTML;
  let diaryEntries=[];try{diaryEntries=Diary.validate(window.SCATTER_DIARY||[]);}catch(error){console.error('Invalid published diary:',error.message);}
  const diaryGallery=Diary.createGallery(id=>diaryEntries.find(entry=>entry.id===id));
  let diaryPages=[],diaryIndex=0,diarySize='',diaryResize;
  const diaryStep=()=>matchMedia('(max-width:860px)').matches?1:2;
  function prepareDiary(){
    const size=right.clientWidth+'x'+right.clientHeight+'x'+diaryStep();if(diarySize===size)return;
    const currentId=diaryPages[diaryIndex]?.entry.id;diarySize=size;
    diaryPages=diaryEntries.flatMap((entry,i)=>Diary.paginate(entry,right.clientWidth,right.clientHeight,{number:i+1,paperClass:'paper diary-paper'}));
    if(currentId)diaryIndex=Math.max(0,diaryPages.findIndex(page=>page.entry.id===currentId));
    diaryIndex=Math.min(diaryIndex,Math.max(0,diaryPages.length-1));if(diaryStep()===2)diaryIndex-=diaryIndex%2;
  }
  function turnPage(direction){
    if(chapter==='notes'){
      const target=diaryIndex+direction*diaryStep();
      if(target>=0&&target<diaryPages.length){goChapter('notes',target);return;}
      if(direction>0)return;
    }
    goChapter(chapters[chapters.indexOf(chapter)+direction]);
  }
  window.addEventListener('resize',()=>{clearTimeout(diaryResize);diaryResize=setTimeout(function refreshDiary(){if(busy){diaryResize=setTimeout(refreshDiary,150);return;}if(chapter==='notes'&&opened)render();},180);});
  let tracks = (Array.isArray(window.SCATTER_TRACKS) ? window.SCATTER_TRACKS : []).filter(t => t && typeof t.src === 'string').map(t => ({ ...t, title: t.title || '未命名曲目', artist: t.artist || 'ScatterMemory' }));
  const running = (label, side) => `<div class="page-running"><span>${side === 'left' ? 'SCATTERMEMORY' : label}</span><span>${side === 'left' ? label : '记忆之书'}</span></div>`;
  const number = n => `<span class="page-number">— ${String(n).padStart(2, '0')} —</span>`;
  const plant = `<svg class="botanical" viewBox="0 0 200 220" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="100" cy="100" r="75" stroke-width=".6" opacity=".35"/><circle cx="100" cy="100" r="65" stroke-width=".6" stroke-dasharray="2 5" opacity=".35"/><path d="M100 198Q86 150 104 117Q125 78 104 28M101 145Q69 123 61 92M101 128q38-6 43-38M101 107Q81 80 77 64M111 83q21-14 25-35M99 169q-28-6-41-28M99 155q34-2 52-23" stroke-width="1.2"/><path d="M105 50Q86 41 96 17q19 16 9 33Zm5 25q-23-7-23-27 24 5 23 27ZM99 132Q74 122 76 102q23 7 23 30Zm-22-13Q51 111 48 91q25 3 29 28Zm40 5q0-27 27-34-3 27-27 34Zm-13 32q8-23 32-20-9 21-32 20Zm-18 7q-26 4-34-20 26-1 34 20Zm27-65q7-19 25-21-2 20-25 21ZM85 85q-23-3-24-24 20 2 24 24Zm43-17q-4-20 14-29 8 20-14 29Z" fill="currentColor" fill-opacity=".13"/><path d="m31 47 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm137 84 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" stroke-width=".7"/><path d="M84 198h32m-25 5h18"/></svg>`;

  function render() {
    left.classList.toggle('sm-endpaper', chapter === 'toc');
    left.classList.toggle('diary-paper',chapter==='notes');right.classList.toggle('diary-paper',chapter==='notes');
    if (chapter === 'toc') {
      left.innerHTML = endpaper;
      right.innerHTML = running('THE CONTENTS', 'right') + `<div class="overline contents-title">THE MAP OF MEMORIES</div><h2 tabindex="-1">记忆目录</h2><p class="page-desc">循着书签，走进故事的某一页。</p><div class="contents">${[
        ['life', 'I', '生活记录', 'THE ORDINARY & THE EXTRAORDINARY', '03'],
        ['video', 'II', '视频分享', 'MOMENTS IN MOTION', '05'],
        ['notes', 'III', '随心杂记', 'THOUGHTS WITHOUT A MAP', '07']
      ].map(([key, roman, title, sub, page]) => `<button class="contents-row ${key === 'music' ? 'music-row' : ''}" data-chapter="${key}"><span class="roman">${roman}</span><span><strong>${title}</strong><small>${sub}</small></span><span class="page-ref">${page}</span></button>`).join('')}</div><p class="contents-footnote">✧ 每一页，都是未完待续 ✧</p>` + number(2);
    } else if (chapter === 'notes') {
      prepareDiary();left.innerHTML=Diary.html(diaryPages[diaryIndex]);right.innerHTML=Diary.html(diaryPages[diaryIndex+(diaryStep()===1?0:1)]);
    } else if (chapter === 'music') {
      left.innerHTML = running('CHAPTER II', 'left') + `<div class="overline">MELODIES FROM WITHIN</div><h2>让记忆，有回声。</h2><p class="page-desc">有些话，适合交给旋律。</p><div class="vinyl-scene"><div class="orbit-line"></div><div class="record ${!audio.paused ? 'playing' : ''}"><div class="record-label">SCATTERMEMORY<strong>Memories</strong><i></i>ORIGINAL SOUNDS</div></div></div><p class="music-quote">把说不出口的心事，<br>写进下一段旋律里。</p><div class="music-note"><span>♮</span> 私人声音档案<br>这里收藏原创音乐，也收藏它们诞生时的心情。</div>` + number(5);
      right.innerHTML = running('THE MUSIC COLLECTION', 'right') + `<div class="collection-head"><div class="overline">CHAPTER II</div><span class="track-count">${String(tracks.length).padStart(2, '0')} 首旋律</span></div><h2 tabindex="-1" style="margin-top:12px">音乐创作</h2><p class="page-desc">按下播放，让时间慢一点。</p><div class="music-list" id="music-list"></div><section class="player" aria-label="音乐播放器"><p class="now-playing-label">NOW PLAYING</p><p class="now-playing" id="now-playing"></p><div class="seek-line"><span id="current-time">00:00</span><input id="seek" type="range" min="0" max="1000" value="0" aria-label="播放进度"><span id="duration">00:00</span></div><div class="player-controls"><button id="shuffle" aria-label="随机播放" aria-pressed="${shuffle}" title="随机播放">⤨</button><button id="prev-track" aria-label="上一首">${icon('prev')}</button><button id="play-toggle" class="play-button" aria-label="播放">${icon('play')}</button><button id="next-track" aria-label="下一首">${icon('next')}</button><button id="repeat" aria-label="单曲循环" aria-pressed="${audio.loop}" title="单曲循环">↻</button></div><div class="volume-line"><span>音量</span><input type="range" id="volume" min="0" max="1" step=".01" value="${audio.volume}" aria-label="音量"></div></section><div class="import-row"><button class="import-button" id="import-music">＋ 选择 MP3 试听</button><span class="import-hint">仅在本机播放，不上传<br>刷新后需重新选择</span></div>` + number(6);
      renderTracks(); bindPlayer(); updatePlayer();
    } else {
      const data = {
        life: ['I', 'THE EVERYDAY JOURNAL', '生活记录', '把平凡的日子，过成值得收藏的片段。', '下一段生活，正在发生。', 3],
        video: ['II', 'MOMENTS IN MOTION', '视频分享', '让转瞬即逝的光影，有一个停靠的地方。', '下一帧故事，还在路上。', 5],
        notes: ['III', 'THOUGHTS WITHOUT A MAP', '随心杂记', '允许思绪漫游，也允许灵感偶然降落。', '下一行文字，留给明天。', 7]
      }[chapter];
      left.innerHTML = running('CHAPTER ' + data[0], 'left') + `<div class="overline">${data[1]}</div><h2>${data[2]}</h2>${plant}<p class="intro-quote">${data[3]}</p><div class="intro-signature">To be continued.</div>` + number(data[5]);
      right.innerHTML = running('CHAPTER ' + data[0], 'right') + `<div class="overline">尚未写下的篇章</div><h2 tabindex="-1">${data[2]}</h2><p class="draft-subtitle">${data[3]}</p><div class="blank-note">✧<br>${data[4]}<br><small>这一页，暂且留白。</small></div><button class="draft-return" data-chapter="toc">返回记忆目录 →</button>` + number(data[5] + 1);
    }
    $('#scene-label').textContent = opened ? names[chapter] : '每一段记忆，都有自己的魔法';
    $('#previous-page').disabled = chapter === 'toc';
    $('#next-page').disabled = chapter === 'notes' && diaryIndex+diaryStep()>=diaryPages.length;
    if(chapter==='notes'&&opened&&diaryPages.length)$('#scene-label').textContent=names.notes+' · '+(Math.floor(diaryIndex/diaryStep())+1)+' / '+Math.ceil(diaryPages.length/diaryStep());
    document.querySelectorAll('.ribbon').forEach(b => { b.classList.toggle('active', b.dataset.chapter === chapter); if (b.dataset.chapter === chapter) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  }

  function lockPages(locked) {
    spread.inert = locked; $('#ribbons').inert = locked; $('.book-nav').inert = locked;
  }

  function afterCoverTransition(done) {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true; clearTimeout(settleTimer);
      cover.removeEventListener('transitionend', onEnd);
      coverAnimationFinish = null; done();
    };
    const onEnd = event => { if (event.target === cover && event.propertyName === 'transform') finish(); };
    cover.addEventListener('transitionend', onEnd);
    coverAnimationFinish = finish;
    // The event owns the handoff; the timer covers cancelled/background transitions.
    settleTimer = setTimeout(finish, reduced ? 30 : 1800);
  }

  function openBook() {
    if (busy || opened) return;
    busy = true; opened = true; chapter = 'toc'; render();
    lockPages(true);
    book.classList.add('opening', 'open'); world.classList.add('is-open');
    $('#eye-button').disabled = true;
    afterCoverTransition(() => {
      book.classList.remove('opening'); book.classList.add('settled');
      busy = false; lockPages(false);
      right.querySelector('h2')?.focus({ preventScroll: true });
    });
  }
  function closeBook() {
    if (busy || !opened) return;
    busy = true; audio.pause(); opened = false;
    lockPages(true);
    // Carry the visible left leaf with the cover instead of leaving it underneath.
    if (chapter !== 'toc' && !matchMedia('(max-width:860px)').matches) {
      const leaf = left.cloneNode(true);
      leaf.removeAttribute('id'); leaf.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      leaf.inert = true; coverBack.replaceChildren(leaf); coverBack.classList.add('closing-leaf');
    }
    book.classList.add('closing');
    book.classList.remove('settled');
    // Paint the restored, fully open cover before starting the reverse transition.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      book.classList.remove('open');
      afterCoverTransition(() => {
        book.classList.remove('closing'); world.classList.remove('is-open');
        coverBack.classList.remove('closing-leaf'); coverBack.innerHTML = endpaper;
        busy = false; $('#eye-button').disabled = false; $('#eye-button').focus({ preventScroll: true });
      });
    }));
    $('#scene-label').textContent = '每一段记忆，都有自己的魔法';
  }
  function goChapter(target, targetDiaryIndex=0) {
    if (!opened || busy || (target === chapter && (target!=='notes'||targetDiaryIndex===diaryIndex)) || !chapters.includes(target)) return;
    busy = true;
    const backward = target===chapter ? targetDiaryIndex<diaryIndex : chapters.indexOf(target) < chapters.indexOf(chapter);
    const mobile = matchMedia('(max-width:860px)').matches;
    const source = (backward && !mobile ? left : right).cloneNode(true);
    const stationary = backward ? right : left;
    const oldStationary = [...stationary.childNodes];
    const oldClass = stationary.className;
    chapter = target;if(target==='notes')diaryIndex=targetDiaryIndex;render();
    if (reduced) { busy = false; right.querySelector('h2')?.focus({ preventScroll: true }); return; }
    const destination = (backward || mobile ? right : left).cloneNode(true);
    // Keep the stationary old page intact until the moving back face fully covers it.
    if (!mobile) { stationary.replaceChildren(...oldStationary); stationary.className = oldClass; }
    lockPages(true);
    BookPageTurn.run({turn,book,source,destination,width:right.offsetWidth,height:right.offsetHeight,backward,onFinish:()=>{
      render();busy=false;lockPages(false);right.querySelector('h2')?.focus({preventScroll:true});
    }});
  }

  async function countVisitor() {
    const counter = $('#visitor-count');
    let id;
    try {
      const key = 'scattermemory.visitor.v1';
      id = localStorage.getItem(key);
      if (!/^[0-9a-f-]{36}$/i.test(id || '')) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
    } catch { id = null; }
    try {
      const response = await fetch('./api/visitors', {
        method: id ? 'POST' : 'GET',
        ...(id ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) } : {}),
        cache: 'no-store', signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error('Counter unavailable');
      const { count } = await response.json();
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid count');
      counter.textContent = count.toLocaleString('en-US');
      counter.title = `累计访客 ${count} · 按浏览器匿名去重`;
      counter.setAttribute('aria-label', counter.title);
    } catch {
      counter.textContent = '—'; counter.title = '访客统计暂不可用'; counter.setAttribute('aria-label', counter.title);
    }
  }

  document.addEventListener('click', e => { const b = e.target.closest('[data-chapter]'); if (b) goChapter(b.dataset.chapter); });
  $('#eye-button').addEventListener('click', openBook);
  $('#close-book').addEventListener('click', closeBook);
  $('#home-link').addEventListener('click', e => { e.preventDefault(); if (opened) closeBook(); else $('#eye-button').focus(); });
  $('#toc-button').addEventListener('click', () => goChapter('toc'));
  $('#previous-page').addEventListener('click', () => turnPage(-1));
  $('#next-page').addEventListener('click', () => turnPage(1));
  document.addEventListener('keydown', e => {
    if (diaryGallery.open || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || !opened) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); turnPage(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); turnPage(-1); }
    if (e.key === 'Escape') closeBook();
  });

  function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4200); }
  const time = n => { if (!Number.isFinite(n)) return '00:00'; return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(Math.floor(n % 60)).padStart(2, '0'); };
  function renderTracks() {
    const list = $('#music-list'); if (!list) return;
    list.innerHTML = tracks.length ? tracks.map((t, i) => `<button class="track-row ${i === selected ? 'selected' : ''}" data-track="${i}" aria-label="播放 ${esc(t.title)}"><span class="track-index">${String(i + 1).padStart(2, '0')}</span><span style="min-width:0"><span class="track-title">${esc(t.title)}</span><span class="track-artist">${esc(t.artist)}${t.local ? ' · 本地试听' : ''}</span></span>${icon(i === selected && !audio.paused ? 'pause' : 'play')}</button>`).join('') : `<div class="empty-music"><span class="music-symbol">♬</span><h3>旋律尚未落笔</h3><p>第一首作品，即将在这里响起。<br>你也可以先选择一首 MP3，试听这一页。</p></div>`;
    $('.track-count').textContent = String(tracks.length).padStart(2, '0') + ' 首旋律';
  }
  async function playTrack(index) {
    if (!tracks.length || index < 0 || index >= tracks.length) return;
    if (selected !== index) { selected = index; audio.src = tracks[index].src; audio.load(); }
    try { await audio.play(); } catch (error) { if (error.name !== 'AbortError') toast('这首音乐暂时无法播放，请检查文件是否有效，或重新选择 MP3。'); }
    updatePlayer(); renderTracks();
  }
  function advance(direction) {
    if (!tracks.length) return;
    let next = (Math.max(selected, 0) + direction + tracks.length) % tracks.length;
    if (shuffle && tracks.length > 1) { next = (Math.max(selected, 0) + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length; }
    playTrack(next);
  }
  function bindPlayer() {
    $('#music-list').addEventListener('click', e => { const row = e.target.closest('[data-track]'); if (!row) return; const i = Number(row.dataset.track); if (i === selected && !audio.paused) audio.pause(); else playTrack(i); });
    $('#import-music').addEventListener('click', () => $('#file-input').click());
    $('#play-toggle').addEventListener('click', () => { if (audio.paused) playTrack(selected < 0 ? 0 : selected); else audio.pause(); });
    $('#prev-track').addEventListener('click', () => advance(-1));
    $('#next-track').addEventListener('click', () => advance(1));
    $('#shuffle').addEventListener('click', e => { shuffle = !shuffle; e.currentTarget.setAttribute('aria-pressed', String(shuffle)); });
    $('#repeat').addEventListener('click', e => { audio.loop = !audio.loop; e.currentTarget.setAttribute('aria-pressed', String(audio.loop)); });
    $('#seek').addEventListener('input', e => { if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = audio.duration * Number(e.target.value) / 1000; });
    $('#volume').addEventListener('input', e => { audio.volume = Number(e.target.value); });
  }
  function updatePlayer() {
    $('.record')?.classList.toggle('playing', !audio.paused);
    $('#footer-label').textContent = 'THE STORY CONTINUES';
    if (!$('#play-toggle')) return;
    $('#now-playing').textContent = selected >= 0 ? tracks[selected].title : tracks.length ? '选择一首旋律' : '等待第一首旋律';
    $('#play-toggle').innerHTML = icon(audio.paused ? 'play' : 'pause');
    $('#play-toggle').setAttribute('aria-label', audio.paused ? '播放' : '暂停');
    for (const s of ['#play-toggle', '#prev-track', '#next-track', '#shuffle', '#repeat']) $(s).disabled = !tracks.length;
    $('#seek').disabled = !Number.isFinite(audio.duration) || audio.duration <= 0;
    $('#seek').value = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.currentTime / audio.duration * 1000 : 0;
    $('#current-time').textContent = time(audio.currentTime); $('#duration').textContent = time(audio.duration);
  }
  $('#file-input').addEventListener('change', e => {
    const files = Array.from(e.target.files || []).filter(f => /\.mp3$/i.test(f.name));
    if (!files.length) { if (e.target.files.length) toast('请选择 MP3 格式的音乐文件。'); e.target.value = ''; return; }
    let added = 0;
    for (const file of files) {
      const key = `${file.name}/${file.size}/${file.lastModified}`;
      if (tracks.some(t => t.fileKey === key)) continue;
      const url = URL.createObjectURL(file); objectURLs.push(url);
      tracks.push({ title: file.name.replace(/\.mp3$/i, ''), artist: 'ScatterMemory', src: url, local: true, fileKey: key }); added++;
    }
    renderTracks(); updatePlayer(); e.target.value = '';
    toast(added ? `已加入 ${added} 首本地音乐，点击曲目即可试听。文件不会上传。` : '这些音乐已经在试听列表里了。');
  });
  for (const event of ['timeupdate', 'loadedmetadata', 'durationchange', 'volumechange']) audio.addEventListener(event, updatePlayer);
  for (const event of ['play', 'pause', 'ended']) audio.addEventListener(event, () => { updatePlayer(); renderTracks(); });
  audio.addEventListener('ended', () => { if (!audio.loop && tracks.length && (shuffle || selected < tracks.length - 1)) advance(1); });
  audio.addEventListener('error', () => { updatePlayer(); toast('音乐文件无法读取，请重新选择文件，或稍后再试。'); });
  audio.volume = .65;

  // Iris fibers are vector strokes so the moving eye stays sharp at every size.
  let fibers = '';
  for (let i = 0; i < 112; i++) {
    const a = i * Math.PI * 2 / 112, r = 24 + Math.sin(i * 8.7) * 4, end = 45 + Math.sin(i * 3) * 2;
    const x = r => 150 + Math.cos(a) * r, y = r => 110 + Math.sin(a) * r;
    fibers += `<path d="M${x(r).toFixed(2)} ${y(r).toFixed(2)}L${x(end).toFixed(2)} ${y(end).toFixed(2)}" stroke="${i % 3 ? '#90b79a' : '#b5aa67'}" opacity="${i % 4 ? '.43' : '.7'}" stroke-width=".65"/>`;
  }
  $('#iris-fibers').innerHTML = fibers;
  let eyeTarget = { x: 0, y: 0 }, eyePos = { x: 0, y: 0 };
  window.addEventListener('pointermove', e => {
    if (opened || reduced || e.pointerType === 'touch') return;
    const r = $('.eye-art').getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const distance = Math.hypot(dx, dy) || 1;
    eyeTarget = { x: dx / distance * Math.min(20, distance / 15), y: dy / distance * Math.min(13, distance / 22) };
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { eyeTarget = { x: 0, y: 0 }; });
  const canvas = $('#dust'), ctx = canvas.getContext('2d'); let cw = 0, ch = 0;
  function sizeCanvas() { cw = innerWidth; ch = innerHeight; const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = cw * dpr; canvas.height = ch * dpr; ctx?.setTransform(dpr, 0, 0, dpr, 0, 0); }
  sizeCanvas(); window.addEventListener('resize', sizeCanvas);
  const motes = Array.from({ length: 43 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .3, speed: Math.random() * .000035 + .00001, phase: Math.random() * 6.28 }));
  let lastFrame = 0;
  function animate(now) {
    requestAnimationFrame(animate);
    if (document.hidden || now - lastFrame < 30) return;
    const dt = Math.min(now - lastFrame, 60); lastFrame = now;
    if (reduced) return;
    if (!opened) { eyePos.x += (eyeTarget.x - eyePos.x) * .13; eyePos.y += (eyeTarget.y - eyePos.y) * .13; $('#iris').setAttribute('transform', `translate(${eyePos.x.toFixed(2)} ${eyePos.y.toFixed(2)})`); }
    if (!ctx) return;
    ctx.clearRect(0, 0, cw, ch);
    for (const p of motes) { p.y -= p.speed * dt / 16; if (p.y < 0) p.y = 1; const alpha = .15 + .25 * (1 + Math.sin(now / 2700 + p.phase)) / 2; ctx.beginPath(); ctx.fillStyle = `rgba(211,191,127,${alpha})`; ctx.arc(p.x * cw + Math.sin(now / 6000 + p.phase) * 10, p.y * ch, p.r, 0, Math.PI * 2); ctx.fill(); }
  }
  function applyMotion() {
    document.documentElement.classList.toggle('reduced-motion', reduced);
    document.documentElement.classList.toggle('allow-motion', !reduced);
    $('#motion-toggle').setAttribute('aria-pressed', String(reduced)); $('#motion-toggle').querySelector('span').textContent = reduced ? '关' : '开';
    if (reduced) { ctx?.clearRect(0, 0, cw, ch); $('#iris').removeAttribute('transform'); eyePos = eyeTarget = { x: 0, y: 0 }; coverAnimationFinish?.(); }
  }

  window.addEventListener('pagehide', () => { audio.pause(); });
  window.addEventListener('beforeunload', () => { objectURLs.forEach(url => URL.revokeObjectURL(url)); clearTimeout(settleTimer); });
  render(); applyMotion(); requestAnimationFrame(animate);

  let stowPending = false;
  window.addEventListener('message', event => {
    if(event.source !== parent || (event.origin !== location.origin && event.origin !== 'null') || event.data?.type !== 'study-stow') return;
    if(stowPending) return; stowPending = true;
    const finishStow = () => {
      if(busy) {setTimeout(finishStow, 80);return;}
      if(opened) {closeBook();setTimeout(finishStow,80);return;}
      stowPending=false;parent.postMessage({type:'study-stowed'},location.protocol === 'file:' ? '*' : location.origin);
    }; finishStow();
  });
})();
