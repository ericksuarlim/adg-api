import MinLengthHandler from "./min-length.handler";
import UppercaseHandler from "./uppercase.handler";
import NumberHandler from "./number.handler";
import SpecialCharHandler from "./special-char.handler";


export const PasswordHandlerRegistry: Record<string, any> = {
    minLength: MinLengthHandler,
    uppercase: UppercaseHandler,
    number: NumberHandler,
    specialChar: SpecialCharHandler,
};