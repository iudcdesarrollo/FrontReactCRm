import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { topCustomers } from "../samplesData"

export const HorizontalBarChart = () => {
    return (
        <ResponsiveContainer className="dashboard__customers-chart">
            <BarChart layout="vertical" data={topCustomers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar
                    dataKey="value"
                    fill="#82ca9d"
                    radius={[0, 4, 4, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}