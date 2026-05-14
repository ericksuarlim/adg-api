"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidRole = void 0;
const roles_interface_1 = require("../interfaces/roles/roles.interface");
const isValidRole = (role) => (0, roles_interface_1.isValidAssignableRole)(role);
exports.isValidRole = isValidRole;
