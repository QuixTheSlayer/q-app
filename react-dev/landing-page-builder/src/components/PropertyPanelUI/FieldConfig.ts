import {Key} from "react-aria-components"

type NumberField = {
  label: string
  fieldType: 'number',
  value: number,
  onChange: (v: number) => void
}

type SelectField = {
  label: string
  fieldType: 'number',
  value: number,
  onChange: (k: Key) => void
}

type FieldConfig = Record<string, {
  label: string,
  fields: (NumberField | SelectField)[]
}[]>

export const block: FieldConfig = {
  layout: [
    {}
  ]
}