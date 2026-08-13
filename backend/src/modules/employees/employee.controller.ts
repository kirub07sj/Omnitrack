import { Request, Response } from 'express';
import { prisma } from '../../database';
import bcrypt from 'bcrypt';


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
      age, 
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
      role
    } = req.body;

    let role_id = null;
    let final_password_hash = password_hash;
    
    if (createLoginAccount && role) {
      let foundRole = await prisma.role.findFirst({ where: { name: role } });
      if (!foundRole) {
        foundRole = await prisma.role.create({ data: { name: role } });
      }
      role_id = foundRole.id;
      
      if (password_hash) {
        const salt = await bcrypt.genSalt(10);
        final_password_hash = await bcrypt.hash(password_hash, salt);
      }
    }

    const employee = await prisma.employee.create({
      data: {
        business_id,
        first_name,
        last_name,
        gender,
        age: age ? parseInt(age, 10) : null,
        phone,
        email,
        address,
        national_id,
        emergency_contact,
        employee_number: employee_number && employee_number !== "Auto-generated upon save" ? employee_number : `EMP-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`,
        position,
        department,
        salary,
        employment_type,
        hire_date: hire_date ? new Date(hire_date) : null,
        status,
        ...(createLoginAccount && username && final_password_hash && role_id ? {
          users: {
            create: {
              business_id,
              username,
              password_hash: final_password_hash,
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
    if (data.hire_date) data.hire_date = new Date(data.hire_date);
    if (data.age) data.age = parseInt(data.age, 10);

    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (existingEmployee?.position === 'Owner') {
      if (data.position && data.position !== 'Owner') {
        return res.status(403).json({ message: 'Cannot change the position of the system owner' });
      }
      if (data.status && data.status !== 'Active') {
        return res.status(403).json({ message: 'Cannot deactivate or terminate the system owner' });
      }
    }

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
    
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (employee?.position === 'Owner') {
      return res.status(403).json({ message: 'Cannot delete the system owner' });
    }
    
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
