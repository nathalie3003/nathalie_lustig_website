import { INTRO_PAINTINGS } from "@/content/introPaintings";

// Design exploration (Nov 2026): two directions ALFIE and Nathalie are
// comparing before choosing one.
//
//   hero:    "classic" is today's homepage; "landing" opens on a full-screen
//            painting hero and the notes slide up over it on scroll;
//            "frontpage" sets the homepage as a publication front page led by
//            the latest note and its own figures.
//   texture: "none" is today's flat white; the rest add a background texture
//            that runs the length of the page.
//   footer:  "plain" is today's footer; the others set it apart as a band.
//
// The choice lives on <html> as data-hero / data-texture / data-footer, set by LOOK_SCRIPT
// before first paint so there is no flash. It comes from ?hero= / ?texture= / ?footer= in
// the URL, else from what the switcher last saved. None of it runs on the live
// domain: there the site looks exactly as it does today.

export const LOOK_HOST_LIVE = "thebasispoint.finance";

export const HERO_OPTIONS = [
  { value: "classic", label: "Current" },
  { value: "landing", label: "Full-screen landing" },
  { value: "frontpage", label: "Front page" },
] as const;

export const TEXTURE_OPTIONS = [
  { value: "none", label: "Flat white (current)" },
  { value: "grain", label: "Paper grain" },
  { value: "guilloche", label: "Bond-certificate lines" },
  { value: "wash", label: "Raspberry wash" },
  { value: "gpt-guilloche", label: "ChatGPT engraving" },
  { value: "gpt-newsprint", label: "ChatGPT newsprint" },
  { value: "gpt-paper-wash", label: "ChatGPT paper + wash" },
] as const;

export const FOOTER_OPTIONS = [
  { value: "plain", label: "White (current)" },
  { value: "ink", label: "Ink band" },
  { value: "certificate", label: "Certificate band" },
] as const;

export type HeroLook = (typeof HERO_OPTIONS)[number]["value"];
export type TextureLook = (typeof TEXTURE_OPTIONS)[number]["value"];
export type FooterLook = (typeof FOOTER_OPTIONS)[number]["value"];

export const LOOK_KEYS = {
  hero: "bp-look-hero",
  texture: "bp-look-texture",
  footer: "bp-look-footer",
} as const;

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
