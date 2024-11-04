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
	weight: {
		mg: 0.001, // milligram to gram
		g: 1, // gram as the base unit
		kg: 1000, // kilogram to gram
		lb: 453.592, // pound to gram
		oz: 28.3495, // ounce to gram
		ton: 1000000, // metric ton to gram
	},
	volume: {
		ml: 0.001, // milliliter to liter
		l: 1, // liter as the base unit
	},
	quantity: {
		piece: 1, // each item as base unit
		bag: 1, // no direct conversion, context-dependent
		packet: 1, // no direct conversion, context-dependent
		dozen: 12, // dozen to piece
		gross: 144, // gross to piece
		bundle: 1, // no direct conversion, context-dependent
		set: 1, // no direct conversion, context-dependent
	},
	length: {
		mm: 0.001, // millimeter to meter
		cm: 0.01, // centimeter to meter
		m: 1, // meter as the base unit
		km: 1000, // kilometer to meter
		in: 0.0254, // inch to meter
		ft: 0.3048, // foot to meter
		yd: 0.9144, // yard to meter
		mile: 1609.34, // mile to meter
	},
	area: {
		"sq mm": 0.000001, // square millimeter to square meter
		"sq cm": 0.0001, // square centimeter to square meter
		"sq m": 1, // square meter as base unit
		hectare: 10000, // hectare to square meter
		acre: 4046.86, // acre to square meter
		"sq km": 1000000, // square kilometer to square meter
		"sq in": 0.00064516, // square inch to square meter
		"sq ft": 0.092903, // square foot to square meter
		"sq yd": 0.836127, // square yard to square meter
	},
} as const;
