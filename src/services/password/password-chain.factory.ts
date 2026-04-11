import PasswordHandler from "./handlers/base.handler";
import {PasswordHandlerRegistry} from "./handlers/handler.registry";

class PasswordChainFactory {

    static create(): PasswordHandler {
        const validators = process.env.PASSWORD_VALIDATORS?.split(',') || [];

        let firstHandler: PasswordHandler | null = null;
        let currentHandler: PasswordHandler | null = null;

        for (const validatorKey of validators) {
            const HandlerClass = PasswordHandlerRegistry[validatorKey.trim()];

            if (!HandlerClass) continue;

            const handlerInstance = this.createHandlerInstance(validatorKey.trim(), HandlerClass);

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

    private static createHandlerInstance(key: string, HandlerClass: any): PasswordHandler {
        switch (key) {
            case 'minLength':
                return new HandlerClass(Number(process.env.PASSWORD_MIN_LENGTH) || 8);
            default:
                return new HandlerClass();
        }
    }
}

export default PasswordChainFactory;