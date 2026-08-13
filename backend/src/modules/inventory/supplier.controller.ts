import { Request, Response } from 'express';
import { prisma } from '../../database';


export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    
    if (!business_id) {
       res.status(400).json({ message: 'business_id is required' });
       return;
    }

    const suppliers = await prisma.supplier.findMany({
      where: { business_id: String(business_id) }
    });
    
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch suppliers', error });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const supplier = await prisma.supplier.findUnique({
      where: { id }
    });
    
    if (!supplier) {
       res.status(404).json({ message: 'Supplier not found' });
       return;
    }
    
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch supplier', error });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { business_id, name, phone, email, address } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        business_id,
        name,
        phone,
        email,
        address
      }
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create supplier', error });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = req.body;
    
    const supplier = await prisma.supplier.update({
      where: { id },
      data
    });
    
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update supplier', error });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    
    // Unlink inventory items first
    await prisma.inventoryItem.updateMany({
      where: { supplier_id: id },
      data: { supplier_id: null }
    });
    
    // We can leave purchases as they are likely restricted, but let's check
    const relatedPurchases = await prisma.purchase.count({ where: { supplier_id: id } });
    if (relatedPurchases > 0) {
      res.status(400).json({ message: 'Cannot delete supplier because they have existing purchase orders.' });
      return;
    }

    await prisma.supplier.delete({
      where: { id }
    });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete supplier', error });
  }
};
