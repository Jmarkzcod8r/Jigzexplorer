'use client';

import React, { useState } from 'react';
import Logo from '../component/logo';
import { checkPremiumStatus } from '../lib/checkPremiumStatus';

interface FolderInfo {
  name: string;
  handle: FileSystemDirectoryHandle;
}

const Page = () => {
  const [mainFolder, setMainFolder] = useState<FileSystemDirectoryHandle | null>(null);
  const [subfolders, setSubfolders] = useState<FolderInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [deleteOriginals, setDeleteOriginals] = useState(false); // ✅ NEW toggle

  // --- Select Folder and List Subfolders ---
  async function selectFolder() {
    // const isPremium = checkPremiumStatus();
    // if (!isPremium) {
    //   alert("🚫 Only premium users can use the folder selection feature. Upgrade to premium to continue.");
    //   return;
    // }
    if (!('showDirectoryPicker' in window)) {
      alert("Your browser doesn't support the File System Access API. Try Chrome or Edge.");
      return;
    }

    try {
      const root = await (window as any).showDirectoryPicker();
      if (!root) throw new Error("No folder selected");

      setMainFolder(root);
      const folders: FolderInfo[] = [];
      const countRef = { total: 0 };

      await scanSubfolders(root, folders, countRef);

      setSubfolders(folders);
      setEligibleCount(countRef.total);

      alert(`📁 Found ${folders.length} subfolder(s) and ${countRef.total} eligible image(s) in "${root.name}"`);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.error('❌ Folder selection canceled by user.');
      } else {
        console.error('Error selecting folder:', err);
      }
    }
  }

  // --- Recursive folder scanner + count eligible images ---
  async function scanSubfolders(
    dirHandle: FileSystemDirectoryHandle,
    results: FolderInfo[],
    countRef: { total: number }
  ) {
    for await (const entry of iterateDirectory(dirHandle)) {
      if (entry.kind === 'directory') {
        results.push({ name: `${dirHandle.name}/${entry.name}`, handle: entry });
        await scanSubfolders(entry, results, countRef);
      } else if (entry.kind === 'file') {
        if (/\.(jpe?g|png|bmp|gif|tiff)$/i.test(entry.name) && !/\.webp$/i.test(entry.name)) {
          countRef.total++;
        }
      }
    }
  }

  // --- Safe async iterator helper ---
  async function* iterateDirectory(dirHandle: FileSystemDirectoryHandle) {
    const anyHandle = dirHandle as any;
    if (anyHandle.values) {
      for await (const entry of anyHandle.values()) yield entry;
    } else if (anyHandle.entries) {
      for await (const [, entry] of anyHandle.entries()) yield entry;
    }
  }

  // --- Convert images in each subfolder ---
  async function convertAllSubfolders() {
    if (!mainFolder) {
      alert('Please select a folder first.');
      return;
    }

    // If delete originals is enabled, confirm first
    if (deleteOriginals) {
      const confirmDelete = confirm(
        '⚠️ You enabled "Delete originals". This will permanently remove the original files after conversion.\n\nDo you want to continue?'
      );
      if (!confirmDelete) return;
    }

    setIsProcessing(true);

    try {
      const allFolders = [{ name: mainFolder.name, handle: mainFolder }, ...subfolders];

      for (const folder of allFolders) {
        console.log(`🔄 Converting in folder: ${folder.name}`);
        await processFolder(folder.handle);
      }

      alert(
        deleteOriginals
          ? '✅ All folders converted and originals deleted!'
          : '✅ All folders converted successfully!'
      );
      setEligibleCount(0);
    } catch (err) {
      console.error('Error converting folders:', err);
      alert('❌ An error occurred while converting images.');
    } finally {
      setIsProcessing(false);
    }
  }

  // --- Process a single folder ---
  async function processFolder(dirHandle: FileSystemDirectoryHandle) {
    for await (const entry of iterateDirectory(dirHandle)) {
      if (entry.kind !== 'file') continue;

      if (/\.webp$/i.test(entry.name)) continue;

      if (/\.(jpe?g|png|bmp|gif|tiff)$/i.test(entry.name)) {
        const file = await entry.getFile();
        const webpBlob = await convertToWebp(file);

        if (webpBlob) {
          const newName = entry.name.replace(/\.[^/.]+$/, '') + '.webp';

          // Skip if WebP already exists
          let newFileHandle: FileSystemFileHandle;
          try {
            newFileHandle = await dirHandle.getFileHandle(newName, { create: false });
            console.log(`⚠️ ${newName} already exists, skipping`);
            continue;
          } catch {
            newFileHandle = await dirHandle.getFileHandle(newName, { create: true });
          }

          const writable = await newFileHandle.createWritable();
          await writable.write(webpBlob);
          await writable.close();

          console.log(`✅ Saved ${newName} in ${dirHandle.name}`);

          // ✅ Delete the original if toggle is ON
          if (deleteOriginals) {
            try {
              await dirHandle.removeEntry(entry.name);
              console.log(`🗑️ Deleted original: ${entry.name}`);
            } catch (err) {
              console.warn(`⚠️ Could not delete ${entry.name}:`, err);
            }
          }
        }
      }
    }
  }

  // --- Image to WebP converter ---
  async function convertToWebp(file: File): Promise<Blob | null> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
          } else {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.95);
      };

      img.onerror = () => resolve(null);
    });
  }

  function reset() {
    setMainFolder(null);
    setSubfolders([]);
    setEligibleCount(0);
  }

  return (
    <div className="font-sans flex flex-col items-center justify-start min-h-screen p-6 bg-[url('/Bg.png')] bg-cover bg-center">
      <Logo />
      <main className="bg-white p-4 rounded-b-md justify-center opacity-90">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 text-center">
          📂 Convert All Folder Images to WebP
        </h1>
        <h3 className="text-center mb-4">ver. 1.3</h3>

        {/* ✅ Delete Originals Toggle */}
        <div className="flex items-center justify-center mb-4 gap-2">
          <label htmlFor="deleteToggle" className="font-semibold text-gray-700">
            🗑️ Delete originals after conversion
          </label>
          <input
            id="deleteToggle"
            type="checkbox"
            checked={deleteOriginals}
            onChange={() => setDeleteOriginals(!deleteOriginals)}
            className="w-5 h-5 cursor-pointer accent-red-600"
          />
        </div>

        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={selectFolder}
            className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded shadow"
          >
            Select Main Folder
          </button>

          <button
            onClick={convertAllSubfolders}
            disabled={!mainFolder || isProcessing}
            className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded shadow disabled:opacity-50"
          >
            {isProcessing ? '⏳ Converting...' : 'Convert All'}
          </button>

          <button
            onClick={reset}
            className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded shadow"
          >
            Reset
          </button>
        </div>

        {mainFolder && (
          <div className="text-gray-700 text-sm max-w-md text-center">
            <p className="font-bold mb-1">📁 Selected Main Folder: {mainFolder.name}</p>
            <p className="mb-3">
              🖼️ Eligible images to convert:{' '}
              <span className="font-semibold">{eligibleCount}</span>
            </p>

            {subfolders.length > 0 ? (
              <ul className="list-disc ml-6 text-left">
                {subfolders.map((folder, idx) => (
                  <li key={idx}>{folder.name}</li>
                ))}
              </ul>
            ) : (
              <p>No subfolders found.</p>
            )}
          </div>
        )}
      </main>

      {/* ✅ Keep the Why WebP Section */}
      <div className="bg-white/90 mt-8 p-6 rounded-md shadow-md max-w-2xl text-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-center">🌍 Why WebP?</h2>
        <p className="text-center mb-4">
          WebP is a modern image format developed by Google that makes your photos smaller and faster to load —
          perfect for travelers, bloggers, and photographers who take lots of pictures.
        </p>

        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✔️</span>
            <span>Up to <strong>30–40% smaller</strong> file sizes than JPEG or PNG — save more storage space.</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✔️</span>
            <span>Maintains <strong>high image quality</strong> with efficient compression.</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✔️</span>
            <span>Loads <strong>faster on websites</strong> and photo galleries — great for sharing travel photos online.</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✔️</span>
            <span><strong>Reduces upload times</strong> when sending images to the cloud or social media.</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2">✔️</span>
            <span><strong>Perfect for tourists</strong>: take more pictures without worrying about running out of storage.</span>
          </li>
        </ul>

        <p className="mt-4 text-sm text-gray-600 text-center">
          By converting your images to WebP, you’ll keep your travel memories clear and compact — ideal for mobile devices and limited storage.
        </p>
      </div>
    </div>
  );
};

export default Page;
