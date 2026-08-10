export const CART_RULES = {
  COLLECTION_FEE_THRESHOLD: 500,
  COLLECTION_FEE_AMOUNT: 150,
};

export function calculateCollectionFee(subtotal: number): number {
  if (subtotal === 0) return 0;
  return subtotal >= CART_RULES.COLLECTION_FEE_THRESHOLD ? 0 : CART_RULES.COLLECTION_FEE_AMOUNT;
}
