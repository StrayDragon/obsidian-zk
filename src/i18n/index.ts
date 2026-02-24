import {ZH_STRINGS} from "./zh";

export type I18nKey = keyof typeof ZH_STRINGS;

export type I18nParams = Record<string, string | number>;

function interpolate(template: string, params: I18nParams): string {
	return template.replace(/\{(\w+)\}/g, (match, rawKey) => {
		const key = String(rawKey);
		const value = params[key];
		return value === undefined ? match : String(value);
	});
}

export function tUnsafe(key: string, params?: I18nParams): string {
	const template = (ZH_STRINGS as Record<string, string>)[key];
	if (!template) return key;
	if (!params) return template;
	return interpolate(template, params);
}

export function t(key: I18nKey, params?: I18nParams): string {
	return tUnsafe(key, params);
}
