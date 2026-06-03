import { createFileRoute, useLocation } from "@tanstack/react-router";
import { Plus } from "@workspace/ui";
import { Button } from "@workspace/ui/components/Button";
import {
  Page,
  PageAction,
  PageBreadcrumb,
  PageContent,
  PageDescription,
  PageFooter,
  PageHeader,
  PageTitle,
} from "@workspace/ui/components/Page";
import { MusicPlayer } from "#/components/MusicPlayer";
import { SONG_SECTIONS, SongList } from "#/components/Songlist";
import { iconMap } from "#/utils/route-icons";

export const Route = createFileRoute("/(protected)/song-bank/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();
  return (
    <Page>
      <PageBreadcrumb pathname={pathname} icons={iconMap} />
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
