import configureMeasurements, { type Measure } from "convert-units";
import length from "convert-units/lib/cjs/definitions/length";
import mass from "convert-units/lib/cjs/definitions/mass";
import pieces from "convert-units/lib/cjs/definitions/pieces";
import volume from "convert-units/lib/cjs/definitions/volume";

/**
 * Configured measurement conversion utility.
 * Supports:
 * - volume: Volume measurements (e.g., l, ml)
 * - mass: Weight measurements (e.g., kg, g)
 * - length: Distance measurements (e.g., m, cm)
 * - pieces: Quantity measurements (e.g., pcs)
 *
 * @example
 * convert().from('kg').to('g').amount(1) // 1000
 */
export const convert = configureMeasurements({
	volume,
	mass,
	length,
	pieces, // Quantity
});

export const MeasurementUnits = convert().measures();

export const isValidUnitCategory = (
	unit: (typeof MeasurementUnits)[number],
) => {
	return MeasurementUnits.includes(unit);
};
