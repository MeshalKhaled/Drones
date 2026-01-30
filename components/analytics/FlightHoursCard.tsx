import { Clock } from "lucide-react";
import type { FlightHoursData } from "@/lib/domain/analytics";

interface FlightHoursCardProps {
  data: FlightHoursData;
}

export function FlightHoursCard({ data }: FlightHoursCardProps) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-md bg-zinc-100 p-2 dark:bg-zinc-800">
          <Clock className="text-blue-500" size={20} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Total Flight Hours
          </h3>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {data.total.toFixed(1)}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Top performers:</p>
        <div className="space-y-1">
          {data.byDrone
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 3)
            .map((drone) => (
              <div key={drone.droneId} className="flex items-center justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">{drone.droneName}</span>
                <span className="text-zinc-500 dark:text-zinc-400">{drone.hours.toFixed(1)}h</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
