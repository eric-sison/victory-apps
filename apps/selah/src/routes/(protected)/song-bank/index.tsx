import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import {
  Page,
  PageAction,
  PageContent,
  PageDescription,
  PageFooter,
  PageHeader,
  PageTitle,
} from "@workspace/ui/components/Page";
import { Plus } from "lucide-react";
import { MusicPlayer } from "#/components/MusicPlayer";
import { SONG_SECTIONS, SongList } from "#/components/Songlist";

export const Route = createFileRoute("/(protected)/song-bank/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>Song Bank</PageTitle>
        <PageDescription>
          Your central library of songs for workship.
        </PageDescription>

        <PageAction>
          <Button>
            <Plus />
            <span>New Song</span>
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent>
        <SongList sections={SONG_SECTIONS} currentSongId="1" />
      </PageContent>

      <PageFooter className="p-0">
        <MusicPlayer />
      </PageFooter>
    </Page>
  );
}
