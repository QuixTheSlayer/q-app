import { useEffect } from "react";


export default function useEverywhere() {

    let hooks: any[] = []
    let currentHook = 0

    function Effect<E>(effect: () => (() => void) |Promise< void>|void, deps: Array<any> | void | null) {
        const oldDeps: Array<any> | void | null = hooks[currentHook]

        const hasChanged = !oldDeps || deps?.some((dep, i) => dep !== oldDeps[i])

        if (hasChanged) { return effect.call(this) }

        hooks[currentHook] = deps

        currentHook++
    }

    function Memo<T>(func: Function, args: T[]) {

    }

    return {
        Effect,
        Memo,
    }

}
