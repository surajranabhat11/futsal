// components/CursorFollower.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CursorFollower() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const move = (e: MouseEvent) => {
            gsap.to(cursorRef.current, {
                x: e.clientX,
                y: e.clientY,
                duration: 1,
                ease: "elastic.out(1, 0.3)",
            });
        };

        window.addEventListener("mousemove", move);

        return () => window.removeEventListener("mousemove", move);
    }, []);

    return (
        <div ref={cursorRef} className="cursor" />
    );
}