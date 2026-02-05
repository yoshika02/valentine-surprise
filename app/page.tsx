"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore
import confetti from "canvas-confetti";

// ---------------------------------------------------------
// 🗓️ CONFIGURATION
// ---------------------------------------------------------
const VALENTINE_WEEK = [
  { id: 1, title: "Rose Day", date: "Feb 7", color: "from-red-200 to-pink-200", icon: "🌹", video: "/rose_reveal.mp4", msg: "Like a rose, my love for you blooms more every day." },
  { id: 2, title: "Propose Day", date: "Feb 8", color: "from-blue-200 to-purple-200", icon: "💍", video: "/propose_reveal.mp4", msg: "I don't need a ring to know I want you forever." },
  { id: 3, title: "Chocolate Day", date: "Feb 9", color: "from-amber-200 to-orange-200", icon: "🍫", video: "/chocolate_reveal.mp4", msg: "You are sweeter than any chocolate in the world." },
  { id: 4, title: "Teddy Day", date: "Feb 10", color: "from-rose-100 to-teal-100", icon: "🧸", video: "/teddy_reveal.mp4", msg: "Sending you a bear hug! (I wish I was there to give it real)." },
  { id: 5, title: "Promise Day", date: "Feb 11", color: "from-indigo-200 to-blue-100", icon: "🤞", video: "/promise_reveal.mp4", msg: "I promise to annoy you, love you, and support you always." },
  { id: 6, title: "Hug Day", date: "Feb 12", color: "from-emerald-200 to-green-100", icon: "🤗", video: "/hug_reveal.mp4", msg: "My favorite place in the world is in your arms." },
  { id: 7, title: "Kiss Day", date: "Feb 13", color: "from-fuchsia-200 to-pink-200", icon: "💋", video: "/kiss_reveal.mp4", msg: "Saving all my kisses just for you." },
  // 📸 NOTE: Valentine's Day is now set to use an IMAGE instead of a video
  { id: 8, title: "Valentine's Day", date: "Feb 14", color: "from-red-300 to-rose-300", icon: "❤️", img: "/valentine_reveal.png", msg: "Will you be my Valentine? (Oh wait, you already said yes!)" },
];

