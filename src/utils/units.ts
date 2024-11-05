import configureMeasurements from "convert-units";
import length from "convert-units/lib/cjs/definitions/length";
import mass from "convert-units/lib/cjs/definitions/mass";
import pieces from "convert-units/lib/cjs/definitions/pieces";
import volume from "convert-units/lib/cjs/definitions/volume";

export const convert = configureMeasurements({
	volume,
	mass,
	length,
	pieces, // Quantity
});

export const MeasurementUnits = convert().measures();

console.log({ measures: MeasurementUnits });
