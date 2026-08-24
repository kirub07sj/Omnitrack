import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) return res.status(400).json({ message: 'business_id is required' });
    const suppliers = await prisma.supplier.findMany({ where: { business_id } });
    res.json(suppliers);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch suppliers', error }); }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.supplier.findUnique({ where: { id: String(req.params.id) } });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch supplier', error }); }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const { name, phone, email, address } = req.body;
    const supplier = await prisma.supplier.create({ data: { business_id, name, phone, email, address } });
    res.status(201).json(supplier);
  } catch (error) { res.status(500).json({ message: 'Failed to create supplier', error }); }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.supplier.update({ where: { id: String(req.params.id) }, data: req.body });
    res.json(supplier);
  } catch (error) { res.status(500).json({ message: 'Failed to update supplier', error }); }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.inventoryItem.updateMany({ where: { supplier_id: id }, data: { supplier_id: null } });
    const relatedPurchases = await prisma.purchase.count({ where: { supplier_id: id } });
    if (relatedPurchases > 0) return res.status(400).json({ message: 'Cannot delete supplier with existing purchase orders.' });
    await prisma.supplier.delete({ where: { id } });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete supplier', error }); }
};
