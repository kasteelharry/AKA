import { EmailNotRegisteredError } from "@dir/exceptions/EmailNotRegisteredError";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { GeneralServerError } from "@dir/exceptions/GeneralServerError";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";
import { UnexpectedSQLResultError } from "@dir/exceptions/UnexpectedSQLResultError";


describe("Test All Exception",() => {


    test("GeneralServerError", () => {
        expect(new GeneralServerError("Server failed").status).toBe(500);
        expect(new GeneralServerError("Server failed").message).toBe("Server failed");
    });

    test("EmailNotRegisteredError", () => {
        expect(new EmailNotRegisteredError("Server failed").status).toBe(498);
        expect(new EmailNotRegisteredError("Server failed").message).toBe("Server failed");
    });

    test("EmptySQLResultError", () => {
        expect(new EmptySQLResultError("Server failed").status).toBe(204);
        expect(new EmptySQLResultError("Server failed").message).toBe("Server failed");
    });

    test("ItemAlreadyExistsError", () => {
        expect(new ItemAlreadyExistsError("Server failed").status).toBe(403);
        expect(new ItemAlreadyExistsError("Server failed").message).toBe("Server failed");
        expect(new ItemAlreadyExistsError().message).toBe("Item already exists in the database or no value was changed.");
    });
    test("UnexpectedSQLResultError", () => {
        expect(new UnexpectedSQLResultError("Server failed").status).toBe(502);
        expect(new UnexpectedSQLResultError("Server failed").message).toBe("Server failed");
    });
});