// Currency utilities for MapBuddi location lists

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', symbolPosition: 'before' },
  { code: 'EUR', name: 'Euro', symbol: '€', symbolPosition: 'before' },
  { code: 'GBP', name: 'British Pound', symbol: '£', symbolPosition: 'before' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', symbolPosition: 'before' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', symbolPosition: 'before' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', symbolPosition: 'before' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', symbolPosition: 'after' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', symbolPosition: 'before' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', symbolPosition: 'after' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', symbolPosition: 'after' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', symbolPosition: 'after' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', symbolPosition: 'after' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', symbolPosition: 'after' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', symbolPosition: 'after' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', symbolPosition: 'after' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', symbolPosition: 'before' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', symbolPosition: 'before' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', symbolPosition: 'before' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', symbolPosition: 'before' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', symbolPosition: 'before' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', symbolPosition: 'before' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', symbolPosition: 'before' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', symbolPosition: 'before' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', symbolPosition: 'before' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', symbolPosition: 'before' },
];

export const DEFAULT_CURRENCY = 'USD';

export function getCurrency(code: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find(currency => currency.code === code);
}

export function formatPrice(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode);
  if (!currency) {
    return `${amount} ${currencyCode}`;
  }

  const formattedAmount = amount.toFixed(2);
  
  if (currency.symbolPosition === 'before') {
    return `${currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${currency.symbol}`;
  }
}

export function formatPriceWithCode(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode);
  if (!currency) {
    return `${amount} ${currencyCode}`;
  }

  const formattedAmount = amount.toFixed(2);
  
  if (currency.symbolPosition === 'before') {
    return `${currency.symbol}${formattedAmount} ${currencyCode}`;
  } else {
    return `${formattedAmount} ${currency.symbol} ${currencyCode}`;
  }
}

// For future implementation: currency conversion
export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

// Placeholder for future currency conversion functionality
export async function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): Promise<number> {
  // TODO: Implement with exchange rate API (e.g., exchangerate-api.com)
  // For now, return the original amount
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Placeholder conversion - in real implementation, this would call an exchange rate API
  return amount;
}

export function getCurrencySelectOptions() {
  return SUPPORTED_CURRENCIES.map(currency => ({
    value: currency.code,
    label: `${currency.code} - ${currency.name}`,
    symbol: currency.symbol,
  }));
}

// Legacy function for backward compatibility
export function currencyFormatter(amount: number): string {
  return formatPrice(amount, DEFAULT_CURRENCY);
}