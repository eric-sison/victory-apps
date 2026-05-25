import { Button } from "@workspace/ui/components/Button";
import { Slider } from "@workspace/ui/components/Slider";
import { Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import type { FunctionComponent } from "react";

export const MusicPlayer: FunctionComponent = () => {
  return (
    <div className="absolute bottom-0 border-t w-full z-20 bg-card">
      <Slider roundedSides={false} variant="foreground" />
      <div className="flex items-center justify-between p-4">
        <section>
          <div className="flex items-center gap-2">
            <img
              src="https://i.scdn.co/image/ab67616d0000b273656001849b39dfee31b8d855"
              alt="album"
              loading="lazy"
              decoding="async"
              className="size-10 object-cover rounded-md"
              width={200}
              height={200}
            />

            <div>
              <h3 className="font-medium text-sm">Meant to Live</h3>
              <p className="text-xs text-muted-foreground">Switchfoot</p>
            </div>
          </div>
        </section>

        <section className="flex items-center gap-5">
          <Button variant="ghost" size="icon-lg">
            <Repeat className="size-5" />
          </Button>

          <Button variant="ghost" size="icon-lg">
            <SkipBack className="size-5" />
          </Button>

          <Button variant="ghost" size="icon-lg">
            <Play className="size-5" />
          </Button>

          <Button variant="ghost" size="icon-lg">
            <SkipForward className="size-5" />
          </Button>

          <Button variant="ghost" size="icon-lg">
            <Shuffle className="size-5" />
          </Button>
        </section>

        <section>1</section>
      </div>
    </div>
  );
};
