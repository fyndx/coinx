import type { Dayjs, ManipulateType } from "dayjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import isYesterday from "dayjs/plugin/isYesterday";
import localeData from "dayjs/plugin/localeData";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isTomorrow);
dayjs.extend(customParseFormat);
dayjs.extend(localeData);
dayjs.extend(utc);
dayjs.extend(timezone);

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

export const dayjsInstance = dayjs;
