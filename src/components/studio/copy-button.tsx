"use client";

/**
 * Кнопка «Скопировать» (v0.0.74) — островок для press-kit на /studio.
 * Копирует текст в буфер обмена; страница студии сама по себе серверная,
 * поэтому clipboard живёт здесь.
 */

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  text,
  label = "Скопировать",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // старые браузеры без clipboard API — запасной путь
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-[#E8B95C]/50 px-3 py-1.5 text-sm font-bold hover:bg-[#E8B95C]/10 transition-colors ${className}`}
      aria-live="polite"
    >
      {copied ? (
        <Check className="size-4 text-[#E8B95C]" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
      {copied ? "Скопировано!" : label}
    </button>
  );
}
