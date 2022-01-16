import { convertStringToSQLDate } from "@dir/util/ConvertStringToSQLDate";


describe("ConvertStringToSQLDateTest", () => {
    test("YYYY/MM/DD", async () => {
        const res = convertStringToSQLDate("2000/01/01");
        expect(res).toBeDefined();
    });

    test("YYYY-MM-DD", async () => {
        const res = convertStringToSQLDate("2000-01-01");
        expect(res).toBeDefined();
    });

    test("YYYY MM DD", async () => {
        const res = convertStringToSQLDate("2000 01 01");
        expect(res).toBeDefined();
    });

    test("YYYY", async () => {
        const res = convertStringToSQLDate("2000");
        expect(res).toBeDefined();
    });

    test("YYYY-MM-DD hh:mm:ss", async () => {
        const res = convertStringToSQLDate("2000-01-01 12:12:12");
        expect(res).toBeDefined();
    });

    test("YYYY/MM/DD hh:mm:ss", async () => {
        const res = convertStringToSQLDate("2000/01/01 12:12:12");
        expect(res).toBeDefined();
    });

    test("YYYY/MM/DD hh:mm:ss:mill", async () => {
        const res = convertStringToSQLDate("2000/01/01 12:12:12.100");
        expect(res).toBeDefined();
    });

    test("DD-MM-YYYY", async () => {
        const res = convertStringToSQLDate("1-1-2000");
        expect(res).toBeDefined();
    });

    test("MM-DD-YYYY", async () => {
        const res = convertStringToSQLDate("15-1-2000");
        expect(res).toBeUndefined();
    });

    test("current date from Date object.", async () => {
        const res = convertStringToSQLDate((new Date()).toISOString());
        expect(res).toBeDefined();
    });


});