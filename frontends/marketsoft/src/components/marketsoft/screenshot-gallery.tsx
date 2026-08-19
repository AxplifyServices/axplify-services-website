'use client';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const slides = [
  {src:'/screenshots/dashboard-01.svg',alt:'MarketSoft dashboard placeholder'},
  {src:'/screenshots/storefront-01.svg',alt:'MarketSoft storefront placeholder'},
  {src:'/screenshots/orders-01.svg',alt:'MarketSoft orders placeholder'}
];
export function ScreenshotGallery(){
  const [index,setIndex]=useState(0); const [full,setFull]=useState(false);
  const previous=()=>setIndex(v=>(v-1+slides.length)%slides.length); const next=()=>setIndex(v=>(v+1)%slides.length);
  useEffect(()=>{if(!full)return; const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setFull(false);if(e.key==='ArrowLeft')previous();if(e.key==='ArrowRight')next();}; window.addEventListener('keydown',onKey); return()=>window.removeEventListener('keydown',onKey);},[full]);
  const content=<div className="ms-gallery__viewer"><Image src={slides[index].src} alt={slides[index].alt} width={1600} height={900} priority={index===0}/><button type="button" className="ms-gallery__nav ms-gallery__nav--left" onClick={previous} aria-label="Previous"><ChevronLeft/></button><button type="button" className="ms-gallery__nav ms-gallery__nav--right" onClick={next} aria-label="Next"><ChevronRight/></button>{full?<button type="button" className="ms-gallery__close" onClick={()=>setFull(false)} aria-label="Close"><X/></button>:<button type="button" className="ms-gallery__expand" onClick={()=>setFull(true)} aria-label="Fullscreen"><Maximize2/></button>}</div>;
  return <div className="ms-gallery">{content}<div className="ms-gallery__dots">{slides.map((_,i)=><button key={i} type="button" data-active={i===index} onClick={()=>setIndex(i)} aria-label={`Slide ${i+1}`}/>)}</div>{full&&<div className="ms-gallery__modal" role="dialog" aria-modal="true">{content}</div>}</div>
}
