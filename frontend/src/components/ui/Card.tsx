import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl bg-white border border-gray-100 shadow-card p-5",
        hover && "cursor-pointer transition-shadow hover:shadow-card-hover",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "amber" | "purple" | "red";
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   text: "text-blue-600"   },
  green:  { bg: "bg-green-50",  icon: "text-green-600",  text: "text-green-600"  },
  amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  text: "text-amber-600"  },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", text: "text-purple-600" },
  red:    { bg: "bg-red-50",    icon: "text-red-600",    text: "text-red-600"    },
};

export function StatCard({ label, value, icon, trend, color = "blue" }: StatCardProps) {
  const c = colorMap[color];
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn("mt-1 text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
              {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("rounded-xl p-2.5", c.bg)}>
          <span className={cn("block [&_svg]:h-5 [&_svg]:w-5", c.icon)}>{icon}</span>
        </div>
      </div>
    </Card>
  );
}
