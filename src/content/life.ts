// Photos for the About page slideshow.
//
// TO ADD A PHOTO
//   1. Drop the image into public/life/ (any size; Next resizes it).
//   2. Add one line below: { src: "/life/<file name>", caption: "…" }.
//   That's it. Order here is the order they play in.
//
// Optional `position` nudges the crop when the subject isn't central, using
// CSS object-position, e.g. "50% 20%" keeps the top of a tall photo.
//
// Photos added in Sanity Studio (Site Settings → About — photos) take over
// from this list whenever there are any, so either place works.

export type LifeShot = { src: string; caption: string; position?: string };

export const lifeShots: LifeShot[] = [
  { src: "/life/coffee.jpg", caption: "Egg coffee, coconut coffee, chasing new flavours in Vietnam." },
  { src: "/life/pool.jpg", caption: "Self-proclaimed professional pool player." },
  { src: "/life/alps.jpg", caption: "Above the clouds in the French Alps. Skiing is non-negotiable." },
  { src: "/life/friends.jpg", caption: "An afternoon with my two best friends, my favourite way to spend one." },
  { src: "/life/angkor.jpg", caption: "Angkor Wat with my brother. Seeing the world with family." },
  { src: "/life/sunset.jpg", caption: "Sunset on the beach, phone away." },
];
