"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../utils/response.handler");
class OwnerController {
    constructor(ownerRepository) {
        this.ownerRepository = ownerRepository;
        this.listActiveOwners = async (req, res, next) => {
            try {
                const rows = await this.ownerRepository.findAllActive();
                return (0, response_handler_1.handleResponse)(res, { success: true, data: rows });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = OwnerController;
