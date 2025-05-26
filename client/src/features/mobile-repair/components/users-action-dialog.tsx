'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/stores/store'
import { addMobileRepair, updateMobileRepair } from '@/stores/mobileRepair.slice'
import toast from 'react-hot-toast'
import { MobileRepair } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  phone: z.string().optional(),
  mobileModel: z.string().optional(),
  mobileFault: z.string().optional(),
  totalAmount: z
    .number()
    .min(0, { message: 'Total Amount must be positive' })
    .optional(),
})

type MobileRepairForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: MobileRepair
  open: boolean
  onOpenChange: (open: boolean) => void
  setFetch: any
}

export function MobileRepairActionDialog({ currentRow, open, onOpenChange, setFetch }: Props) {
  const isEdit = !!currentRow
  const form = useForm<MobileRepairForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          totalAmount: currentRow?.totalAmount ?? 0,
        }
      : {
          name: '',
          phone: '',
          mobileModel: '',
          mobileFault: '',
          totalAmount: 0,
        },
  })

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = async (values: MobileRepairForm) => {
    if (isEdit) {
      await dispatch(updateMobileRepair({ ...values, _id: currentRow?.id })).then(() => {
        toast.success('Mobile Repair updated successfully')
        setFetch((prev: any) => !prev)
      })
    } else {
      await dispatch(addMobileRepair(values)).then(() => {
        toast.success('Mobile Repair created successfully')
        setFetch((prev: any) => !prev)
      })
    }
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>{isEdit ? 'Edit Mobile Repair' : 'Add New Mobile Repair'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the mobile repair record here.' : 'Create a new mobile repair record here.'} Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4">
          <Form {...form}>
            <form
              id="mobileRepair-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-right">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" className="col-span-4" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-right">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone" className="col-span-4" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileModel"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-right">Mobile Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Mobile Model" className="col-span-4" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileFault"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-right">Mobile Fault</FormLabel>
                    <FormControl>
                      <Input placeholder="Mobile Fault" className="col-span-4" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-right">Total Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Total Amount"
                        className="col-span-4"
                        autoComplete="off"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type="submit" form="mobileRepair-form">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
