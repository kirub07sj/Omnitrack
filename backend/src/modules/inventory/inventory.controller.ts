import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getInventoryItems = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    
    if (!business_id) {
       res.status(400).json({ message: 'business_id is required' });
       return;
    }

    const items = await prisma.inventoryItem.findMany({
      where: { business_id: String(business_id) }
    });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory items', error });
  }
};

export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const item = await prisma.inventoryItem.findUnique({
      where: { id }
    });
    
    if (!item) {
       res.status(404).json({ message: 'Inventory item not found' });
       return;
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory item', error });
  }
};

export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const {
      business_id,
      name,
      sku,
      unit,
      quantity,
      minimum_quantity,
      cost_per_unit,
      supplier_id,
      status
    } = req.body;

    const item = await prisma.inventoryItem.create({
      data: {
        business_id,
        name,
        sku,
        unit,
        quantity: quantity ?? 0,
        minimum_quantity: minimum_quantity ?? 0,
        cost_per_unit,
        supplier_id,
        status: status || 'Active'
      }
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create inventory item', error });
  }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = req.body;
    
    const item = await prisma.inventoryItem.update({
      where: { id },
      data
    });
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update inventory item', error });
  }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    // Delete linked products first (cascade)
    await prisma.product.deleteMany({
      where: { inventory_item_id: id }
    });

    await prisma.inventoryItem.delete({
      where: { id }
    });
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete inventory item', error });
  }
};
