"use client";

import React, { useState, useEffect, useRef } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";

const Upload: React.FC = () => {
  const [person, setPerson] = useState<File | null>(null);
  const [clothes, setClothes] = useState<string[]>([]);
  const [selectedClothes, setSelectedClothes] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const cursorRef = useRef<HTMLDivElement>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number }[]>([]);
  const rippleId = useRef(0);

  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    const moveCursor = (e: MouseEvent) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    const clickCursor = (e: MouseEvent) => {
      cursor.classList.add("click");
      setTimeout(() => cursor.classList.remove("click"), 150);
      const id = rippleId.current++;
      const newRipple = { x: e.clientX, y: e.clientY, id };
      setRipple((prev) => [...prev, newRipple]);
      setTimeout(() => {
        setRipple((prev) => prev.filter((r) => r.id !== id));
      }, 400);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", clickCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", clickCursor);
      document.head.removeChild(style);
    };
  }, []);

  
  useEffect(() => {
    const fetchClothes = async () => {
      const listRef = ref(storage, "clothes");
      const res = await listAll(listRef);
      const clothesUrls = await Promise.all(
        res.items.map(async (itemRef) => await getDownloadURL(itemRef))
      );
      setClothes(clothesUrls);
    };
    fetchClothes();
  }, []);

  const handlePersonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.name.toLowerCase().endsWith(".jpg")) {
        alert("Format file tidak diterima. Pastikan formatnya .jpg");
        event.target.value = "";
        return;
      }
      setPerson(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !selectedClothes) {
      alert("Please upload a person image and select clothes.");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    
    const interval = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 2 : p));
    }, 100);

    const formData = new FormData();
    const decodedClothesUrl = decodeURIComponent(selectedClothes);
    const clothesFileName =
      decodedClothesUrl.split("/").pop()?.split("?")[0] || selectedClothes;
    formData.append("person", person);
    formData.append("garment", clothesFileName);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.status === "success") {
        setImageUrl(result.image_url);
        setProgress(100);
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Upload failed!");
    } finally {
      clearInterval(interval);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (carouselRef.current) {
      isDragging.current = true;
      startX.current = e.clientX;
      scrollLeft.current = carouselRef.current.scrollLeft;
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const walk = (e.clientX - startX.current) * 3;
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const handleMouseUp = () => (isDragging.current = false);
  const handleMouseLeave = () => (isDragging.current = false);

  const handleDownload = () => {
    if (imageUrl) {
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = "generated-image.jpg";
      a.click();
    }
  };

  const handleReset = () => {
    setPerson(null);
    setSelectedClothes("");
    setImageUrl(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 select-none">
      <style>{`
        * { cursor: none !important; }

        /* Hover follow movement */
        .hover-lift { transition: transform 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px) scale(1.02); }

        /* Pop Animation */
        @keyframes fadeInPop {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop { animation: fadeInPop 0.6s ease forwards; }

        /* Fade In Image */
        @keyframes fadeZoom {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .fade-zoom { animation: fadeZoom 0.7s ease forwards; }

        /* Cursor */
        .custom-cursor {
          position: fixed; top: 0; left: 0;
          width: 22px; height: 22px;
          border: 2px solid black; border-radius: 50%;
          pointer-events: none; transform: translate(-50%, -50%);
          transition: transform 0.08s ease-out, background 0.2s ease;
          z-index: 9999;
        }
        .custom-cursor.click {
          transform: translate(-50%, -50%) scale(1.4);
          background: rgba(0, 0, 0, 0.15);
        }

        .ripple {
          position: fixed; width: 8px; height: 8px;
          background: rgba(0, 0, 0, 0.25);
          border-radius: 50%; pointer-events: none;
          transform: translate(-50%, -50%) scale(1);
          animation: rippleAnim 0.4s ease-out forwards;
          z-index: 9998;
        }
        @keyframes rippleAnim {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(5); opacity: 0; }
        }
      `}</style>

  
      <div ref={cursorRef} className="custom-cursor"></div>
      {ripple.map((r) => (
        <div key={r.id} className="ripple" style={{ left: r.x, top: r.y }}></div>
      ))}

   
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-[3px] bg-gray-200 z-[9999]">
          <div
            className="h-[3px] bg-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

  
      <nav className="flex items-center justify-between py-8 bg-white border-b border-gray-100 px-6 fixed top-0 left-0 right-0 z-50 animate-fadeIn">
        <a href="/" className="hover-lift">
          <img src="/baju.svg" alt="Baju Logo" className="h-7 sm:h-9" />
        </a>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-base sm:text-lg font-semibold text-black tracking-tight uppercase">
          Virtual Try-On
        </h1>
      </nav>


       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl w-full mt-32 mb-8 animate-pop">
        <div className="bg-white border border-gray-200 rounded-lg p-8 hover-lift relative">
          <div className="absolute -top-3 left-6 bg-white px-3 py-1 text-xs font-semibold text-black uppercase tracking-wider">
            Step 1
          </div>
          
          <div className="border-l-2 border-black p-4 mb-6 text-sm text-gray-800">
            <p className="font-medium text-black mb-2">Keterangan</p>
            <ul className="space-y-1 ml-4 text-gray-600">
              <li>• Format gambar: <strong>JPG</strong></li>
              <li>• Foto harus memuat bagian atas badan</li>
            </ul>
          </div>

          <div className="relative w-full h-80 bg-gray-50 flex items-center justify-center mb-6 rounded-lg overflow-hidden border border-gray-200 group transition-all hover:border-black">
            {person ? (
              <img src={URL.createObjectURL(person)} alt="Uploaded Person" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 border-2 border-gray-300 rounded-full flex items-center justify-center group-hover:border-black transition-colors">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Upload gambar Anda</p>
              </div>
            )}
          </div>

          <label className="block mb-6 cursor-pointer group">
            <div className="flex items-center justify-center px-4 py-3 bg-black text-white rounded-lg transition-all hover:bg-gray-800 active:scale-95">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="font-medium">Pilih Foto</span>
            </div>
            <input type="file" onChange={handlePersonUpload} className="hidden" />
          </label>

          <p className="text-sm font-medium text-black mb-3">Pilih Pakaian</p>
          <div className="relative">
            <div ref={carouselRef} className="flex gap-4 py-2 cursor-grab overflow-x-auto no-scrollbar" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
              {clothes.map((cloth, index) => (
                <img key={index} src={cloth} alt={`Clothes ${index + 1}`} className={`w-32 h-32 object-cover rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${selectedClothes === cloth ? "border-2 border-black ring-2 ring-black ring-offset-2" : "border border-gray-200 hover:border-gray-400"}`} onClick={() => setSelectedClothes(cloth)} />
              ))}
            </div>
            <button onClick={() => carouselRef.current?.scrollBy({ left: -100, behavior: "smooth" })} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all">
              <span>◀</span>
            </button>
            <button onClick={() => carouselRef.current?.scrollBy({ left: 100, behavior: "smooth" })} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all">
              <span>▶</span>
            </button>
          </div>

          <button onClick={handleSubmit} disabled={isLoading || !person || !selectedClothes} className={`w-full mt-6 py-3 rounded-lg font-medium transition-all active:scale-95 ${isLoading || !person || !selectedClothes ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`}>
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : "Generate"}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 hover-lift relative">
          <div className="absolute -top-3 left-6 bg-white px-3 py-1 text-xs font-semibold text-black uppercase tracking-wider">
            Step 2
          </div>

           <div className="w-full h-80 bg-gray-50 flex items-center justify-center rounded-lg overflow-hidden mb-6 border border-gray-200 transition-all hover:border-black">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Generated Image"
                className="w-full h-full object-contain fade-zoom"
              />
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Hasil akan muncul di sini</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button onClick={handleDownload} disabled={!imageUrl} className={`flex-1 py-3 rounded-lg font-medium transition-all active:scale-95 ${!imageUrl ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`}>
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </span>
            </button>
            <button onClick={handleReset} className="flex-1 py-3 rounded-lg font-medium border-2 border-black text-black hover:bg-black hover:text-white transition-all active:scale-95">
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;