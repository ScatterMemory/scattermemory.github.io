(() => {
 const grid=document.querySelector('#cover-grid'),dialog=document.querySelector('#cover-detail');
 for(const book of STUDY_BOOKS){const button=document.createElement('button');button.className='cover-card';const img=document.createElement('img');img.src=book.cover;img.alt=book.title+'的手记封面';img.loading='lazy';const number=document.createElement('small');number.textContent='VOLUME '+String(book.number).padStart(2,'0');const title=document.createElement('strong');title.textContent=book.title;button.append(img,number,title);button.addEventListener('click',()=>{const large=document.querySelector('#large-cover');large.src=book.cover;large.alt=book.title+'的手记封面';dialog.showModal();});grid.append(button);}
 document.querySelector('#close-cover').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();
