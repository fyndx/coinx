import type { Dayjs, ManipulateType } from "dayjs";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(localeData);

/**
 * Create a range of Day.js dates between a start and end date.
 *
 * ```js
 * dayjsRange(dayjs('2021-04-03'), dayjs('2021-04-05'), 'day');
 * // => [dayjs('2021-04-03'), dayjs('2021-04-04'), dayjs('2021-04-05')]
 * ```
 */
export function dayjsRange({
	start,
	end,
	unit,
}: { start: Dayjs; end: Dayjs; unit: ManipulateType }) {
	const range = [];
	let current = start;
	while (!current.isAfter(end)) {
		range.push(current);
		current = current.add(1, unit);
	}
	return range;
}

export const dayjsLocaleDataInstance = dayjs().localeData();
