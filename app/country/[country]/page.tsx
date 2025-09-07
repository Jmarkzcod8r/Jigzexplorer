"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import axios from "axios";
import Swal from 'sweetalert2'
import { doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore"
// import { apptry, db } from "../api/firebase/firebase-config"
import { apptry, db } from "@/app/api/firebase/firebase-config";

const JigsawPuzzle: React.FC = () => {
  const router = useRouter();
  const { country } = useParams<{ country: string }>(); // ✅ dynamic segment param
  const [imageList, setImageList] = useState<string[]>([]);

  const [quotaPics, setQuotaPics] = useState(10);


  // Fetch images for the given country
  useEffect(() => {
    const fetchImages = async () => {
        try {
          const res = await axios.get<string[]>(`/api/images/${country}`);
          const shuffled = [...res.data].sort(() => Math.random() - 0.5);
          setImageList(shuffled);
        } catch (err) {
          console.error("Error fetching images:", err);
          alert("Error getting data");
        }
      };

    if (country) fetchImages();

  }, [country]);

  // ---------------- existing game state ----------------
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
  const [countdown, setCountdown] = useState(0);
  const [cooldown, setCooldown] = useState(false); // 🔒 stays disabled after Turbo ends
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [puzzleSize, setPuzzleSize] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [loading, setLoading] = useState(false);



  // 👇 initialize safely with 0
  const [size, setSize] = useState({ width: 0, height: 0 });

  const [breakpoint, setBreakpoint] = useState("base");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedPieces, setSelectedPieces] = useState<string[]>([]);

// ✅ Select/Deselect multiple pieces
const handlePieceClick = (piece: string) => {
  if (framePieces.includes(piece)) return; // already placed

  // ⏱️ start timer on first interaction
  if (!startTime) setStartTime(Date.now());

  setSelectedPieces(prev => {
    if (prev.includes(piece)) {
      // deselect if already selected
      return prev.filter(p => p !== piece);
    }
    return [...prev, piece]; // add new selection
  });
};
;

// ✅ Place pieces on frame in order
const handleFrameClick = (frameIndex: number) => {
  const currentPiece = framePieces[frameIndex];

  // 🟢 If cell already has a piece → remove it
  if (currentPiece) {
    const newFramePieces = [...framePieces];
    newFramePieces[frameIndex] = null;
    setFramePieces(newFramePieces);
    return;
  }

  // 🟢 Place the *first* selected piece
  if (selectedPieces.length === 0) return;

  const [piece, ...rest] = selectedPieces;

  // ✅ scoring / streak logic
  if (originalPieces[frameIndex] === piece) {
    setStreak((prev) => prev + 1);
  } else {
    setStreak(0);
  }

  const newFramePieces = [...framePieces];
  newFramePieces[frameIndex] = piece;
  setFramePieces(newFramePieces);

  setSelectedPieces(rest); // keep remaining selected

  // ✅ check if puzzle complete
  if (newFramePieces.every((p, idx) => p === originalPieces[idx])) {
    const updatedStatus = [...completedStatus];
    updatedStatus[currentIndex] = true;
    setCompletedStatus(updatedStatus);
    setScore((prevScore) => prevScore + (turbo ? 200 : 100));
    fireConfetti();
    goNext();
  }
};


  // Init completed status
  useEffect(() => {
    setCompletedStatus(Array(imageList.length).fill(false));
  }, [imageList.length]);

  // Load new image
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
  }, [currentIndex, imageList]);

  // Recalculate piece size when puzzleSize changes
