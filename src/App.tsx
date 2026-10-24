import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Calendar,
  User,
  Bus,
  Clock,
  Utensils,
  FileText,
  Trash2,
  History,
  CheckCircle,
  ExternalLink,
  RotateCcw,
  Plus,
  Sparkles,
  Download,
  Image as ImageIcon,
} from "lucide-react";

// Types
interface LeaveRecord {
  id: string;
  createdAt: string;
  previewText: string;
  elderName: string;
  dates: string[];
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function App() {
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("toad_sound_enabled");
    return saved !== null ? saved === "true" : true;
  });
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Form states
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [inputDate, setInputDate] = useState<string>("");
  const [elderName, setElderName] = useState<string>("");
  const [savedElderNames, setSavedElderNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("toad_elder_names");
      return saved ? JSON.parse(saved) : ["王大明", "林阿公", "陳奶奶"];
    } catch {
      return ["王大明", "林阿公", "陳奶奶"];
    }
  });

  // Category selections
  const [attendance, setAttendance] = useState<string>("");
  const [otherAttendance, setOtherAttendance] = useState<string>("");
  const [attendanceName, setAttendanceName] = useState<string>("");

  const [transport, setTransport] = useState<string>("");
  const [otherTransport, setOtherTransport] = useState<string>("");
  const [transportName, setTransportName] = useState<string>("");

  const [reason, setReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [reasonName, setReasonName] = useState<string>("");

  const [food, setFood] = useState<string>("");
  const [otherFood, setOtherFood] = useState<string>("");
  const [foodName, setFoodName] = useState<string>("");

  const [customNote, setCustomNote] = useState<string>("");
  const [noteName, setNoteName] = useState<string>("");

  // Modals & notifications
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showIconModal, setShowIconModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  // History state
  const [historyList, setHistoryList] = useState<LeaveRecord[]>(() => {
    try {
      const saved = localStorage.getItem("toad_leave_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sound synthesis
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (type: "powerup" | "toadJump" | "win" | "pop" | "error" | "coin") => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === "powerup") {
        const freqs = [330, 392, 659, 523, 587, 784];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.12, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.08);
        });
      } else if (type === "toadJump") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "win") {
        const notes = [523.25, 659.25, 783.99, 1046.5, 880, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.14, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.09);
        });
      } else if (type === "pop") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "coin") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "error") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.setValueAtTime(95, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper date functions
  const getFormattedDate = (offsetDays = 0) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const d = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    return `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAYS[d.getDay()]}）`;
  };

  // Set today by default on mount
  useEffect(() => {
    setInputDate(getFormattedDate(0));
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("toad_sound_enabled", String(next));
    if (next) {
      playSound("coin");
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 1800);
  };

  const triggerAlert = (msg: string) => {
    playSound("error");
    setAlertError(msg);
    setTimeout(() => setAlertError(null), 2500);
  };

  // Add date
  const handleAddDate = () => {
    if (!inputDate) return;
    if (selectedDates.includes(inputDate)) {
      triggerAlert("這個日期已經加過了唷！🍄");
      return;
    }
    playSound("powerup");
    const updated = [...selectedDates, inputDate].sort();
    setSelectedDates(updated);
  };

  // Quick set date and auto-add
  const handleQuickAddDate = (offset: number) => {
    const dateStr = getFormattedDate(offset);
    setInputDate(dateStr);
    if (selectedDates.includes(dateStr)) {
      triggerAlert("這個日期已經在清單中囉！🍄");
      return;
    }
    playSound("coin");
    const updated = [...selectedDates, dateStr].sort();
    setSelectedDates(updated);
  };

  const handleRemoveDate = (date: string) => {
    playSound("pop");
    setSelectedDates(selectedDates.filter((d) => d !== date));
  };

  // Save/manage elder names
  const handleSaveElderName = () => {
    const trimmed = elderName.trim();
    if (!trimmed) return;
    if (!savedElderNames.includes(trimmed)) {
      const updated = [...savedElderNames, trimmed];
      setSavedElderNames(updated);
      localStorage.setItem("toad_elder_names", JSON.stringify(updated));
      playSound("coin");
      showToast(`已儲存長輩「${trimmed}」！🌟`);
    }
  };

  const handleRemoveSavedName = (e: React.MouseEvent, nameToRemove: string) => {
    e.stopPropagation();
    playSound("pop");
    const updated = savedElderNames.filter((n) => n !== nameToRemove);
    setSavedElderNames(updated);
    localStorage.setItem("toad_elder_names", JSON.stringify(updated));
  };

  // Compute final leave text
  const computeLeaveMessage = () => {
    const finalAttendance = attendance === "自填" ? otherAttendance.trim() : attendance;
    const finalTransport = transport === "自填" ? otherTransport.trim() : transport;
    const finalReason = reason === "自填" ? otherReason.trim() : reason;
    const finalFood = food === "自填" ? otherFood.trim() : food;

    const formattedDates =
      selectedDates.length > 0
        ? selectedDates.map((d) => formatDateDisplay(d)).join("、")
        : "尚未選擇日期";

    let message = `【長輩請假通知 🍄 ✨ 🌟】\n\n📅 日期：${formattedDates}`;

    if (elderName.trim()) {
      message += `\n👤 個案：${elderName.trim()}`;
    }

    if (finalAttendance) {
      message += `\n🏫 出席：${finalAttendance}`;
      if (attendanceName.trim()) message += `（${attendanceName.trim()}）`;
    }

    if (finalTransport) {
      message += `\n🚐 交通車：${finalTransport}`;
      if (transportName.trim()) message += `（${transportName.trim()}）`;
    }

    if (finalReason) {
      message += `\n📝 原因：${finalReason}`;
      if (reasonName.trim()) message += `（${reasonName.trim()}）`;
    }

    if (finalFood) {
      message += `\n🍱 伙食：${finalFood}`;
      if (foodName.trim()) message += `（${foodName.trim()}）`;
    }

    if (customNote.trim()) {
      message += `\n📌 備註：${customNote.trim()}`;
      if (noteName.trim()) message += `（${noteName.trim()}）`;
    }

    return message;
  };

  // Generate Action
  const handleGenerate = () => {
    if (selectedDates.length === 0) {
      triggerAlert("別忘了先選日期並點「加入 🪙」喔！");
      return;
    }
    if (attendance === "自填" && !otherAttendance.trim()) {
      triggerAlert("請寫下自訂的出席情形！🏫");
      return;
    }
    if (transport === "自填" && !otherTransport.trim()) {
      triggerAlert("請寫下自訂的交通需求！🚐");
      return;
    }
    if (reason === "自填" && !otherReason.trim()) {
      triggerAlert("請寫下自訂的請假原因！📝");
      return;
    }
    if (food === "自填" && !otherFood.trim()) {
      triggerAlert("請寫下自訂的伙食需求！🍱");
      return;
    }

    playSound("win");
    const currentMessage = computeLeaveMessage();

    // Save to history
    const newRecord: LeaveRecord = {
      id: Date.now().toString(),
      createdAt: new Date().toLocaleString("zh-TW", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      elderName: elderName.trim() || "未填寫長輩",
      previewText: currentMessage,
      dates: [...selectedDates],
    };

    const updatedHistory = [newRecord, ...historyList.slice(0, 19)];
    setHistoryList(updatedHistory);
    localStorage.setItem("toad_leave_history", JSON.stringify(updatedHistory));

    setShowResultModal(true);
  };

  // Copy to clipboard
  const handleCopy = (textToCopy?: string) => {
    const text = textToCopy || computeLeaveMessage();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    playSound("coin");
    showToast("成功複製到剪貼簿！👑");
  };

  // LINE direct share
  const handleLineShare = () => {
    playSound("coin");
    const text = computeLeaveMessage();
    const encoded = encodeURIComponent(text);
    // Line direct universal url
    window.location.href = `https://line.me/R/msg/text/?${encoded}`;
  };

  // Native share sheet
  const handleNativeShare = async () => {
    playSound("pop");
    const text = computeLeaveMessage();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "長輩請假通知",
          text: text,
        });
      } catch {
        handleCopy(text);
      }
    } else {
      handleCopy(text);
    }
  };

  // Reset all fields
  const handleReset = () => {
    playSound("pop");
    setSelectedDates([]);
    setInputDate(getFormattedDate(0));
    setElderName("");
    setAttendance("");
    setOtherAttendance("");
    setAttendanceName("");
    setTransport("");
    setOtherTransport("");
    setTransportName("");
    setReason("");
    setOtherReason("");
    setReasonName("");
    setFood("");
    setOtherFood("");
    setFoodName("");
    setCustomNote("");
    setNoteName("");
    showToast("表單已重新清空 🧹");
  };

  const previewMessage = computeLeaveMessage();

  return (
    <div className="min-h-screen py-4 px-3 sm:px-6 md:py-8 flex flex-col items-center">
      {/* Toast Alert */}
      {alertError && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 toad-red text-white px-6 py-4 rounded-2xl text-lg font-black z-50 shadow-2xl retro-border flex items-center gap-2 animate-bounce">
          <span>🍄</span> {alertError}
        </div>
      )}

      {/* Copy Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-black text-yellow-300 px-6 py-3 rounded-2xl text-lg font-black z-50 retro-border border-yellow-400 flex items-center gap-2">
          <span>🌟</span> {notification}
        </div>
      )}

      {/* Container */}
      <div className="w-full max-w-lg mx-auto relative pb-12">
        {/* Top Control Bar */}
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="toad-yellow text-black font-extrabold px-3 py-1.5 rounded-xl retro-border text-sm flex items-center gap-1.5">
              <span>🍄</span> TOAD KINGDOM
            </span>
            <span className="toad-blue text-white font-extrabold px-3 py-1.5 rounded-xl retro-border text-sm flex items-center gap-1">
              <span>🌟</span> WORLD 1-1
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mascot Icon button */}
            <button
              onClick={() => {
                playSound("coin");
                setShowIconModal(true);
              }}
              title="查看與下載花栗鼠桌面圖示"
              className="bg-white text-black px-2 py-1.5 rounded-xl retro-border font-black btn-touch flex items-center gap-1.5 hover:bg-yellow-50 text-xs sm:text-sm"
            >
              <img
                src="/chipmunk_mushroom_icon.jpg"
                alt="花栗鼠圖示"
                className="w-5 h-5 rounded-md object-cover border border-black"
              />
              <span className="hidden sm:inline">桌面Icon</span>
            </button>

            {/* History button */}
            <button
              onClick={() => {
                playSound("pop");
                setShowHistoryModal(true);
              }}
              title="查看過往請假紀錄"
              className="bg-white text-black p-2 rounded-xl retro-border font-black btn-touch flex items-center gap-1 hover:bg-yellow-50 text-xs sm:text-sm"
            >
              <History className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">歷史</span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "音效：開啟中 (點擊靜音)" : "音效：靜音中 (點擊開啟)"}
              className={`p-2 rounded-xl retro-border font-black btn-touch flex items-center gap-1 ${
                soundEnabled ? "toad-yellow text-black" : "bg-gray-200 text-gray-600"
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-black" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl retro-border overflow-hidden relative shadow-2xl">
          {/* Header */}
          <div className="toad-red mushroom-dots p-5 sm:p-6 text-white text-center relative border-b-4 border-black">
            <div className="absolute top-3 left-4 text-3xl animate-bounce">🍄</div>
            <div className="absolute top-3 right-4 text-3xl animate-bounce delay-150">✨</div>

            <div className="bg-black/55 backdrop-blur-sm p-4 rounded-2xl border-2 border-white inline-block w-full">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                {/* Chipmunk mascot icon */}
                <button
                  type="button"
                  onClick={() => {
                    playSound("toadJump");
                    setShowIconModal(true);
                  }}
                  className="relative group cursor-pointer focus:outline-none"
                  title="點擊放大 / 下載花栗鼠桌面圖示 🐿️"
                >
                  <img
                    src="/chipmunk_mushroom_icon.jpg"
                    alt="可愛卡通花栗鼠拿著蘑菇"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-3 border-black shadow-[3px_3px_0_#000] object-cover group-hover:scale-105 group-active:scale-95 transition-transform bg-white"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full border border-black shadow-xs flex items-center gap-0.5 animate-pulse">
                    <Download className="w-2.5 h-2.5" /> ICON
                  </span>
                </button>

                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-[2px_2px_0_#000] tracking-wide">
                      DHGD請假系統
                    </h1>
                    <span className="text-2xl animate-pulse">🍄</span>
                  </div>
                  <p className="mt-1 text-yellow-300 text-xs sm:text-sm font-extrabold drop-shadow-[1px_1px_0_#000]">
                    「Thank you Mario! 讓花栗鼠與蘑菇幫長輩請假吧！」
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 space-y-5 bg-[#FAF9F5]">
            {/* 1. Date Picker */}
            <div className="bg-[#FFF5F5] p-4 rounded-2xl toad-card-border">
              <label className="block text-xl font-black text-black mb-2 flex items-center gap-1.5">
                <Calendar className="w-6 h-6 text-red-600 inline" />
                第一步：選擇請假日期 🍄
              </label>

              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="flex-1 input-large border-3 border-black rounded-2xl focus:outline-none font-black text-black bg-white border-2"
                />
                <button
                  onClick={handleAddDate}
                  className="toad-yellow text-black px-5 rounded-2xl font-black text-lg btn-touch toad-card-border hover:bg-yellow-400 flex items-center gap-1"
                >
                  加入 🪙
                </button>
              </div>

              {/* Quick Date Pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => handleQuickAddDate(0)}
                  className="bg-white text-red-600 border-2 border-black font-extrabold px-3 py-1 rounded-xl text-sm btn-touch hover:bg-red-50 flex items-center gap-1"
                >
                  帶入今天 ☀️
                </button>
                <button
                  onClick={() => handleQuickAddDate(1)}
                  className="bg-white text-red-600 border-2 border-black font-extrabold px-3 py-1 rounded-xl text-sm btn-touch hover:bg-red-50 flex items-center gap-1"
                >
                  帶入明天 🌅
                </button>
                <button
                  onClick={() => handleQuickAddDate(2)}
                  className="bg-white text-red-600 border-2 border-black font-extrabold px-3 py-1 rounded-xl text-sm btn-touch hover:bg-red-50 flex items-center gap-1"
                >
                  帶入後天 🗓️
                </button>
              </div>

              {/* Date List Container */}
              <div className="min-h-[50px] bg-white p-2.5 rounded-xl border-2 border-dashed border-black flex flex-wrap items-center">
                {selectedDates.length === 0 ? (
                  <span className="text-gray-400 p-2 font-bold text-sm">
                    🍄 尚未加入請假日期喔！請點選上方「加入 🪙」
                  </span>
                ) : (
                  selectedDates.map((date) => (
                    <span key={date} className="mushroom-tag">
                      <span>{formatDateDisplay(date)}</span>
                      <button
                        onClick={() => handleRemoveDate(date)}
                        className="ml-2 text-red-600 font-black hover:text-red-800 text-lg leading-none"
                        title="刪除此日期"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 2. Elder Name */}
            <div className="bg-[#F0F7FF] p-4 rounded-2xl toad-card-border">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xl font-black text-black flex items-center gap-1.5">
                  <User className="w-6 h-6 text-blue-600 inline" />
                  第二步：長輩姓名
                  <span className="text-xs font-bold text-gray-500">（可不選）</span>
                </label>
                {elderName.trim() && (
                  <button
                    onClick={handleSaveElderName}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-900 border border-black font-black px-2 py-0.5 rounded-lg flex items-center gap-0.5 btn-touch"
                  >
                    <Plus className="w-3 h-3" /> 常用保存
                  </button>
                )}
              </div>

              <input
                type="text"
                value={elderName}
                placeholder="請輸入名字（例如：王大明）"
                onChange={(e) => {
                  playSound("pop");
                  setElderName(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-black text-black bg-white"
              />

              {/* Frequent Names Quick Selector */}
              {savedElderNames.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-gray-500">常用長輩：</span>
                  {savedElderNames.map((name) => (
                    <span
                      key={name}
                      onClick={() => {
                        playSound("pop");
                        setElderName(name);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black cursor-pointer border border-black btn-touch ${
                        elderName === name
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-800 hover:bg-blue-50"
                      }`}
                    >
                      {name}
                      <button
                        onClick={(e) => handleRemoveSavedName(e, name)}
                        className="text-gray-400 hover:text-red-500 font-black ml-0.5"
                        title="移除常用"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Attendance */}
            <div className="bg-[#FFFDF0] p-4 rounded-2xl toad-card-border">
              <label className="block text-xl font-black text-black mb-2 flex items-center gap-1.5">
                <Clock className="w-6 h-6 text-amber-600 inline" />
                🏫 出席情形 <span className="text-xs font-bold text-gray-500">（可不選）</span>：
              </label>
              <select
                value={attendance}
                onChange={(e) => {
                  playSound("toadJump");
                  setAttendance(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none bg-white font-black text-black mb-2"
              >
                <option value="">-- 不變更 / 不選擇 🍄 --</option>
                <option value="上午上課 ☀️">上午上課 ☀️</option>
                <option value="下午上課 🌅">下午上課 🌅</option>
                <option value="整天請假 💤">整天請假 💤</option>
                <option value="自填">✏️ 想要自己寫內容...</option>
              </select>

              {attendance === "自填" && (
                <div className="mb-2">
                  <input
                    type="text"
                    value={otherAttendance}
                    placeholder="手寫出席狀況（例如：僅參加早操）..."
                    onChange={(e) => {
                      playSound("pop");
                      setOtherAttendance(e.target.value);
                    }}
                    className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-black text-black bg-white"
                  />
                </div>
              )}

              <input
                type="text"
                value={attendanceName}
                placeholder="👤 自填此項目姓名（選填）"
                onChange={(e) => {
                  playSound("pop");
                  setAttendanceName(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-bold text-black bg-white text-base"
              />
            </div>

            {/* 4. Transport */}
            <div className="bg-[#F2FDF4] p-4 rounded-2xl toad-card-border">
              <label className="block text-xl font-black text-black mb-2 flex items-center gap-1.5">
                <Bus className="w-6 h-6 text-green-700 inline" />
                🚐 交通車 <span className="text-xs font-bold text-gray-500">（可不選）</span>：
              </label>
              <select
                value={transport}
                onChange={(e) => {
                  playSound("toadJump");
                  setTransport(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none bg-white font-black text-black mb-2"
              >
                <option value="">-- 不變更 / 不選擇 🍄 --</option>
                <option value="早上不用載 ☀️">早上不用載 ☀️</option>
                <option value="下午不用載 🌅">下午不用載 🌅</option>
                <option value="整天不用載 🚫">整天不用載 🚫</option>
                <option value="自填">✏️ 想要自己寫內容...</option>
              </select>

              {transport === "自填" && (
                <div className="mb-2">
                  <input
                    type="text"
                    value={otherTransport}
                    placeholder="手寫交通車狀況（例如：家屬親自接送）..."
                    onChange={(e) => {
                      playSound("pop");
                      setOtherTransport(e.target.value);
                    }}
                    className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-black text-black bg-white"
                  />
                </div>
              )}

              <input
                type="text"
                value={transportName}
                placeholder="👤 自填此項目姓名（選填）"
                onChange={(e) => {
                  playSound("pop");
                  setTransportName(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-bold text-black bg-white text-base"
              />
            </div>

            {/* 5. Leave Reason */}
            <div className="bg-[#FFF0F5] p-4 rounded-2xl toad-card-border">
              <label className="block text-xl font-black text-black mb-2 flex items-center gap-1.5">
                <FileText className="w-6 h-6 text-pink-600 inline" />
                📝 請假原因 <span className="text-xs font-bold text-gray-500">（可不選）</span>：
              </label>
              <select
                value={reason}
                onChange={(e) => {
                  playSound("toadJump");
                  setReason(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none bg-white font-black text-black mb-2"
              >
                <option value="">-- 不變更 / 不選擇 🍄 --</option>
                <option value="請假 ✋">請假 ✋</option>
                <option value="體檢 🏥">體檢 🏥</option>
                <option value="回診看診 🩺">回診看診 🩺</option>
                <option value="無人接送 🚗">無人接送 🚗</option>
                <option value="想休息 🏠">想休息 🏠</option>
                <option value="下雨☔休息 ☔">下雨☔休息 ☔</option>
                <option value="太冷休息 ❄️">太冷休息 ❄️</option>
                <option value="家庭出遊 ✈️">家庭出遊 ✈️</option>
                <option value="施打疫苗 💉">施打疫苗 💉</option>
                <option value="自填">✏️ 想要自己寫內容...</option>
              </select>

              {reason === "自填" && (
                <div className="mb-2">
                  <input
                    type="text"
                    value={otherReason}
                    placeholder="手寫原因（例如：感冒在家休養）..."
                    onChange={(e) => {
                      playSound("pop");
                      setOtherReason(e.target.value);
                    }}
                    className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-black text-black bg-white"
                  />
                </div>
              )}

              <input
                type="text"
                value={reasonName}
                placeholder="👤 自填此項目姓名（選填）"
                onChange={(e) => {
                  playSound("pop");
                  setReasonName(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-bold text-black bg-white text-base"
              />
            </div>

            {/* 6. Food */}
            <div className="bg-[#FFFDF0] p-4 rounded-2xl toad-card-border">
              <label className="block text-xl font-black text-black mb-2 flex items-center gap-1.5">
                <Utensils className="w-6 h-6 text-orange-600 inline" />
                🍱 伙食選項 <span className="text-xs font-bold text-gray-500">（可不選）</span>：
              </label>
              <select
                value={food}
                onChange={(e) => {
                  playSound("toadJump");
                  setFood(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none bg-white font-black text-black mb-2"
              >
                <option value="">-- 不變更 / 不選擇 🍄 --</option>
                <option value="初一 十五吃素 🥗">初一 十五吃素 🥗</option>
                <option value="吃午餐 🍚">吃午餐 🍚</option>
                <option value="不吃午餐 ❌">不吃午餐 ❌</option>
                <option value="試行吃飯 🥢">試行吃飯 🥢</option>
                <option value="自帶午餐 🍱">自帶午餐 🍱</option>
                <option value="自填">✏️ 想要自己寫內容...</option>
              </select>

              {food === "自填" && (
                <div className="mb-2">
                  <input
                    type="text"
                    value={otherFood}
                    placeholder="手寫伙食需求（例如：素食便當、清淡）..."
                    onChange={(e) => {
                      playSound("pop");
                      setOtherFood(e.target.value);
                    }}
                    className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-black text-black bg-white"
                  />
                </div>
              )}

              <input
                type="text"
                value={foodName}
                placeholder="👤 自填此項目姓名（選填）"
                onChange={(e) => {
                  playSound("pop");
                  setFoodName(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-bold text-black bg-white text-base"
              />
            </div>

            {/* 7. Note */}
            <div className="bg-[#F8F0FF] p-4 rounded-2xl toad-card-border">
              <label className="block text-xl font-black text-black mb-2 flex items-center gap-1.5">
                <Sparkles className="w-6 h-6 text-purple-600 inline" />
                📌 備註說明 <span className="text-xs font-bold text-gray-500">（有需要再寫）</span>：
              </label>
              <input
                type="text"
                value={customNote}
                placeholder="例如：會晚一點點到、需交代午休吃藥 🌟"
                onChange={(e) => {
                  playSound("pop");
                  setCustomNote(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-black text-black mb-2 bg-white"
              />
              <input
                type="text"
                value={noteName}
                placeholder="👤 自填此項目姓名（選填）"
                onChange={(e) => {
                  playSound("pop");
                  setNoteName(e.target.value);
                }}
                className="w-full input-large border-2 border-black rounded-2xl focus:outline-none font-bold text-black bg-white text-base"
              />
            </div>

            {/* Live Preview Card */}
            <div className="mt-8 p-5 rounded-2xl toad-cream toad-card-border relative shadow-md">
              <div className="absolute -top-4 -right-2 text-3xl animate-bounce">🌟</div>
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <h3 className="text-xl font-black text-black flex items-center gap-1.5">
                  🔍 DHGD請假單預覽（即時產生）
                </h3>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-600 hover:text-black font-extrabold flex items-center gap-1 bg-white border border-black px-2 py-1 rounded-lg btn-touch"
                  title="清空表單全部欄位"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 清空
                </button>
              </div>

              <div className="text-lg text-black font-extrabold whitespace-pre-wrap break-words min-h-[60px] leading-relaxed bg-white/70 p-3 rounded-xl border border-black/30">
                {selectedDates.length === 0 ? "請先加入日期以開始預覽..." : previewMessage}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerate}
              className="w-full toad-red text-white text-2xl font-black py-5 rounded-2xl btn-touch retro-border flex items-center justify-center gap-2 hover:bg-red-600 shadow-lg cursor-pointer"
            >
              <span>🍄✨</span> 產生請假訊息 (GO!)
            </button>
          </div>

          {/* Bottom Bar */}
          <div className="toad-blue p-4 text-center text-white font-black border-t-4 border-black flex items-center justify-center gap-2 text-sm sm:text-base">
            🍄 TOAD & MUSHROOM KINGDOM LEAVE SYSTEM 🌟 ✨
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative retro-border shadow-2xl">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-5xl">👑</div>

            <h2 className="text-2xl font-black mt-2 mb-4 text-center text-black border-b-2 border-black pb-2 flex items-center justify-center gap-1.5">
              <span>🍄</span> DHGD請假單完成了！
            </h2>

            <div className="toad-cream p-4 rounded-2xl text-lg leading-relaxed whitespace-pre-wrap border-2 border-black mb-5 font-black text-black max-h-64 overflow-y-auto shadow-inner">
              {computeLeaveMessage()}
            </div>

            <div className="space-y-3">
              {/* LINE Button */}
              <button
                onClick={handleLineShare}
                className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white text-xl font-black py-4 rounded-2xl btn-touch retro-border flex items-center justify-center gap-2"
              >
                <span>📲</span> 分享到 LINE 聊天室 🚩
              </button>

              {/* Native share sheet */}
              <button
                onClick={handleNativeShare}
                className="w-full toad-yellow text-black text-lg font-black py-3.5 rounded-2xl btn-touch retro-border flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" /> 其他 APP 分享 / 發送 🌟
              </button>

              {/* Copy */}
              <button
                onClick={() => handleCopy()}
                className="w-full bg-white hover:bg-gray-50 text-black text-lg font-black py-3.5 rounded-2xl btn-touch retro-border flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" /> 複製文字全部內容 🪙
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  playSound("toadJump");
                  setShowResultModal(false);
                }}
                className="w-full toad-red text-white text-lg font-black py-3.5 rounded-2xl btn-touch retro-border"
              >
                ❌ 返回繼續修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 relative retro-border shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-black text-black">過往請假歷史紀錄</h2>
              </div>
              <button
                onClick={() => {
                  playSound("pop");
                  setShowHistoryModal(false);
                }}
                className="w-8 h-8 rounded-full border-2 border-black font-black flex items-center justify-center hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {historyList.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-bold">
                  🍄 目前還沒有請假紀錄喔！產生請假單後會自動留存於此。
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border-2 border-black bg-[#FFFDF0] shadow-sm relative group"
                  >
                    <div className="flex items-center justify-between text-xs font-black text-gray-600 mb-1.5">
                      <span className="bg-yellow-300 text-black px-2 py-0.5 rounded-md border border-black">
                        {item.elderName}
                      </span>
                      <span>{item.createdAt}</span>
                    </div>

                    <p className="text-sm font-extrabold text-black whitespace-pre-wrap line-clamp-3 bg-white/80 p-2 rounded-xl border border-black/20 mb-2">
                      {item.previewText}
                    </p>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleCopy(item.previewText)}
                        className="text-xs bg-yellow-400 hover:bg-yellow-500 text-black font-black px-3 py-1.5 rounded-xl border border-black btn-touch flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" /> 複製
                      </button>
                      <button
                        onClick={() => {
                          const updated = historyList.filter((h) => h.id !== item.id);
                          setHistoryList(updated);
                          localStorage.setItem("toad_leave_history", JSON.stringify(updated));
                          playSound("pop");
                        }}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-black px-2.5 py-1.5 rounded-xl border border-black btn-touch flex items-center gap-1"
                        title="刪除這筆紀錄"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {historyList.length > 0 && (
              <div className="pt-3 border-t-2 border-black mt-3 flex justify-between items-center">
                <button
                  onClick={() => {
                    if (window.confirm("確定要清空所有過往請假紀錄嗎？")) {
                      setHistoryList([]);
                      localStorage.removeItem("toad_leave_history");
                      playSound("pop");
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-extrabold"
                >
                  清空歷史紀錄
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-1.5 bg-black text-white rounded-xl text-sm font-black btn-touch"
                >
                  關閉
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Icon Showcase & Download Modal */}
      {showIconModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative retro-border shadow-2xl text-center">
            <button
              onClick={() => {
                playSound("pop");
                setShowIconModal(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-black font-black flex items-center justify-center hover:bg-gray-100"
            >
              ✕
            </button>

            <div className="inline-block p-1 bg-yellow-300 rounded-2xl border-2 border-black mb-3">
              <span className="text-xs font-black px-2 py-0.5 text-black">🐿️ 桌面專用圖示</span>
            </div>

            <h3 className="text-2xl font-black text-black mb-1">
              可愛花栗鼠蘑菇 ICON
            </h3>
            <p className="text-xs font-extrabold text-gray-500 mb-4">
              專為桌面捷徑與手機主畫面設計的高畫質圖示
            </p>

            {/* Icon Preview */}
            <div className="flex justify-center mb-5">
              <div className="relative p-2 bg-gradient-to-b from-amber-100 to-amber-200 rounded-3xl border-3 border-black shadow-[5px_5px_0_#000]">
                <img
                  src="/chipmunk_mushroom_icon.jpg"
                  alt="可愛卡通花栗鼠拿著蘑菇圖示"
                  className="w-48 h-48 rounded-2xl object-cover border-2 border-black/40"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <a
                href="/chipmunk_mushroom_icon.jpg"
                download="chipmunk_mushroom_icon.jpg"
                onClick={() => playSound("coin")}
                className="w-full bg-[#FBD100] hover:bg-yellow-400 text-black text-lg font-black py-3 rounded-2xl btn-touch retro-border flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> 下載高畫質圖示 (1024x1024)
              </a>

              <button
                onClick={() => {
                  playSound("pop");
                  setShowIconModal(false);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-black text-sm font-black py-2.5 rounded-xl border-2 border-black btn-touch"
              >
                關閉視窗
              </button>
            </div>

            {/* Hint */}
            <div className="mt-4 text-[11px] font-bold text-gray-500 bg-[#FFFDF0] p-2.5 rounded-xl border border-black/20 text-left space-y-1">
              <p className="font-black text-gray-700">💡 如何設為桌面／手機圖示？</p>
              <p>• <b>手機</b>：點瀏覽器「分享」或「選單」➔「加入主畫面」，即會自動採用此圖示！</p>
              <p>• <b>電腦桌面</b>：下載圖片後，在網頁捷徑「內容」➔「變更圖示」選取此圖片即可。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
