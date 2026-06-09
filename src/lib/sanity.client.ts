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
