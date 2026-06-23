'use client'

import { useState } from 'react'

export function CharitySlider({ initialPercentage }: { initialPercentage: number }) {
  const [percentage, setPercentage] = useState(initialPercentage)

  return (
    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/10">
      <input
        type="range"
        name="percentage"
        min="10"
        max="100"
        value={percentage}
        onChange={(e) => setPercentage(parseInt(e.target.value))}
        className="flex-1 accent-accent h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-2xl font-bold tabular-nums text-white w-16 text-right">
        {percentage}%
      </span>
    </div>
  )
}
