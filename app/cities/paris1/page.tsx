"use client";

import { useEffect, useState } from "react";

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/images");
        if (!res.ok) {
          throw new Error(`Failed to fetch images: ${res.status}`);
        }
        const data = await res.json();
        setImages(data);
      } catch (err: any) {
        console.error("Error fetching images:", err);
        setError("Could not load images");
      }
    };

    fetchImages();
  }, []);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((src, i) => (
        <img key={i} src={src} alt={`Image ${i}`} className="rounded shadow" />
      ))}
    </div>
  );
}
