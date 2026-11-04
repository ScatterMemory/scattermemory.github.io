(() => {
 const $=s=>document.querySelector(s),book=$('#diary-book'),left=$('#diary-left'),right=$('#diary-right');
 let entries=[];try{entries=Diary.validate(window.SCATTER_DIARY||[]);}catch(e){console.error(e.message);}
 const gallery=Diary.createGallery(id=>entries.find(e=>e.id===id));
 let pages=[],index=0,busy=false,finishTurn,resizeTimer;
 const step=()=>matchMedia('(max-width:700px)').matches?1:2;
 function build(){pages=entries.flatMap((e,i)=>Diary.paginate(e,right.clientWidth,right.clientHeight,{number:i+1}));index=Math.min(index,Math.max(0,pages.length-1));if(step()===2)index-=index%2;}
 function content(at){return {left:Diary.html(pages[at]),right:Diary.html(pages[at+(step()===1?0:1)])};}
 function render(){const c=content(index);left.innerHTML=c.left;right.innerHTML=c.right;$('#diary-position').textContent=pages.length?`${Math.floor(index/step())+1} / ${Math.ceil(pages.length/step())}`:'待续';$('#diary-prev').disabled=busy||index===0;$('#diary-next').disabled=busy||index+step()>=pages.length;}
 function turn(target){if(busy||target<0||target>=pages.length)return;busy=true;const backward=target<index,source=(backward&&step()===2?left:right).cloneNode(true),c=content(target),destination=(backward||step()===1?right:left).cloneNode(false);destination.innerHTML=backward||step()===1?c.right:c.left;if(backward&&step()===2)left.innerHTML=c.left;else right.innerHTML=c.right;left.inert=right.inert=true;$('#diary-prev').disabled=$('#diary-next').disabled=true;finishTurn=BookPageTurn.run({turn:$('#diary-turn'),book,source,destination,width:right.offsetWidth,height:right.offsetHeight,backward,onFinish:()=>{index=target;busy=false;finishTurn=null;left.inert=right.inert=false;render();}});}
 $('#diary-prev').onclick=()=>turn(index-step());$('#diary-next').onclick=()=>turn(index+step());
 document.addEventListener('keydown',e=>{if(gallery.open)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();turn(index+(e.key==='ArrowRight'?step():-step()));}});
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{finishTurn?.();build();render();},150);});
 build();render();
})();
