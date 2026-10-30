"use client";

import { MusicGenre, GENRE_LABELS } from "@/src/types/music";
import { Music2 } from "lucide-react";

interface GenreGridProps {
  onGenreSelect: (genre: MusicGenre) => void;
  selectedGenre: MusicGenre | null;
}

const genreIcons: Record<MusicGenre, string> = {
  [MusicGenre.POP]: "🎤",
  [MusicGenre.ROCK]: "🎸",
  [MusicGenre.ELECTRONIC]: "🎧",
  [MusicGenre.JAZZ]: "🎷",
  [MusicGenre.CLASSICAL]: "🎻",
  [MusicGenre.HIP_HOP]: "🎤",
  [MusicGenre.AMBIENT]: "🌌",
  [MusicGenre.FOLK]: "🪕",
  [MusicGenre.INDIE]: "🎵",
  [MusicGenre.WORLD]: "🌍",
  [MusicGenre.ACOUSTIC]: "🎸",
  [MusicGenre.INSTRUMENTAL]: "🎹",
};

const genreColors: Record<MusicGenre, string> = {
  [MusicGenre.POP]: "from-pink-400 to-pink-600",
  [MusicGenre.ROCK]: "from-red-400 to-red-600",
  [MusicGenre.ELECTRONIC]: "from-purple-400 to-purple-600",
  [MusicGenre.JAZZ]: "from-blue-400 to-blue-600",
  [MusicGenre.CLASSICAL]: "from-indigo-400 to-indigo-600",
  [MusicGenre.HIP_HOP]: "from-yellow-400 to-yellow-600",
  [MusicGenre.AMBIENT]: "from-cyan-400 to-cyan-600",
  [MusicGenre.FOLK]: "from-green-400 to-green-600",
  [MusicGenre.INDIE]: "from-teal-400 to-teal-600",
  [MusicGenre.WORLD]: "from-orange-400 to-orange-600",
  [MusicGenre.ACOUSTIC]: "from-amber-400 to-amber-600",
  [MusicGenre.INSTRUMENTAL]: "from-slate-400 to-slate-600",
};

const GenreGrid = ({ onGenreSelect, selectedGenre }: GenreGridProps) => {
  const genres = Object.values(MusicGenre);

  return (
    <div>
      <h3 className='text-base font-semibold mb-4'>Browse by Genre</h3>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreSelect(genre)}
            className={`
              relative overflow-hidden rounded-xl p-6
              bg-gradient-to-br ${genreColors[genre]}
              text-white font-semibold
              hover:scale-105 hover:shadow-lg
              transition-all duration-200
              ${selectedGenre === genre ? "ring-4 ring-sage-600 scale-105" : ""}
            `}
          >
            <div className='relative z-10'>
              <div className='text-3xl mb-2'>{genreIcons[genre]}</div>
              <div className='text-sm'>{GENRE_LABELS[genre]}</div>
            </div>
            <div className='absolute inset-0 bg-black/10'></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreGrid;
