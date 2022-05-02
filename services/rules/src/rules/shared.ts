import c from "../constants"
import { nanoid } from "nanoid"

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

export function createRuleExecID(): string {
	return nanoid(c.RULE_EXEC_ID_SIZE)
}