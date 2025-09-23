import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  className?: string
  variant?: 'default' | 'patient' | 'doctor' | 'pharmacy' | 'admin'
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default'
}: StatsCardProps) {
  const variantClasses = {
    default: 'border-gray-200',
    patient: 'border-patient/20 bg-patient/5',
    doctor: 'border-doctor/20 bg-doctor/5',
    pharmacy: 'border-pharmacy/20 bg-pharmacy/5',
    admin: 'border-admin/20 bg-admin/5'
  }

  const iconClasses = {
    default: 'text-gray-600',
    patient: 'text-patient',
    doctor: 'text-doctor',
    pharmacy: 'text-pharmacy',
    admin: 'text-admin'
  }

  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200",
      variantClasses[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconClasses[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {description && (
          <p className="text-xs text-gray-600 mb-2">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center text-xs">
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full font-medium",
                trend.isPositive
                  ? "text-green-700 bg-green-100"
                  : "text-red-700 bg-red-100"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className="ml-2 text-gray-600">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}