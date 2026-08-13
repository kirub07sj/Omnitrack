import { Request, Response } from 'express';
import { prisma } from '../../database';


export const getTables = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    
    if (!business_id) {
       res.status(400).json({ message: 'business_id is required' });
       return;
    }

    const tables = await prisma.restaurantTable.findMany({
      where: { business_id: String(business_id) },
      orderBy: { table_number: 'asc' },
      include: { waiter: true }
    });
    
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tables', error });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const { business_id, table_number, capacity, status } = req.body;

    const table = await prisma.restaurantTable.create({
      data: {
        business_id,
        table_number,
        capacity: capacity ? parseInt(capacity) : null,
        status: status || 'Available'
      }
    });

    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create table', error });
  }
};

export const updateTable = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = req.body;
    
    // Convert capacity if provided
    if (data.capacity) {
      data.capacity = parseInt(data.capacity);
    }
    
    const table = await prisma.restaurantTable.update({
      where: { id },
      data
    });
    
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update table', error });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    await prisma.restaurantTable.delete({
      where: { id }
    });
    
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete table', error });
  }
};

export const setupTables = async (req: Request, res: Response) => {
  try {
    const { business_id, count } = req.body;
    
    if (!business_id || !count) {
       res.status(400).json({ message: 'business_id and count are required' });
       return;
    }

    const tableCount = parseInt(count);

    const currentTables = await prisma.restaurantTable.findMany({
      where: { business_id: String(business_id) }
    });

    currentTables.sort((a, b) => {
      const numA = parseInt(a.table_number.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.table_number.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    if (currentTables.length < tableCount) {
       const tablesToCreate = [];
       const maxNum = currentTables.length > 0 ? 
         Math.max(...currentTables.map(t => parseInt(t.table_number.replace(/\D/g, '')) || 0)) : 0;
         
       for (let i = 1; i <= tableCount - currentTables.length; i++) {
         tablesToCreate.push({
           business_id: String(business_id),
           table_number: `Table ${maxNum + i}`,
           status: 'Available'
         });
       }
       await prisma.restaurantTable.createMany({
         data: tablesToCreate
       });
    } else if (currentTables.length > tableCount) {
       const tablesToDelete = currentTables.slice(tableCount).map(t => t.id);
       await prisma.restaurantTable.deleteMany({
         where: { id: { in: tablesToDelete } }
       });
    }

    const updatedTables = await prisma.restaurantTable.findMany({
      where: { business_id: String(business_id) },
      include: { waiter: true }
    });

    res.json(updatedTables);
  } catch (error) {
    res.status(500).json({ message: 'Failed to setup tables', error });
  }
};
