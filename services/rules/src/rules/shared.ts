import c from "../constants"

export function stringIfNull(v: any): string {
	if (v == null) {
		return ""
	}
	return v
}

export function stringIfNumber(v: any): string {
	if (typeof v == 'number') {
		return v.toString()
	}
	return v
}

export function numberToFixedString(num: number): string {
	return num.toFixed(c.FIXED_DECIMAL_PLACES).toString()
}