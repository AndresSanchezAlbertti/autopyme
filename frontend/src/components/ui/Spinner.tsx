import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-9 w-9" };

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-brand-500", sizeMap[size])} />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center">
      <Spinner size="lg" label="Cargando..." />
    </div>
  );
}
