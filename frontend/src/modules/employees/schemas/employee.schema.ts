import * as z from "zod";

export const employeeSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  age: z.preprocess((val) => (val === "" || val === undefined || val === null) ? undefined : Number(val), z.number().min(16, "Must be at least 16 years old").max(100, "Invalid age").optional()),
  phoneNumber: z.string().regex(/^\+251\d{9}$/, "Must be +251 followed by exactly 9 digits"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  nationalId: z.string().regex(/^\d{4}-\d{4}-\d{4}-\d{4}$/, "Must be 16 digits (e.g. 1234-5678-9123-2412)"),
  emergencyContact: z.string().regex(/^\+251\d{9}$/, "Must be +251 followed by exactly 9 digits"),

  // Employment Information
  employeeNumber: z.string().optional(),
  position: z.enum(["Manager", "Chief", "Waiter", "Dishwasher", "Cleaner", "Casher"], {
    errorMap: () => ({ message: "Please select a valid position" })
  }),
  department: z.string().min(2, "Department is required"),
  salary: z.coerce.number().min(0, "Salary cannot be negative"),
  employmentType: z.enum(["Full Time", "Part Time", "Contract"]),
  hireDate: z.coerce.date({
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
