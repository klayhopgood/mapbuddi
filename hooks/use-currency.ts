"use client";

import { useState, useEffect } from "react";
import { DEFAULT_CURRENCY, formatPrice } from "@/lib/currency";

// Simple exchange rates (in a real app, these would come from an API)
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.00,
  'EUR': 0.85,
  'GBP': 0.73,
  'JPY': 110.0,
  'AUD': 1.35,
  'CAD': 1.25,
  'CHF': 0.92,
  'CNY': 6.45,
  'SEK': 8.85,
  'NOK': 8.65,
  'DKK': 6.35,
  'PLN': 3.85,
  'CZK': 21.5,
  'HUF': 295.0,
  'RUB': 75.0,
  'BRL': 5.15,
  'MXN': 17.5,
  'INR': 74.5,
  'KRW': 1180.0,
  'SGD': 1.35,
  'HKD': 7.75,
  'NZD': 1.42,
  'ZAR': 14.8,
  'TRY': 8.45,
  'ILS': 3.25,
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
