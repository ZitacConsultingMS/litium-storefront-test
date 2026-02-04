'use server';
import { revalidatePath } from 'next/cache';

/**
 * Revalidates the page at the given path.
 * @param path the path of the page to revalidate.
 */
export const revalidatePage = async function (path: string) {
  revalidatePath(path);
};
