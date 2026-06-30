import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import "react-day-picker/dist/style.css"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  showClearButton?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner une date",
  className,
  disabled = false,
  minDate,
  maxDate,
  showClearButton = true,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(date || new Date())

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate)
    if (selectedDate) {
      setIsOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange?.(undefined)
  }

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

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
        <div className="p-3">
          {/* Custom Navigation */}
          <div className="flex justify-center items-center gap-4 py-2 mb-2">
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

          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={fr}
            showOutsideDays
            fixedWeeks
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={isDateDisabled}
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "hidden",
              nav: "hidden",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-[#44DBD4]/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 text-slate-900 rounded-md hover:bg-[#44DBD4]/10 hover:text-slate-900 transition-colors cursor-pointer font-medium",
              day_selected: "bg-[#44DBD4] text-white hover:bg-[#3bc9c2] hover:text-white focus:bg-[#44DBD4] focus:text-white",
              day_today: "bg-[#44DBD4]/10 text-[#44DBD4] font-semibold",
              day_outside: "text-slate-400 opacity-50",
              day_range_middle: "aria-selected:bg-[#44DBD4]/20 aria-selected:text-slate-900",
              day_disabled: "text-slate-300 opacity-40 cursor-not-allowed line-through",
              day_range_end: "day-range-end",
            }}
          />
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-700"
            onClick={() => {
              onDateChange?.(new Date())
              setCurrentMonth(new Date())
              setIsOpen(false)
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

interface DateRangePickerProps {
  fromDate?: Date
  toDate?: Date
  onFromDateChange?: (date: Date | undefined) => void
  onToDateChange?: (date: Date | undefined) => void
  fromPlaceholder?: string
  toPlaceholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  showClearButton?: boolean
}

export function DateRangePicker({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  fromPlaceholder = "Date de départ",
  toPlaceholder = "Date de retour",
  className,
  disabled = false,
  minDate,
  maxDate,
  showClearButton = true,
}: DateRangePickerProps) {
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const [fromMonth, setFromMonth] = useState(fromDate || new Date())
  const [toMonth, setToMonth] = useState(toDate || new Date())

  const isFromDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isToDateDisabled = (date: Date) => {
    if (fromDate && date < fromDate) return true
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const handleFromSelect = (date: Date | undefined) => {
    onFromDateChange?.(date)
    if (date) {
      setFromOpen(false)
      // If the new from date is after the to date, clear the to date
      if (toDate && date > toDate) {
        onToDateChange?.(undefined)
      }
    }
  }

  const handleToSelect = (date: Date | undefined) => {
    onToDateChange?.(date)
    if (date) {
      setToOpen(false)
    }
  }

  const handleClearFrom = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFromDateChange?.(undefined)
  }

  const handleClearTo = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToDateChange?.(undefined)
  }

  const goToPreviousFromMonth = () => {
    const newMonth = new Date(fromMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setFromMonth(newMonth)
  }

  const goToNextFromMonth = () => {
    const newMonth = new Date(fromMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setFromMonth(newMonth)
  }

  const goToPreviousToMonth = () => {
    const newMonth = new Date(toMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setToMonth(newMonth)
  }

  const goToNextToMonth = () => {
    const newMonth = new Date(toMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setToMonth(newMonth)
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "flex-1 justify-start text-left font-normal border-slate-200 hover:border-[#44DBD4] hover:bg-white transition-all duration-200",
              !fromDate && "text-muted-foreground",
              fromDate && "text-slate-900",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[#44DBD4]" />
            {fromDate ? (
              <span className="flex-1">{format(fromDate, "d MMM", { locale: fr })}</span>
            ) : (
              <span className="flex-1">{fromPlaceholder}</span>
            )}
            {fromDate && showClearButton && !disabled && (
              <X 
                className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" 
                onClick={handleClearFrom}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-white border-slate-200 shadow-xl rounded-xl" 
          align="start"
        >
          <div className="p-3">
            {/* Custom Navigation */}
            <div className="flex justify-center items-center gap-4 py-2 mb-2">
              <button
                onClick={goToPreviousFromMonth}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <span className="text-sm font-semibold text-slate-900 min-w-[140px] text-center capitalize">
                {format(fromMonth, "MMMM yyyy", { locale: fr })}
              </span>
              <button
                onClick={goToNextFromMonth}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            <DayPicker
              mode="single"
              selected={fromDate}
              onSelect={handleFromSelect}
              locale={fr}
              showOutsideDays
              month={fromMonth}
              onMonthChange={setFromMonth}
              disabled={isFromDateDisabled}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "hidden",
                nav: "hidden",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-[#44DBD4]/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 text-slate-900 rounded-md hover:bg-[#44DBD4]/10 hover:text-slate-900 transition-colors cursor-pointer font-medium",
                day_selected: "bg-[#44DBD4] text-white hover:bg-[#3bc9c2] hover:text-white focus:bg-[#44DBD4] focus:text-white",
                day_today: "bg-[#44DBD4]/10 text-[#44DBD4] font-semibold",
                day_outside: "text-slate-400 opacity-50",
                day_range_middle: "aria-selected:bg-[#44DBD4]/20 aria-selected:text-slate-900",
                day_disabled: "text-slate-300 opacity-40 cursor-not-allowed line-through",
                day_range_end: "day-range-end",
              }}
            />
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700"
              onClick={() => {
                onFromDateChange?.(new Date())
                setFromMonth(new Date())
                setFromOpen(false)
              }}
            >
              Aujourd'hui
            </Button>
            {fromDate && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
                onClick={() => onFromDateChange?.(undefined)}
              >
                Effacer
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "flex-1 justify-start text-left font-normal border-slate-200 hover:border-[#44DBD4] hover:bg-white transition-all duration-200",
              !toDate && "text-muted-foreground",
              toDate && "text-slate-900",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[#44DBD4]" />
            {toDate ? (
              <span className="flex-1">{format(toDate, "d MMM", { locale: fr })}</span>
            ) : (
              <span className="flex-1">{toPlaceholder}</span>
            )}
            {toDate && showClearButton && !disabled && (
              <X 
                className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" 
                onClick={handleClearTo}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-white border-slate-200 shadow-xl rounded-xl" 
          align="start"
        >
          <div className="p-3">
            {/* Custom Navigation */}
            <div className="flex justify-center items-center gap-4 py-2 mb-2">
              <button
                onClick={goToPreviousToMonth}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <span className="text-sm font-semibold text-slate-900 min-w-[140px] text-center capitalize">
                {format(toMonth, "MMMM yyyy", { locale: fr })}
              </span>
              <button
                onClick={goToNextToMonth}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            <DayPicker
              mode="single"
              selected={toDate}
              onSelect={handleToSelect}
              locale={fr}
              showOutsideDays
              month={toMonth}
              onMonthChange={setToMonth}
              disabled={isToDateDisabled}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "hidden",
                nav: "hidden",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-[#44DBD4]/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 text-slate-900 rounded-md hover:bg-[#44DBD4]/10 hover:text-slate-900 transition-colors cursor-pointer font-medium",
                day_selected: "bg-[#44DBD4] text-white hover:bg-[#3bc9c2] hover:text-white focus:bg-[#44DBD4] focus:text-white",
                day_today: "bg-[#44DBD4]/10 text-[#44DBD4] font-semibold",
                day_outside: "text-slate-400 opacity-50",
                day_range_middle: "aria-selected:bg-[#44DBD4]/20 aria-selected:text-slate-900",
                day_disabled: "text-slate-300 opacity-40 cursor-not-allowed line-through",
                day_range_end: "day-range-end",
              }}
            />
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700"
              onClick={() => {
                const today = new Date()
                if (!fromDate || today >= fromDate) {
                  onToDateChange?.(today)
                  setToMonth(today)
                  setToOpen(false)
                }
              }}
            >
              Aujourd'hui
            </Button>
            {toDate && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
                onClick={() => onToDateChange?.(undefined)}
              >
                Effacer
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
