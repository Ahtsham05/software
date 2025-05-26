import React from 'react';
import { useTransactions } from '../context/users-context';
import TransactionActionDialog from './users-action-dialog';
import TransactionDeleteDialog from './users-delete-dialog';

interface TransactionsDialogsProps {
  setFetch: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TransactionsDialogs({ setFetch }: TransactionsDialogsProps) {
  const { open, setOpen, currentTransaction, setCurrentRow } = useTransactions();

  const hasValidId = !!currentTransaction?._id;

  return (
    <>
      <TransactionActionDialog
        setFetch={setFetch}
        key="transaction-add"
        open={open === 'add'}
        onOpenChange={(openState) => setOpen(openState ? 'add' : null)}
      />

      {currentTransaction && hasValidId && (
        <>
          <TransactionActionDialog
            key={`transaction-edit-${currentTransaction._id}`}
            setFetch={setFetch}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit');
              setTimeout(() => setCurrentRow(null), 500);
            }}
            currentTransaction={currentTransaction}
          />

          <TransactionDeleteDialog
            key={`transaction-delete-${currentTransaction._id}`}
            open={open === 'delete'}
            setFetch={setFetch}
            onOpenChange={() => {
              setOpen('delete');
              setTimeout(() => setCurrentRow(null), 500);
            }}
            currentTransaction={currentTransaction}
          />
        </>
      )}
    </>
  );
}
