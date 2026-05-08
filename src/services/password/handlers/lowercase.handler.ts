import PasswordHandler from "./base.handler";
import ApiError from "../../../errors/apiError";
import HttpStatusCodes from "../../../errors/httpStatusCodes";

class LowercaseHandler extends PasswordHandler {
    protected validate(password: string): void {
        if (!/[a-z]/.test(password)) {
            throw new ApiError({
                name: 'WeakPassword',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Password must contain at least one lowercase letter'
            });
        }
    }
}

export default LowercaseHandler;
