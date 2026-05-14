"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handler_registry_1 = require("./handlers/handler.registry");
const password_policy_constants_1 = require("../../constants/password-policy.constants");
class PasswordChainFactory {
    static create() {
        const validators = [...password_policy_constants_1.PASSWORD_POLICY.validators];
        let firstHandler = null;
        let currentHandler = null;
        for (const validatorKey of validators) {
            const HandlerClass = handler_registry_1.PasswordHandlerRegistry[validatorKey];
            if (!HandlerClass)
                continue;
            const handlerInstance = this.createHandlerInstance(validatorKey, HandlerClass);
            if (!firstHandler) {
                firstHandler = handlerInstance;
                currentHandler = handlerInstance;
            }
            else {
                currentHandler.setNext(handlerInstance);
                currentHandler = handlerInstance;
            }
        }
        if (!firstHandler) {
            throw new Error("No password validators configured");
        }
        return firstHandler;
    }
    static createHandlerInstance(key, HandlerClass) {
        switch (key) {
            case 'minLength':
                return new HandlerClass(password_policy_constants_1.PASSWORD_POLICY.minLength);
            default:
                return new HandlerClass();
        }
    }
}
exports.default = PasswordChainFactory;
