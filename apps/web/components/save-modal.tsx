"use client";

import React, { useState } from "react";

interface SaveDrawingModalProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function SaveDrawingModal({
  onSave,
  onCancel,
}: SaveDrawingModalProps): React.ReactElement {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 p-6 w-80">
        <h2 className="text-xs font-mono text-amber-400 tracking-wider mb-4">
          // SAVE DRAWING
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter drawing name..."
            autoFocus
            className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs font-mono 
                       text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 mb-4"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-400 text-xs font-mono 
                         hover:bg-zinc-700 transition-colors tracking-wider"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-3 py-2 bg-amber-500 text-black text-xs font-mono 
                         hover:bg-amber-400 transition-colors tracking-wider
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SAVE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

