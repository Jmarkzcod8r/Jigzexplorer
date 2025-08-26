"use client";

import React, { useState, useRef, useEffect } from "react";

const JigsawPuzzle: React.FC = () => {
  const [imageList, setImageList] = useState<string[]>([
    "/pics/paris/eiffel2.jpg",
    "/pics/paris/paris1.jpg",
    "/pics/paris/paris2.jpg"
  ]);

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

  const [scaleFactor, setScaleFactor] = useState(0.2);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [loading, setLoading] = useState(false); // 🚀 NEW

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setCompletedStatus(Array(imageList.length).fill(false));
  }, []);

  useEffect(() => {
    if (imageList.length === 0) return;

    setLoading(true);
    setImage(null);   // 🚀 clear previous image immediately

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
  }, [currentIndex, imageList, scaleFactor]);


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

    // ✅ Stop timer if ALL puzzles are solved
    if (solvedCount === imageList.length && imageList.length > 0) {
      setEndTime(Date.now());
    }
  }, [completedStatus, imageList.length]);



  const createPuzzlePieces = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pieceWidth = img.width / 3;
    const pieceHeight = img.height / 3;
    const scaledWidth = pieceWidth * scaleFactor;
    const scaledHeight = pieceHeight * scaleFactor;

    setPieceSize({ width: scaledWidth, height: scaledHeight });

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
          j * pieceWidth,
          i * pieceHeight,
          pieceWidth,
          pieceHeight,
          0,
          0,
          pieceWidth,
          pieceHeight
        );
        pieces.push(pieceCanvas.toDataURL());
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

  const handleDragStart = (event: React.DragEvent<HTMLImageElement>, index: number) => {
    event.dataTransfer.setData("text/plain", index.toString());
    if (!startTime) setStartTime(Date.now());
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, frameIndex: number) => {
    event.preventDefault();
    const pieceIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
    const piece = puzzlePieces[pieceIndex];

    if (originalPieces[frameIndex] === piece) {
      setStreak((prev) => prev + 1);
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
        // ✅ Add 100 points to the score
        setScore(prevScore => prevScore + (turbo ? 200 : 100));
      goNext();
      // setEndTime(Date.now());
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % imageList.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "10px 20px" }}>
        <div style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "white", padding: "5px 10px", borderRadius: "5px", fontWeight: "bold" }}>
          Score: {score} pts | Streak: {streak}
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          style={{ padding: "8px 16px", backgroundColor: "gray", color: "white", border: "none", borderRadius: "5px" }}
        >
          Settings
        </button>
        <div style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "white", padding: "5px 10px", borderRadius: "5px", fontWeight: "bold" }}>
          ⏱ {formatTime(elapsedTime)}
        </div>
        <div>
          {solvedPuzzlesCount}
        </div>
        <button
          onClick={() => setTurbo(prev => !prev)}
          className={`cursor-pointer px-4 py-2 rounded-lg text-white transition-all duration-300
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
            <h2>Adjust Piece Size</h2>
            <p>Current scale: {scaleFactor.toFixed(2)}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button onClick={() => setScaleFactor(prev => prev + 0.1)}>+</button>
              <button onClick={() => setScaleFactor(prev => Math.max(0.1, prev - 0.1))}>-</button>
            </div>
            <div style={{ marginTop: "10px" }}>
              <button onClick={() => setSettingsOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <h1>Jigsaw Puzzle</h1>

      {/* Navigation */}
      <div style={{ margin: "10px" }}>
        <button onClick={goPrev} style={{ marginRight: "10px" }}>⬅ Prev</button>
        <button onClick={goNext}>Next ➡</button>
      </div>

      {/* Original Image / Loader */}
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
                // key={`${image.src}-${currentIndex}`}
                alt="Original"
                style={{
                  margin: "5px",
                  width: `${pieceSize.width * 3}px`,
                  height: `${pieceSize.height * 3}px`,
                  border: "2px solid #ccc"
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
            <div style={{ display: "flex", flexWrap: "wrap", width: `${pieceSize.width * 7}px` }}>
              {puzzlePieces.map((piece, index) => (
                <img
                  key={index}
                  src={piece}
                  alt={`Piece ${index}`}
                  draggable
                  onDragStart={(event) => handleDragStart(event, index)}
                  style={{ width: `${pieceSize.width}px`, height: `${pieceSize.height}px`, margin: "5px" }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default JigsawPuzzle;
