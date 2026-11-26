import React from 'react'

export interface LabeledNumberInputProps {
  id?: string
  label: string
  value: number
  onValueChange: (value: number) => void
}

function LabeledNumberInput({ id, label, value, onValueChange }: LabeledNumberInputProps) {
  return (
    <div className="pf">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        value={value}
        onInput={(e) => {
          const target = e.currentTarget
          if (target) onValueChange(Number(target.value))
        }}
      />
    </div>
  )
}

export default LabeledNumberInput
