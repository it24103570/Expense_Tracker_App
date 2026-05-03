import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CurrencyContext = createContext();

export const CURRENCIES = [
  { code: 'LKR', symbol: 'Rs.', label: 'Sri Lankan Rupee', locale: 'en-LK', rate: 1 },
  { code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US', rate: 300 },
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(CURRENCIES[0]); // Default to LKR
  const [loadComplete, setLoadComplete] = useState(false);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCode = await AsyncStorage.getItem('user-currency');
        if (savedCode) {
          const found = CURRENCIES.find(c => c.code === savedCode);
          if (found) setCurrency(found);
        }
      } catch (e) {
        console.log('Error loading currency:', e);
      } finally {
        setLoadComplete(true);
      }
    };
    loadCurrency();
  }, []);

  const changeCurrency = async (curr) => {
    try {
      setCurrency(curr);
      await AsyncStorage.setItem('user-currency', curr.code);
    } catch (e) {
      console.log('Error saving currency:', e);
    }
  };

  const convertToBase = (amount) => {
    return Number(amount) * currency.rate;
  };

  const convertFromBase = (amount) => {
    return Number(amount) / currency.rate;
  };

  const formatAmount = (amount) => {
    return `${currency.symbol} ${formatValue(amount)}`;
  };

  const formatValue = (amount) => {
    const converted = convertFromBase(amount);
    return Number(converted).toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      changeCurrency, 
      formatAmount, 
      formatValue, 
      convertToBase,
      convertFromBase,
      loadComplete 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
