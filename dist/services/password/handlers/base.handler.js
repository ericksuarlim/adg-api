"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PasswordHandler {
    setNext(handler) {
        this.nextHandler = handler;
        return handler;
    }
    handle(password) {
        this.validate(password);
        if (this.nextHandler) {
            this.nextHandler.handle(password);
        }
    }
}
exports.default = PasswordHandler;