useEffect(() => {
  if (image) {
    createPuzzlePieces(image); // just updates pieceSize + pieces
  }
}, [puzzleSize]);


  // Timer
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

  // Track solved puzzles
  useEffect(() => {
    const solvedCount = completedStatus.filter(status => status).length;
    setSolvedPuzzlesCount(solvedCount);

    if (solvedCount === imageList.length && imageList.length > 0) {
      setEndTime(Date.now());
    }
  }, [completedStatus, imageList.length]);

  const [orientation, setOrientation] = useState('')

  const createPuzzlePieces = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = Math.min(puzzleSize / img.width, puzzleSize / img.height);
    // const scale = .07;
    const displayWidth = img.width * scale;
    const displayHeight = img.height * scale;

    setOrientation(displayWidth > displayHeight ? "landscape" : "portrait");

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

  // 🎉 Confetti
  const fireConfetti = () => {
    const duration = 180;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: turbo ? 10 : 5,
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

      fireConfetti();
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

  const hasFiredRef = useRef(false);
  useEffect(() => {
    if (solvedPuzzlesCount === quotaPics && !hasFiredRef.current) {
      hasFiredRef.current = true; // ✅ mark as fired

      Swal.fire({
        title: "🎉 Congratulations!",
        html: `
          You solved <b>10</b> puzzles!<br>
          <b>Score:</b> ${score}<br>
          <b>Streak:</b> ${streak}<br>
          <b>Over-All Score:</b> ${score + (streak * 10)}<br>
          <b>Time Spent:</b> ${elapsedTime}s <br>
          <b>Tickets Earned</b> "+2"<br>
        `,
        icon: "success",
        confirmButtonText: "Nice!",
        didOpen: () => {
          const burst = () => {
            const particleCount = 50;

            confetti({
              particleCount,
              origin: { x: 0, y: Math.random() - 0.2 },
              angle: 60,
              spread: 55,
            });

            confetti({
              particleCount,
              origin: { x: 1, y: Math.random() - 0.2 },
              angle: 120,
              spread: 55,
            });
          };

          burst();
          const interval = setInterval(burst, 2000);

          Swal.getPopup()?.addEventListener("mouseleave", () => {
            clearInterval(interval);
          });
        },
      });

      // 📡 Send payload only once
      const rawEmail = localStorage.getItem("email");
      const cleanEmail = rawEmail ? rawEmail.replace(/^"+|"+$/g, "") : "";

      const rawUID = localStorage.getItem("uid");
      const cleanUID = rawUID ? rawUID.replace(/^"+|"+$/g, "") : "";

      const payload = {
        email: cleanEmail,
        country,
        score: score + (streak * 10),
        datePlayed: Date.now(),
        tickets: 2
      };

      fetch("/api/post/country", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => console.log("✅ Saved:", data))
        .catch((err) => console.error("❌ Error saving data:", err));

        const userRef = doc(db, "Firebase-jigzexplorer-profiles", cleanUID);
        updateDoc(userRef, {
          tickets: increment(2),
          overallscore: increment(score + (streak * 10)),
        })
        .then(() => console.log("✅ Firestore updated with score & tickets"))
        .catch((err) => console.error("❌ Firestore update failed:", err));

    }
  }, [solvedPuzzlesCount]); // ✅ only watch this



  const getBreakpoint = (width: number) => {
    if (width >= 1536)  {
      setPuzzleSize(300);
      return "2xl";
    }
    if (width >= 1280) {
      setPuzzleSize(300);
      return "xl";
    }
    if (width >= 1024) {
      setPuzzleSize(300);
     return "md"; }
    if (width >= 768){
      setPuzzleSize(300);
     return "md"; }
    if (width >= 640) {
      setPuzzleSize(250);
     return "sm"; }
    else {
      setPuzzleSize(250);
      return "base";
    }
     // below 640px (phones)
  };

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setSize({ width: w, height: h });
      setBreakpoint(getBreakpoint(w));
    };

    handleResize(); // ✅ set on mount (runs only in client)
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect for Turbo button
  useEffect(() => {
    if (turbo && countdown > 0) {
      // ⏱ Countdown logic
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && turbo) {
      // 🔴 Time’s up, turn off Turbo but keep cooldown
      setTurbo(false);
      setCooldown(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [turbo, countdown]);

  const handleClick = () => {
    if (!turbo && !cooldown) {
      setTurbo(true);
      setCountdown(30);
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="flex flex-col items-center  max-[400px]:h-screen">
       {/* <p> {size.width}px x {size.height}px</p> */}
          {/* <p className="text-sm font-semibold text-blue-600">
        Orientation: {orientation}
      </p>
      <p> {size.width}px x {size.height}px</p>
      <p>{breakpoint} </p> */}
      {/* {orientation} */}
      {/* Top bar */}
      {/* <div className="bg-blue-600 flex justify-between items-center w-full px-5 py-2 gap-2">
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
      </div> */}

      {/* Settings Popup */}
      {/* // Settings Popup - START */}
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
        {/* // Settings Popup - START */}

        {/* start */}

        <main className="bg-gray-100" >
        {/* score */}
      <div className="bg-purple-200 text-white px-3 py-1 text-xs sm:text-lg flex justify-around rounded-md font-bold">
        <button
          onClick={() => router.push("/")}
          className="cursor-pointer px-2 py-2 text-xs sm:text-lg rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
          >
          🏠 Home
        </button>
        <div className="px-2 py-1 sm:py-2 text-xs sm:text-lg rounded-lg bg-violet-800">Score: {score} pts | Streak: {streak}</div>


        {/* <button
          onClick={() => setSettingsOpen(true)}
          className="cursor-pointer px-2 py-2 rounded-lg text-white bg-gray-500 hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
        >
          Settings
        </button> */}
         <div className="bg-black/60 text-white px-2 py-1 sm:py-2 text-xs sm:text-lg rounded-md font-bold">
          ⏱ {formatTime(elapsedTime)}
        </div>

        <button
      onClick={handleClick}
      disabled={turbo || cooldown} // 🚫 disables both while active + after finish
      className={`cursor-pointer px-2 py-2 text-xs sm:text-lg rounded-lg text-white transition-all duration-300 transform hover:scale-105
        ${turbo
          ? "bg-blue-500 shadow-[0_0_20px_5px_rgba(59,130,246,0.7)]"
          : cooldown
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"}`}
    >
      {turbo ? `Turbo Mode (${countdown}s)` : cooldown ? "Turbo (Disabled)" : "Turbo"}
    </button>
      </div>

      {/* Navigation */}
      <div className=" flex justify-around gap-2 m-1 bg-purple-200 ">
      <div className="bg-black/60 text-white sm:px-3 px-1 py-1 text-xs sm:text-lg rounded-md font-bold ">
          <div className="flex justify-center">📷 </div>
          <p>{currentIndex + 1} / {imageList.length}</p>
        </div>
        <button
          onClick={goPrev}
          className="cursor-pointer px-2 sm:px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600
                    transition-all duration-300 text-sm shadow-md hover:shadow-lg transform hover:scale-110"
        >
          ⬅ Prev
        </button>
        <button
          onClick={goNext}
          className="cursor-pointer px-2 sm:px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600
                    transition-all duration-300 text-sm shadow-md hover:shadow-lg transform hover:scale-110"
        >
          Next ➡
        </button>
        <div className="bg-black/60 text-white sm:px-3 px-2 py-1 text-xs sm:text-lg rounded-md font-bold ">
        <div className="flex justify-center">🧩 {solvedPuzzlesCount}</div>
          {imageList.length > 0 && (
            <> ({Math.round((solvedPuzzlesCount / imageList.length) * 100)}%)</>
          )}
        </div>

      </div>

      {/* Puzzle Board + Original */}
      <div className="flex justify-around flex-col items-center  [@media(min-width:400px)]:flex-row">
          {loading ? (
           <div
           className="flex items-center justify-center border-2 border-gray-300 w-screen"
           style={{
             width: `${pieceSize.width * 3}px`,
             height: `${pieceSize.height * 3}px`,
           }}
         >
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
                    objectFit: "cover",
                  }}
                />
              </div>
            )
          )}

          {completedStatus[currentIndex] ? null : (
         <div
         className="mx-auto [@media(min-width:400px)]:mx-0"
         style={{
           display: "grid",
           gridTemplateColumns: "repeat(3, 1fr)",
           gap: "5px",
           width: `${pieceSize.width * 3}px`,
           height: `${pieceSize.height * 3}px`,
         }}
       >
         {framePieces.map((piece, index) => (
           <div
             key={index}
             onClick={() => handleFrameClick(index)}
             onDrop={(event) => handleDrop(event, index)}
             onDragOver={handleDragOver}
             style={{
               width: `${pieceSize.width}px`,
               height: `${pieceSize.height}px`,
               border: "1px solid gray",
               backgroundImage: piece ? `url(${piece})` : "none",
               backgroundSize: "cover",
               cursor: "pointer",
             }}
           />
         ))}
       </div>

          )}
        </div>


      {/* Solved or Puzzle pieces */}
      {completedStatus[currentIndex] ? (
        <div style={{ color: "green", fontWeight: "bold", marginTop: "10px" }}>
          ✅ Already Solved
        </div>
      ) : (
        <div className=""
               style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <div className="pb-7">
            {/* <h3 className="text-center">Puzzle Pieces</h3> */}
            <div className=""
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",        // space between pieces
                justifyContent: "flex-start", // align pieces nicely
              }}
            >
           {puzzlePieces.map((piece, index) => {
              const isPlaced = framePieces.includes(piece);
              const isSelected = selectedPieces.includes(piece);

              return (
                <button key={index} onClick={() => handlePieceClick(piece)}>
                  <img
                    src={piece}
                    alt={`Piece ${index}`}
                    draggable
                    onDragStart={(event) => handleDragStart(event, index)}
                    style={{
                      width: `${pieceSize.width}px`,
                      height: `${pieceSize.height}px`,
                      cursor: "grab",
                      borderRadius: "6px",
                      transition: "all 0.3s ease",
                      opacity: isPlaced ? 0.1 : 1,
                      border: isSelected ? "3px solid yellow" : "none", // highlight multiple
                    }}
                  />
                </button>
              );
            })}



            </div>

          </div>
        </div>
      )}
        </main>

      {/* // end */}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default JigsawPuzzle;
