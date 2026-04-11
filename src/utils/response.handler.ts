import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { Response } from "express";

export function handleResponse<T>(
    res: Response,
    response: ServiceResponse<T>,
    successCode = 200
) {
    if (!response.success) {
        return res.status(response.code ?? 500).json(response);
    }

    return res.status(successCode).json(response);
}
