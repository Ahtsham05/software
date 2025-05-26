import React, { useState, createContext, useContext } from 'react';
import { Transaction } from '../data/schema';

export type TransactionDialogType = 'add' | 'edit' | 'delete' | null;

interface TransactionsContextType {
  open: TransactionDialogType | null;
  setOpen: (value: TransactionDialogType | null) => void;
  currentTransaction: Transaction | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Transaction | null>>;
}

const TransactionsContext = createContext<TransactionsContextType | null>(null);

export default function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<TransactionDialogType>(null);
  const [currentTransaction, setCurrentRow] = useState<Transaction | null>(null);

  return (
    <TransactionsContext.Provider value={{ open, setOpen, currentTransaction, setCurrentRow }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactions must be used within TransactionsProvider');
  return context;
};
