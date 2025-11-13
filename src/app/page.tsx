"use client";
import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import "./index.css";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);


  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

 
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };


  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.classList.add("custom-cursor");
    document.body.appendChild(cursor);

    const moveCursor = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    const clickEffect = (e: MouseEvent) => {
      cursor.classList.add("click");
      setTimeout(() => cursor.classList.remove("click"), 150);

      const ripple = document.createElement("div");
      ripple.classList.add("ripple");
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 400);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("click", clickEffect);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("click", clickEffect);
      cursor.remove();
    };
  }, []);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="/dist/output.css" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <title>Virtual Try On</title>
      </Head>


      <audio ref={audioRef} autoPlay loop>
        <source src="/jingle.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

   
      <div className="moving">
        <h1 className="name animate-pop">Virtual Try On Clothing.</h1>
        <p className="subtitle animate-pop" style={{ animationDelay: "0.2s" }}>
          Choose Your Own Clothes
        </p>
      </div>

      <div className="-mt-20 flex justify-center">
        <img src="/mouse.svg" alt="Mouse icon" className="-mt-10 w-10 animate-bounce" />
      </div>

      <a className="-mt-10 opacity-70 hover-lift" href="upload">
        Discover
      </a>

   
      <div className="fixed bottom-5 right-5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-md px-4 py-3 flex items-center gap-3 animate-pop">
        <button
  onClick={togglePlay}
  className="w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform duration-200"
  aria-label={isPlaying ? "Pause" : "Play"}
>
  {isPlaying ? (
  
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="22" height="22">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ) : (

    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="22" height="22">
      <path d="M8 5v14l11-7z" />
    </svg>
  )}
</button>

        <input
  type="range"
  min="0"
  max="1"
  step="0.01"
  value={volume}
  onChange={handleVolumeChange}
  className="w-24 custom-volume"
/>

      </div>
    </>
  );
}
