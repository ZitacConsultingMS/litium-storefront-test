'use server';
import { cookies } from 'next/headers';
import setCookieParser from 'set-cookie-parser';
import { Token } from './constants';

export async function setCookieFromResponse(res: any) {
  const parsedCookies = setCookieParser.parse(
    res.__setCookie?.split(',').map((s: string) => s.trim())
  );
  parsedCookies?.forEach(async (cookie: any) => {
    (await cookies()).set(cookie.name, cookie.value, cookie);
  });
}

export async function deleteCookie(name = Token.Name) {
  (await cookies()).delete(name);
}
