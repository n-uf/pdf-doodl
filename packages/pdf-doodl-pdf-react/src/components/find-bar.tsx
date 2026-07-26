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

/**
 * Fixed slot for match count (`999/999` / `0/0` / `…`). Always reserve this
 * width so the find strip does not shift when the count appears or grows.
 */
export const FIND_BAR_MATCH_COUNT_CLASS =
  "inline-flex w-[7ch] shrink-0 items-center justify-center whitespace-nowrap tabular-nums text-center";

/**
 * Fixed square for the case-sensitive (Aa) toggle so `font-semibold` on press
 * cannot expand the control.
 */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_SIZE_CLASS =
  "inline-flex w-[2.25rem] shrink-0 items-center justify-center";

/** Muted off-state styling for the case-sensitive (Aa) toggle. */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_OFF_CLASS =
  "text-current/40 bg-transparent border-current/15";

/** Active on-state styling for the case-sensitive (Aa) toggle (aria-pressed=true). */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_ON_CLASS =
  "aria-pressed:text-current aria-pressed:border-current/55 aria-pressed:bg-current/18 aria-pressed:font-semibold";

/** Full size + off/on styling — pair with a base button class. */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_CLASS = `${FIND_BAR_CASE_SENSITIVE_TOGGLE_SIZE_CLASS} ${FIND_BAR_CASE_SENSITIVE_TOGGLE_OFF_CLASS} ${FIND_BAR_CASE_SENSITIVE_TOGGLE_ON_CLASS}`;

/** Accent-token override for on-state when the host app defines accent colors. */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_ACCENT_ON_CLASS =
  "aria-pressed:border-accent/40 aria-pressed:bg-accent/15 aria-pressed:text-accent";

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
      <span
        className={`${FIND_BAR_MATCH_COUNT_CLASS} text-xs opacity-70`}
        aria-live="polite"
      >
        {countLabel !== "" ? countLabel : "\u00a0"}
      </span>
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
          className={`${buttonClass} ${FIND_BAR_CASE_SENSITIVE_TOGGLE_CLASS}`}
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
