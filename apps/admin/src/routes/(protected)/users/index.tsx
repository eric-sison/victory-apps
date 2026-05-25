import { createFileRoute } from "@tanstack/react-router";
import { Page } from "#/components/Page";
import { Button } from "@workspace/ui/components/Button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/(protected)/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <Page.Header>
        <Page.Title>Users</Page.Title>
        <Page.Description>Manage your users</Page.Description>
        <Page.Action>
          <Button>
            <Plus />
            <span>Add Users</span>
          </Button>
        </Page.Action>
      </Page.Header>

      <Page.Content></Page.Content>
    </Page>
  );
}
