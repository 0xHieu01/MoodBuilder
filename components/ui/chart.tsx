"use client"

import { Tooltip } from "@/components/ui/tooltip"

import type * as React from "react"
import { cn } from "@/lib/utils"

// Re-export Recharts components
export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ children, config, className, ...props }: ChartContainerProps) {
  return (
    <div
      className={cn("h-[350px] w-full", className)}
      style={
        {
          "--color-primary": "hsl(var(--primary))",
          "--color-secondary": "hsl(var(--secondary))",
          "--color-muted": "hsl(var(--muted))",
          ...Object.entries(config).reduce(
            (acc, [key, value]) => ({
              ...acc,
              [`--color-${key}`]: value.color,
            }),
            {},
          ),
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipProps extends React.ComponentPropsWithoutRef<typeof Tooltip> {
  className?: string
}

export function ChartTooltip({ className, ...props }: ChartTooltipProps) {
  return (
    <Tooltip
      cursor={false}
      content={<ChartTooltipContent />}
      contentStyle={{
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        backgroundColor: "var(--background)",
        padding: "8px 12px",
        boxShadow: "var(--shadow)",
      }}
      {...props}
    />
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: string | number
    payload: {
      name: string
      value: string | number
      [key: string]: any
    }
  }>
  label?: string
}

export function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="text-sm">
      <p className="mb-2 font-medium">{label}</p>
      <div className="grid gap-2">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: `var(--color-${item.name})`,
                }}
              />
              <span className="text-muted-foreground">{item.payload.config?.[item.name]?.label || item.name}</span>
            </div>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
