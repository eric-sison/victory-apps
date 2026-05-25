import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Page } from "@workspace/ui/components/Page";
import { Plus } from "lucide-react";

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
            <span>Add New Song</span>
          </Button>
        </Page.Action>
      </Page.Header>
      <Page.Content>lorem5000</Page.Content>
    </Page>
  );
}
