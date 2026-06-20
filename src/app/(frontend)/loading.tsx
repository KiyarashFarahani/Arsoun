export default function FrontendLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        <p className="text-white/30 font-body text-sm">Loading...</p>
      </div>
    </div>
  );
}
