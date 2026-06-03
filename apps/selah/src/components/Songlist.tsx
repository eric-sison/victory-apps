import { Heart, MoreHorizontal, Pause, Play } from "@workspace/ui";
import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";

export type Song = {
  id: string;
  title: string;
  artist: string;
  playlist: string;
  duration: string;
  color?: string;
  iconColor?: string;
};

type SongRowProps = {
  song: Song;
  index: number;
  isPlaying: boolean;
  onPlay: (id: string) => void;
};

function SongRow({ song, index, isPlaying, onPlay }: SongRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: This is just a mock
    // biome-ignore lint/a11y/useKeyWithClickEvents: This is just a mock
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors",
        hovered && "bg-secondary",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(song.id)}
    >
      <span className="w-5 flex items-center justify-center shrink-0">
        {hovered ? (
          isPlaying ? (
            <Pause className="size-4 text-muted-foreground" />
          ) : (
            <Play className="size-4 text-muted-foreground" />
          )
        ) : isPlaying ? (
          <span className="text-sm text-primary">♫</span>
        ) : (
          <span className="text-sm text-muted-foreground">{index}</span>
        )}
      </span>

      <div
        className="size-11 rounded-md flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: song.color ?? "#1a1a2e" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={song.iconColor ?? "#6c63ff"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isPlaying ? "text-primary" : "text-foreground",
          )}
        >
          {song.title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {song.artist} · {song.playlist}
        </p>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 transition-opacity",
          hovered ? "opacity-100" : "opacity-0",
        )}
      >
        <button
          type="button"
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Like"
          onClick={(e) => e.stopPropagation()}
        >
          <Heart className="size-4" />
        </button>
        <button
          type="button"
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="More options"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <span className="text-xs text-muted-foreground min-w-9 text-right shrink-0">
        {song.duration}
      </span>
    </div>
  );
}

type SongSection = {
  label: string;
  songs: Song[];
};

type SongListProps = {
  title?: string;
  sections: SongSection[];
  currentSongId?: string;
  onSongPlay?: (id: string) => void;
};

export const SONG_SECTIONS: SongSection[] = [
  {
    label: "Recently added",
    songs: [
      {
        id: "1",
        title: "Electronic Dreams",
        artist: "SoundHelix",
        playlist: "Today's Top Hits",
        duration: "6:12",
        color: "#1a1a2e",
        iconColor: "#6c63ff",
      },
      {
        id: "2",
        title: "Night Drive",
        artist: "SoundHelix",
        playlist: "Chill Hits",
        duration: "4:49",
        color: "#1c2b1c",
        iconColor: "#4caf7d",
      },
      {
        id: "3",
        title: "Summer Vibes",
        artist: "SoundHelix",
        playlist: "Pop Hits",
        duration: "6:55",
        color: "#2b1f10",
        iconColor: "#f4a261",
      },
    ],
  },
  {
    label: "All songs",
    songs: [
      {
        id: "4",
        title: "Midnight Blues",
        artist: "SoundHelix",
        playlist: "Sad Feeling",
        duration: "5:33",
        color: "#1e1e2e",
        iconColor: "#9c7fe0",
      },
      {
        id: "5",
        title: "Power Up",
        artist: "SoundHelix",
        playlist: "Workout",
        duration: "4:58",
        color: "#2b1010",
        iconColor: "#e05c5c",
      },
      {
        id: "6",
        title: "Chill Out",
        artist: "SoundHelix",
        playlist: "Chill Hits",
        duration: "5:52",
        color: "#102020",
        iconColor: "#4dd0e1",
      },
      {
        id: "7",
        title: "Urban Beats",
        artist: "SoundHelix",
        playlist: "Today's Top Hits",
        duration: "6:28",
        color: "#201020",
        iconColor: "#e879f9",
      },
      {
        id: "8",
        title: "Acoustic Sessions",
        artist: "SoundHelix",
        playlist: "My Playlists",
        duration: "6:41",
        color: "#1a1810",
        iconColor: "#d4a843",
      },
      {
        id: "9",
        title: "Dance Floor",
        artist: "SoundHelix",
        playlist: "Pop Hits",
        duration: "4:25",
        color: "#102210",
        iconColor: "#86efac",
      },
      {
        id: "10",
        title: "Sunset Groove",
        artist: "SoundHelix",
        playlist: "Chill Hits",
        duration: "5:20",
        color: "#2b1a10",
        iconColor: "#fb923c",
      },
      {
        id: "11",
        title: "Deep Focus",
        artist: "SoundHelix",
        playlist: "My Playlists",
        duration: "7:25",
        color: "#10101a",
        iconColor: "#818cf8",
      },
      {
        id: "12",
        title: "Morning Light",
        artist: "SoundHelix",
        playlist: "Pop Hits",
        duration: "3:58",
        color: "#1a1510",
        iconColor: "#fcd34d",
      },
      {
        id: "13",
        title: "Rainy Day",
        artist: "SoundHelix",
        playlist: "Sad Feeling",
        duration: "5:10",
        color: "#101520",
        iconColor: "#7dd3fc",
      },
      {
        id: "14",
        title: "Fire Walk",
        artist: "SoundHelix",
        playlist: "Workout",
        duration: "4:44",
        color: "#2a1010",
        iconColor: "#f87171",
      },
      {
        id: "15",
        title: "Forest Echo",
        artist: "SoundHelix",
        playlist: "Chill Hits",
        duration: "6:03",
        color: "#0f1f10",
        iconColor: "#6ee7b7",
      },
    ],
  },
];

export function SongList({
  title = "All Tracks",
  sections,
  currentSongId,
  onSongPlay,
}: SongListProps) {
  const [activeSongId, setActiveSongId] = useState<string | undefined>(
    currentSongId,
  );

  const handlePlay = (id: string) => {
    setActiveSongId(id);
    onSongPlay?.(id);
  };

  let globalIndex = 1;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-3 mb-3">
        <h2 className="text-xl font-medium">{title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-md px-3 py-1.5 hover:bg-secondary transition-colors"
          >
            Filter
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-md px-3 py-1.5 hover:bg-secondary transition-colors"
          >
            Sort
          </button>
        </div>
      </div>

      {sections.map((section, sectionIndex) => (
        <div key={section.label}>
          {sectionIndex > 0 && <div className="h-px bg-border mx-3 my-2" />}
          <p className="text-xs font-medium text-muted-foreground px-3 py-1.5 uppercase tracking-wide">
            {section.label}
          </p>
          {section.songs.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              index={globalIndex++}
              isPlaying={activeSongId === song.id}
              onPlay={handlePlay}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
