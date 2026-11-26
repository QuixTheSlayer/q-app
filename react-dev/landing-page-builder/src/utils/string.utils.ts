/**
 * Converts camelCase or kebab_case text into a human-readable sentence.
 * Inserts spaces before uppercase letters and normalizes underscores/hyphens to spaces.
 * Capitalizes the first character of the resulting string.
 * 
 * @param {string} text - The input string in camelCase, snake_case or kebab-case
 * @returns {string} A sentence-cased string with spaces and initial capitalization
 * 
 * @example
 * camelToSentenceCase('helloWorld'); // Returns: 'Hello World'
 * @example
 * camelToSentenceCase('hello-world'); // Returns: 'Hello world'
 */
export function camelToSentenceCase(text: string) {
	if (!text) return "";

	const result = text
		.replace(/([A-Z])/g, " $1") // insert space before capitals
		.replace(/[_-]+/g, " ") // replace _ or - with space
		.trim();

	return result.charAt(0).toUpperCase() + result.slice(1);
}
