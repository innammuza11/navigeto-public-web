'use strict';
const photos=JSON.parse(document.querySelector('#photo-data').textContent);
const dialog=document.querySelector('.viewer');
const image=document.querySelector('#viewer-image');
let visible=photos.map((_,i)=>i),viewerIndices=[...visible],current=0,opener=null,startX=null;
function show(index){current=(index+viewerIndices.length)%viewerIndices.length;const photo=photos[viewerIndices[current]];image.src='/guest-album/images/'+photo.id+'.webp';image.alt=photo.caption;document.querySelector('#viewer-caption').textContent=photo.caption;document.querySelector('#viewer-count').textContent=(current+1)+' / '+viewerIndices.length;}
document.querySelectorAll('[data-photo]').forEach(link=>link.addEventListener('click',event=>{if(!dialog.showModal)return;event.preventDefault();const index=Number(link.dataset.photo);viewerIndices=visible.includes(index)?[...visible]:photos.map((_,i)=>i);opener=link;show(viewerIndices.indexOf(index));dialog.showModal();}));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));visible=[];document.querySelectorAll('.moment').forEach((card,index)=>{card.hidden=category!=='All moments'&&card.dataset.category!==category;if(!card.hidden)visible.push(index);});document.querySelector('.count').textContent=visible.length+' photographs';}));
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
dialog.querySelector('.previous').addEventListener('click',()=>show(current-1));
dialog.querySelector('.next').addEventListener('click',()=>show(current+1));
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(current-1);}if(event.key==='ArrowRight'){event.preventDefault();show(current+1);}});
image.addEventListener('touchstart',event=>{startX=event.changedTouches[0].clientX;},{passive:true});
image.addEventListener('touchend',event=>{if(startX===null)return;const delta=event.changedTouches[0].clientX-startX;if(Math.abs(delta)>55)show(current+(delta<0?1:-1));startX=null;},{passive:true});
