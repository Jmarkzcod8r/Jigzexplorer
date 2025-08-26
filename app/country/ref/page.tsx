

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti"; // 🎉 import

const JigsawPuzzle: React.FC = () => {
  const router = useRouter(); // ✅ router hook
  const [imageList, setImageList] = useState<string[]>([]);

  const searchParams = useSearchParams();
  // The query parameter (e.g. "france", "germany")
//   const searchParams = useSearchParams();
const country = searchParams.get("country"); // e.g. "france"

useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/images/${country}`);
        if (!res.ok) throw new Error("Failed to fetch images");
        const data = await res.json();

        // Shuffle the images
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setImageList(shuffled);
      } catch (err) {
        alert("Error getting data");
      }
    };

    fetchImages();
  }, [country]);




  const [currentIndex, setCurrentIndex] = useState(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [puzzlePieces, setPuzzlePieces] = useState<string[]>([]);
  const [framePieces, setFramePieces] = useState<(string | null)[]>(Array(9).fill(null));
  const [originalPieces, setOriginalPieces] = useState<string[]>([]);
  const [pieceSize, setPieceSize] = useState({ width: 120, height: 120 });
  const [completedStatus, setCompletedStatus] = useState<boolean[]>([]);
  const [solvedPuzzlesCount, setSolvedPuzzlesCount] = useState(0);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [turbo, setTurbo] = useState(false);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [puzzleSize, setPuzzleSize] = useState(360);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setCompletedStatus(Array(imageList.length).fill(false));
  }, []);

  useEffect(() => {
    if (imageList.length === 0) return;

    setLoading(true);
    setImage(null);

    const img = new Image();
    img.src = imageList[currentIndex];

    img.onload = () => {
      setImage(img);
      createPuzzlePieces(img);
      setLoading(false);
    };

    if (!completedStatus[currentIndex]) {
      setFramePieces(Array(9).fill(null));
    } else {
      setFramePieces([...originalPieces]);
    }
  }, [currentIndex, imageList, puzzleSize]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (startTime && !endTime) {
      timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [startTime, endTime]);

  useEffect(() => {
    const solvedCount = completedStatus.filter(status => status).length;
    setSolvedPuzzlesCount(solvedCount);

    if (solvedCount === imageList.length && imageList.length > 0) {
      setEndTime(Date.now());
    }
  }, [completedStatus, imageList.length]);

  const createPuzzlePieces = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = Math.min(puzzleSize / img.width, puzzleSize / img.height);
    const displayWidth = img.width * scale;
    const displayHeight = img.height * scale;

    const pieceWidth = displayWidth / 3;
    const pieceHeight = displayHeight / 3;

    setPieceSize({ width: pieceWidth, height: pieceHeight });

    const pieces: string[] = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const pieceCanvas = document.createElement("canvas");
        pieceCanvas.width = pieceWidth;
        pieceCanvas.height = pieceHeight;
        const pieceCtx = pieceCanvas.getContext("2d");
        if (!pieceCtx) continue;

        pieceCtx.drawImage(
          img,
          (j * img.width) / 3,
          (i * img.height) / 3,
          img.width / 3,
          img.height / 3,
          0,
          0,
          pieceWidth,
          pieceHeight
        );

        pieces.push(pieceCanvas.toDataURL("image/png"));
      }
    }

    setOriginalPieces([...pieces]);

    if (!completedStatus[currentIndex]) {
      const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);
      setPuzzlePieces(shuffledPieces);
    } else {
      setPuzzlePieces([...pieces]);
    }
  };

  // 🎉 Confetti helper
  const fireConfetti = () => {
    const duration = 180;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: turbo ? 10 : 5, // 💨 more confetti in Turbo mode
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: turbo ? 10 : 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleDragStart = (event: React.DragEvent<HTMLImageElement>, index: number) => {
    event.dataTransfer.setData("text/plain", index.toString());
    if (!startTime) setStartTime(Date.now());
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, frameIndex: number) => {
    event.preventDefault();
    const pieceIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
    const piece = puzzlePieces[pieceIndex];

    if (originalPieces[frameIndex] === piece) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    const newFramePieces = [...framePieces];
    newFramePieces[frameIndex] = piece;
    setFramePieces(newFramePieces);

    if (newFramePieces.every((p, idx) => p === originalPieces[idx])) {
      const updatedStatus = [...completedStatus];
      updatedStatus[currentIndex] = true;
      setCompletedStatus(updatedStatus);
      setScore(prevScore => prevScore + (turbo ? 200 : 100));

      fireConfetti(); // 🎉 trigger celebration

      goNext();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

  const goNext = () => setCurrentIndex(prev => (prev + 1) % imageList.length);
  const goPrev = () => setCurrentIndex(prev => (prev - 1 + imageList.length) % imageList.length);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Top bar */}
      <div className="flex justify-between items-center w-full px-5 py-2 gap-2">
      <button
          onClick={() => router.push("/")}
          className="cursor-pointer px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
        >
          🏠 Home
        </button>
      <button
          onClick={() => setSettingsOpen(true)}
          className="cursor-pointer px-4 py-2 rounded-lg text-white bg-gray-500 hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
        >
          Settings
        </button>
        <div className="bg-black/60 text-white px-3 py-1 rounded-md font-bold">
          ⏱ {formatTime(elapsedTime)}
        </div>


        <div className="bg-black/60 text-white px-3 py-1 rounded-md font-bold">
          📷 {currentIndex + 1} / {imageList.length}
        </div>
        <div className="bg-black/60 text-white px-3 py-1 rounded-md font-bold">
        🧩 {solvedPuzzlesCount}
        {imageList.length > 0 && (
          <> ({Math.round((solvedPuzzlesCount / imageList.length) * 100)}%)</>
        )}
      </div>


        <button
          onClick={() => setTurbo(prev => !prev)}
          className={`cursor-pointer px-4 py-2 rounded-lg text-white transition-all duration-300 transform hover:scale-105
            ${turbo
              ? "bg-blue-500 shadow-[0_0_20px_5px_rgba(59,130,246,0.7)]"
              : "bg-blue-500 hover:bg-blue-600"}`}
        >
          {turbo ? "Turbo ON ⚡" : "Turbo"}
        </button>
      </div>

      {/* Settings Popup */}
      {settingsOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
            <h2 className="text-lg font-semibold mb-2">Adjust Puzzle Size</h2>
            <p className="mb-4">Current size: {puzzleSize}px</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded-md text-lg cursor-pointer hover:bg-blue-800 transition"
                onClick={() => setPuzzleSize(prev => prev + 50)}
              >
                +
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md text-lg cursor-pointer hover:bg-red-700 transition"
                onClick={() => setPuzzleSize(prev => Math.max(150, prev - 50))}
              >
                –
              </button>
            </div>
            <div className="mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-gray-600 transition"
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


        <div className="bg-black/60 text-white px-3 py-1 rounded-md font-bold">
          Score: {score} pts | Streak: {streak}
        </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 m-1">
        <button
          onClick={goPrev}
          className="cursor-pointer px-5 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600
                    transition-all duration-300 text-sm shadow-md hover:shadow-lg transform hover:scale-110"
        >
          ⬅ Prev
        </button>
        <button
          onClick={goNext}
          className="cursor-pointer px-5 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600
                    transition-all duration-300 text-sm shadow-md hover:shadow-lg transform hover:scale-110"
        >
          Next ➡
        </button>
      </div>

      {/* Original Image / Puzzle Board */}
      <div className="flex justify-around">
        {loading ? (
          <div style={{
            width: `${pieceSize.width * 3}px`,
            height: `${pieceSize.height * 3}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #ccc"
          }}>
            ⏳ Loading...
          </div>
        ) : (
          image && (
            <div className="flex justify-around">
              <img
                src={image.src}
                alt="Original"
                style={{
                  margin: "5px",
                  width: `${pieceSize.width * 3}px`,
                  height: `${pieceSize.height * 3}px`,
                  border: "2px solid #ccc",
                  objectFit: "cover"
                }}
              />
            </div>
          )
        )}

        {completedStatus[currentIndex] ? (<></>) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "5px",
            width: `${pieceSize.width * 3}px`,
            height: `${pieceSize.height * 3}px`
          }}>
            {framePieces.map((piece, index) => (
              <div
                key={index}
                onDrop={(event) => handleDrop(event, index)}
                onDragOver={handleDragOver}
                style={{
                  width: `${pieceSize.width}px`,
                  height: `${pieceSize.height}px`,
                  border: "1px solid gray",
                  backgroundImage: piece ? `url(${piece})` : "none",
                  backgroundSize: "cover",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Already Solved Notification */}
      {completedStatus[currentIndex] ? (
        <div style={{ color: "green", fontWeight: "bold", marginTop: "10px" }}>
          ✅ Already Solved
        </div>
      ) : (
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {/* Puzzle Pieces */}
          <div>
  <h3>Puzzle Pieces</h3>
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      width: `${pieceSize.width * 7}px`,
    }}
  >
    {puzzlePieces.map((piece, index) => {
      // Check if this piece is already placed in the frame
      const isPlaced = framePieces.includes(piece);

      return (
        <img
          key={index}
          src={piece}
          alt={`Piece ${index}`}
          draggable
          onDragStart={(event) => handleDragStart(event, index)}
          style={{
            width: `${pieceSize.width}px`,
            height: `${pieceSize.height}px`,
            margin: "5px",
            cursor: "grab",
            borderRadius: "6px",
            transition: "all 0.3s ease",
            // ✅ Glow only if not placed yet
            // boxShadow: !isPlaced
            //   ? "0 0 15px 3px rgba(59, 130, 246, 0.7)" // blue glow
            //   : "none",
          }}
        />
      );
    })}
  </div>
</div>

        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default JigsawPuzzle;
