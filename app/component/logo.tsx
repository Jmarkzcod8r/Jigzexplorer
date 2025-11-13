"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function Logo() {
    const router = useRouter()

    return (
        <div className="cursor-pointer flex items-center flex-col group">
            <button
                className="cursor-pointer items-center flex flex-col
                          transition-transform duration-400 ease-out
                          hover:scale-105 hover:rotate-2
                          hover:shadow-lg rounded-xl p-2"
                onClick={() => { router.push('/') }}
            >
                <img
                    src="/JigzExplorer-logo2.1.png"
                    alt="JigzExplorer Logo"
                    width={30}
                    height={30}
                    className="sm:w-[80px] sm:h-[80px] transition-transform duration-300 group-hover:rotate-8"
                />
                <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md mt-1">
                    <span className="text-blue-900">Jigz</span>
                    <span className="text-yellow-600">Explorer</span>
                </h1>
            </button>
        </div>
    );
}