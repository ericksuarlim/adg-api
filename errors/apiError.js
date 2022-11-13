const httpStatusCodes = require('./httpStatusCodes')
const BaseError = require('./baseError')

class ApiError extends BaseError {
 constructor (
 name,
 statusCode,
 description,
 isOperational
 ) {
 super(name, statusCode, isOperational, description)
 }
}

module.exports = ApiError