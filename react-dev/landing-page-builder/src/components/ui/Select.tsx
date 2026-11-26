import React, { useEffect, useRef, useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/libs/cn'

const sizeClasses = {
  sm: 'h-9 px-2 text-[13px] gap-1.5',
  md: 'h-[48px] px-3 text-[13.6px] gap-2.5',
}

export type SelectKey = string | number

export interface SelectItemMeta {
  id: SelectKey
  label: React.ReactNode
  isDisabled?: boolean
}

interface SelectContextValue {
  selectedKey?: SelectKey | null
  onSelect: (key: SelectKey) => void
  registerItem: (item: SelectItemMeta) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

const placementToSide: Record<string, 'top' | 'bottom'> = {
  bottom: 'bottom',
  'bottom end': 'bottom',
  top: 'top',
  'top end': 'top',
}
const placementToAlign: Record<string, 'start' | 'end'> = {
  bottom: 'start',
  'bottom end': 'end',
  top: 'start',
  'top end': 'end',
}

export interface SelectProps<T extends object> {
  id?: string
  'aria-label'?: string
  className?: string
  items?: Iterable<T>
  children?: React.ReactNode | ((item: T) => React.ReactNode)
  style?: React.CSSProperties
  size?: 'sm' | 'md'
  placement?: 'bottom' | 'bottom end' | 'top' | 'top end'
  offset?: number
  placeholder?: string
  selectedKey?: SelectKey | null
  onSelectionChange?: (key: SelectKey) => void
  isDisabled?: boolean
  /** Accepted for API parity with the previous react-aria-based Select; unused (dropdown is always non-modal). */
  isNonModal?: boolean
  /**
   * DOM node the dropdown portals into (defaults to document.body, via Radix).
   * Pass the DOM node of an enclosing overlay (e.g. a react-aria Popover) when
   * this Select is nested inside one, so the dropdown's outside-click/outside-
   * interact detection sees it as contained rather than "outside" — avoids
   * needing `shouldCloseOnInteractOutside` workarounds on the parent overlay.
   */
  portalContainer?: HTMLElement | null
}

function Select<T extends object>({
  id,
  'aria-label': ariaLabel,
  className,
  children,
  items,
  style,
  size = 'md',
  placement = 'bottom',
  offset = 4,
  placeholder,
  selectedKey,
  onSelectionChange,
  isDisabled,
  portalContainer,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const itemsRef = useRef<Map<SelectKey, SelectItemMeta>>(new Map())
  const [, forceUpdate] = useState(0)
  const [triggerWidth, setTriggerWidth] = useState<number>()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const registerItem = (item: SelectItemMeta) => {
    const existing = itemsRef.current.get(item.id)
    if (existing?.label === item.label && existing?.isDisabled === item.isDisabled) return
    itemsRef.current.set(item.id, item)
    forceUpdate((n) => n + 1)
  }

  const renderedChildren = items
    ? Array.from(items).map((item) => (typeof children === 'function' ? (children as (item: T) => React.ReactNode)(item) : null))
    : children

  const selectedItem = selectedKey != null ? itemsRef.current.get(selectedKey) : undefined

  return (
    <PopoverPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (isDisabled) return
        setIsOpen(open)
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-label={ariaLabel}
          disabled={isDisabled}
          style={style}
          onPointerDown={() => setTriggerWidth(triggerRef.current?.getBoundingClientRect().width)}
          className={cn(
            'group w-full flex items-center justify-between rounded-md border border-border bg-input text-foreground',
            'outline-none focus-visible:outline-1 focus-visible:outline-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'data-[state=open]:border-primary/60',
            sizeClasses[size],
            className
          )}
        >
          <span className={cn('flex-1 min-w-0 truncate text-start', !selectedItem && 'text-muted-foreground')}>
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 512 512"
            className="w-3 h-3 shrink-0 text-muted-foreground"
            fill="currentColor"
          >
            <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z" />
          </svg>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={portalContainer}>
        <PopoverPrimitive.Content
          side={placementToSide[placement]}
          align={placementToAlign[placement]}
          sideOffset={offset}
          style={{ minWidth: triggerWidth, zIndex: 'var(--z-popover)' }}
          className={cn(
            'max-h-[280px] overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg py-1',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
        >
          <SelectContext.Provider
            value={{
              selectedKey,
              onSelect: (key) => {
                onSelectionChange?.(key)
                setIsOpen(false)
              },
              registerItem,
            }}
          >
            {renderedChildren}
          </SelectContext.Provider>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
      {/*
        Radix only mounts Popover.Content's children while open, so
        SelectOption's registerItem effect never runs before the user's
        first open — the trigger would show the placeholder instead of the
        selected item's label. This invisible, always-mounted copy registers
        every item's label up front so the default value shows immediately.
      */}
      <div aria-hidden className="hidden">
        <SelectContext.Provider value={{ selectedKey, onSelect: () => {}, registerItem }}>
          {renderedChildren}
        </SelectContext.Provider>
      </div>
    </PopoverPrimitive.Root>
  )
}

export interface SelectOptionProps<T> {
  id: SelectKey
  children: React.ReactNode
  isDisabled?: boolean
  className?: string
}

function SelectOption<T extends object>({ id, children, isDisabled, className }: SelectOptionProps<T>) {
  const ctx = React.useContext(SelectContext)

  useEffect(() => {
    ctx?.registerItem({ id, label: children, isDisabled })
  }, [ctx, id, children, isDisabled])

  const isSelected = ctx?.selectedKey === id

  return (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      data-selected={isSelected || undefined}
      onClick={() => {
        if (isDisabled) return
        ctx?.onSelect(id)
      }}
      className={cn(
        'flex items-center h-9 px-3 text-[13px] text-popover-foreground capitalize cursor-pointer outline-none',
        'hover:bg-accent hover:text-accent-foreground data-[selected]:bg-accent/70 data-[selected]:text-accent-foreground',
        isDisabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  )
}

export interface OptionBoxSectionProps<T> {
  children?: React.ReactNode
  label?: string
  className?: string
}

function OptionBoxSection<T extends object>({ children, label, className }: OptionBoxSectionProps<T>) {
  return (
    <div className={cn('[&>div[role=option]]:pl-5', className)}>
      {label && (
        <div className="px-3 py-2 mt-0.5 text-[13px] font-semibold text-muted-foreground">{label}</div>
      )}
      {children}
    </div>
  )
}

export default Select
export { Select, SelectOption, OptionBoxSection }
