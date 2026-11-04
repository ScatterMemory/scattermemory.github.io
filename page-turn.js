// Shared by the original life book and every reading journal.
(() => {
  function ease(x) {
    const cubic=(t,a,b)=>3*(1-t)**2*t*a+3*(1-t)*t*t*b+t**3;
    let lo=0,hi=1;for(let i=0;i<14;i++){const t=(lo+hi)/2;if(cubic(t,.32,.18)<x)lo=t;else hi=t;}
    return cubic((lo+hi)/2,.02,1);
  }
  window.BookPageTurn={run({turn,book,source,destination,width,height,backward,onFinish}){
    turn.className='turnsheet turning'+(backward?' backward':'');turn.replaceChildren();
    const count=12,stripWidth=width/count,strips=[];let parent=turn;
    for(let i=0;i<count;i++){
      const strip=document.createElement('div');strip.className='page-strip';strip.style.width=stripWidth+'px';
      for(const [side,original] of [['front',source],['back',destination]]){
        const face=document.createElement('div');face.className='strip-face strip-'+side;
        const snapshot=original.cloneNode(true);snapshot.classList.add('page-snapshot');snapshot.removeAttribute('id');snapshot.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));snapshot.inert=true;
        const offset=side==='front'?(backward?count-1-i:i):(backward?i:count-1-i);
        Object.assign(snapshot.style,{width:width+'px',height:height+'px',left:-offset*stripWidth+'px'});
        face.append(snapshot);strip.append(face);
      }
      parent.append(strip);parent=strip;strips.push(strip);
    }
    const shadow=document.createElement('div');shadow.className='page-cast-shadow';book.append(shadow);
    let started,raf,finished=false;
    const finish=()=>{if(finished)return;finished=true;cancelAnimationFrame(raf);turn.className='turnsheet';turn.replaceChildren();shadow.remove();onFinish();};
    const frame=now=>{
      if(finished)return;if(!started)started=now;const t=Math.min((now-started)/1150,1);if(t===1){finish();return;}
      const p=ease(t),bend=-42*Math.sin(Math.PI*p),direction=backward?1:-1;
      strips.forEach((strip,i)=>{const angle=i===0?180*p-bend/2:bend/(count-1);strip.style.transform=`rotateY(${direction*angle}deg)`;strip.style.setProperty('--shade',(Math.sin(Math.PI*p)*(.04+i/count*.15)).toFixed(3));});
      shadow.style.opacity=String(Math.sin(Math.PI*p)*.34);shadow.style.background=`linear-gradient(${backward?90:270}deg,transparent 8%,#34230c 50%,transparent 92%)`;
      raf=requestAnimationFrame(frame);
    };raf=requestAnimationFrame(frame);return finish;
  }};
})();
