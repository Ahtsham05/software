import React from 'react'
import { useAccounts } from '../context/users-context'
import AccountActionDialog from './users-action-dialog'
import AccountDeleteDialog from './users-delete-dialog'
import { Account } from '../data/schema'  // Import your Account type

interface AccountsDialogsProps {
  setFetch: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AccountsDialogs({ setFetch }: AccountsDialogsProps) {
  const { open, setOpen, currentAccount, setCurrentRow } = useAccounts()

  // Guard to ensure _id exists (to satisfy non-optional _id in dialogs)
  const hasValidId = !!currentAccount?._id

  return (
    <>
      <AccountActionDialog
        setFetch={setFetch}
        key="account-add"
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentAccount && hasValidId && (
        <>
          <AccountActionDialog
            key={`account-edit-${currentAccount._id}`}
            setFetch={setFetch}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentAccount={currentAccount}
          />

          <AccountDeleteDialog
            key={`account-delete-${currentAccount._id}`}
            open={open === 'delete'}
            setFetch={setFetch}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentAccount={currentAccount}
          />
        </>
      )}
    </>
  )
}
