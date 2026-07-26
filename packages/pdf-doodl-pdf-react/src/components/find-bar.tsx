"use client";

/**
 * FindBar - Optional default UI for `usePdfFind`
 *
 * A minimal, unopinionated find-in-PDF input strip (query + in-field clear,
 * match count, prev/next, case-sensitive toggle). Consumers who want fully
 * custom chrome should use `usePdfFind` directly and build their own UI —
 * this component exists so simple integrations don't have to hand-roll one.
 *
 * ## Tailwind consumers
 * Class tokens below are plain string constants. Host apps that use Tailwind
 * must `@source` this package (src or dist) so utilities like `w-[7ch]` are
 * generated — importing the constant alone does not keep classes from purge.
 *
 * Shared default control height is 28px (`h-7`) to align with ZoomControls.
 */

import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from "react";
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
  "inline-flex h-7 items-center justify-center px-2 text-xs border border-current/20 rounded-md hover:bg-current/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

/**
 * Fixed slot for match count (`999/999` / `0/0` / `…`). Always reserve this
 * width so the find strip does not shift when the count appears or grows.
 */
export const FIND_BAR_MATCH_COUNT_CLASS =
  "inline-flex h-7 w-[7ch] shrink-0 items-center justify-center whitespace-nowrap tabular-nums text-center";

/** Purge-proof match-count slot — prefer `style={…}` over classes alone. */
export const FIND_BAR_MATCH_COUNT_STYLE: CSSProperties = {
  boxSizing: "border-box",
  width: "7ch",
  minWidth: "7ch",
  height: 28,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  textAlign: "center",
  fontVariantNumeric: "tabular-nums",
};

/** Purge-proof Aa toggle size. */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_SIZE_STYLE: CSSProperties = {
  boxSizing: "border-box",
  width: 28,
  height: 28,
  minWidth: 28,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

/**
 * Relative wrapper for the find input + absolute clear control.
 * Flex + fixed height keeps the clear glyph vertically centered in the field.
 */
export const FIND_BAR_INPUT_WRAP_CLASS =
  "relative flex h-7 min-w-0 flex-1 items-center";

/** Right padding so typed text does not sit under the clear control. */
export const FIND_BAR_INPUT_WITH_CLEAR_CLASS = "w-full h-full pr-7";

/**
 * Absolute clear (✕) inside the find input’s right edge.
 * `inset-y-0` + `my-auto` centers against the wrap height (not a flaky %).
 * Show only when `query.length > 0`.
 */
export const FIND_BAR_CLEAR_BUTTON_CLASS =
  "absolute right-0.5 top-0 bottom-0 z-10 my-auto inline-flex h-5 w-5 items-center justify-center rounded-md text-current/55 hover:bg-current/10 hover:text-current";

/**
 * Fixed square for the case-sensitive (Aa) toggle so ON fill cannot expand
 * the control. Radius matches other toolbar chrome (`rounded-md`).
 */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_SIZE_CLASS =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs";

/**
 * OFF: muted ghost outline only — no fill. Distinct from ON without relying
 * on opacity alone for the whole control.
 */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_OFF_CLASS =
  "bg-transparent text-current/55 border border-current/30 font-normal no-underline shadow-none";

/**
 * ON (`aria-pressed=true`): filled + high-contrast text.
 * Must remain readable as “on” without inspecting aria attributes.
 * Avoid stacking underline+bold on top of a solid fill (reads garish).
 */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_ON_CLASS =
  "aria-pressed:bg-current aria-pressed:text-white aria-pressed:border-current aria-pressed:font-semibold aria-pressed:hover:bg-current aria-pressed:hover:text-white";

/** Full size + off/on styling — pair with a base button class (avoid text-muted). */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_CLASS = `${FIND_BAR_CASE_SENSITIVE_TOGGLE_SIZE_CLASS} ${FIND_BAR_CASE_SENSITIVE_TOGGLE_OFF_CLASS} ${FIND_BAR_CASE_SENSITIVE_TOGGLE_ON_CLASS}`;

/**
 * Accent-token ON override when the host defines `--color-accent` / `accent`
 * and a contrasting `bg` (or `Canvas`) text color.
 * Tonal fill (not solid accent slab) so ON stays obvious beside muted chrome
 * without overpowering neighboring layer dots.
 */
export const FIND_BAR_CASE_SENSITIVE_TOGGLE_ACCENT_ON_CLASS =
  "aria-pressed:bg-accent/20 aria-pressed:text-accent aria-pressed:border-accent aria-pressed:hover:bg-accent/25 aria-pressed:hover:text-accent";

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
  const hasQuery = query.length > 0;

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
      <div className={FIND_BAR_INPUT_WRAP_CLASS}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`box-border px-2 text-xs border border-current/20 rounded-md bg-transparent outline-none focus:border-current/45 ${FIND_BAR_INPUT_WITH_CLEAR_CLASS} ${inputClassName}`}
        />
        {hasQuery ? (
          <button
            type="button"
            onClick={clear}
            title="Clear (Esc)"
            aria-label="Clear search"
            className={FIND_BAR_CLEAR_BUTTON_CLASS}
          >
            ✕
          </button>
        ) : null}
      </div>
      <span
        style={FIND_BAR_MATCH_COUNT_STYLE}
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
      {showCaseSensitiveToggle ? (
        <button
          type="button"
          onClick={() => setCaseSensitive(!caseSensitive)}
          title={caseSensitive ? "Case-sensitive (on)" : "Case-sensitive (off)"}
          aria-label={
            caseSensitive ? "Case-sensitive: on" : "Case-sensitive: off"
          }
          aria-pressed={caseSensitive}
          style={FIND_BAR_CASE_SENSITIVE_TOGGLE_SIZE_STYLE}
          className={`${buttonClass} ${FIND_BAR_CASE_SENSITIVE_TOGGLE_CLASS}`}
        >
          Aa
        </button>
      ) : null}
    </div>
  );
}

export default FindBar;
