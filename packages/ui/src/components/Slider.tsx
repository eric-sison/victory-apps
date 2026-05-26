import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@workspace/ui/lib/utils";

type SliderProps = {
  roundedSides?: boolean;
  variant?: "primary" | "foreground";
  hideThumb?: boolean;
};

function Slider({
  className,
  defaultValue,
  roundedSides = true,
  variant = "primary",
  hideThumb = false,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props & SliderProps) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        className={cn(
          "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
          hideThumb && "group",
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            roundedSides ? "rounded-full" : "rounded-none",
            "relative grow overflow-hidden bg-muted cursor-pointer select-none transition-all duration-500 data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1",
            hideThumb &&
              "group-hover:data-horizontal:h-1.5 group-hover:data-vertical:w-1.5",
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className={cn(
              variant === "primary" ? "bg-primary" : "bg-foreground",
              "select-none data-horizontal:h-full data-vertical:w-full",
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            // biome-ignore lint/suspicious/noArrayIndexKey: Using index here is safe
            key={index}
            className={cn(
              "block border-2 cursor-pointer size-4 shrink-0 rounded-full bg-white shadow-sm ring-ring/50 transition-[color,box-shadow,opacity] duration-500 select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
              variant === "primary"
                ? "border-none"
                : "border-foreground bg-background",
              hideThumb && "opacity-0 group-hover:opacity-100",
            )}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
