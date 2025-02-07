"use client"

import React, { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ImageResizeProps {
  onResize: (width: number, align: string) => void
}

export function ImageResize({ onResize }: ImageResizeProps) {
  const [width, setWidth] = useState(100)
  const [align, setAlign] = useState("center")

  const handleWidthChange = (value: number[]) => {
    setWidth(value[0])
    onResize(value[0], align)
  }

  const handleAlignChange = (value: string) => {
    setAlign(value)
    onResize(width, value)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neon-green-400">Width (%)</label>
        <Slider defaultValue={[100]} max={100} min={20} step={5} onValueChange={handleWidthChange} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neon-green-400">Alignment</label>
        <Select onValueChange={handleAlignChange} defaultValue={align}>
          <SelectTrigger className="border-neon-green-400">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

