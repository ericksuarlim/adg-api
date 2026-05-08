import MinLengthHandler from "./min-length.handler";
import UppercaseHandler from "./uppercase.handler";
import LowercaseHandler from "./lowercase.handler";
import NumberHandler from "./number.handler";
import SpecialCharHandler from "./special-char.handler";


export const PasswordHandlerRegistry: Record<string, any> = {
    minLength: MinLengthHandler,
    uppercase: UppercaseHandler,
    lowercase: LowercaseHandler,
    number: NumberHandler,
    specialChar: SpecialCharHandler,
};