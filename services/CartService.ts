import { CartItem, DuplicateWarning } from '@/context/CartContext';
import { calculateCollectionFee } from '@/config/businessRules';

export class CartService {
  static getDuplicateWarnings(items: CartItem[]): DuplicateWarning[] {
    const duplicateWarnings: DuplicateWarning[] = [];
    const packageItems = items.filter((i) => i.type === 'package');
    const testItems = items.filter((i) => i.type === 'test');

    packageItems.forEach((pkg) => {
      const includedSlugs = pkg.includedTests || [];
      testItems.forEach((test) => {
        if (includedSlugs.includes(test.slug)) {
          duplicateWarnings.push({
            testId: test.id,
            testSlug: test.slug,
            testTitle: test.title,
            packageTitle: pkg.title,
            savingsAmount: test.price * test.quantity,
          });
        }
      });
    });

    return duplicateWarnings;
  }

  static calculateTotals(items: CartItem[]) {
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const totalSavings = items.reduce((acc, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return acc + (item.originalPrice - item.price) * item.quantity;
      }
      return acc;
    }, 0);

    const collectionFee = calculateCollectionFee(subtotal);
    const totalAmount = subtotal + collectionFee;

    return { itemCount, subtotal, totalSavings, collectionFee, totalAmount };
  }
}
