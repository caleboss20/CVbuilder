/**
 * Turns whatever an organiser pastes (a WhatsApp list, an Excel column, a typed list) into clean
 * names, one per certificate. Pure functions, so it is easy to test and runs in the browser.
 */

/** The most certificates one batch may hold for now. */
export const MAX_NAMES = 500;

/** Example Ghanaian names, a mix of women and men, for trying the tool without typing. */
export const SAMPLE_NAMES = [
  "Akosua Mensah",
  "Kwame Boateng",
  "Abena Owusu",
  "Kofi Asante",
  "Ama Serwaa Darko",
  "Yaw Appiah",
  "Efua Quaye",
  "Kwesi Annan",
  "Adwoa Frimpong",
  "Kojo Antwi",
  "Esi Acheampong",
  "Nana Yaw Opoku",
  "Afia Nyarko",
  "Kwabena Ofori",
  "Akua Badu",
  "Fiifi Ankrah",
  "Naa Dedei Tetteh",
  "Mawuli Agbenyega",
  "Selorm Amegashie",
  "Ewurabena Quansah",
  "Yaa Asantewaa Boakye",
  "Kwaku Sarpong",
  "Abigail Addo",
  "Emmanuel Tagoe",
  "Gifty Ofosu-Appiah",
  "Prince Amoako",
  "Comfort Adjei",
  "Samuel Lamptey",
  "Mavis Koomson",
  "Ebenezer Kumi",
];

export type ParsedNames = {
  /** Clean names in the order they were given. */
  names: string[];
  /** Names that were repeated and left out. */
  duplicates: number;
  /** Names whose capital letters were fixed (for example KWAME BOATENG). */
  recased: number;
  /** Names beyond the limit that were left out. */
  overLimit: number;
};

/** "kwame boateng" or "KWAME BOATENG" -> "Kwame Boateng"; also after hyphens and apostrophes. */
function titleCase(name: string): string {
  return name.toLowerCase().replace(/(^|[\s\-'’.])(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase());
}

/**
 * Fix names typed in one case only. A name that already mixes cases (McDonald, Nana Yaw) is left
 * alone. "Nearly all capitals" counts too, because a lowercase Ghanaian letter such as ɛ or ɔ often
 * sneaks into an otherwise all-capital name (KOFI ɛNYONAM).
 */
function needsRecase(name: string): boolean {
  const letters = Array.from(name.replace(/[^\p{L}]/gu, ""));
  if (letters.length < 2) return false;
  const upper = letters.filter((ch) => ch !== ch.toLowerCase()).length;
  return upper === 0 || upper / letters.length >= 0.85;
}

/**
 * Reads a pasted list. One name per line is the normal case. A list on a single line is split on
 * commas, semicolons or tabs. Numbering and bullets are removed, extra spaces collapsed, and
 * duplicates dropped.
 */
export function parseNames(raw: string): ParsedNames {
  const text = raw.replace(/\r/g, "").trim();
  const pieces = text.includes("\n") ? text.split("\n") : text.split(/[,;\t]/);

  const seen = new Set<string>();
  const names: string[] = [];
  let duplicates = 0;
  let recased = 0;
  let overLimit = 0;

  for (const piece of pieces) {
    // Excel pastes columns separated by tabs: the first column is the name
    let name = piece.split("\t")[0]
      // "1." "2)" "3 -" "-" "•" at the start
      .replace(/^\s*(?:\d+\s*[.)\-:]|[-•*·])\s*/, "")
      .replace(/\s+/g, " ")
      .trim()
      // stray commas or full stops at the end
      .replace(/[,;.]+$/, "");

    if (!name || !/\p{L}/u.test(name)) continue;

    if (needsRecase(name)) {
      name = titleCase(name);
      recased++;
    }

    const key = name.toLowerCase();
    if (seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);

    if (names.length >= MAX_NAMES) {
      overLimit++;
      continue;
    }
    names.push(name);
  }

  return { names, duplicates, recased, overLimit };
}

/** A safe file name for one certificate, such as "Kwame_Boateng". Numbered when two names collide. */
export function fileNameFor(name: string, used: Set<string>): string {
  const base = name.normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "certificate";
  let candidate = base;
  for (let n = 2; used.has(candidate.toLowerCase()); n++) candidate = `${base}_${n}`;
  used.add(candidate.toLowerCase());
  return candidate;
}
