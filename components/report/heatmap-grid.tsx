export function HeatmapGrid() {
  const frames = [
    { time: "0:03", anomaly: true },
    { time: "0:07", anomaly: false },
    { time: "0:12", anomaly: true },
    { time: "0:15", anomaly: true },
    { time: "0:21", anomaly: false },
    { time: "0:26", anomaly: true },
    { time: "0:30", anomaly: false },
    { time: "0:34", anomaly: true },
  ]

  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <h3 className="text-lg font-semibold mb-4">Heatmap Snapshots</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {frames.map((frame, i) => (
          <div
            key={i}
            className={`relative aspect-video rounded-xl overflow-hidden border ${
              frame.anomaly ? "border-destructive glow-purple" : "border-border/50"
            }`}
          >
            <img
              src={`/face-heatmap-thermal-analysis-frame-.jpg?height=120&width=200&query=face heatmap thermal analysis frame ${i + 1}`}
              alt={`Frame at ${frame.time}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white">{frame.time}</span>
                {frame.anomaly && <span className="text-xs text-destructive font-medium">Anomaly</span>}
              </div>
            </div>
            {frame.anomaly && <div className="absolute inset-0 shimmer pointer-events-none opacity-30" />}
          </div>
        ))}
      </div>
    </div>
  )
}
