import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getInventoryItems = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) return res.status(400).json({ message: 'business_id is required' });
    const items = await prisma.inventoryItem.findMany({
      where: { business_id },
      include: { supplier: true }
    });
    res.json(items);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch inventory items', error }); }
};

export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: String(req.params.id) },
      include: { supplier: true, movements: { orderBy: { created_at: 'desc' }, take: 10 } }
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch item', error }); }
};

export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const { name, sku, unit, quantity, minimum_quantity, cost_per_unit, supplier_id } = req.body;
    const item = await prisma.inventoryItem.create({
      data: { business_id, name, sku, unit, quantity, minimum_quantity, cost_per_unit, supplier_id }
    });
    if (parseFloat(quantity) > 0) {
      await prisma.inventoryMovement.create({
        data: { business_id, inventory_item_id: item.id, type: 'IN', quantity, reference_type: 'Initial Stock' }
      });
    }
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ message: 'Failed to create inventory item', error }); }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const id = String(req.params.id);
    const { name, sku, unit, quantity, minimum_quantity, cost_per_unit, supplier_id, movement_reason } = req.body;
    
    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Item not found' });

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: { name, sku, unit, quantity, minimum_quantity, cost_per_unit, supplier_id }
    });

    const qtyDiff = parseFloat(quantity) - parseFloat(String(existing.quantity));
    if (qtyDiff !== 0) {
      await prisma.inventoryMovement.create({
        data: { business_id, inventory_item_id: id, type: qtyDiff > 0 ? 'IN' : 'OUT', quantity: Math.abs(qtyDiff), reference_type: movement_reason || 'Manual Adjustment' }
      });
    }
    res.json(updated);
  } catch (error) { res.status(500).json({ message: 'Failed to update item', error }); }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const linkedProductCount = await prisma.product.count({ where: { inventory_item_id: id } });
    if (linkedProductCount > 0) return res.status(400).json({ message: 'Cannot delete item because it is linked to a product.' });
    
    await prisma.inventoryMovement.deleteMany({ where: { inventory_item_id: id } });
    await prisma.purchaseItem.deleteMany({ where: { inventory_item_id: id } });
    await prisma.inventoryItem.delete({ where: { id } });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete item', error }); }
};

export const getInventoryMovements = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) return res.status(400).json({ message: 'business_id is required' });
    const movements = await prisma.inventoryMovement.findMany({
      where: { business_id },
      include: { inventory_item: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(movements);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch movements', error }); }
};
