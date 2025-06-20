'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import TransactionsProvider from '../transactions/context/users-context';
import { Header } from '@/components/layout/header';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Main } from '@/components/layout/main';
import { useNavigate } from '@tanstack/react-router';

const saleLedgerSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type SaleLedgerFormValues = z.infer<typeof saleLedgerSchema>;

export default function SaleLedger() {
  const [fetching, setFetching] = useState(false);
  // Fallback to an empty array if customersOptions is null or undefined

  const form = useForm<SaleLedgerFormValues>({
    resolver: zodResolver(saleLedgerSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
    },
  });

  const navigate = useNavigate()
  const onSubmit = async (values: SaleLedgerFormValues) => {
    setFetching(true);
    try {
      navigate({ to: `/sale-ledger-detail?startDate=${values.startDate}&endDate=${values.endDate}`, replace: true })
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setFetching(false);
    }
  };

  return (
    <TransactionsProvider>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Sale Ledger</h2>
            <p className="text-muted-foreground">Manage your Sale Ledger here.</p>
          </div>
          {/* <TransactionPrimaryButtons /> */}
        </div>
        <div className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Date Range */}
            <div className="flex space-x-4">
              <div className="w-full">
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <Controller
                  name="startDate"
                  control={form.control}
                  render={({ field }) => (
                    <Input type="date" {...field} className="w-full" />
                  )}
                />
              </div>
              <div className="w-full">
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <Controller
                  name="endDate"
                  control={form.control}
                  render={({ field }) => (
                    <Input type="date" {...field} className="w-full" />
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button type="submit" disabled={fetching} className="mt-4">
                {fetching ? 'Fetching Ledger...' : 'Get Ledger'}
              </Button>
            </div>
          </form>
        </div>
      </Main>
    </TransactionsProvider>
  );
}
