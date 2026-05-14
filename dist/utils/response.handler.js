"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = handleResponse;
function handleResponse(res, response, successCode = 200) {
    if (!response.success) {
        return res.status(response.code ?? 500).json(response);
    }
    return res.status(successCode).json(response);
}
