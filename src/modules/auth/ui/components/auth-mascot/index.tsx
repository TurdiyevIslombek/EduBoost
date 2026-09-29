"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

// three.js is only downloaded where the mascot is actually visible (lg+).
const MascotScene = dynamic(
  () => import("./mascot-scene").then((mod) => ({ default: mod.MascotScene })),
  { ssr: false },
);

export const AuthMascot = () => {
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const handleError = useCallback(() => setFailed(true), []);

  return (
    <div className="relative w-full max-w-xl h-[clamp(260px,42vh,420px)]">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-200/25 blur-3xl"
      />
      {enabled && !failed && <MascotScene onError={handleError} />}
    </div>
  );
};
