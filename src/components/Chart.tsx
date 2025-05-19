import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts"

interface ChartData {
    iteration: number;
    aco: number;
    prob: number;
}

interface ChartProps {
    data: ChartData[];
}

const chartConfig = {
    record: {
        label: "Рекорд",
    },
    aco: {
        label: "Алгоритм мурашиних колоній",
        color: "#000000",
    },
    prob: {
        label: "Ймовірнісний алгоритм",
        color: "#dddddd",
    },
} satisfies ChartConfig

export function Chart({ data }: ChartProps) {
    return (
        <ChartContainer config={chartConfig} className="w-full min-h-[200px] max-h-[400px]">
            <AreaChart
                accessibilityLayer
                data={data}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false}/>
                <XAxis
                    dataKey="iteration"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => value}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[(dataMin: number) => Math.round(dataMin * 0.8), (dataMax: number) => Math.round(dataMax * 1.2)]}
                />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            labelKey="iteration"
                            labelFormatter={(_, payload) => {
                                return `Ітерація ${payload[0].payload.iteration}`;
                            }}
                            indicator="dot"
                        />
                    }
                />
                <Area
                    dataKey="aco"
                    type="linear"
                    fill="var(--color-aco)"
                    fillOpacity={0.4}
                    stroke="var(--color-aco)"
                />
                <Area
                    dataKey="prob"
                    type="linear"
                    fill="var(--color-prob)"
                    fillOpacity={0.4}
                    stroke="var(--color-prob)"
                />
                <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
        </ChartContainer>
    )
}