import slugifyLib from "slugify";

export function createSlug(title: string): string {
  return slugifyLib(title, { lower: true, strict: true, trim: true });
}

export async function uniqueSlug(title: string, existsCheck: (slug: string) => Promise<boolean>): Promise<string> {
  let slug = createSlug(title);
  let exists = await existsCheck(slug);
  let counter = 1;

  while (exists) {
    slug = `${createSlug(title)}-${counter}`;
    exists = await existsCheck(slug);
    counter++;
  }

  return slug;
}
