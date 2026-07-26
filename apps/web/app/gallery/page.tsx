"use client";

/**
 * Gallery Page - View saved drawings
 */

import React from "react";
import Link from "next/link";
import { useStudio, type Drawing } from "@/components/providers";
import { GalleryCard } from "@/components/gallery-card";

export default function GalleryPage(): React.ReactElement {
  const { drawings, deleteDrawing, setCurrentDrawingId } = useStudio();

  const handleOpen = (drawing: Drawing) => {
    setCurrentDrawingId(drawing.id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this drawing?")) {
      deleteDrawing(id);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xs tracking-[0.3em] text-amber-400">
              DOODL / GALLERY
            </h1>
            <p className="text-[10px] text-zinc-600 mt-1">
              {drawings.length} DRAWING{drawings.length !== 1 ? "S" : ""}
            </p>
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-amber-500 text-black text-xs hover:bg-amber-400 
                       transition-colors tracking-wider"
          >
            + NEW DRAWING
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {drawings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-zinc-700 text-6xl mb-4">◇</div>
            <p className="text-zinc-600 text-xs tracking-wider">
              NO DRAWINGS YET
            </p>
            <Link
              href="/"
              className="mt-4 text-amber-400 text-xs hover:underline"
            >
              CREATE YOUR FIRST DRAWING →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {drawings.map((drawing) => (
              <GalleryCard
                key={drawing.id}
                drawing={drawing}
                onOpen={() => handleOpen(drawing)}
                onDelete={() => handleDelete(drawing.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

