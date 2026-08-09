export type EmploymentStatus = "Active" | "On Leave" | "Suspended" | "Terminated";
export type EmploymentType = "Full Time" | "Part Time" | "Contract";
export type EmployeeRole = "Owner" | "Manager" | "Cashier" | "Waiter" | "Kitchen";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  phoneNumber: string;
  email: string;
  address: string;
  nationalId?: string;
  emergencyContact: string;

  employeeNumber: string;
  position: string;
  department: string;
  salary: number;
  employmentType: EmploymentType;
  hireDate: string; // ISO date string
  status: EmploymentStatus;
  
  // Login info
  hasLoginAccount: boolean;
  username?: string;
  role?: EmployeeRole;

  avatarUrl?: string;
}
