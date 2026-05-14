import { Response, NextFunction } from "express";
import { handleResponse } from "../utils/response.handler";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import OwnerRepository from "../repositories/owner.repository";

class OwnerController {
    constructor(private readonly ownerRepository: OwnerRepository) {}

    listActiveOwners = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const rows = await this.ownerRepository.findAllActive();
            return handleResponse(res, { success: true, data: rows });
        } catch (error) {
            next(error);
        }
    };
}

export default OwnerController;
