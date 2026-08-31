import { z } from 'zod';

const employeeBody = {
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  gender: z.string().optional(),
  age: z.union([z.string(), z.number()]).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  national_id: z.string().optional(),
  emergency_contact: z.string().optional(),
  employee_number: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  salary: z.number().optional(),
  employment_type: z.string().optional(),
  hire_date: z.union([z.string(), z.date()]).optional(),
  status: z.string().optional(),
  createLoginAccount: z.boolean().optional(),
  username: z.string().optional(),
  password_hash: z.string().optional(),
  role: z.string().optional(),
};

export const createEmployeeSchema = z.object({
  body: z.object(employeeBody)
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    ...employeeBody,
    first_name: z.string().optional()
  })
});
