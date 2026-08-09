import { Badge } from "@/components/ui/badge";
import { EmploymentStatus } from "../types/employee";

interface Props {
  status: EmploymentStatus;
}

export function EmployeeStatusBadge({ status }: Props) {
  switch (status) {
    case "Active":
      return <Badge variant="outline" className="text-emerald-500 border-emerald-900/20 ">Active</Badge>;
    case "On Leave":
      return <Badge variant="outline" className="text-amber-500 border-amber-900/20 ">On Leave</Badge>;
    case "Suspended":
      return <Badge variant="outline" className="text-orange-500 border-orange-900/20 ">Suspended</Badge>;
    case "Terminated":
      return <Badge variant="outline" className="text-red-500 border-red-900/20 ">Terminated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
