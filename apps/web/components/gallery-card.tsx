"use client";

import { useRouter } from "next/navigation";
import React from "react";
import type { Drawing } from "./providers";

interface GalleryCardProps {
  drawing: Drawing;
  onOpen: () => void;
  onDelete: () => void;
}

export function GalleryCard({
  drawing,
  onOpen,
  onDelete,
}: GalleryCardProps): React.ReactElement {
  const router = useRouter();
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
      {/* Preview area */}
      <div className="h-32 bg-zinc-950 border-b border-zinc-800 flex items-center justify-center">
        <div className="text-zinc-700 text-4xl">◈</div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-xs text-zinc-200 tracking-wider truncate mb-1">
          {drawing.name}
        </h3>
        <p className="text-[10px] text-zinc-600">
          {drawing.shapes.length} shape{drawing.shapes.length !== 1 ? "s" : ""}{" "}
          • {formatDate(drawing.updatedAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex border-t border-zinc-800">
        <button
          onClick={() => {
            onOpen();
            router.push("/");
          }}
          className="flex-1 px-3 py-2 text-[10px] text-amber-400 hover:bg-zinc-800 
                     transition-colors text-center tracking-wider"
        >
          OPEN
        </button>
        <button
          onClick={onDelete}
          className="flex-1 px-3 py-2 text-[10px] text-red-400 hover:bg-zinc-800 
                     transition-colors tracking-wider border-l border-zinc-800"
        >
          DELETE
        </button>
      </div>
    </div>
  );
}
