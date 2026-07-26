/**
 * KeyboardDriver - Keyboard input handling
 *
 * Encapsulates keyboard event handling, modifier tracking,
 * and command detection (undo, redo, delete, escape).
 */

import type { DrawModifiers } from "../types/input";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Keyboard command types
 */
export type KeyboardCommand = "undo" | "redo" | "delete" | "escape";

/**
 * Keyboard driver callbacks
 */
export interface KeyboardDriverCallbacks {
  /** Called when a command is detected */
  onCommand?: (command: KeyboardCommand) => void;
  /** Called when modifiers change */
  onModifiersChange?: (modifiers: DrawModifiers) => void;
}

/**
 * Keyboard driver options
 */
export interface KeyboardDriverOptions {
  /** Target element (defaults to window) */
  target?: EventTarget;
  /** Whether keyboard input is disabled */
  disabled?: boolean;
}

// =============================================================================
// KEYBOARD DRIVER
// =============================================================================

/**
 * KeyboardDriver - Handles keyboard input
 */
export class KeyboardDriver {
  private _target: EventTarget;
  private _callbacks: KeyboardDriverCallbacks;
  private _disabled: boolean;
  private _modifiers: DrawModifiers = { shift: false, ctrl: false, alt: false };

  // Bound handlers for cleanup
  private _boundKeyDown: (e: Event) => void;
  private _boundKeyUp: (e: Event) => void;

  constructor(
    callbacks: KeyboardDriverCallbacks,
    options: KeyboardDriverOptions = {}
  ) {
    this._target = options.target ?? window;
    this._callbacks = callbacks;
    this._disabled = options.disabled ?? false;

    // Bind handlers
    this._boundKeyDown = this._handleKeyDown.bind(this);
    this._boundKeyUp = this._handleKeyUp.bind(this);

    // Attach events
    this._attach();
  }

  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    this._detach();
  }

  private _attach(): void {
    this._target.addEventListener("keydown", this._boundKeyDown);
    this._target.addEventListener("keyup", this._boundKeyUp);
  }

  private _detach(): void {
    this._target.removeEventListener("keydown", this._boundKeyDown);
    this._target.removeEventListener("keyup", this._boundKeyUp);
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  /**
   * Get current modifiers
   */
  getModifiers(): DrawModifiers {
    return { ...this._modifiers };
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled: boolean): void {
    this._disabled = disabled;
  }

  /**
   * Check if disabled
   */
  isDisabled(): boolean {
    return this._disabled;
  }

  // ===========================================================================
  // EVENT HANDLERS
  // ===========================================================================

  private _handleKeyDown(e: Event): void {
    if (this._disabled) return;

    const event = e as KeyboardEvent;
    this._updateModifiers(event);

    // Detect commands
    const command = this._detectCommand(event);
    if (command) {
      event.preventDefault();
      this._callbacks.onCommand?.(command);
    }
  }

  private _handleKeyUp(e: Event): void {
    if (this._disabled) return;

    const event = e as KeyboardEvent;
    this._updateModifiers(event);
  }

  private _updateModifiers(e: KeyboardEvent): void {
    const newModifiers: DrawModifiers = {
      shift: e.shiftKey,
      ctrl: e.ctrlKey || e.metaKey,
      alt: e.altKey,
    };

    // Check if changed
    if (
      newModifiers.shift !== this._modifiers.shift ||
      newModifiers.ctrl !== this._modifiers.ctrl ||
      newModifiers.alt !== this._modifiers.alt
    ) {
      this._modifiers = newModifiers;
      this._callbacks.onModifiersChange?.(newModifiers);
    }
  }

  private _detectCommand(e: KeyboardEvent): KeyboardCommand | null {
    const isCtrl = e.ctrlKey || e.metaKey;

    // Undo: Ctrl+Z (without Shift)
    if (isCtrl && e.key === "z" && !e.shiftKey) {
      return "undo";
    }

    // Redo: Ctrl+Shift+Z or Ctrl+Y
    if ((isCtrl && e.key === "z" && e.shiftKey) || (isCtrl && e.key === "y")) {
      return "redo";
    }

    // Delete: Delete or Backspace
    if (e.key === "Delete" || e.key === "Backspace") {
      return "delete";
    }

    // Escape
    if (e.key === "Escape") {
      return "escape";
    }

    return null;
  }
}

/**
 * Create a new KeyboardDriver instance
 */
export function createKeyboardDriver(
  callbacks: KeyboardDriverCallbacks,
  options?: KeyboardDriverOptions
): KeyboardDriver {
  return new KeyboardDriver(callbacks, options);
}
