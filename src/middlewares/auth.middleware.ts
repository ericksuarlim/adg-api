const { verifyToken } = require('../helpers/jwtHelper');
const ApiError = require('../errors/apiError');
const httpStatus = require('../errors/httpStatusCodes');

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return next(new ApiError('AuthorizationHeaderMissing', httpStatus.UNAUTHORIZED, 'Access token required', true));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next(new ApiError('TokenMissing', httpStatus.UNAUTHORIZED, 'Token not provided', true));
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return next(new ApiError('InvalidToken', httpStatus.UNAUTHORIZED, 'Token is invalid or expired', true));
    }
};

module.exports = {
    authenticate,
};
