import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    
    if (!business_id) {
       res.status(400).json({ message: 'business_id is required' });
       return;
    }

    const employees = await prisma.employee.findMany({
      where: { business_id: String(business_id) },
      include: { users: true }
    });
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employees', error });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { users: true }
    });
    
    if (!employee) {
       res.status(404).json({ message: 'Employee not found' });
       return;
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employee', error });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { 
      business_id, 
      first_name, 
      last_name, 
      gender, 
      date_of_birth, 
      phone, 
      email, 
      address, 
      national_id, 
      emergency_contact, 
      employee_number, 
      position, 
      department, 
      salary, 
      employment_type, 
      hire_date, 
      status,
      // User login info
      createLoginAccount,
      username,
      password_hash,
      role_id
    } = req.body;

    const employee = await prisma.employee.create({
      data: {
        business_id,
        first_name,
        last_name,
        gender,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
        phone,
        email,
        address,
        national_id,
        emergency_contact,
        employee_number,
        position,
        department,
        salary,
        employment_type,
        hire_date: hire_date ? new Date(hire_date) : null,
        status,
        ...(createLoginAccount && username && password_hash && role_id ? {
          users: {
            create: {
              business_id,
              username,
              password_hash, // You should hash this in a real scenario
              role_id,
              status: 'Active'
            }
          }
        } : {})
      },
      include: {
        users: true
      }
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create employee', error });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = req.body;
    
    // Convert dates if present
    if (data.date_of_birth) data.date_of_birth = new Date(data.date_of_birth);
    if (data.hire_date) data.hire_date = new Date(data.hire_date);

    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: { users: true }
    });
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update employee', error });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    
    // Must delete related users first
    await prisma.user.deleteMany({
      where: { employee_id: id }
    });

    await prisma.employee.delete({
      where: { id }
    });
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete employee', error });
  }
};
