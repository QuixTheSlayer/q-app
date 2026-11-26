import { NumberField, TextField } from "react-aria-components";

export default function NumAndTextField({ props, isNumber, children }: { props: React.ComponentProps<typeof NumberField>| React.ComponentProps<typeof TextField>, isNumber: boolean, children: React.ReactNode }) {

    if (isNumber) {
        return (
            <NumberField {...props as React.ComponentProps<typeof NumberField>}>
                {children}
            </NumberField>
        )
    }
    return (
        <TextField {...props as React.ComponentProps<typeof TextField>}>
            {children}
        </TextField>
    )

}
