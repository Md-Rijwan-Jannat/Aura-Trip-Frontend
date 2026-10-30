"use client";

import { MusicMood, MOOD_LABELS } from "@/src/types/music";

interface MoodGridProps {
  onMoodSelect: (mood: MusicMood) => void;
  selectedMood: MusicMood | null;
}

const moodIcons: Record<MusicMood, string> = {
  [MusicMood.HAPPY]: "😊",
  [MusicMood.SAD]: "😢",
  [MusicMood.ENERGETIC]: "⚡",
  [MusicMood.CALM]: "🧘",
  [MusicMood.ROMANTIC]: "💕",
  [MusicMood.EPIC]: "🔥",
  [MusicMood.DARK]: "🌑",
  [MusicMood.UPLIFTING]: "🌟",
  [MusicMood.CHILL]: "😎",
  [MusicMood.DRAMATIC]: "🎭",
};

const moodColors: Record<MusicMood, string> = {
  [MusicMood.HAPPY]: "from-yellow-400 to-yellow-600",
  [MusicMood.SAD]: "from-blue-400 to-blue-600",
  [MusicMood.ENERGETIC]: "from-red-400 to-red-600",
  [MusicMood.CALM]: "from-green-400 to-green-600",
  [MusicMood.ROMANTIC]: "from-pink-400 to-pink-600",
  [MusicMood.EPIC]: "from-orange-400 to-orange-600",
  [MusicMood.DARK]: "from-gray-700 to-gray-900",
  [MusicMood.UPLIFTING]: "from-purple-400 to-purple-600",
  [MusicMood.CHILL]: "from-cyan-400 to-cyan-600",
  [MusicMood.DRAMATIC]: "from-indigo-400 to-indigo-600",
};

const MoodGrid = ({ onMoodSelect, selectedMood }: MoodGridProps) => {
  const moods = Object.values(MusicMood);

  return (
    <div>
      <h3 className='text-base font-semibold mb-4'>Browse by Mood</h3>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {moods.map((mood) => (
          <button
            key={mood}
            onClick={() => onMoodSelect(mood)}
            className={`
              relative overflow-hidden rounded-xl p-6
              bg-gradient-to-br ${moodColors[mood]}
              text-white font-semibold
              hover:scale-105 hover:shadow-lg
              transition-all duration-200
              ${selectedMood === mood ? "ring-4 ring-sage-600 scale-105" : ""}
            `}
          >
            <div className='relative z-10'>
              <div className='text-3xl mb-2'>{moodIcons[mood]}</div>
              <div className='text-sm'>{MOOD_LABELS[mood]}</div>
            </div>
            <div className='absolute inset-0 bg-black/10'></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodGrid;
