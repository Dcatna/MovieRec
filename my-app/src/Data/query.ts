export type Param = {
    name: string
    value: string | number | boolean | undefined
}

export type Join = "OR" | "AND" | undefined

type Primitves = boolean | number | undefined | string

export type ListParam<T extends Primitves> = {
    name: string
    value: T[]
    join: Join
}

export function buildUrl(
    base: string,
    args: Param[] = [],
    listArgs: ListParam<Primitves>[] = []
): string {

    let url = base
    let first = true

    for (let {name, value} of args) {
        if (value === undefined) {
            continue
        }
        if (first) {
            url += `?${name}=${value.toString()}`
            first = false
        } else {
            url += `&${name}=${value.toString()}`
        }
    }

    for (let {name, join, value} of listArgs) {
        if (value.length < 1) {
            continue
        }
        const seperator =
            join === "AND" ? ',' :
                join === "OR" ? '|' : '';

        if (first) {
            url += `?${name}=${value.join(seperator)}`
            first = false
        } else {
            url += `&${name}=${ value.join(seperator)}`
        }
    }

    return encodeURI(url)
}
