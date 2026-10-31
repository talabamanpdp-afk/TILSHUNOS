/**
 * O‘zbek tili yangi alifbosi (Reformed Uzbek Latin Alphabet)
 * Sh, sh -> Ş, ş
 * Ch, ch -> Ç, ç
 * O‘, o‘, O', o' -> Ö, ö
 * G‘, g‘, G', g' -> Ğ, ğ
 * Loyiha nomi: TILŞUNOS / Tilşunos
 */

export function convertUzbekText(str: string): string {
  if (typeof str !== 'string' || !str) return str;

  // Skip URLs, storage paths, base64, raw HTML/SVG paths, pure color hexes, and email identifiers
  if (
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('data:') ||
    str.includes('supabase.co') ||
    str.includes('unsplash.com') ||
    (str.includes('@') && !str.includes(' ')) ||
    /^#[0-9a-fA-F]{3,8}$/.test(str)
  ) {
    return str;
  }

  return str
    .replace(/\bHorizoq\b/g, 'Hoziroq')
    .replace(/\bhorizoq\b/g, 'hoziroq')
    .replace(/TILSHUNOS/g, 'TILŞUNOS')
    .replace(/Tilshunos/g, 'Tilşunos')
    .replace(/tilshunos(?!\.onrender|\.app|-media|_cms|_token|_user|_role|_last)/g, 'tilşunos')
    // O' / O‘ / O` / O’ -> Ö
    .replace(/O[ʻ'‘`’]/g, 'Ö')
    .replace(/o[ʻ'‘`’]/g, 'ö')
    // G' / G‘ / G` / G’ -> Ğ
    .replace(/G[ʻ'‘`’]/g, 'Ğ')
    .replace(/g[ʻ'‘`’]/g, 'ğ')
    // SH / Sh / sh -> Ş / ş
    .replace(/SH(?=[A-ZŞÇĞÖ]|\b)/g, 'Ş')
    .replace(/Sh/g, 'Ş')
    .replace(/sh/g, 'ş')
    // CH / Ch / ch -> Ç / ç
    .replace(/CH(?=[A-ZŞÇĞÖ]|\b)/g, 'Ç')
    .replace(/Ch/g, 'Ç')
    .replace(/ch/g, 'ç');
}

export function sanitizeCmsData<T>(obj: T): T {
  if (typeof obj === 'string') {
    return convertUzbekText(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeCmsData(item)) as unknown as T;
  }
  if (obj && typeof obj === 'object') {
    const res: any = {};
    for (const key in obj) {
      if (['image', 'heroImage', 'heroMobileImage', 'heroBgDesktop', 'heroBgMobile', 'youtubeAudioUrl', 'videoUrl', 'url', 'avatar', 'token'].includes(key)) {
        res[key] = (obj as any)[key];
      } else {
        res[key] = sanitizeCmsData((obj as any)[key]);
      }
    }
    return res as T;
  }
  return obj;
}
