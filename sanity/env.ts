export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;

if (!projectId || !dataset || !apiVersion) {
  throw new Error("Missing Sanity env vars. Check .env.local");
}
