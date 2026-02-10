class BaseError extends Error {
    name: string;
    statusCode: number;
    isOperational: boolean;
    description: string;

    constructor(name: string, statusCode: number, isOperational: boolean, description: string) {
        super(description);

        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.description = description;

        Error.captureStackTrace(this);
    }
}

export default BaseError;

