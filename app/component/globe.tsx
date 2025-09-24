"use client";

import { Globe } from "lucide-react";
import Swal from "sweetalert2";

export default function GlobeButton({ setMenu }: { setMenu: (menu: string) => void }) {
  const handleGlobeClick = () => {
    Swal.fire({
      title: "Choose a Continent",
      html: `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <!-- Active -->
          <button id="europe" class="swal2-confirm swal2-styled">Europe</button>

          <!-- Disabled with tooltip -->
          <button disabled title="Coming soon" class="swal2-confirm swal2-styled" style="opacity: 0.5; cursor: not-allowed;">Asia</button>
          <button disabled title="Coming soon" class="swal2-confirm swal2-styled" style="opacity: 0.5; cursor: not-allowed;">Africa</button>
          <button disabled title="Coming soon" class="swal2-confirm swal2-styled" style="opacity: 0.5; cursor: not-allowed;">North America</button>
          <button disabled title="Coming soon" class="swal2-confirm swal2-styled" style="opacity: 0.5; cursor: not-allowed;">South America</button>
          <button disabled title="Coming soon" class="swal2-confirm swal2-styled" style="opacity: 0.5; cursor: not-allowed;">Australia</button>
          <button disabled title="Coming soon" class="swal2-confirm swal2-styled" style="opacity: 0.5; cursor: not-allowed;">Antarctica</button>
        </div>
      `,
      showConfirmButton: false,
    });

    // attach click for Europe only
    setTimeout(() => {
      document.getElementById("europe")?.addEventListener("click", () => {
        Swal.close();
        // setMenu("europe");
        console.log('europe')
      });
    }, 0);
  };

  return (
    <button
      onClick={handleGlobeClick}
      className="cursor-pointer flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-200
                 text-gray-700 rounded-lg shadow hover:bg-gray-400 transition duration-300 text-sm sm:text-base"
    >
      <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
      Globe
    </button>
  );
}
