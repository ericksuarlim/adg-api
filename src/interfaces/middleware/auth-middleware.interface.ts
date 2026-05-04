import { Request } from 'express';
import { JwtPayload } from "../common/jwt-payload.interface";

export interface AuthRequest extends Request {
    user?: JwtPayload;
}
