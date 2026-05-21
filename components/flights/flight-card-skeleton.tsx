export default function FlightCardSkeleton() {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-32 bg-white/5 rounded" />
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="h-6 w-20 bg-white/5 rounded" />
          <div className="h-3 w-16 bg-white/5 rounded" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
        <div className="h-3 w-20 bg-white/5 rounded" />
        <div className="h-3 w-20 bg-white/5 rounded" />
        <div className="h-3 w-24 bg-white/5 rounded" />
      </div>
    </div>
  )
}
