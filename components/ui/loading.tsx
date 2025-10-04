import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface LoadingProps {
  type?: "spinner" | "skeleton" | "wave";
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function Loading({
  type = "wave",
  size = "md",
  className,
  text
}: LoadingProps) {
  if (type === "skeleton") {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (type === "wave") {
    const sizeClasses = {
      sm: "h-6 w-1",
      md: "h-8 w-1.5",
      lg: "h-12 w-2"
    };

    return (
      <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <div className="flex items-end justify-center space-x-1">
          {/* Wave bars with staggered scaling animations */}
          <div className={cn(
            "bg-gradient-to-t from-blue-500 to-blue-300 rounded-full",
            "animate-[pulse_1s_ease-in-out_infinite]",
            sizeClasses[size]
          )} />
          <div className={cn(
            "bg-gradient-to-t from-blue-500 to-blue-300 rounded-full",
            "animate-[pulse_1s_ease-in-out_infinite]",
            "[animation-delay:0.2s]",
            sizeClasses[size]
          )} />
          <div className={cn(
            "bg-gradient-to-t from-blue-500 to-blue-300 rounded-full",
            "animate-[pulse_1s_ease-in-out_infinite]",
            "[animation-delay:0.4s]",
            sizeClasses[size]
          )} />
          <div className={cn(
            "bg-gradient-to-t from-blue-500 to-blue-300 rounded-full",
            "animate-[pulse_1s_ease-in-out_infinite]",
            "[animation-delay:0.6s]",
            sizeClasses[size]
          )} />
          <div className={cn(
            "bg-gradient-to-t from-blue-500 to-blue-300 rounded-full",
            "animate-[pulse_1s_ease-in-out_infinite]",
            "[animation-delay:0.8s]",
            sizeClasses[size]
          )} />
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}
