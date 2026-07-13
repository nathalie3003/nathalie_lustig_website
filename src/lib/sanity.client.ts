import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { projectId, dataset, apiVersion } from "../../sanity/env";

export const sanityClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: unknown) => builder.image(source as never);

// Pull the source pixel dimensions out of a Sanity image asset _ref
// (format: `image-<id>-<width>x<height>-<format>`) so cover images can be laid
// out at their true aspect ratio instead of forced into a fixed crop.
export function imageDimensions(
  source: { asset?: { _ref?: string } } | undefined | null,
): { width: number; height: number } | null {
  const ref = source?.asset?._ref;
  if (!ref) return null;
  const [w, h] = (ref.split("-")[2] ?? "").split("x").map(Number);
  if (!w || !h) return null;
  return { width: w, height: h };
}
