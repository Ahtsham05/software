'use client'

import { z } from 'zod'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/stores/store'
import toast from 'react-hot-toast'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Main } from '@/components/layout/main'
import SalesProvider from './context/users-context'  // Updated for sales
import Select from 'react-select'
import { useEffect, useState } from 'react'
import { selectBoxStyle } from '@/assets/styling.ts'
import { IconBackspace } from '@tabler/icons-react'
import { addSale, fetchSaleById, updateSale } from '@/stores/sale.slice'  // Updated for sales
import { useNavigate } from '@tanstack/react-router'
import { jsPDF } from 'jspdf';  // Import jsPDF
import { useLocation } from '@tanstack/react-router'

// Define the schema for validation
const itemSchema = z.object({
    product: z.string().min(1, { message: 'Product is required' }),
    quantity: z.number().positive({ message: 'Quantity must be greater than 0' }),
    priceAtSale: z.number().positive({ message: 'Price must be greater than 0' }),
    purchasePrice: z.number().positive({ message: 'Purchase price must be greater than 0' }),
    total: z.number().positive({ message: 'Total must be greater than 0' }),
    profit: z.number().positive({ message: 'Profit must be greater than 0' }),  // Added profit calculation
});

export const saleFormSchema = z.object({
    customer: z.string().min(1, { message: 'Customer is required' }),  // Changed from supplier to customer
    items: z.array(itemSchema).min(1, { message: 'At least one item is required' }),
    saleDate: z.date().optional(),  // Changed from purchaseDate to saleDate
    totalAmount: z.number().positive({ message: 'Total amount is required' }),
    totalProfit: z.number().positive({ message: 'Total profit is required' }),  // Added totalProfit
});

export type SaleForm = z.infer<typeof saleFormSchema>;

const defaultValues: z.infer<typeof saleFormSchema> = {
    customer: '',
    saleDate: new Date(),
    items: [
        {
            product: '',
            quantity: 1,
            priceAtSale: 0,
            purchasePrice: 0,
            total: 0,
            profit: 0,  // Added profit field
        },
    ],
    totalAmount: 0,
    totalProfit: 0,  // Added totalProfit
};

// Define the props for the SalesActionDialog

export default function SalesActionDialog() {
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const id = urlParams.get('id');
    const isEdit = !!id;

useEffect(() => {
    if (isEdit) {
        const loadData = async () => {
            await dispatch(fetchSaleById(id)).then((action) => {
                form.setValue('customer', action.payload.customer.id)
                form.setValue('saleDate', new Date(action.payload.saleDate))
                form.setValue('totalAmount', action.payload.totalAmount)
                form.setValue('totalProfit', action.payload.totalProfit)  // Set total profit

                // Filter items and set the product field
                const filteredValues = action.payload.items?.map((item: any) => {
                    return { ...item, product: item?.product?.id };  // Ensure product is set correctly
                });
                
                form.setValue('items', filteredValues); // Set filtered items to the form
            })
        };
        loadData();
    }
}, [id]);


const form = useForm<SaleForm>({
    resolver: zodResolver(saleFormSchema),
    defaultValues,
});
const productsOptions = useSelector((state: any) => state.product?.products);
const customersOptions = useSelector((state: any) => state.customer?.data);
const [totalInvoice, setTotalInvoice] = useState(0)

// console.log("customersOptions", customersOptions)
const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
});

const dispatch = useDispatch<AppDispatch>();
const navigate = useNavigate();

const onSubmit = async (values: SaleForm) => {
    if (isEdit) {
        await dispatch(updateSale({ ...values, id: id })).then((action) => {
            if (action.payload?.id) {
                toast.success('Sale updated successfully');
                navigate({ to: '/sale', replace: true })
                form.reset();
            }
        });
    } else {
        await dispatch(addSale(values)).then((action) => {
            if (action.payload.id) {
                toast.success('Sale created successfully');
                form.reset();
            }
        });
    }
};

