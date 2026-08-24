import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) { res.status(400).json({ message: 'business_id is required' }); return; }
    const categories = await prisma.category.findMany({ where: { business_id } });
    res.json(categories);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch categories', error }); }
};
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: String(req.params.id) } });
    if (!category) { res.status(404).json({ message: 'Category not found' }); return; }
    res.json(category);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch category', error }); }
};
export const createCategory = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const { name, description, status } = req.body;
    const category = await prisma.category.create({ data: { business_id, name, description, status: status || 'Active' } });
    res.status(201).json(category);
  } catch (error) { res.status(500).json({ message: 'Failed to create category', error }); }
};
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.update({ where: { id: String(req.params.id) }, data: req.body });
    res.json(category);
  } catch (error) { res.status(500).json({ message: 'Failed to update category', error }); }
};
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete category', error }); }
};
