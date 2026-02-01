// components/StartGameModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StartGameModalProps {
    // Controls whether the modal is visible
    isOpen: boolean;
    // Function to close the modal without starting the game
    onClose: () => void;
    // Function to start the game, accepts the opponent's name as an argument
    onStart: (opponentName: string, home: boolean) => void;
    // State for the controlled input field (name of the opponent)
    input: string;
    // Setter for the input state
    setInput: (name: string) => void;
}

export default function StartGameModal({ isOpen, onClose, onStart, input, setInput }: StartGameModalProps) {
    // 1. Create a ref to attach to the input element
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHome, setIsHome] = useState(true);

    // 2. Use useEffect to focus the input when the modal opens
    useEffect(() => {
        // Only attempt to focus if the modal is currently open AND the ref is attached
        if (isOpen) {
            // Use setTimeout to ensure the browser has fully rendered the modal 
            // before trying to focus the element, which often resolves timing issues.
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]); // Re-run this effect whenever the isOpen prop changes

    // If not open, render nothing
    if (!isOpen) return null;

    // Handle form submission when the Start Game button is clicked
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Call the onStart function in the parent, passing the trimmed input.
        // Falls back to a default name if the input is empty or just whitespace.
        onStart(input.trim() || 'Opponent Team', isHome);
    };

    return (
        // Modal Backdrop: fixed to cover the screen, centered content, semi-transparent black background
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300" >
            <form
                onSubmit={handleSubmit}
                // Modal container: white, rounded, centered, shadow, max-width for mobile
                className="bg-white rounded-xl p-6 m-4 w-11/12 max-w-sm shadow-2xl transform scale-100 transition-transform duration-300"
            >
                <h3 className="text-2xl font-bold text-indigo-700 border-b pb-2" > Start New Match </h3>

                {isHome && <div className="text-center w-full font-bold text-indigo-500">- Home -</div>}
                {!isHome && <div className="text-center w-full font-bold text-indigo-500">- Away -</div>}
                <div className="flex justify-between space-x-3 mb-3">
                    {/* Hidden input ensures the value is sent on form submit */}
                    <input type="hidden" name="location" value={isHome ? "home" : "away"} />

                    <button
                        type="button" // Prevent default form submission on click
                        onClick={() => setIsHome(true)}
                        className={`w-1/2 h-10 font-black uppercase border-2 border-black transition-all ${isHome
                            ? "bg-blue-500 shadow-none translate-x-1 translate-y-1"
                            : "bg-blue-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                            }`}
                    >
                        Home
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsHome(false)}
                        className={`w-1/2 h-10 font-black uppercase border-2 border-black transition-all ${!isHome
                            ? "bg-blue-500 shadow-none translate-x-1 translate-y-1"
                            : "bg-blue-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                            }`}
                    >
                        Away
                    </button>
                </div>
                < label htmlFor="opponent" className="block text-base font-medium text-gray-700 mb-2" >
                    Opponent Team Name:
                </label>
                < input
                    id="opponent"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)
                    }
                    placeholder="e.g., Southwell City U12"
                    ref={inputRef}
                    required
                    // Tailwind styling for input field
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition mb-6 text-lg"
                />

                <div className="flex justify-between space-x-3" >
                    <button
                        type="button" // Important: use 'button' type to prevent form submission
                        onClick={onClose}
                        // Tailwind styling for Cancel button
                        className="flex-1 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>
                    < button
                        type="submit" // Use 'submit' type to trigger handleSubmit
                        // Tailwind styling for Start Game button (Green, bold, professional)
                        className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition shadow-md"
                    >
                        Start Game
                    </button>
                </div>
            </form>
        </div>
    );
}