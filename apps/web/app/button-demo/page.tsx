"use client";

import React from "react";

function Draw3DButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        relative
        px-16 py-5
        bg-[#F5C842]
        text-white text-2xl font-bold tracking-wider
        rounded-lg
        border-2 border-[#B8962F]
        shadow-[0_10px_0_0_#8B7335]
        hover:shadow-[0_6px_0_0_#8B7335]
        hover:translate-y-[4px]
        active:shadow-[0_0px_0_0_#8B7335]
        active:translate-y-[10px]
        transition-all duration-100
        cursor-pointer
        select-none
      "
    >
      Let's Draw!
    </button>
  );
}

function Draw3DButtonIsometric({ onClick }: { onClick?: () => void }) {
  // Two-face extruded button (top + base only), with a slanted base edge and a
  // separate soft drop shadow. Use a fixed footprint so proportions stay stable.
  const widthPx = 640;
  const heightPx = 112;
  const baseOffsetX = 18;
  const baseOffsetY = 18;
  const shadowOffsetX = 28;
  const shadowOffsetY = 26;
  const slantPx = 56;

  return (
    <div
      className="relative inline-block"
      style={{ width: widthPx, height: heightPx }}
    >
      {/* Soft drop shadow */}
      <div
        className="
          absolute
          inset-0
          -z-10
          rounded-[12px]
          bg-black/18
          blur-[14px]
        "
        style={{
          transform: `translate(${shadowOffsetX}px, ${shadowOffsetY}px)`,
        }}
      />

      {/* Base face: same footprint as top, offset down+right, slanted right edge */}
      <div
        className="
          absolute
          inset-0
          rounded-[12px]
          bg-[#d1ad3b]
        "
        style={{
          transform: `translate(${baseOffsetX}px, ${baseOffsetY}px)`,
          clipPath: `polygon(0 0, 100% 0, calc(100% - ${slantPx}px) 100%, 0 100%)`,
        }}
      />

      {/* Top face */}
      <button
        onClick={onClick}
        className="
          relative
          w-full h-full
          rounded-[12px]
          bg-[#F5C842]
          text-white
          font-mono
          text-[56px]
          tracking-[3px]
          whitespace-nowrap
          [box-shadow:inset_0_3px_0_rgba(255,255,255,0.22)]
          before:content-['']
          before:absolute
          before:inset-y-0
          before:left-0
          before:w-[16px]
          before:bg-white/25
          before:rounded-l-[12px]
          hover:translate-x-[10px] hover:translate-y-[10px]
          active:translate-x-[18px] active:translate-y-[18px]
          transition-transform duration-100
          cursor-pointer
          select-none
        "
      >
        <span className="relative flex items-center justify-center h-full px-10">
          Let&apos;s Draw!
        </span>
      </button>
    </div>
  );
}

function QuickDrawLargeTwoFaceButton({ onClick }: { onClick?: () => void }) {
  // Target: the large "2-face block" look (top slab + bottom slab) with a soft
  // gray drop shadow and a slanted right edge on the bottom face.
  const baseOffsetX = 18;
  const baseOffsetY = 20;

  return (
    <div className="relative inline-block w-[640px] max-w-[92vw] h-[92px]">
      {/* Soft drop shadow (under everything, down+right) */}
      <div
        className="
          absolute
          inset-0
          -z-10
          rounded-[10px]
          bg-black/18
          blur-[10px]
        "
        style={{
          transform: `translate(${baseOffsetX + 10}px, ${baseOffsetY + 10}px)`,
        }}
      />

      {/* Bottom face (offset down+right, slanted right edge) */}
      <div
        className="
          absolute
          inset-0
          rounded-[10px]
          bg-[#d1ad3b]
          [clip-path:polygon(0_0,100%_0,calc(100%-48px)_100%,0_100%)]
        "
        style={{
          transform: `translate(${baseOffsetX}px, ${baseOffsetY}px)`,
        }}
      />

      {/* Top face */}
      <button
        onClick={onClick}
        className="
          relative
          w-full h-full
          rounded-[10px]
          bg-[#ffd139]
          text-white
          font-mono
          text-[44px]
          leading-none
          tracking-[2px]
          whitespace-nowrap
          [text-shadow:0_1px_0_rgba(0,0,0,0.08)]
          [box-shadow:inset_0_2px_0_rgba(255,255,255,0.22)]
          before:content-['']
          before:absolute
          before:inset-y-0
          before:left-0
          before:w-[14px]
          before:bg-white/25
          before:rounded-l-[10px]
          hover:translate-x-[6px] hover:translate-y-[8px]
          active:translate-x-[18px] active:translate-y-[20px]
          transition-transform duration-100
          cursor-pointer
          select-none
        "
        aria-label="Let's Draw!"
      >
        <span className="flex items-center justify-center h-full px-10">
          Let&apos;s Draw!
        </span>
      </button>
    </div>
  );
}

export default function ButtonDemoPage(): React.ReactElement {
  const handleClick = (): void => {
    alert("Button clicked!");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-12">
      <h1 className="text-3xl font-bold text-slate-700">3D Button Demo</h1>

      <div className="flex flex-col gap-8 items-center">
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-2">Straight down (current)</p>
          <Draw3DButton onClick={handleClick} />
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-500 mb-2">
            Isometric (down + right)
          </p>
          <Draw3DButtonIsometric onClick={handleClick} />
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-500 mb-2">
            QuickDraw-style (two faces, angled base)
          </p>
          <QuickDrawLargeTwoFaceButton onClick={handleClick} />
        </div>
      </div>

      <div className="mt-8 p-6 bg-white/80 rounded-lg shadow-lg max-w-md">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          How it works:
        </h2>
        <ul className="text-sm text-slate-600 space-y-2">
          <li>
            •{" "}
            <code className="bg-slate-100 px-1 rounded">
              shadow-[0_8px_0_0_#C9A235]
            </code>{" "}
            creates the 3D base
          </li>
          <li>
            •{" "}
            <code className="bg-slate-100 px-1 rounded">
              hover:translate-y-[4px]
            </code>{" "}
            moves button down
          </li>
          <li>
            •{" "}
            <code className="bg-slate-100 px-1 rounded">
              active:translate-y-[8px]
            </code>{" "}
            full press effect
          </li>
          <li>• Shadow reduces on hover/active to match movement</li>
        </ul>
      </div>
    </div>
  );
}
