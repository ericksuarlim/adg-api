class BaseError extends Error {
    constructor(name, statusCode, isOperational, description) {
        super(description);

        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name || 'Error';
        this.statusCode = statusCode || 500;
        this.isOperational = isOperational ?? true;
        this.description = description || 'An unexpected error occurred.';

        Error.captureStackTrace(this);
    }
}

module.exports = BaseError;
