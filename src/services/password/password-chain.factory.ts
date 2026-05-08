import PasswordHandler from "./handlers/base.handler";
import {PasswordHandlerRegistry} from "./handlers/handler.registry";
import { PASSWORD_POLICY, PasswordValidatorKey } from "../../constants/password-policy.constants";

class PasswordChainFactory {

    static create(): PasswordHandler {
        const validators: PasswordValidatorKey[] = [...PASSWORD_POLICY.validators];

        let firstHandler: PasswordHandler | null = null;
        let currentHandler: PasswordHandler | null = null;

        for (const validatorKey of validators) {
            const HandlerClass = PasswordHandlerRegistry[validatorKey];

            if (!HandlerClass) continue;

            const handlerInstance = this.createHandlerInstance(validatorKey, HandlerClass);

            if (!firstHandler) {
                firstHandler = handlerInstance;
                currentHandler = handlerInstance;
            } else {
                currentHandler!.setNext(handlerInstance);
                currentHandler = handlerInstance;
            }
        }

        if (!firstHandler) {
            throw new Error("No password validators configured");
        }

        return firstHandler;
    }

    private static createHandlerInstance(key: PasswordValidatorKey, HandlerClass: any): PasswordHandler {
        switch (key) {
            case 'minLength':
                return new HandlerClass(PASSWORD_POLICY.minLength);
            default:
                return new HandlerClass();
        }
    }
}

export default PasswordChainFactory;