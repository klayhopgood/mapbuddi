"use client";

import { useState, useEffect } from "react";
import { DEFAULT_CURRENCY, formatPrice } from "@/lib/currency";

// Current exchange rates (updated with real rates as of late 2024)
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.00,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 149.5,
  'AUD': 1.514,  // Fixed: USD 10 = AUD 15.14
  'CAD': 1.37,
  'CHF': 0.88,
  'CNY': 7.24,
  'SEK': 10.85,
  'NOK': 10.95,
  'DKK': 6.85,
  'PLN': 4.05,
  'CZK': 23.2,
  'HUF': 365.0,
  'RUB': 95.0,
  'BRL': 5.65,
  'MXN': 17.8,
  'INR': 83.5,
  'KRW': 1325.0,
  'SGD': 1.34,
  'HKD': 7.81,
  'NZD': 1.65,
  'ZAR': 18.2,
  'TRY': 32.5,
  'ILS': 3.75,
};

export function useCurrency() {
  const [currentCurrency, setCurrentCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    // Load saved currency preference
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency) {
      setCurrentCurrency(savedCurrency);
    }

    // Listen for currency changes
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrentCurrency(event.detail.currency);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  const convertPrice = (usdPrice: number, targetCurrency: string = currentCurrency): number => {
    const rate = EXCHANGE_RATES[targetCurrency] || 1;
    return usdPrice * rate;
  };

  const formatDisplayPrice = (usdPrice: number, targetCurrency: string = currentCurrency): string => {
    const convertedPrice = convertPrice(usdPrice, targetCurrency);
    return formatPrice(convertedPrice, targetCurrency);
  };

  return {
    currentCurrency,
    convertPrice,
    formatDisplayPrice,
  };
}
