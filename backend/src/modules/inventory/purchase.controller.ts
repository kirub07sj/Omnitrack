import { Request, Response } from 'express';
import { prisma } from '../../database';


export const getPurchases = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    if (!business_id) {
       res.status(400).json({ message: 'business_id is required' });
       return;
    }

    const purchases = await prisma.purchase.findMany({
      where: { business_id: String(business_id) },
      include: {
        supplier: true,
        items: {
          include: {
            inventory_item: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch purchases', error });
  }
};

export const createPurchase = async (req: Request, res: Response) => {
  try {
    const { business_id, supplier_id, status, items } = req.body;
    
    if (!business_id || !supplier_id || !items || !Array.isArray(items)) {
      res.status(400).json({ message: 'Invalid data' });
      return;
    }

    const total = items.reduce((sum: number, item: any) => sum + (parseFloat(item.quantity) * parseFloat(item.cost)), 0);

    const purchase = await prisma.$transaction(async (tx) => {
      // Create the purchase
      const newPurchase = await tx.purchase.create({
        data: {
          business_id,
          supplier_id,
          status: status || 'Paid',
          total
        }
      });

      // Create a Transaction for this purchase
      await tx.transaction.create({
        data: {
          business_id,
          purchase_id: newPurchase.id,
          type: 'EXPENSE',
          amount: total,
          method: 'Cash',
          status: status || 'Paid',
          date: new Date()
        }
      });

      for (const item of items) {
        let invItem;

        // If the item provides an existing inventory_item_id
        if (item.inventory_item_id) {
          invItem = await tx.inventoryItem.findUnique({
            where: { id: item.inventory_item_id }
          });
          
          if (!invItem) throw new Error(`Inventory item ${item.inventory_item_id} not found`);
          
          // Increment the quantity and update cost_per_unit
          invItem = await tx.inventoryItem.update({
            where: { id: item.inventory_item_id },
            data: {
              quantity: {
                increment: item.quantity
              },
              cost_per_unit: item.cost
            }
          });
        } else if (item.name) {
          // Otherwise, check if a product with the exact same name exists for this business
          const existingItem = await tx.inventoryItem.findFirst({
            where: {
              business_id,
              name: item.name
            }
          });

          if (existingItem) {
            invItem = await tx.inventoryItem.update({
              where: { id: existingItem.id },
              data: {
                quantity: {
                  increment: item.quantity
                },
                cost_per_unit: item.cost
              }
            });
          } else {
            // Create a brand new inventory item
            invItem = await tx.inventoryItem.create({
              data: {
                business_id,
                name: item.name,
                unit: item.unit || 'pcs',
                quantity: item.quantity,
                supplier_id,
                cost_per_unit: item.cost,
                minimum_quantity: item.minimum_quantity || 0
              }
            });
          }
        } else {
          throw new Error('Item must have inventory_item_id or name');
        }

        // Create the purchase item
        await tx.purchaseItem.create({
          data: {
            purchase_id: newPurchase.id,
            inventory_item_id: invItem.id,
            quantity: item.quantity,
            cost: item.cost
          }
        });

        // Record the inventory movement
        await tx.inventoryMovement.create({
          data: {
            business_id,
            inventory_item_id: invItem.id,
            type: 'IN',
            quantity: item.quantity,
            reference_type: 'Purchase',
            reference_id: newPurchase.id
          }
        });
      }

      return newPurchase;
    });

    res.status(201).json(purchase);
  } catch (error: any) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ message: 'Failed to create purchase', error: error.message });
  }
};

export const updatePurchaseStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    
    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const purchase = await prisma.$transaction(async (tx) => {
      const p = await tx.purchase.update({
        where: { id },
        data: { status }
      });

      // Also update the associated transaction's status
      await tx.transaction.updateMany({
        where: { purchase_id: id },
        data: { status: status.toUpperCase() }
      });

      return p;
    });

    res.json(purchase);
  } catch (error: any) {
    console.error('Error updating purchase:', error);
    res.status(500).json({ message: 'Failed to update purchase', error: error.message });
  }
};
