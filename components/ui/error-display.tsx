import { cn } from "@/lib/utils";
import { AlertTriangle, XCircle, Wifi, Shield, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorDisplayProps {
  type?: "error" | "warning" | "network" | "auth" | "validation";
  size?: "sm" | "md" | "lg";
  className?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
  variant?: "default" | "card" | "inline";
}

const errorConfig = {
  error: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    buttonColor: "bg-red-600 hover:bg-red-700"
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700"
  },
  network: {
    icon: Wifi,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    buttonColor: "bg-blue-600 hover:bg-blue-700"
  },
  auth: {
    icon: Shield,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    buttonColor: "bg-purple-600 hover:bg-purple-700"
  },
  validation: {
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    buttonColor: "bg-orange-600 hover:bg-orange-700"
  }
};

export function ErrorDisplay({
  type = "error",
  size = "md",
  className,
  title,
  message,
  onRetry,
  retryText = "Try Again",
  showIcon = true,
  variant = "default"
}: ErrorDisplayProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      icon: "h-4 w-4",
      title: "text-sm font-medium",
      message: "text-xs",
      padding: "p-3",
      spacing: "space-y-2"
    },
    md: {
      icon: "h-5 w-5",
      title: "text-base font-semibold",
      message: "text-sm",
      padding: "p-4",
      spacing: "space-y-3"
    },
    lg: {
      icon: "h-6 w-6",
      title: "text-lg font-bold",
      message: "text-base",
      padding: "p-6",
      spacing: "space-y-4"
    }
  };

  const currentSize = sizeClasses[size];

  if (variant === "inline") {
    return (
      <div className={cn(
        "flex items-center space-x-2 text-sm",
        config.color,
        className
      )}>
        {showIcon && <Icon className={currentSize.icon} />}
        <span>{message || title}</span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "rounded-lg border",
        config.bgColor,
        config.borderColor,
        currentSize.padding,
        currentSize.spacing,
        className
      )}>
        <div className="flex items-start space-x-3">
          {showIcon && (
            <Icon className={cn(currentSize.icon, config.color, "mt-0.5 flex-shrink-0")} />
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={cn(currentSize.title, config.color.replace('text-', 'text-'))}>
                {title}
              </h3>
            )}
            {message && (
              <p className={cn("text-muted-foreground", currentSize.message)}>
                {message}
              </p>
            )}
            {onRetry && (
              <div className="mt-3">
                <Button
                  onClick={onRetry}
                  size="sm"
                  className={cn(config.buttonColor, "text-white")}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {retryText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant - centered full display
  return (
    <div className={cn(
      "min-h-screen bg-background flex items-center justify-center",
      className
    )}>
      <div className={cn(
        "max-w-md mx-auto text-center",
        currentSize.spacing
      )}>
        {showIcon && (
          <div className="flex justify-center">
            <Icon className={cn(currentSize.icon, config.color, "mx-auto")} />
          </div>
        )}
        {title && (
          <h2 className={cn(currentSize.title, config.color)}>
            {title}
          </h2>
        )}
        {message && (
          <p className={cn("text-muted-foreground", currentSize.message)}>
            {message}
          </p>
        )}
        {onRetry && (
          <div className="mt-4">
            <Button
              onClick={onRetry}
              className={cn(config.buttonColor, "text-white")}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
