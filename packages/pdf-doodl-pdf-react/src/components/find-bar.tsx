"use client";

/**
 * FindBar - Optional default UI for `usePdfFind`
 *
 * A minimal, unopinionated find-in-PDF input strip (query, match count,
 * prev/next, case-sensitive toggle, clear). Consumers who want fully custom
 * chrome should use `usePdfFind` directly and build their own UI — this
 * component exists so simple integrations don't have to hand-roll one.
 */

import { useEffect, useRef, type KeyboardEvent, type ReactElement } from "react";
import type { UsePdfFindReturn } from "../hooks/use-pdf-find";

export interface FindBarProps {
  /** Return value of `usePdfFind` */
  find: UsePdfFindReturn;
  /** Additional className for the root container */
  className?: string;
  /** Additional className for the text input */
  inputClassName?: string;
  /** Additional className applied to buttons */
  buttonClassName?: string;
  /** Input placeholder (default: "Find in document…") */
  placeholder?: string;
  /** Autofocus the input on mount (default: true) */
  autoFocus?: boolean;
  /** Show the case-sensitive toggle (default: true) */
  showCaseSensitiveToggle?: boolean;
}

const DEFAULT_BUTTON_CLASS =
  "px-2 py-1 text-xs border border-current/20 rounded-sm hover:bg-current/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

export function FindBar({
  find,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  placeholder = "Find in document…",
  autoFocus = true,
  showCaseSensitiveToggle = true,
}: FindBarProps): ReactElement {
  const {
    query,
    setQuery,
    caseSensitive,
    setCaseSensitive,
    matches,
    activeIndex,
    next,
    prev,
    clear,
    isSearching,
  } = find;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buttonClass = `${DEFAULT_BUTTON_CLASS} ${buttonClassName}`;
  const hasMatches = matches.length > 0;
  const countLabel = isSearching
    ? "…"
    : hasMatches
      ? `${activeIndex + 1}/${matches.length}`
      : query.trim().length > 0
        ? "0/0"
        : "";

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (event.shiftKey) {
        prev();
      } else {
        next();
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      clear();
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`px-2 py-1 text-xs border border-current/20 rounded-sm bg-transparent focus:outline-none ${inputClassName}`}
      />
      {countLabel !== "" && (
        <span className="min-w-[3rem] text-center text-xs opacity-70">
          {countLabel}
        </span>
      )}
      <button
        type="button"
        onClick={prev}
        disabled={!hasMatches}
        title="Previous match (Shift+Enter)"
        className={buttonClass}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={next}
        disabled={!hasMatches}
        title="Next match (Enter)"
        className={buttonClass}
      >
        ↓
      </button>
      {showCaseSensitiveToggle && (
        <button
          type="button"
          onClick={() => setCaseSensitive(!caseSensitive)}
          title="Case-sensitive"
          aria-pressed={caseSensitive}
          className={`${buttonClass} ${caseSensitive ? "opacity-100 font-semibold" : "opacity-60"}`}
        >
          Aa
        </button>
      )}
      <button
        type="button"
        onClick={clear}
        disabled={query.length === 0}
        title="Clear (Esc)"
        className={buttonClass}
      >
        ✕
      </button>
    </div>
  );
}

export default FindBar;
