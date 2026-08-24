import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getTables = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) return res.status(400).json({ message: 'business_id is required' });
    const tables = await prisma.restaurantTable.findMany({ where: { business_id }, orderBy: { table_number: 'asc' }, include: { waiter: true } });
    res.json(tables);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch tables', error }); }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const { table_number, capacity, status } = req.body;
    const table = await prisma.restaurantTable.create({ data: { business_id, table_number, capacity: capacity ? parseInt(capacity) : null, status: status || 'Available' } });
    res.status(201).json(table);
  } catch (error) { res.status(500).json({ message: 'Failed to create table', error }); }
};

export const updateTable = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = req.body;
    if (data.capacity) data.capacity = parseInt(data.capacity);
    const table = await prisma.restaurantTable.update({ where: { id }, data });
    res.json(table);
  } catch (error) { res.status(500).json({ message: 'Failed to update table', error }); }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    await prisma.restaurantTable.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Table deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete table', error }); }
};

export const setupTables = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const { count } = req.body;
    if (!count) return res.status(400).json({ message: 'count is required' });

    const tableCount = parseInt(count);
    const currentTables = await prisma.restaurantTable.findMany({ where: { business_id } });
    currentTables.sort((a, b) => (parseInt(a.table_number.replace(/\D/g, '')) || 0) - (parseInt(b.table_number.replace(/\D/g, '')) || 0));

    if (currentTables.length < tableCount) {
       const tablesToCreate: any[] = [];
       const maxNum = currentTables.length > 0 ? Math.max(...currentTables.map(t => parseInt(t.table_number.replace(/\D/g, '')) || 0)) : 0;
       for (let i = 1; i <= tableCount - currentTables.length; i++) {
         tablesToCreate.push({ business_id, table_number: `Table ${maxNum + i}`, status: 'Available' });
       }
       await prisma.restaurantTable.createMany({ data: tablesToCreate });
    } else if (currentTables.length > tableCount) {
       const tablesToDelete = currentTables.slice(tableCount).map(t => t.id);
       await prisma.restaurantTable.deleteMany({ where: { id: { in: tablesToDelete } } });
    }

    const updatedTables = await prisma.restaurantTable.findMany({ where: { business_id }, include: { waiter: true } });
    res.json(updatedTables);
  } catch (error) { res.status(500).json({ message: 'Failed to setup tables', error }); }
};
