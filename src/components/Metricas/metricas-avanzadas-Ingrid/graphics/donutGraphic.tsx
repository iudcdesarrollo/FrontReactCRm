import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { COLORS, salesByCategory } from "../samplesData"

export const GraphicDonut = () => {
    return (
        <ResponsiveContainer className="dashboard__category-chart">
            <PieChart>
                <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {salesByCategory.map((_entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}