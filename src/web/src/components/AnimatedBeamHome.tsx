"use client";

import React, { forwardRef, useRef } from "react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "./ui/animated-beam";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 border-border bg-secondary p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamHome({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef1 = useRef<HTMLDivElement>(null);
  const leftRef2 = useRef<HTMLDivElement>(null);
  const leftRef3 = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightRef1 = useRef<HTMLDivElement>(null);
  const rightRef2 = useRef<HTMLDivElement>(null);
  const rightRef3 = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden p-10",
        className,
      )}
      ref={containerRef}
    >
      <div className="flex size-full items-center justify-between">
        {/* Services de gauche */}
        <div className="flex flex-col justify-between h-40">
          <Circle ref={leftRef1}>
            <Icons.googleDrive />
          </Circle>
          <Circle ref={leftRef2}>
            <Icons.discord />
          </Circle>
        </div>

        {/* LinkIt au centre */}
        <Circle ref={centerRef} className="size-20">
          <Icons.linkit />
        </Circle>

        {/* Services de droite */}
        <div className="flex flex-col justify-between h-40">
          <Circle ref={rightRef1}>
            <Icons.youtube />
          </Circle>
          <Circle ref={rightRef2}>
            <Icons.facebook />
          </Circle>
          <Circle ref={rightRef3}>
            <Icons.x />
          </Circle>
        </div>
      </div>

      {/* Connexions de gauche vers le centre */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftRef1}
        toRef={centerRef}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftRef2}
        toRef={centerRef}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftRef3}
        toRef={centerRef}
      />

      {/* Connexions du centre vers la droite */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={rightRef1}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={rightRef2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={rightRef3}
      />
    </div>
  );
}

