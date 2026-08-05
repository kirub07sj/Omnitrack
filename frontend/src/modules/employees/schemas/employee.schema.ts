import * as z from "zod";

export const employeeSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  nationalId: z.string().optional(),
  emergencyContact: z.string().min(10, "Emergency contact is required"),

  // Employment Information
  employeeNumber: z.string().min(2, "Employee number is required"),
  position: z.string().min(2, "Position is required"),
  department: z.string().min(2, "Department is required"),
  salary: z.coerce.number().positive("Salary must be positive"),
  employmentType: z.enum(["Full Time", "Part Time", "Contract"]),
  hireDate: z.date({
    required_error: "Hire date is required",
  }),
  status: z.enum(["Active", "On Leave", "Suspended", "Terminated"]),

  // Optional Login Account
  createLoginAccount: z.boolean().default(false),
  username: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  role: z.enum(["Owner", "Manager", "Cashier", "Waiter", "Kitchen"]).optional(),
}).superRefine((data, ctx) => {
  if (data.createLoginAccount) {
    if (!data.username || data.username.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["username"],
        message: "Username is required (min 3 chars)",
      });
    }
    if (!data.password || data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required (min 6 chars)",
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
    if (!data.role) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["role"],
        message: "Role is required for login accounts",
      });
    }
  }
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
