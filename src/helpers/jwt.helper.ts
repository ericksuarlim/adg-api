import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config';
import { JwtPayload } from '../interfaces/common/jwtPayLoad.interface';

export const signToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

export const verifyToken = (token: string): JwtPayload | string => {
    return jwt.verify(token, jwtConfig.secret);
};

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