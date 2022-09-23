import parseRoamDateUid from "../src/date/parseRoamDateUid";
import parseNlpDate from "../src/date/parseNlpDate";
import { test, expect } from "@playwright/test";

test("parseRoamDateUid", () => {
    const roamDate = parseRoamDateUid("06-11-2022");
    expect(roamDate.getMonth()).toBe(5);
    expect(roamDate.getDate()).toBe(11);
    expect(roamDate.getFullYear()).toBe(2022);
});

test.skip("parseNlpDate - end of the month", () => {
    const dateBasis = new Date(2022, 7, 19);
    const endOfMonth = parseNlpDate("end of the month", dateBasis);
    expect(endOfMonth.getMonth()).toBe(7);
    expect(endOfMonth.getDate()).toBe(31);
    expect(endOfMonth.getFullYear()).toBe(2022);
})
