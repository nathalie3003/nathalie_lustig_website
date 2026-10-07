import {
  INTRO_PAINTINGS,
  INTRO_PER_VISIT,
  INTRO_WIDTHS,
} from "@/content/introPaintings";

// What the head script hands to the Intro component once it hydrates.
export type IntroPlan = {
  order: number[]; // indexes into INTRO_PAINTINGS, in showing order
  urls: string[];
  imgs: HTMLImageElement[]; // the preloads, read for load state
};

declare global {
  interface Window {
    __bpIntro?: IntroPlan;
    // performance.now() when the opening painting finished downloading
    __bpIntroT?: number;
  }
}

const [SMALL, LARGE] = INTRO_WIDTHS;

// Runs in <head> before first paint, inline, so it must stay plain ES5 with no
// imports at runtime. On a first visit (once per session, never under reduced
// motion, never in the Studio) it:
//
// - marks html[data-intro="on"], so the cover is on screen from the first
//   paint rather than the page flashing and then being covered;
// - picks this visit's paintings, starting on a different one from last time;
// - starts downloading them at once, the opening painting first, long before
//   the app's JavaScript arrives;
// - hands the opening painting to CSS as a background, so it appears the moment
//   it lands even if the app is still loading.
//
// The timeout is a failsafe: if the app never hydrates to lift the cover, it
// lifts itself.
export const INTRO_SCRIPT = `(function(){try{
var d=document.documentElement;
if(location.pathname.indexOf('/studio')===0)return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
if(sessionStorage.getItem('bp-intro-seen')==='1')return;
sessionStorage.setItem('bp-intro-seen','1');
var N=${JSON.stringify(INTRO_PAINTINGS.map((p) => p.name))};
var P=${JSON.stringify(INTRO_PAINTINGS.map((p) => p.position))};
var n=N.length,k=Math.min(n,${INTRO_PER_VISIT}),s=Math.floor(Math.random()*n);
try{var l=localStorage.getItem('bp-intro-last');if(n>1&&l!==null&&+l===s)s=(s+1+Math.floor(Math.random()*(n-1)))%n;localStorage.setItem('bp-intro-last',''+s);}catch(e){}
var w=Math.max(innerWidth,innerHeight)*Math.min(devicePixelRatio||1,2)>1400?${LARGE}:${SMALL};
var o=[],u=[],m=[];
for(var i=0;i<k;i++){var j=(s+i)%n;o.push(j);u.push('/intro/'+N[j]+'-'+w+'.webp');}
for(var i=0;i<k;i++){var im=new Image();if(i===0){im.fetchPriority='high';im.onload=function(){window.__bpIntroT=performance.now();};}im.src=u[i];m.push(im);}
window.__bpIntro={order:o,urls:u,imgs:m};
d.style.setProperty('--intro-first','url('+u[0]+')');
d.style.setProperty('--intro-first-pos',P[o[0]]);
d.setAttribute('data-intro','on');
setTimeout(function(){if(d.getAttribute('data-intro')==='on'){d.removeAttribute('data-intro');dispatchEvent(new Event('bp:intro-done'));}},8000);
}catch(e){}})();`;
