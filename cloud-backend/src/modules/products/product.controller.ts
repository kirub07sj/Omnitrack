import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) { res.status(400).json({ message: 'business_id is required' }); return; }
    const products = await prisma.product.findMany({
      where: { business_id },
      include: {
        category: { select: { id: true, name: true } },
        inventory_item: {
          select: { id: true, quantity: true, unit: true },
        },
      },
    });
    res.json(products);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch products', error }); }
};
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) },
      include: {
        category: { select: { id: true, name: true } },
        inventory_item: {
          select: { id: true, quantity: true, unit: true },
        },
      },
    });
    if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
    res.json(product);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch product', error }); }
};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emptyToNull = (value: any) => (value === undefined || value === '' ? null : value);

async function resolveCategoryId(business_id: string, categoryRef?: string | null) {
  if (categoryRef && UUID_RE.test(categoryRef)) {
    const byId = await prisma.category.findFirst({ where: { id: categoryRef, business_id } });
    if (byId) return byId.id;
  }

  const categoryName = categoryRef?.trim() || 'General';
  const byName = await prisma.category.findFirst({
    where: { business_id, name: { equals: categoryName, mode: 'insensitive' } }
  });
  if (byName) return byName.id;

  const created = await prisma.category.create({
    data: { business_id, name: categoryName, status: 'Active' }
  });
  return created.id;
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) { res.status(400).json({ message: 'business_id is required' }); return; }

    const { category_id, inventory_item_id, name, sku, barcode, description, price, cost, unit, track_inventory, min_stock, image_url, status } = req.body;
    const resolvedCategoryId = await resolveCategoryId(business_id, category_id);

    const product = await prisma.product.create({
      data: {
        business_id,
        category_id: resolvedCategoryId,
        inventory_item_id: emptyToNull(inventory_item_id),
        name,
        sku: emptyToNull(sku),
        barcode: emptyToNull(barcode),
        description: emptyToNull(description),
        price,
        cost: emptyToNull(cost),
        unit: emptyToNull(unit),
        track_inventory: track_inventory ?? false,
        min_stock: emptyToNull(min_stock),
        image_url: emptyToNull(image_url),
        status: status || 'Active'
      }
    });
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Failed to create product:', error);
    res.status(500).json({ message: 'Failed to create product', error: error?.message || String(error) });
  }
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
