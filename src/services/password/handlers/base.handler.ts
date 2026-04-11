abstract class PasswordHandler {
    private nextHandler?: PasswordHandler;

    setNext(handler: PasswordHandler): PasswordHandler {
        this.nextHandler = handler;
        return handler;
    }

    handle(password: string): void {
        this.validate(password);

        if (this.nextHandler) {
            this.nextHandler.handle(password);
        }
    }

    protected abstract validate(password: string): void;
}

export default PasswordHandler;