import { cn } from "@workspace/ui/lib/utils";
import type { ComponentPropsWithoutRef, FunctionComponent } from "react";

type PageSubComponents = {
  Header: typeof Header;
  Title: typeof Title;
  Description: typeof Description;
  Action: typeof Action;
  Content: typeof Content;
  Footer: typeof Footer;
};

const Header: FunctionComponent<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("grid grid-cols-[1fr_auto] items-start gap-x-4", className)}
      {...props}
    />
  );
};

const Title: FunctionComponent<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("col-start-1 row-start-1 text-xl font-medium", className)}
      {...props}
    />
  );
};

const Description: FunctionComponent<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("col-start-1 row-start-2 text-muted-foreground", className)}
      {...props}
    />
  );
};

const Action: FunctionComponent<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-center",
        className,
      )}
      {...props}
    />
  );
};

const Content: FunctionComponent<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  return <div className={cn("h-full space-y-5", className)} {...props} />;
};

const Footer: FunctionComponent<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("absolute bottom-0 border-t p-4 w-full right-0")}
      {...props}
    />
  );
};

const Page: FunctionComponent<ComponentPropsWithoutRef<"div">> &
  PageSubComponents = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "h-full space-y-5 overflow-y-hidden p-5 relative",
        className,
      )}
      {...props}
    />
  );
};

Page.Header = Header;
Page.Title = Title;
Page.Description = Description;
Page.Action = Action;
Page.Content = Content;
Page.Footer = Footer;

export { Page };
