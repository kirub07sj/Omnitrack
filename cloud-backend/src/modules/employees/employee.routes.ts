import { Router } from 'express';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from './employee.controller';
import { validate } from '../../middleware/validate';
import { createEmployeeSchema, updateEmployeeSchema } from '../../schemas/employee.schema';

const router = Router();
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', validate(createEmployeeSchema), createEmployee);
router.put('/:id', validate(updateEmployeeSchema), updateEmployee);
router.delete('/:id', deleteEmployee);
export default router;
