/**
 * @module components/dashboard/GrowthChart
 * @description Market Growth Projection chart using Recharts.
 */

'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface GrowthMetric {
    year: string;
    value: number;
}

interface GrowthChartProps {
    data: GrowthMetric[];
}

/**
 * Renders a bar chart visualizing market growth projections.
 * 
 * Uses a premium indigo/slate color palette to match the dark theme aesthetics.
 * The final year is highlighted to emphasize the potential scale.
 * 
 * @param {GrowthChartProps} props - Component properties
 * @returns {JSX.Element} The rendered chart
 * @api Recharts
 */
export const GrowthChart = ({ data }: GrowthChartProps) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis
                        dataKey="year"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}B`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#f1f5f9'
                        }}
                        cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index === data.length - 1 ? '#6366f1' : '#475569'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
