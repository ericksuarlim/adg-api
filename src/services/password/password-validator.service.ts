import PasswordChainFactory from "./password-chain.factory";

class PasswordValidatorService {
    private chain;

    constructor() {
        this.chain = PasswordChainFactory.create();
    }

    validate(password: string): void {
        this.chain.handle(password);
    }
}

export default PasswordValidatorService;