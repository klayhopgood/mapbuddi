"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currency";
import { Globe } from "lucide-react";

export function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);

  // Load saved currency preference on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && SUPPORTED_CURRENCIES.find(c => c.code === savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem('preferredCurrency', currencyCode);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('currencyChanged', { 
      detail: { currency: currencyCode } 
    }));
  };

  const selectedCurrencyData = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency);

  return (
    <div className="flex items-center gap-2">
      <Globe size={16} className="text-gray-500" />
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-auto min-w-[80px] h-8 text-sm border-none shadow-none">
          <SelectValue>
            {selectedCurrencyData?.symbol} {selectedCurrency}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center gap-2">
                <span className="font-mono">{currency.symbol}</span>
                <span>{currency.code}</span>
                <span className="text-gray-500 text-xs">- {currency.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
