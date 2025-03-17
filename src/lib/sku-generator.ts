/**
 * Generates a standardized SKU from a product name
 * @param name The product name to convert to SKU
 * @param existingSKUs Optional array of existing SKUs to check for uniqueness
 * @returns A standardized SKU string
 */

export function generateSKU(name: string, existingSKUs: string[] = []): string {
	let sku = name
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, "")
		.replace(/\s/g, "");

	if (sku.length > 12) {
		sku = sku.substring(0, 12);
	}

	if (sku.length === 0) {
		sku = "PROD";
	}

	if (existingSKUs.includes(sku)) {
		let counter = 1;
		let newSku = `${sku}${counter}`;

		while (existingSKUs.includes(newSku)) {
			counter++;
			newSku = `${sku}${counter}`;

			if (newSku.length > 12) {
				newSku = newSku.substring(0, 12 - String(counter).length);
			}
		}

		sku = newSku;
	}

	return sku;
}
