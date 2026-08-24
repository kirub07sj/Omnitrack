import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) { res.status(400).json({ message: 'business_id is required' }); return; }
    const products = await prisma.product.findMany({ where: { business_id } });
    res.json(products);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch products', error }); }
};
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
    if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
    res.json(product);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch product', error }); }
};
export const createProduct = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const { category_id, inventory_item_id, name, sku, barcode, description, price, cost, unit, track_inventory, min_stock, image_url, status } = req.body;
    const product = await prisma.product.create({
      data: { business_id, category_id, inventory_item_id, name, sku, barcode, description, price, cost, unit, track_inventory: track_inventory ?? false, min_stock, image_url, status: status || 'Active' }
    });
    res.status(201).json(product);
  } catch (error) { res.status(500).json({ message: 'Failed to create product', error }); }
};
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({ where: { id: String(req.params.id) }, data: req.body });
    res.json(product);
  } catch (error) { res.status(500).json({ message: 'Failed to update product', error }); }
};
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete product', error }); }
};
