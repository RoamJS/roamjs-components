import parseRoamDateUid from "../src/date/parseRoamDateUid";

test("parseRoamDateUid", () => {
    const roamDate = parseRoamDateUid("06-11-2022");
    expect(roamDate.getMonth()).toBe(5);
    expect(roamDate.getDate()).toBe(11);
    expect(roamDate.getFullYear()).toBe(2022);
});
