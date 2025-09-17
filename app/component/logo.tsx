"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface CenteredLayoutProps {
  topContent: React.ReactNode;     // content for top center
  middleContent: React.ReactNode;  // content for middle
}

export default function Logo() {
    const router = useRouter()
  return (
    <div className="cursor-pointer flex items-center flex-col">
        <button className="cursor-pointer items-center flex flex-col hover:scale-110" onClick={()=> {router.push('/')}}>
    <img
        src="/JigzExplorer-logo2.1.png"
        alt="Profile"
        width={30}
        height={30}
        className="sm:w-[80px] sm:h-[80px]  "
      />
     <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md">
      <span className="text-blue-900">Jigz</span>
      <span className="text-yellow-600">Explorer</span>
    </h1>
        </button>
     </div>
  );
}
