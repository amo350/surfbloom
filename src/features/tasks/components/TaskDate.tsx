import { differenceInDays, format } from "date-fns";
import { cn } from "@/lib/utils";

type TaskDateProps = {
  value: Date | string | null;
  className?: string;
  /** When true, always use muted styling (no overdue/soon colors). Use for Created column. */
  neutral?: boolean;
};

export const TaskDate = ({ value, className, neutral }: TaskDateProps) => {
  if (!value) {
    return <span className="text-muted-foreground">—</span>;
  }

  const date = new Date(value);
  let textColor = "text-muted-foreground";

  if (!neutral) {
    const today = new Date();
    const diffInDays = differenceInDays(date, today);
    if (diffInDays < 0) {
      textColor = "text-red-600 font-medium";
    } else if (diffInDays <= 3) {
      textColor = "text-red-500";
    } else if (diffInDays <= 7) {
      textColor = "text-orange-500";
    } else if (diffInDays <= 14) {
      textColor = "text-yellow-600";
    }
  }

  return (
    <span className={cn(textColor, className)}>
      {format(date, "MMM d, yyyy")}
    </span>
  );
};
