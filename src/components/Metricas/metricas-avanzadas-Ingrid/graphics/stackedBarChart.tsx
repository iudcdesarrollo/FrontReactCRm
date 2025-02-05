import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { accountManagerData } from "../samplesData"

export const StackedBarChart = () => {
    return (
        <ResponsiveContainer className="dashboard__manager-chart">
            <BarChart data={accountManagerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Sarah" stackId="a" fill="#8884d8" />
                <Bar dataKey="Mike" stackId="a" fill="#82ca9d" />
                <Bar dataKey="Emma" stackId="a" fill="#ffc658" />
                <Bar dataKey="Personal" stackId="a" fill="#ff7300" />
            </BarChart>
        </ResponsiveContainer>
    )
}