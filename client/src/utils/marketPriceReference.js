const formatPKR = (amount) => `PKR ${amount.toLocaleString('en-PK')}`;

export function getMarketPriceReference(name, type = 'test') {
  if (type === 'package') {
    const testName = String(name || '').toLowerCase();
    if (testName.includes('basic')) {
      return `${formatPKR(10500)} - ${formatPKR(13000)}`;
    }
    return `${formatPKR(10500)} - ${formatPKR(28000)}`;
  }

  return 'Price pending confirmation';
}
