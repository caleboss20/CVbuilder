import type { ReactNode } from "react";
import { demoPersonas, type DemoPersona } from "@/lib/ai-demo";
import { getCvExample } from "@/lib/cv-examples";
import { AtsCv } from "@/components/cv/ats-cv";
import {
  ClassicTemplate,
  SidebarTemplate,
  type DemoTemplateProps,
} from "./ai-demo-templates";

/** Props that render a demo template fully filled in, with nothing animating. */
function completed(persona: DemoPersona): DemoTemplateProps {
  return {
    persona,
    current: persona.examples[0],
    filled: Object.fromEntries(persona.examples.map((e) => [e.section, e])),
    phase: "typing",
    words: [],
    written: 0,
  };
}

/**
 * Renders a full-size CV page (600px wide) shrunk down to a thumbnail,
 * so the text is real rather than placeholder bars.
 */
export function ScaledPage({ children }: { children: ReactNode }) {
  return (
    <div className="h-[146px] w-[104px] overflow-hidden rounded-[3px] bg-white sm:h-[212px] sm:w-[150px]">
      <div className="@container w-[600px] origin-top-left scale-[0.1733] sm:scale-[0.25]">{children}</div>
    </div>
  );
}

export function MonochromeThumb() {
  return <SidebarTemplate {...completed(demoPersonas[0])} />;
}

export function ClassicBlueThumb() {
  return <ClassicTemplate {...completed(demoPersonas[1])} />;
}

/** ATS Classic: the nursing example rendered with the shared ATS layout. */
export function AtsClassicThumb() {
  const nursing = getCvExample("nursing");
  return nursing ? <AtsCv doc={nursing.cv} /> : null;
}
