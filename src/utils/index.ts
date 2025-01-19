/* eslint-disable @typescript-eslint/no-explicit-any */
export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    // @ts-expect-error TS being dumb
    return parts.pop().split(';').shift()
  }
}

function isNumeric(str: any) {
  return (
    !isNaN(str as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ) // ...and ensure strings of whitespace fail
}

export function compareString(a: string, b: string) {
  if (isNumeric(a) && isNumeric(b)) {
    return Number(a) - Number(b)
  }
  if (a < b) {
    return -1
  } else if (a > b) {
    return 1
  } else {
    return 0
  }
}

export function compareRecords(a: any, b: any, field: string) {
  return compareString(a[field], b[field])
}

export const host = import.meta.env.VITE_API_HOST
