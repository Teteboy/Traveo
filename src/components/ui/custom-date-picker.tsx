import { useState } from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isBefore, isToday } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface CustomDatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  showClearButton?: boolean
}

export function CustomDatePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner une date",
  className,
  disabled = false,
  minDate,
  maxDate,
  showClearButton = true,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(date || new Date())

  const handleSelect = (selectedDate: Date) => {
    onDateChange?.(selectedDate)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange?.(undefined)
  }

  const isDateDisabled = (checkDate: Date) => {
    if (minDate && isBefore(checkDate, minDate)) return true
    if (maxDate && isBefore(maxDate, checkDate)) return true
    return false
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add days from previous month to fill the first week
  const startDayOfWeek = monthStart.getDay()
  const daysFromPrevMonth = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1
  const prevMonthDays = []
  for (let i = daysFromPrevMonth; i > 0; i--) {
    const prevDate = new Date(monthStart)
    prevDate.setDate(prevDate.getDate() - i)
    prevMonthDays.push(prevDate)
  }

  // Add days from next month to fill the last week
  const endDayOfWeek = monthEnd.getDay()
  const daysFromNextMonth = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek
  const nextMonthDays = []
  for (let i = 1; i <= daysFromNextMonth; i++) {
    const nextDate = new Date(monthEnd)
    nextDate.setDate(nextDate.getDate() + i)
    nextMonthDays.push(nextDate)
  }

  const allDays = [...prevMonthDays, ...calendarDays, ...nextMonthDays]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal border-slate-200 hover:border-[#44DBD4] hover:bg-white transition-all duration-200",
            !date && "text-muted-foreground",
            date && "text-slate-900",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#44DBD4]" />
          {date ? (
            <span className="flex-1">{format(date, "d MMMM yyyy", { locale: fr })}</span>
          ) : (
            <span className="flex-1">{placeholder}</span>
          )}
          {date && showClearButton && !disabled && (
            <X
              className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white border-slate-200 shadow-xl rounded-xl"
        align="start"
      >
        <div className="p-4">
          {/* Custom Navigation */}
          <div className="flex justify-center items-center gap-4 py-2 mb-4">
            <button
              onClick={goToPreviousMonth}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <span className="text-sm font-semibold text-slate-900 min-w-[140px] text-center capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </span>
            <button
              onClick={goToNextMonth}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = date && isSameDay(day, date)
              const isDisabled = isDateDisabled(day)
              const isTodayDate = isToday(day)

              return (
                <button
                  key={index}
                  onClick={() => !isDisabled && handleSelect(day)}
                  disabled={isDisabled}
                  className={cn(
                    "h-9 w-9 text-sm rounded-md transition-colors flex items-center justify-center",
                    isCurrentMonth ? "text-slate-900" : "text-slate-400",
                    isSelected && "bg-[#44DBD4] text-white hover:bg-[#3bc9c2]",
                    !isSelected && isCurrentMonth && !isDisabled && "hover:bg-[#44DBD4]/10 hover:text-slate-900",
                    isTodayDate && !isSelected && "bg-[#44DBD4]/20 text-[#44DBD4] font-semibold",
                    isDisabled && "text-slate-300 cursor-not-allowed line-through"
                  )}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-700"
            onClick={() => {
              const today = new Date()
              if (!minDate || !isBefore(today, minDate)) {
                onDateChange?.(today)
                setCurrentMonth(today)
                setIsOpen(false)
              }
            }}
          >
            Aujourd'hui
          </Button>
          {date && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700"
              onClick={() => onDateChange?.(undefined)}
            >
              Effacer
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}