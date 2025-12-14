// components/TryAnimationOverlay.tsx (Tailwind styled and Mobile Optimized)

import React, { useState, useEffect } from 'react';
import { AnimationData } from '../types'; // Assuming you put the interface here

interface TryAnimationProps {
    data: AnimationData | null;
}

export default function TryAnimationOverlay({ data }: TryAnimationProps) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (data) {
            setAnimate(false);
            // Wait for the component to render, then trigger the animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setAnimate(true));
            });
        } else {
            setAnimate(false);
        }
    }, [data]);

    if (!data) return null;

    const text = data.type === 'TRY' ? 'TRY!' : '2 POINTS!';
    const color = data.type === 'TRY' ? 'red' : 'blue';
    const baseClasses = "fixed font-black tracking-widest pointer-events-none transition-all duration-7000 ease-out z-[100]"; // Increased Z-index

    // --- RESPONSIVE STYLE CONFIGURATION ---

    // Starting position (small size, low opacity, centered at button click)
    const initialStyle: React.CSSProperties = {
        left: data.startX,
        top: data.startY,
        fontSize: '1rem', // Start small
        opacity: 0.5,
        // Start transformation relative to the button position
        transform: 'translate(-50%, -50%) scale(1)',
        color: color,
    };

    // Final position (Controlled size, fading out, moving toward center)
    const finalStyle: React.CSSProperties = {
        left: '50%', // Final resting position (center of screen)
        top: '50%',
        // Reduce the final scale factor. A scale of 5-8 is usually enough to fill a mobile screen
        // before fading out completely. We'll use a slightly larger scale for a better effect.
        transform: 'translate(-50%, -50%) scale(10)',
        opacity: 0,

        // Use a smaller final font size that scales up to fill the mobile screen
        fontSize: '12rem', // Reduced from 25rem to 12rem (still large, but scales better)
        color: color,
    };

    // Conditional styling to control the initial size transition smoothly
    const dynamicStyle = animate ? finalStyle : initialStyle;

    return (
        <div
            className={baseClasses}
            style={dynamicStyle}
        >
            <span
                // Using Tailwind classes for large text size and fallback for shadow effect
                className={`text-7xl md:text-9xl`}
                style={{
                    // Apply text shadow for the 'wire'/'neon' effect 
                    textShadow: `0 0 10px ${color}, 0 0 5px rgba(255, 255, 255, 0.5)`,
                }}
            >
                {text}
            </span>
        </div>
    );
}