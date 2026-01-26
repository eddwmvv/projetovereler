import { cn } from "@/lib/utils";

function Skeleton({ 
  className, 
  variant = "default",
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "text" | "circular" | "rectangular";
}) {
  const variants = {
    default: "rounded-md",
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// Componentes pré-configurados para casos comuns
function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            "h-4",
            i === lines - 1 && "w-3/4" // Última linha mais curta
          )}
        />
      ))}
    </div>
  );
}

function SkeletonAvatar({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return <Skeleton variant="circular" className={cn(sizes[size], className)} />;
}

function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton variant="rectangular" className={cn("h-10 w-24", className)} />;
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-3", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard 
};
