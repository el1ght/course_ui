import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    min?: number
    max?: number
    step?: number
    onValueChange?: (value: number) => void
    onChange?: (value: number) => void
    error?: string
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
    ({ className, min, max, step = 1, onValueChange, onChange, error, value, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value
            const numValue = Number(inputValue)

            // Allow empty input for better UX
            if (inputValue === "") {
                onChange?.(NaN)
                onValueChange?.(NaN)
                return
            }

            // Check if input is a valid number
            if (isNaN(numValue)) {
                return
            }

            // Apply min/max constraints
            let finalValue = numValue
            if (min !== undefined && numValue < min) {
                finalValue = min
            } else if (max !== undefined && numValue > max) {
                finalValue = max
            }

            onChange?.(finalValue)
            onValueChange?.(finalValue)
        }

        const displayValue = typeof value === 'number' ? value : ''

        return (
            <div className="flex flex-col gap-1">
                <Input
                    type="number"
                    className={cn(
                        error && "border-red-500 focus-visible:ring-red-500",
                        className
                    )}
                    min={min}
                    max={max}
                    step={step}
                    onChange={handleChange}
                    value={displayValue}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <span className="text-sm text-red-500">{error}</span>
                )}
            </div>
        )
    }
)

ValidatedInput.displayName = "ValidatedInput"

export { ValidatedInput } 