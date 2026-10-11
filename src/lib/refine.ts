/**
 * Turns spoken, casual words into CV lines.
 *
 * This is a simple rule-based tidy-up so the feature works without an AI key.
 * When an AI provider is added, replace `refineText` with a call to a server
 * route; the UI only depends on this function's signature.
 */

export type RefineKind = "bullets" | "summary" | "project";

const fillers = [
  /\b(um+|uh+|erm+|hmm+)\b/gi,
  /\b(you know|i mean|like i said|basically|actually|kind of|sort of)\b/gi,
  /^(so|okay|ok|well|and|but)\s+/i,
];

const verbs: [RegExp, string][] = [
  [/^(was )?(helping|helped|help) (to )?(organi[sz]e|plan)\w*/i, "Coordinated"],
  [/^(was )?(organi[sz]ing|organi[sz]ed|organi[sz]e)/i, "Organised"],
  [/^(was )?(helping|helped|help)( with)?/i, "Supported"],
  [/^(was )?(teaching|taught|teach)/i, "Taught"],
  [/^(was )?(leading|led|lead)/i, "Led"],
  [/^(was )?(managing|managed|manage)/i, "Managed"],
  [/^(was )?(building|built|build)/i, "Built"],
  [/^(was )?(making|made|make|creating|created)/i, "Created"],
  [/^(was )?(designing|designed)/i, "Designed"],
  [/^(was )?(fixing|fixed|fix)/i, "Resolved"],
  [/^(was )?(selling|sold)/i, "Sold"],
  [/^(was )?(counting|counted)/i, "Counted"],
  [/^(was )?(writing|wrote)/i, "Wrote"],
  [/^(was )?(training|trained)/i, "Trained"],
  [/^(was )?(serving|served|attending to|attended to)/i, "Served"],
  [/^(was )?(handling|handled)/i, "Handled"],
  [/^(was )?(checking|checked)/i, "Checked"],
  [/^(was )?(working|worked) (on|with)/i, "Worked on"],
  [/^(was )?(working|worked) (at|in|for)/i, "Worked at"],
  [/^(was )?(in charge of)/i, "Managed"],
  [/^(was )?(responsible for)/i, "Responsible for"],
];

function clean(text: string) {
  let t = text;
  // Run twice so stacked openers like "so um" both go
  for (let pass = 0; pass < 2; pass++) {
    for (const f of fillers) t = t.replace(f, " ").replace(/\s+/g, " ").trim();
  }
  return t;
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function finish(s: string) {
  const t = s.trim().replace(/[,;:\s]+$/, "");
  return t ? `${capitalise(t)}${/[.!?]$/.test(t) ? "" : "."}` : "";
}

/** "maybe 50 customers a day" -> "around 50 customers a day" */
function tidyNumbers(s: string) {
  return s.replace(/\b(maybe|about|like)\s+(\d)/gi, "around $2").replace(/\bpercent\b/gi, "%");
}

function toBullet(clause: string) {
  // "during vacation I worked at X" -> "worked at X during vacation"
  const lead = clean(clause).match(/^((?:during|in|over|last|this|for)\b[^,]*?),?\s+(?:i|we)\s+(.+)$/i);
  let c = (lead ? `${lead[2]} ${lead[1].toLowerCase()}` : clean(clause))
    .replace(/^(i|we|me and \w+|my team)\s+(also\s+)?/i, "")
    .replace(/^(would|used to|had to|got to)\s+/i, "");
  c = tidyNumbers(c);
  for (const [re, verb] of verbs) {
    if (re.test(c)) {
      c = c.replace(re, verb);
      break;
    }
  }
  return finish(c);
}

/** Splits speech into separate points at sentence breaks and joining words. */
function splitPoints(text: string) {
  return clean(text)
    .split(/[.!?]+|\b(?:and then|after that|also|then|plus)\b|,\s*(?=(?:i|we)\b)|\band\s+(?=(?:i|we)\s)/i)
    .map((s) => (s ?? "").trim())
    .filter((s) => s.split(/\s+/).length >= 3);
}

export function refineText(text: string, kind: RefineKind): string[] {
  const raw = text.trim();
  if (!raw) return [];

  if (kind === "summary") {
    const sentences = splitPoints(raw).map((s) =>
      finish(tidyNumbers(s.replace(/^i('m| am)\s+/i, "").replace(/\bi\b/g, "I"))),
    );
    return [sentences.slice(0, 3).join(" ")];
  }

  if (kind === "project") {
    const points = splitPoints(raw).map(toBullet);
    return [points.join(" ")];
  }

  const bullets = splitPoints(raw).map(toBullet).filter(Boolean);
  return bullets.length ? bullets.slice(0, 6) : [finish(raw)];
}
