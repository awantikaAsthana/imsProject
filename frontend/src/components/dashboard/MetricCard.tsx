import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: "primary" | "success" | "warning" | "destructive";
}

const iconColorClasses = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const changeTypeClasses = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
};

const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "primary",
}: MetricCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 card-shadow transition-shadow duration-200 hover:card-shadow-hover animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl md:text-3xl font-semibold text-card-foreground truncate">{value}</p>
          {change && (
            <p className={cn("text-xs md:text-sm font-medium", changeTypeClasses[changeType])}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-2 md:p-3 shrink-0", iconColorClasses[iconColor])}>
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
