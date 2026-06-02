import { cn } from "@workspace/ui/lib/utils";
import { type ComponentProps, Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/Breadcrumb.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatSegment(segment: string): string {
  if (UUID_REGEX.test(segment)) {
    return `${segment.slice(0, 4)}....${segment.slice(-8)}`;
  }
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type PageBreadcrumbProps = ComponentProps<typeof Breadcrumb> & {
  pathname: string;
  icons?: Record<string, React.ElementType>;
};

function PageBreadcrumb({ pathname, icons, ...props }: PageBreadcrumbProps) {
  const path = typeof pathname === "string" ? pathname : "";
  const segments = path.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    label: formatSegment(segment),
    href: `/${segments.slice(0, index + 1).join("/")}`,
    isLast: index === segments.length - 1,
  }));

  return (
    <Breadcrumb className="border-b px-4 py-2.5" {...props}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {crumbs.map((crumb) => {
          const Icon = icons?.[crumb.href]; // lookup works for all crumbs

          return (
            <Fragment key={crumb.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {Icon && <Icon className="size-3.5" />}
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={crumb.href}
                    className="flex items-center gap-1.5"
                  >
                    {Icon && <Icon className="size-3.5" />}{" "}
                    {/* ← icon here too */}
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function PageHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-start gap-x-4 px-7",
        className,
      )}
      {...props}
    />
  );
}

function PageTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("col-start-1 row-start-1 text-xl font-medium", className)}
      {...props}
    />
  );
}

function PageDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-1 row-start-2 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function PageAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-center",
        className,
      )}
      {...props}
    />
  );
}

function PageContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("space-y-5 flex-1 overflow-y-auto px-7", className)}
      {...props}
    />
  );
}

function PageFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("w-full shrink-0", className)} {...props} />;
}

function Page({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "h-full flex flex-col overflow-hidden bg-white dark:bg-secondary/10 border rounded-lg space-y-5",
        className,
      )}
      {...props}
    />
  );
}

export {
  Page,
  PageBreadcrumb,
  PageHeader,
  PageTitle,
  PageDescription,
  PageAction,
  PageContent,
  PageFooter,
};
