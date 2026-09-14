import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import bcrypt from 'bcryptjs';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) { res.status(400).json({ message: 'business_id is required' }); return; }
    const employees = await prisma.employee.findMany({
      where: { business_id, users: { none: { role: { name: 'Owner' } } } },
      include: { users: { include: { role: true } } }
    });
    res.json(employees);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch employees', error }); }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: String(req.params.id) },
      include: { users: { include: { role: true } } }
    });
    if (!employee) { res.status(404).json({ message: 'Employee not found' }); return; }
    res.json(employee);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch employee', error }); }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const { first_name, last_name, gender, age, phone, email, address, national_id, emergency_contact, employee_number, position, department, salary, employment_type, hire_date, status, createLoginAccount, username, password_hash, role } = req.body;

    let role_id: string | null = null;
    let final_password_hash = password_hash;

    if (createLoginAccount && role) {
      let foundRole = await prisma.role.findFirst({ where: { name: role } });
      if (!foundRole) foundRole = await prisma.role.create({ data: { name: role } });
      role_id = foundRole.id;
      if (password_hash) {
        const salt = await bcrypt.genSalt(10);
        final_password_hash = await bcrypt.hash(password_hash, salt);
      }
    }

    const employee = await prisma.employee.create({
      data: {
        business_id, first_name, last_name, gender,
        age: age ? parseInt(age, 10) : null,
        phone, email, address, national_id, emergency_contact,
        employee_number: employee_number && employee_number !== "Auto-generated upon save" ? employee_number : `EMP-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`,
        position, department, salary, employment_type,
        hire_date: hire_date ? new Date(hire_date) : null,
        status,
        ...(createLoginAccount && username && final_password_hash && role_id ? {
          users: { create: { business_id, username, password_hash: final_password_hash, role_id, status: 'Active' } }
        } : {})
      },
      include: { users: true }
    });
    res.status(201).json(employee);
  } catch (error) { res.status(500).json({ message: 'Failed to create employee', error }); }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      createLoginAccount,
      username,
      password_hash,
      role,
      hire_date,
      age,
      ...rest
    } = req.body;

    const employeeData: any = { ...rest };
    if (hire_date) employeeData.hire_date = new Date(hire_date);
    if (age) employeeData.age = parseInt(age, 10);

    const existing = await prisma.employee.findUnique({
      where: { id },
      include: { users: { include: { role: true } } }
    });
    if (!existing) return res.status(404).json({ message: 'Employee not found' });

    if (existing.position === 'Owner') {
      if (employeeData.position && employeeData.position !== 'Owner') {
        return res.status(403).json({ message: 'Cannot change the position of the system owner' });
      }
      if (employeeData.status && employeeData.status !== 'Active') {
        return res.status(403).json({ message: 'Cannot deactivate or terminate the system owner' });
      }
    }

    await prisma.employee.update({ where: { id }, data: employeeData });

    const existingUser = existing.users[0];
    if (createLoginAccount) {
      let role_id = existingUser?.role_id || null;
      if (role) {
        let foundRole = await prisma.role.findFirst({ where: { name: role } });
        if (!foundRole) foundRole = await prisma.role.create({ data: { name: role } });
        role_id = foundRole.id;
      }

      let hashed: string | undefined;
      if (password_hash) {
        const salt = await bcrypt.genSalt(10);
        hashed = await bcrypt.hash(password_hash, salt);
      }

      if (existingUser) {
        const userUpdate: any = {};
        if (username && username !== existingUser.username) {
          const taken = await prisma.user.findUnique({ where: { username } });
          if (taken && taken.id !== existingUser.id) {
            return res.status(409).json({ message: 'Username is already taken' });
          }
          userUpdate.username = username;
        }
        if (hashed) userUpdate.password_hash = hashed;
        if (role_id) userUpdate.role_id = role_id;
        if (Object.keys(userUpdate).length > 0) {
          await prisma.user.update({ where: { id: existingUser.id }, data: userUpdate });
        }
      } else if (username && hashed && role_id) {
        const taken = await prisma.user.findUnique({ where: { username } });
        if (taken) return res.status(409).json({ message: 'Username is already taken' });
        await prisma.user.create({
          data: {
            business_id: existing.business_id,
            employee_id: id,
            username,
            password_hash: hashed,
            role_id,
            status: 'Active'
          }
        });
      }
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { users: { include: { role: true } } }
    });
    res.json(employee);
  } catch (error) { res.status(500).json({ message: 'Failed to update employee', error }); }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (employee?.position === 'Owner') return res.status(403).json({ message: 'Cannot delete the system owner' });
    await prisma.user.deleteMany({ where: { employee_id: id } });
    await prisma.employee.delete({ where: { id } });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete employee', error }); }
};
