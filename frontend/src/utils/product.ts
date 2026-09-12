export function isProductSoldOut(product: {
  inventory_item_id?: string | null;
  inventory_item?: { quantity?: number | string | null } | null;
}): boolean {
  if (!product?.inventory_item_id) return false;
  const quantity = Number(product.inventory_item?.quantity);
  return Number.isFinite(quantity) && quantity <= 0;
}
