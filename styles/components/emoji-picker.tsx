"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Common emoji sets
const EMOJI_SETS = {
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
  gestures: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤙", "👈", "👉", "👆", "👇", "❤️", "🔥", "👏", "🙏"],
  objects: ["🎮", "🎯", "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥅", "🏒", "🏑"],
  symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝"],
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState("smileys")

  return (
    <Tabs defaultValue="smileys" onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="smileys">😀</TabsTrigger>
        <TabsTrigger value="gestures">👍</TabsTrigger>
        <TabsTrigger value="objects">⚽</TabsTrigger>
        <TabsTrigger value="symbols">❤️</TabsTrigger>
      </TabsList>
      {Object.entries(EMOJI_SETS).map(([category, emojis]) => (
        <TabsContent key={category} value={category} className="p-2">
          <div className="grid grid-cols-7 gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                className="p-2 hover:bg-accent rounded-md text-lg"
                onClick={() => onEmojiSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
