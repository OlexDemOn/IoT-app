export function getCssVariable(variableName: string) {
	return getComputedStyle(document.documentElement).getPropertyValue(variableName);
}
