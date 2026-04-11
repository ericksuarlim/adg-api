import PasswordHandler from "./base.handler";
import ApiError from "../../../errors/apiError";
import HttpStatusCodes from "../../../errors/httpStatusCodes";

class SpecialCharHandler extends PasswordHandler {
    protected validate(password: string): void {
        if (!/[!@#$%^&*.]/.test(password)) {
            throw new ApiError({
                name: 'WeakPassword',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Password must contain at least one special character'
            });
        }
    }
}

export default SpecialCharHandler;