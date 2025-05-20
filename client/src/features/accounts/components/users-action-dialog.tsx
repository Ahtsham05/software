'use client'

import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/stores/store'
import { addAccount, updateAccount } from '@/stores/account.slice'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Account } from '../data/schema'

// Validation schema for Account form
const accountSchema = z.object({
  name: z.string().min(1, { message: 'Account name is required' }),
  type: z.enum(['receivable', 'payable']),
  balance: z.number().min(0).optional(),
  transactionType: z.enum(['cashReceived', 'expenseVoucher', 'generalLedger']),
  // You can add customer and supplier if needed here
})

type AccountFormValues = z.infer<typeof accountSchema>

interface AccountActionDialogProps {
  setFetch: React.Dispatch<React.SetStateAction<boolean>>
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAccount?: Account | null
}

export default function AccountActionDialog({
  setFetch,
  open,
  onOpenChange,
  currentAccount,
}: AccountActionDialogProps) {
  const isEdit = Boolean(currentAccount)
  const dispatch = useDispatch<AppDispatch>()

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: isEdit
      ? {
          name: currentAccount?.name ?? '',
          type: currentAccount?.type ?? 'receivable',
          balance: currentAccount?.balance ?? 0,
          transactionType: currentAccount?.transactionType ?? 'cashReceived',
        }
      : {
          name: '',
          type: 'receivable',
          balance: 0,
          transactionType: 'cashReceived',
        },
  })

  const onSubmit = async (values: AccountFormValues) => {
    if (isEdit && currentAccount?._id) {
      await dispatch(updateAccount({ ...values, _id: currentAccount._id }))
        .unwrap()
        .then(() => {
          toast.success('Account updated successfully')
          setFetch((prev) => !prev)
        })
        .catch(() => toast.error('Failed to update account'))
    } else {
      await dispatch(addAccount(values))
        .unwrap()
        .then(() => {
          toast.success('Account created successfully')
          setFetch((prev) => !prev)
        })
        .catch(() => toast.error('Failed to create account'))
    }
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      form.reset()
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Account' : 'Add New Account'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the account details here.' : 'Create a new account here.'}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[26rem] overflow-y-auto pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Account name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receivable">Receivable</SelectItem>
                        <SelectItem value="payable">Payable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Balance"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cashReceived">Cash Received</SelectItem>
                        <SelectItem value="expenseVoucher">Expense Voucher</SelectItem>
                        <SelectItem value="generalLedger">General Ledger</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">{isEdit ? 'Update Account' : 'Create Account'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
