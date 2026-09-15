export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/40 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-sky-100 shadow-xl shadow-sky-500/5">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-sky-100 border-t-sky-500 border-r-blue-500 rounded-full animate-spin" />
          <div className="absolute w-6 h-6 rounded-full bg-sky-400/20 animate-ping" />
        </div>
        <p className="text-slate-700 font-semibold text-sm animate-pulse">กำลังโหลด...</p>
      </div>
    </div>
  );
}
