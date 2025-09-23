"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
}

function Calendar({
  className,
  selected,
  onSelect,
  disabled,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    return selected || new Date()
  })

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (disabled && disabled(date)) return
    onSelect?.(date)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    )
  }

  const monthYear = currentMonth.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded"
            type="button"
          >
            ‹
          </button>
          <h2 className="text-sm font-semibold">{monthYear}</h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded"
            type="button"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="text-xs text-center text-gray-500 font-medium">
              {day}
            </div>
          ))}
          {blanks.map(blank => (
            <div key={`blank-${blank}`} />
          ))}
          {days.map(day => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const isDisabled = disabled && disabled(date)
            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={isDisabled}
                type="button"
                className={cn(
                  "h-9 w-9 text-sm rounded-md hover:bg-gray-100 transition-colors",
                  isSelected(day) && "bg-blue-500 text-white hover:bg-blue-600",
                  isToday(day) && !isSelected(day) && "bg-gray-100 font-semibold",
                  isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }