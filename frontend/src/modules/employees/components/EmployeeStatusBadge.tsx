import { Badge } from "@/components/ui/badge";
import { EmploymentStatus } from "../types/employee";

interface Props {
  status: EmploymentStatus;
}

export function EmployeeStatusBadge({ status }: Props) {
  switch (status) {
    case "Active":
      return <Badge variant="outline" className="text-emerald-500 border-emerald-900 bg-emerald-950/30">Active</Badge>;
    case "On Leave":
      return <Badge variant="outline" className="text-amber-500 border-amber-900 bg-amber-950/30">On Leave</Badge>;
    case "Suspended":
      return <Badge variant="outline" className="text-orange-500 border-orange-900 bg-orange-950/30">Suspended</Badge>;
    case "Terminated":
      return <Badge variant="outline" className="text-red-500 border-red-900 bg-red-950/30">Terminated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
