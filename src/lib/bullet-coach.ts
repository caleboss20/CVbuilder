import { isActionWord, weakPhrasesIn, wordCount } from "./cv-check";

/*
 * Live coaching for one bullet point, as a student types it. It reuses the same
 * rules as the CV checker, so a bullet that passes here also scores well there.
 * No AI: it looks at the first word, numbers, filler phrases and length.
 *
 * The coach gives ONE tip at a time, the most important one, so it never feels
 * like a wall of warnings.
 */

export type CoachTone = "good" | "tip" | "fix";

export type Coaching = {
  tone: CoachTone;
  /** One plain sentence. */
  message: string;
  /** Opening words the student can tap to put at the start of the bullet. */
  verbs?: string[];
};

/** Strong openers to offer when a bullet starts with a weak word. */
const OPENERS = ["Led", "Built", "Organised", "Trained", "Managed", "Supported"];

/** Returns null for an empty bullet, otherwise the most useful single tip. */
export function coachBullet(text: string): Coaching | null {
  const bullet = text.trim();
  if (!bullet) return null;

  if (wordCount(bullet) < 4) {
    return { tone: "tip", message: "Say a little more: what did you do, and what changed?" };
  }

  const filler = weakPhrasesIn(bullet);
  if (filler.length > 0) {
    return {
      tone: "fix",
      message: `“${filler[0]}” says little. Say what you actually did instead.`,
      verbs: OPENERS,
    };
  }

  if (!isActionWord(bullet.split(/\s+/)[0])) {
    return { tone: "tip", message: "Start with an action word.", verbs: OPENERS };
  }

  if (!/\d/.test(bullet)) {
    return { tone: "tip", message: "Add a number: how many, how often or how much. For example “Trained 40 volunteers”." };
  }

  if (wordCount(bullet) > 30) {
    return { tone: "tip", message: "A bit long. Keep it to one or two lines so it gets read." };
  }

  return { tone: "good", message: "Strong bullet." };
}

/**
 * Puts an opening verb in front of a bullet. If the bullet already starts with a
 * filler phrase ("Responsible for ...") that phrase is dropped first. The rest is
 * lower-cased unless it starts with an acronym, and the student finishes the grammar.
 */
export function startWith(verb: string, text: string): string {
  const withoutFiller = text.trim().replace(/^(responsible for|duties (included|include)|worked on|tasked with|in charge of)\s+/i, "");
  const rest = /^[A-Z]{2,}/.test(withoutFiller) ? withoutFiller : withoutFiller.charAt(0).toLowerCase() + withoutFiller.slice(1);
  return `${verb} ${rest}`;
}
