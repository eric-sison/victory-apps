import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Page } from "@workspace/ui/components/Page";
import { Plus } from "lucide-react";
import { MusicPlayer } from "#/components/MusicPlayer";
import { SONG_SECTIONS, SongList } from "#/components/Songlist";

export const Route = createFileRoute("/(protected)/song-bank/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <Page.Header>
        <Page.Title>Song Bank</Page.Title>
        <Page.Description>
          Your central library of songs for workship.
        </Page.Description>

        <Page.Action>
          <Button>
            <Plus />
            <span>New Song</span>
          </Button>
        </Page.Action>
      </Page.Header>

      <Page.Content>
        <SongList sections={SONG_SECTIONS} currentSongId="1" />
      </Page.Content>

      <Page.Footer className="p-0">
        <MusicPlayer />
      </Page.Footer>
    </Page>
  );
}
