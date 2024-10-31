export const UnitCategory = [
	"weight", // kg, g, mg
	"volume", // l, ml
	"quantity", // pieces, bags, packets
	"length", // m, cm
	"area", // sq.m, sq.ft
] as const;

// Base units for each category for standardized comparison
export enum BaseUnit {
	WEIGHT = "g", // all weights converted to grams
	VOLUME = "ml", // all volumes converted to milliliters
	QUANTITY = "pc", // pieces
	LENGTH = "cm", // centimeters
	AREA = "cm2", // square centimeters
}

// Conversion rates to base unit
export const UnitConversions = {
	// Weight
	kg: 1000, // 1 kg = 1000 g
	g: 1, // 1 g = 1 g
	mg: 0.001, // 1 mg = 0.001 g

	// Volume
	l: 1000, // 1 l = 1000 ml
	ml: 1, // 1 ml = 1 ml

	// Quantity - no conversion needed
	pc: 1, // piece
	bag: 1, // bag
	pack: 1, // pack

	// Length
	m: 100, // 1 m = 100 cm
	cm: 1, // 1 cm = 1 cm
	mm: 0.1, // 1 mm = 0.1 cm

	// Area
	m2: 10000, // 1 m² = 10000 cm²
	cm2: 1, // 1 cm² = 1 cm²
} as const;
