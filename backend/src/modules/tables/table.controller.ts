import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTables = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    
    if (!business_id) {
       res.status(400).json({ message: 'business_id is required' });
       return;
    }

    const tables = await prisma.restaurantTable.findMany({
      where: { business_id: String(business_id) }
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
