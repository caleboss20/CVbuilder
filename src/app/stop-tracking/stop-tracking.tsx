"use client";

import { useEffect, useState } from "react";
import { OWNER_KEY, isOwnerDevice } from "@/lib/owner";

/** Turns analytics off or on for this browser, so your own visits are not counted. */
export function StopTracking() {
  const [off, setOff] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read from storage
    setOff(isOwnerDevice());
  }, []);

  function toggle() {
    try {
      if (off) localStorage.removeItem(OWNER_KEY);
      else localStorage.setItem(OWNER_KEY, "1");
    } catch {}
    setOff(!off);
  }

  return (
    <div className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-6">
      <h1 className="text-xl font-medium text-fg">{off ? "Analytics is off on this device" : "Analytics is on for this device"}</h1>
      <p className="mt-2 text-sm leading-relaxed text-fg/60">
        {off
          ? "Your visits and downloads here are no longer counted. Do this once on each phone and laptop you use."
          : "Turn it off on your own phone and laptop, so your visits do not count as students."}
      </p>
      <button
        type="button"
        onClick={toggle}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500"
      >
        {off ? "Turn analytics back on" : "Stop counting my visits"}
      </button>
    </div>
  );
}
