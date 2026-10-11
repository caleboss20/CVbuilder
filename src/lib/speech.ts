"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Minimal typings for the browser Speech Recognition API (Chrome, Edge, Android). */
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Live speech-to-text. `text` holds everything said so far (final + in-progress
 * words). Uses Ghanaian English first, which also understands local names.
 */
export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const rec = useRef<Recognition | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature check after mount
    setSupported(!!getCtor());
    return () => rec.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    setError("");
    setInterim("");
    const r = new Ctor();
    r.lang = "en-GH";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let fin = "";
      let mid = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) fin += res[0].transcript;
        else mid += res[0].transcript;
      }
      if (fin) setFinalText((t) => `${t} ${fin}`.trim());
      setInterim(mid);
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access was blocked. Allow the mic in your browser settings, or type instead.");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setError("We couldn't hear that clearly. Try again, or type instead.");
      }
    };
    r.onend = () => {
      setListening(false);
      setInterim("");
    };
    rec.current = r;
    r.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => rec.current?.stop(), []);

  const text = `${finalText} ${interim}`.trim();
  return { supported, listening, text, setText: setFinalText, error, start, stop };
}
