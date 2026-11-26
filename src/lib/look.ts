import { INTRO_PAINTINGS } from "@/content/introPaintings";

// Design exploration (Nov 2026): two directions ALFIE and Nathalie are
// comparing before choosing one.
//
//   hero:    "classic" is today's homepage; "landing" opens on a full-screen
//            painting hero and the notes slide up over it on scroll.
//   texture: "none" is today's flat white; the rest add a background texture
//            to the page and to the top and footer bands.
//
// The choice lives on <html> as data-hero / data-texture, set by LOOK_SCRIPT
// before first paint so there is no flash. It comes from ?hero= / ?texture= in
// the URL, else from what the switcher last saved. None of it runs on the live
// domain: there the site looks exactly as it does today.

export const LOOK_HOST_LIVE = "thebasispoint.finance";

export const HERO_OPTIONS = [
  { value: "classic", label: "Current" },
  { value: "landing", label: "Full-screen landing" },
] as const;

export const TEXTURE_OPTIONS = [
  { value: "none", label: "Flat white (current)" },
  { value: "grain", label: "Paper grain" },
  { value: "guilloche", label: "Bond-certificate lines" },
  { value: "wash", label: "Raspberry wash" },
  { value: "custom", label: "Your images" },
] as const;

export type HeroLook = (typeof HERO_OPTIONS)[number]["value"];
export type TextureLook = (typeof TEXTURE_OPTIONS)[number]["value"];

export const LOOK_KEYS = { hero: "bp-look-hero", texture: "bp-look-texture" } as const;

// Plain ES5, inline in <head>. Also picks the landing hero's painting for this
// visit and hands it to CSS as --landing-img.
export const LOOK_SCRIPT = `(function(){try{
var d=document.documentElement;
if(location.hostname==='${LOOK_HOST_LIVE}'||location.hostname==='www.${LOOK_HOST_LIVE}')return;
if(location.pathname.indexOf('/studio')===0)return;
var q=new URLSearchParams(location.search),K=${JSON.stringify(LOOK_KEYS)};
for(var k in K){var v=q.get(k);try{if(v)localStorage.setItem(K[k],v);else v=localStorage.getItem(K[k]);}catch(e){}if(v)d.setAttribute('data-'+k,v);}
var N=${JSON.stringify(INTRO_PAINTINGS.map((p) => p.name))};
var P=${JSON.stringify(INTRO_PAINTINGS.map((p) => p.position))};
var i=Math.floor(Math.random()*N.length);
var w=Math.max(innerWidth,innerHeight)*Math.min(devicePixelRatio||1,2)>1400?1920:1280;
d.style.setProperty('--landing-img','url(/intro/'+N[i]+'-'+w+'.webp)');
d.style.setProperty('--landing-pos',P[i]);
}catch(e){}})();`;
