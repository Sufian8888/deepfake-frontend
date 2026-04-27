"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"

const data = [
  { time: "0:00", audio: 0.2, lip: 0.25 },
  { time: "0:03", audio: 0.8, lip: 0.7 },
  { time: "0:06", audio: 0.5, lip: 0.55 },
  { time: "0:09", audio: 0.9, lip: 0.4 },
  { time: "0:12", audio: 0.3, lip: 0.8 },
  { time: "0:15", audio: 0.7, lip: 0.3 },
  { time: "0:18", audio: 0.6, lip: 0.65 },
  { time: "0:21", audio: 0.4, lip: 0.45 },
  { time: "0:24", audio: 0.85, lip: 0.8 },
  { time: "0:27", audio: 0.55, lip: 0.5 },
  { time: "0:30", audio: 0.75, lip: 0.2 },
  { time: "0:33", audio: 0.35, lip: 0.4 },
]

export function AudioSyncChart() {
  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <h3 className="text-lg font-semibold mb-4">Audio vs Lip Movement Alignment</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <ReferenceLine x="0:09" stroke="var(--destructive)" strokeDasharray="3 3" />
            <ReferenceLine x="0:12" stroke="var(--destructive)" strokeDasharray="3 3" />
            <ReferenceLine x="0:15" stroke="var(--destructive)" strokeDasharray="3 3" />
            <ReferenceLine x="0:30" stroke="var(--destructive)" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="audio"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              name="Audio Signal"
            />
            <Line
              type="monotone"
              dataKey="lip"
              stroke="var(--secondary)"
              strokeWidth={2}
              dot={false}
              name="Lip Movement"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Audio Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-sm text-muted-foreground">Lip Movement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-destructive" />
          <span className="text-sm text-muted-foreground">Mismatch Detected</span>
        </div>
      </div>
    </div>
  )
}
