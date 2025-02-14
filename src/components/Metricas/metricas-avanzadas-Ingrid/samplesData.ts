import { AccountManagerData, DailySale, SalesByCategory, TopCustomer } from "../types/types";

export const dailySales: DailySale[] = [
    { date: '01/01', value: 150000 },
    { date: '01/02', value: 180000 },
    { date: '01/03', value: 160000 },
    { date: '01/04', value: 190000 },
    { date: '01/05', value: 170000 },
    { date: '01/06', value: 200000 },
    { date: '01/07', value: 185000 },
];


export const topCustomers: TopCustomer[] = [
    { name: 'Metro Building', value: 450000 },
    { name: 'Central Hotels', value: 380000 },
    { name: 'Henry Street Coffee', value: 350000 },
    { name: 'Park Mall', value: 320000 },
    { name: 'Grand Central', value: 300000 },
];

export const salesByCategory: SalesByCategory[] = [
    { name: 'Retail', value: 35 },
    { name: 'Wholesale', value: 25 },
    { name: 'Online', value: 20 },
    { name: 'B2B', value: 20 },
];

export const accountManagerData: AccountManagerData[] = [
    { name: 'Ene', Sarah: 4000, Mike: 2400, Emma: 2400, Personal: 1800 },
    { name: 'Feb', Sarah: 4500, Mike: 2800, Emma: 2800, Personal: 2000 },
    { name: 'Mar', Sarah: 5000, Mike: 3200, Emma: 3000, Personal: 2200 },
    { name: 'Abr', Sarah: 4800, Mike: 3000, Emma: 3200, Personal: 2400 },
];

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];