// Function to generate PDF
const generatePDF = (invoiceData: SaleForm) => {
    const doc = new jsPDF();

    const getCustomer = customersOptions?.find((customer: any) => customer.id === invoiceData.customer);

    // Add title with large font size and center it
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Sale Invoice', 105, 20, { align: 'center' });

    // Add customer and sale date with spacing
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer: ${getCustomer?.name}`, 20, 30);
    doc.text(`Sale Date: ${invoiceData?.saleDate?.toLocaleDateString()}`, 20, 40);

    // Add a horizontal line for separation
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45); // Draw a line under the header

    // Table Header (bold and center aligned)
    doc.setFont('helvetica', 'bold');
    doc.text('Product', 20, 51);
    doc.text('Quantity', 100, 51);
    doc.text('Price', 140, 51);
    doc.text('Total', 180, 51);

    // Table Row Separator Line
    doc.setLineWidth(0.5);
    doc.line(20, 54, 190, 54);

    // Add items with borders and better formatting
    let y = 60;
    doc.setFont('helvetica', 'normal');
    invoiceData.items.forEach((item) => {
        const product = productsOptions?.find((product: any) => product.id === item.product);

        // Product, Quantity, Price, and Total (aligned properly)
        doc.text(product?.name || '', 20, y);
        doc.text(item.quantity.toString(), 100, y, { align: 'center' });
        doc.text(item.priceAtSale.toFixed(2), 140, y, { align: 'right' });
        doc.text(item.total.toFixed(2), 180, y, { align: 'right' });

        // Item Row Border
        doc.setLineWidth(0.2);
        doc.line(20, y + 2, 190, y + 2);

        y += 10;
    });

    // Add a horizontal line after the last row
    doc.setLineWidth(0.5);
    doc.line(20, y + 2, 190, y + 2);

    // Add total amount with a larger font size
    doc.setFontSize(14);
    doc.text(`Total Amount: ${invoiceData.totalAmount.toFixed(2)}`, 20, y + 15);
    doc.text(`Total Profit: ${invoiceData.totalProfit.toFixed(2)}`, 20, y + 25);  // Added total profit to PDF

    // Add footer (optional)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', 105, y + 35, { align: 'center' });

    // Save PDF with a unique name
    doc.save('sale_invoice.pdf');
};

const watchedItems = useWatch({ control: form.control, name: 'items' }) || [];

useEffect(() => {
    let total = 0;
    let profit = 0;
    for (let i = 0; i < watchedItems.length; i++) {
        total += Number(watchedItems[i].total) || 0; // Avoid NaN in case of invalid total
        profit += Number(watchedItems[i].profit) || 0; // Calculate total profit
    }
    form.setValue('totalAmount', total);
    form.setValue('totalProfit', profit);  // Set total profit
    setTotalInvoice(total)
}, [watchedItems]);

return (
    <SalesProvider>
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
                    <h2 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Sale' : 'Add New Sale'}</h2>
                    <p className="text-muted-foreground">
                        {isEdit ? 'Update the Sale here.' : 'Create new Sale here.'}
                        Click save when you're done.
                    </p>
                </div>
            </div>
            <div className="-mr-4 overflow-y-auto min-h-[50vh] py-1 pr-4">
                <Form {...form}>
                    <form
                        id="sale-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 p-0.5"
                    >
                        <div className="w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 z-10">
                                <FormField
                                    control={form.control}
                                    name="customer"
                                    render={() => (
                                        <FormItem className="space-y-0">
                                            <FormLabel className="col-span-2 text-right">Customer Name</FormLabel>
                                            <FormControl>
                                                <Controller
                                                    name="customer"
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            placeholder="Select Customer..."
                                                            options={customersOptions}
                                                            value={customersOptions?.find((o: any) => o?.value === field?.value)} // Ensure value is correctly set
                                                            onChange={(option) => {
                                                                field.onChange(option?.value); // Ensure we are passing the correct value
                                                            }}
                                                            styles={selectBoxStyle}
                                                            className="col-span-4 text-sm outline-none border-1 rounded-md focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] bg-transparent text-black dark:text-white"
                                                        />
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage className="col-span-4 col-start-3" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="saleDate"
                                    render={() => (
                                        <FormItem className="space-y-0">
                                            <FormLabel className="col-span-2 text-right">Sale Date</FormLabel>
                                            <FormControl>
                                                <Controller
                                                    name="saleDate"
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <input
                                                            type="date"
                                                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => field.onChange(new Date(e.target.value))}
                                                            className="col-span-4 text-sm outline-none border-1 rounded-md focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] bg-transparent text-black dark:text-white p-2"
                                                            autoComplete="off"
                                                        />
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage className="col-span-4 col-start-3" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-between mt-4">
                                <h3 className="text-lg font-semibold">Items</h3>
                                <Button
                                    type="button"
                                    onClick={() => append({ product: '', quantity: 1, priceAtSale: 0, purchasePrice: 0, total: 0, profit: 0 })}
                                >
                                    Add Item
                                </Button>
                            </div>
                            <div className="my-6 space-y-2">
                                {fields.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-8 gap-4 items-center">
                                        <Controller
                                            name={`items.${index}.product`}
                                            control={form.control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={productsOptions}
                                                    placeholder="Select Product"
                                                    value={productsOptions.find((opt: any) => opt?.value === field?.value)}
                                                    onChange={(option) => {
                                                        // console.log("option", option);
                                                        form.setValue(`items.${index}.priceAtSale`, option?.price);
                                                        form.setValue(`items.${index}.purchasePrice`, option?.cost);
                                                        form.setValue(`items.${index}.total`, option?.price * form.getValues(`items.${index}.quantity`));
                                                        form.setValue(`items.${index}.profit`, (option?.price - option?.cost) * form.getValues(`items.${index}.quantity`)); // Profit calculation
                                                        field.onChange(option?.value)

                                                    }}
                                                    styles={selectBoxStyle}
                                                    className="col-span-4 text-sm outline-none border-1 rounded-md focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] bg-transparent text-black dark:text-white"
                                                />
                                            )}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Quantity"
                                            {...form.register(`items.${index}.quantity`, {
                                                valueAsNumber: true,
                                                onChange: (e) => {
                                                    const value = e.target.value;
                                                    const quantity = parseFloat(value) || 0;
                                                    form.setValue(`items.${index}.quantity`, quantity);
                                                    const priceAtSale = form.getValues(`items.${index}.priceAtSale`);
                                                    const purchasePrice = form.getValues(`items.${index}.purchasePrice`);
                                                    const total = quantity * priceAtSale;
                                                    form.setValue(`items.${index}.total`, total);
                                                    const profit = (priceAtSale - purchasePrice) * quantity;
                                                    form.setValue(`items.${index}.profit`, profit); // Update profit
                                                },
                                            })}
                                            className="sm:max-w-[200px] col-span-1 p-2 border rounded-md"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            {...form.register(`items.${index}.priceAtSale`, {
                                                valueAsNumber: true,
                                                onChange: (e) => {
                                                    const value = e.target.value;
                                                    const priceAtSale = parseFloat(value) || 0;
                                                    form.setValue(`items.${index}.priceAtSale`, priceAtSale);
                                                    const purchasePrice = form.getValues(`items.${index}.purchasePrice`);
                                                    const quantity = form.getValues(`items.${index}.quantity`);
                                                    const total = priceAtSale * quantity;
                                                    form.setValue(`items.${index}.total`, total);
                                                    const profit = (priceAtSale - purchasePrice) * quantity;
                                                    form.setValue(`items.${index}.profit`, profit); // Update profit
                                                },
                                            })}
                                            className="sm:max-w-[200px] col-span-1 p-2 border rounded-md"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Purchase Price"
                                            {...form.register(`items.${index}.purchasePrice`, {
                                                valueAsNumber: true,
                                            })}
                                            disabled
                                            hidden
                                            className="sm:max-w-[200px] col-span-1 p-2 border rounded-md"
                                        />
                                        <input
                                            type="number"
                                            disabled
                                            value={form.getValues(`items.${index}.total`) || 0}
                                            className="sm:max-w-[200px] col-span-1 p-2 border rounded-md text-gray-600"
                                        />
                                        <input
                                            type="number"
                                            disabled
                                            hidden
                                            value={form.getValues(`items.${index}.profit`) || 0}
                                            className="sm:max-w-[200px] col-span-1 p-2 border rounded-md text-gray-600"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            className="w-fit"
                                            onClick={() => remove(index)}
                                        >
                                            <IconBackspace stroke={2} className="size-6" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-3 my-5 gap-4'>
                                <div className="mt-4">
                                    <label className="font-medium text-sm">Total Amount</label>
                                    <input
                                        type="number"
                                        disabled
                                        value={totalInvoice}
                                        className="w-full mt-1 p-2 border rounded-md text-gray-700"
                                    />
                                </div>
                                <div className="mt-4">
                                    <label className="font-medium text-sm">Total Profit</label>
                                    <input
                                        type="number"
                                        disabled
                                        value={form.getValues('totalProfit') || 0}
                                        className="w-full mt-1 p-2 border rounded-md text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
            <div className='flex gap-4'>
                <Button type="submit" form="sale-form">
                    Save changes
                </Button>
                <Button
                    type="button"
                    onClick={() => generatePDF(form.getValues())}  // Pass the current form data to generate PDF
                >
                    Download PDF
                </Button>
            </div>
        </Main>
    </SalesProvider>
);
}
