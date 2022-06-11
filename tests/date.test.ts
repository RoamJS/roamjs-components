import toRoamDate from "../src/date/toRoamDate";
import toRoamDateUid from "../src/date/toRoamDateUid";
import parseRoamDate from "../src/date/parseRoamDate";
import parseRoamDateUid from "../src/date/parseRoamDateUid";

test("toRoamDate", () => {
  const date = new Date(2022, 5, 11);
  const roamDate = toRoamDate(date);
  expect(roamDate).toBe("June 11th, 2022");
});

test("toRoamDateUid", () => {
  const date = new Date(2022, 5, 11);
  const roamDateUid = toRoamDateUid(date);
  expect(roamDateUid).toBe("06-11-2022");
});

test("parseRoamDate", () => {
  const roamDate = parseRoamDate("June 11th, 2022");
  expect(roamDate.valueOf()).toBe(new Date(2022, 5, 11).valueOf());
});
test("toRoamDate", () => {
    const roamDate = parseRoamDateUid("06-11-2022");
    expect(roamDate.valueOf()).toBe(new Date(2022, 5, 11).valueOf());
});
