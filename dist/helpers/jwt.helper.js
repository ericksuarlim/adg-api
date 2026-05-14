"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = __importDefault(require("../config/jwt.config"));
const signToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, jwt_config_1.default.secret, { expiresIn: jwt_config_1.default.expiresIn });
};
exports.signToken = signToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, jwt_config_1.default.secret);
};
exports.verifyToken = verifyToken;
//
// const jwt = require('jsonwebtoken');
// module.exports ={
//     verifyAccessToken: (req,res,next)=>{
//         try {
//             if(!req.headers['authorization'])return res.status(401).json({ error: 'Access denied, token required' });
//             const authHeader = req.headers['authorization'];
//             const bearerToken = authHeader.split(' ');
//             const token = bearerToken[1];
//             const verified = jwt.verify(token, 'secreto');
//             req.user = verified
//             next()
//         } catch (error) {
//             res.status(401).json({error: 'Invalid token'})
//         }
//     }
// }