export const Icons = {
  discord: () => (
    <svg width="71" height="80" viewBox="0 0 71 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60.1045 13.8978C55.5792 11.8214 50.7265 10.2916 45.6527 9.41542C45.5603 9.39851 45.468 9.44077 45.4204 9.52529C44.7963 10.6353 44.105 12.0834 43.6209 13.2216C38.1637 12.4046 32.7345 12.4046 27.3892 13.2216C26.905 12.0581 26.1886 10.6353 25.5617 9.52529C25.5141 9.44359 25.4218 9.40133 25.3294 9.41542C20.2584 10.2888 15.4057 11.8186 10.8776 13.8978C10.8384 13.9147 10.8048 13.9429 10.7825 13.9795C1.57795 27.7309 -0.943561 41.1443 0.293408 54.3914C0.299005 54.4562 0.335386 54.5182 0.385761 54.5576C6.45866 59.0174 12.3413 61.7249 18.1147 63.5195C18.2071 63.5477 18.305 63.5139 18.3638 63.4378C19.7295 61.5728 20.9469 59.6063 21.9907 57.5383C22.0523 57.4172 21.9935 57.2735 21.8676 57.2256C19.9366 56.4931 18.0979 55.6 16.3292 54.5858C16.1893 54.5041 16.1781 54.304 16.3068 54.2082C16.679 53.9293 17.0513 53.6391 17.4067 53.3461C17.471 53.2926 17.5606 53.2813 17.6362 53.3151C29.2558 58.6202 41.8354 58.6202 53.3179 53.3151C53.3935 53.2785 53.4831 53.2898 53.5502 53.3433C53.9057 53.6363 54.2779 53.9293 54.6529 54.2082C54.7816 54.304 54.7732 54.5041 54.6333 54.5858C52.8646 55.6197 51.0259 56.4931 49.0921 57.2228C48.9662 57.2707 48.9102 57.4172 48.9718 57.5383C50.038 59.6034 51.2554 61.5699 52.5959 63.435C52.6519 63.5139 52.7526 63.5477 52.845 63.5195C58.6464 61.7249 64.529 59.0174 70.6019 54.5576C70.6551 54.5182 70.6887 54.459 70.6943 54.3942C72.1747 39.0791 68.2147 25.7757 60.1968 13.9823C60.1772 13.9429 60.1437 13.9147 60.1045 13.8978ZM23.7259 46.3253C20.2276 46.3253 17.3451 43.1136 17.3451 39.1693C17.3451 35.225 20.1717 32.0133 23.7259 32.0133C27.308 32.0133 30.1626 35.2532 30.1066 39.1693C30.1066 43.1136 27.28 46.3253 23.7259 46.3253ZM47.3178 46.3253C43.8196 46.3253 40.9371 43.1136 40.9371 39.1693C40.9371 35.225 43.7636 32.0133 47.3178 32.0133C50.9 32.0133 53.7545 35.2532 53.6986 39.1693C53.6986 43.1136 50.9 46.3253 47.3178 46.3253Z" fill="#5865F2"/>
    </svg>
  ),
  linkit: () => (
    <svg width="800px" height="800px" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <g>
        <path d="M128.080089,-0.000183105 C135.311053,0.0131003068 142.422517,0.624138494 149.335663,1.77979593 L149.335663,1.77979593 L149.335663,76.2997796 L202.166953,23.6044907 C208.002065,27.7488446 213.460883,32.3582023 218.507811,37.3926715 C223.557281,42.4271407 228.192318,47.8867213 232.346817,53.7047992 L232.346817,53.7047992 L179.512985,106.400063 L254.227854,106.400063 C255.387249,113.29414 256,120.36111 256,127.587243 L256,127.587243 L256,127.759881 C256,134.986013 255.387249,142.066204 254.227854,148.960282 L254.227854,148.960282 L179.500273,148.960282 L232.346817,201.642324 C228.192318,207.460402 223.557281,212.919983 218.523066,217.954452 L218.523066,217.954452 L218.507811,217.954452 C213.460883,222.988921 208.002065,227.6115 202.182208,231.742607 L202.182208,231.742607 L149.335663,179.04709 L149.335663,253.5672 C142.435229,254.723036 135.323765,255.333244 128.092802,255.348499 L128.092802,255.348499 L127.907197,255.348499 C120.673691,255.333244 113.590195,254.723036 106.677048,253.5672 L106.677048,253.5672 L106.677048,179.04709 L53.8457596,231.742607 C42.1780766,223.466917 31.977435,213.278734 23.6658953,201.642324 L23.6658953,201.642324 L76.4997269,148.960282 L1.78485803,148.960282 C0.612750404,142.052729 0,134.946095 0,127.719963 L0,127.719963 L0,127.349037 C0.0121454869,125.473817 0.134939797,123.182933 0.311311815,120.812834 L0.36577283,120.099764 C0.887996182,113.428547 1.78485803,106.400063 1.78485803,106.400063 L1.78485803,106.400063 L76.4997269,106.400063 L23.6658953,53.7047992 C27.8076812,47.8867213 32.4300059,42.4403618 37.4769335,37.4193681 L37.4769335,37.4193681 L37.5023588,37.3926715 C42.5391163,32.3582023 48.0106469,27.7488446 53.8457596,23.6044907 L53.8457596,23.6044907 L106.677048,76.2997796 L106.677048,1.77979593 C113.590195,0.624138494 120.688946,0.0131003068 127.932622,-0.000183105 L127.932622,-0.000183105 L128.080089,-0.000183105 Z M128.067377,95.7600714 L127.945335,95.7600714 C118.436262,95.7600714 109.32891,97.5001809 100.910584,100.661566 C97.7553011,109.043534 96.0085811,118.129275 95.9958684,127.613685 L95.9958684,127.733184 C96.0085811,137.217594 97.7553011,146.303589 100.923296,154.685303 C109.32891,157.846943 118.436262,159.587052 127.945335,159.587052 L128.067377,159.587052 C137.576449,159.587052 146.683802,157.846943 155.089415,154.685303 C158.257411,146.290368 160.004131,137.217594 160.004131,127.733184 L160.004131,127.613685 C160.004131,118.129275 158.257411,109.043534 155.089415,100.661566 C146.683802,97.5001809 137.576449,95.7600714 128.067377,95.7600714 Z" fill="#FF4A00" fill-rule="nonzero"/>
      </g>
    </svg>
  ),
  googleDrive: () => (
    <svg
      width="100"
      height="100"
      viewBox="0 0 87.3 78"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
        fill="#0066da"
      />
      <path
        d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
        fill="#00ac47"
      />
      <path
        d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
        fill="#ea4335"
      />
      <path
        d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
        fill="#00832d"
      />
      <path
        d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
        fill="#2684fc"
      />
      <path
        d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
        fill="#ffba00"
      />
    </svg>
  ),
  youtube: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="external-icon" viewBox="0 0 28.57  20" focusable="false" style={{pointerEvents: 'none', display: 'block', width: '100%', height: '100%'}}>
      <svg viewBox="0 0 28.57 20" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"></path>
          <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"></path>
        </g>
      </svg>
    </svg>
  ),
  x: () => (
    <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 462.799"><path fill-rule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"/></svg>
  ),
  facebook: () => (
    <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" viewBox="0 0 40 40">
      <linearGradient id="a" x1="-277.375" x2="-277.375" y1="406.6018" y2="407.5726" gradientTransform="matrix(40 0 0 -39.7778 11115.001 16212.334)" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0062e0"/>
        <stop offset="1" stop-color="#19afff"/>
      </linearGradient>
      <path fill="url(#a)" d="M16.7 39.8C7.2 38.1 0 29.9 0 20 0 9 9 0 20 0s20 9 20 20c0 9.9-7.2 18.1-16.7 19.8l-1.1-.9h-4.4l-1.1.9z"/>
      <path fill="#fff" d="m27.8 25.6.9-5.6h-5.3v-3.9c0-1.6.6-2.8 3-2.8H29V8.2c-1.4-.2-3-.4-4.4-.4-4.6 0-7.8 2.8-7.8 7.8V20h-5v5.6h5v14.1c1.1.2 2.2.3 3.3.3 1.1 0 2.2-.1 3.3-.3V25.6h4.4z"/>
    </svg>
  ),
  user: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000000"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};
