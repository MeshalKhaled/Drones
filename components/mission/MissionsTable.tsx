import { VirtualMissionsTable } from "./VirtualMissionsTable";
import type { Mission } from "@/lib/domain/types";

interface MissionsTableProps {
  missions: Mission[];
  currentPage: number;
  totalPages: number;
  total: number;
  searchParams?: Record<string, string>;
}

// Server Component wrapper - passes data to client VirtualMissionsTable
export function MissionsTable(props: MissionsTableProps) {
  return <VirtualMissionsTable {...props} />;
}