export default function Home() {
  const [stage, setStage] = useState<"intro" | "ask" | "dashboard">("intro");
  const [yesPressed, setYesPressed] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [unlockedDays, setUnlockedDays] = useState<number>(0);
  const [showContent, setShowContent] = useState(false); 
  const [toastMessage, setToastMessage] = useState(""); // 💬 State for the "See you Puttu" popup
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // 🔒 REAL DATE LOCKING LOGIC
    const now = new Date();
    const currentMonth = now.getMonth(); // 0 = Jan, 1 = Feb
    const currentDate = now.getDate();
    
    // Logic: If it's NOT Feb, lock everything. 
    // If it is Feb, check the date.
    if (currentMonth === 1) { // February
      if (currentDate < 7) {
        setUnlockedDays(0); // Before Feb 7: Locked
      } else if (currentDate >= 14) {
        setUnlockedDays(8); // On/After Feb 14: All Open
      } else {
        setUnlockedDays(currentDate - 6); // Feb 7 = 1 unlocked, Feb 8 = 2 unlocked...
      }
    } else {
      setUnlockedDays(0); // Lock everything if it's not February
    }
  }, []);

  // 💬 Helper to show the popup message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000); // Hide after 3 seconds
  };

  // 🔄 LOOP LOGIC: Plays full video once, then loops the last 3 seconds
  const handleVideoEnd = () => {
    if (videoRef.current) {
      const loopStartTime = Math.max(0, videoRef.current.duration - 3);
      videoRef.current.currentTime = loopStartTime;
      videoRef.current.play();
    }
  };

  const setPlayBackSpeed = () => {
    if (videoRef.current) videoRef.current.playbackRate = 0.75;
  };

  const handleYesClick = () => {
    setYesPressed(true);
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      confetti({ ...defaults, particleCount: 50, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount: 50, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    setTimeout(() => {
      setStage("dashboard");
    }, 4000);
  };

  const phrases = ["No", "Are you sure?", "Really sure?", "Pookie please?", 
    "Just think about it!", "If you say no, I will be really sad...", 
    "I will be very very very sad...", "Ok fine, I will stop asking...", 
    "Just kidding, say yes please! ❤️"];
  
  const isSurePuttuMode = noCount >= phrases.length;
  const isSad = noCount > 0 && !yesPressed;

  const handleNoClick = () => {
    if (isSurePuttuMode) handleYesClick(); 
    else setNoCount(noCount + 1);
  };

  const closeModal = () => {
    setSelectedDay(null);
    setShowContent(false); 
  };

  // 🔔 NOTIFY HIM FUNCTION (Opens Email + Shows Popup)
  const handleNotify = () => {
    const today = new Date();
    const currentDay = VALENTINE_WEEK.find(d => d.id === unlockedDays);
    const nextDay = VALENTINE_WEEK.find(d => d.id === unlockedDays + 1);

    const subject = `Valentine Surprise: ${currentDay ? currentDay.title : "New Update"} Unlocked! 💖`;
    
    // Create a body with a countdown message
    let body = `Hey Pookie! \n\n`;
    if (currentDay) {
        body += `🎉 Today is ${currentDay.title}! Go check your surprise now: ${window.location.href}\n\n`;
    }
    if (nextDay) {
        body += `⏳ Next unlock: ${nextDay.title} is coming tomorrow! Get ready!\n\n`;
    }
    body += `Love you! ❤️`;

    // 💬 Show the "See you Puttu" popup
    showToast("See you Puttu! 💌");

    // Open Mail App
    setTimeout(() => {
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 1000);
  };

  if (!mounted) return null;

  // @ts-ignore
  const currentDayData = selectedDay !== null ? VALENTINE_WEEK[selectedDay - 1] : null;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-100 flex items-center justify-center font-sans">
      
      {/* 🌸 BACKGROUND HEARTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: windowSize.height, x: Math.random() * windowSize.width }} 
            animate={{ opacity: [0, 0.5, 0], y: -100 }}
            transition={{ duration: Math.random() * 10 + 15, repeat: Infinity, delay: Math.random() * 5 }}
            className="absolute text-rose-300 text-2xl"
          >
            ❤️
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* 💌 STAGE 1: INTRO */}
        {stage === "intro" && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex flex-col items-center text-center"
          >
             <h1 className="font-pacifico text-5xl text-rose-600 mb-8 drop-shadow-sm">Hi Doraemon!</h1>
            <button
              onClick={() => setStage("ask")}
              className="bg-white/90 backdrop-blur-sm text-rose-500 font-bold py-4 px-12 rounded-full shadow-xl border border-rose-100 animate-pulse text-xl"
            >
              Open Letter 💌
            </button>
          </motion.div>
        )}

        {/* 🐘 STAGE 2: THE QUESTION */}
        {stage === "ask" && (
          <motion.div 
            key="ask"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }}
            className="z-10 w-full max-w-md p-6 text-center"
          >
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white/50 mb-8">
              <video
                ref={videoRef}
                key={yesPressed ? "celebration" : (isSad ? "sad" : "happy")}
                autoPlay 
                // loop <--- REMOVED THIS so JS can handle the 3-sec loop
                playsInline 
                onCanPlay={setPlayBackSpeed}
                onEnded={handleVideoEnd} 
                className="w-full h-full object-cover"
              >
                <source src={isSad ? "/sad.mp4" : "/elephant.mp4"} type="video/mp4" />
              </video>
            </div>

            {!yesPressed ? (
              <div className="flex flex-col gap-4">
                <h2 className="font-pacifico text-4xl text-rose-600">Will you be my Valentine?</h2>
                <div className="flex justify-center gap-4 mt-4">
                  <button onClick={handleYesClick} className="bg-rose-500 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg transform transition hover:scale-110">
                    Yes! ❤️
                  </button>
                  <button 
                    onClick={handleNoClick} 
                    className={`font-bold py-3 px-8 rounded-full shadow-lg text-lg transition-all ${isSurePuttuMode ? "bg-green-500 text-white" : "bg-white text-rose-500"}`}
                  >
                    {isSurePuttuMode ? "Sure puttu ❤️" : (noCount === 0 ? "No" : phrases[Math.min(noCount, phrases.length - 1)])}
                  </button>
                </div>
              </div>
            ) : (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                 <h2 className="font-pacifico text-5xl text-rose-600 mb-2">YAAAY! 🎉</h2>
                 <p className="text-rose-800 text-lg">Unlocking your surprise calendar...</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 📅 STAGE 3: THE VALENTINE WEEK DASHBOARD */}
        {stage === "dashboard" && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="z-20 w-full max-w-lg p-4 h-[100dvh] overflow-y-auto"
          >
            <div className="text-center mb-6 pt-4">
              <h1 className="font-pacifico text-3xl text-rose-600">Our Valentine Week ❤️</h1>
              <p className="text-rose-400 text-sm">Come back every day for a new surprise!</p>
              
              {/* 🔔 NOTIFY BUTTON */}
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleNotify}
                className="mt-4 text-sm bg-rose-500 text-white px-6 py-2 rounded-full shadow-md font-bold hover:bg-rose-600 transition"
              >
                🔔 Notify Him!
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-10">
              {VALENTINE_WEEK.map((day, index) => {
                const isUnlocked = index < unlockedDays;
                return (
                  <motion.div
                    key={day.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => isUnlocked ? setSelectedDay(day.id) : showToast(`Wait for ${day.date} Puttu! 🔒`)}
                    className={`relative aspect-square rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md cursor-pointer transition-transform transform ${
                      isUnlocked ? `bg-gradient-to-br ${day.color} hover:scale-105` : "bg-gray-100 grayscale opacity-70"
                    }`}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                        <span className="text-2xl">🔒</span>
                      </div>
                    )}
                    <div className="text-4xl mb-2">{day.icon}</div>
                    <h3 className="font-bold text-rose-800 text-sm">{day.title}</h3>
                    <p className="text-xs text-rose-600 opacity-80">{day.date}</p>
                    
                    {isUnlocked && index === unlockedDays - 1 && (
                      <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* 🎭 POPUP MODAL FOR DAILY MESSAGE */}
      <AnimatePresence>
        {selectedDay !== null && currentDayData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className={`w-full max-w-sm bg-gradient-to-br ${currentDayData.color} p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 text-rose-800 opacity-50 hover:opacity-100 text-xl z-10"
              >✕</button>
              
              {showContent ? (
                 <div className="relative w-full aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-inner my-2 flex items-center justify-center">
                   
                   {/* 🎞️ Logic: Check if it's an Image or Video */}
                   {currentDayData.img ? (
                     <img 
                       src={currentDayData.img} 
                       alt="Valentine Surprise" 
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <video 
                        key={currentDayData.video}
                        src={currentDayData.video}
                        className="w-full h-full object-cover" 
                        controls 
                        autoPlay 
                        loop 
                        playsInline 
                     />
                   )}
                   
                 </div>
              ) : (
                <>
                  <div className="text-6xl mb-4 animate-bounce">{currentDayData.icon}</div>
                  <h2 className="font-pacifico text-3xl text-rose-900 mb-2">{currentDayData.title}</h2>
                  <p className="text-rose-800 text-lg font-medium leading-relaxed">
                    "{currentDayData.msg}"
                  </p>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowContent(true)}
                    className="mt-6 bg-rose-600 text-white font-bold py-2 px-6 rounded-full shadow-lg animate-pulse"
                  >
                    Open Surprise! ✨
                  </motion.button>
                </>
              )}

              <p className="mt-6 text-xs text-rose-700 opacity-60 uppercase tracking-widest">Unlocked • {currentDayData.date}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🗨️ CUSTOM TOAST / POPUP MESSAGE */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-md font-bold text-sm whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}