import PasswordHandler from "./base.handler";
import ApiError from "../../../errors/apiError";

class MinLengthHandler extends PasswordHandler {
    constructor(private minLength: number) {
        super();
    }

    protected validate(password: string): void {
        if (password.length < this.minLength) {
            throw new ApiError({
                name: 'WeakPassword',
                statusCode: 400,
                description: `Password must be at least ${this.minLength} characters`
            });
        }
    }
}

export default MinLengthHandler;