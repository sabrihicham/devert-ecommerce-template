import { cn } from "@/lib/utils";

export const GridProducts = ({
  children,
  className,
  density = "comfortable",
}: {
  children: React.ReactNode;
  className?: string;
  density?: "comfortable" | "compact";
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-9 lg:grid-cols-4",
        density === "compact" && "lg:grid-cols-5",
        className
      )}
    >
      {children}
    </div>
  );
};
