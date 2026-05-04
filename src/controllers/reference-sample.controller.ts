import { Request, Response, NextFunction } from 'express';
import {
    ReferenceSampleAttributes,
    ReferenceSampleCreationAttributes
} from "../interfaces/reference-sample/reference-sample.interface";
import { handleResponse } from '../utils/response.handler';
import { buildGetAllParams, buildGetByIdParams } from '../utils/query.builder';
import { IBaseServiceInterface } from '../interfaces/services/base-service.interface';
import { IncludeInactiveQuery, IBaseParams } from '../interfaces/params/query.interface';
import {
    IDeleteReferenceSampleParams,
    IGetReferenceSampleParams,
    IUpdateReferenceSampleParams
} from "../interfaces/params/referenceSampleParams.interface";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";

class ReferenceSampleController {
    private readonly referenceSampleService: IBaseServiceInterface<
        ReferenceSampleAttributes,
        ReferenceSampleCreationAttributes
    >;

    constructor(
        referenceSampleService: IBaseServiceInterface<
            ReferenceSampleAttributes,
            ReferenceSampleCreationAttributes
        >
    ) {
        this.referenceSampleService = referenceSampleService;
    }

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const body = req.body as ReferenceSampleCreationAttributes;
            if (req.user?.uuid_company) {
                body.uuid_company = req.user.uuid_company;
            }

            const response = await this.referenceSampleService.create(body);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    };

    getById = async (
        req: AuthRequest & Request<IGetReferenceSampleParams, {}, {}, IncludeInactiveQuery>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { uuid_reference_sample } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);

            const response = await this.referenceSampleService.getById({
                id: uuid_reference_sample,
                includeInactive,
                uuid_company: req.user?.uuid_company
            });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const params: IBaseParams = buildGetAllParams(req.query);
            params.uuid_company = req.user?.uuid_company;

            const response = await this.referenceSampleService.getAll(params);

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    update = async (
        req: AuthRequest & Request<IUpdateReferenceSampleParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { uuid_reference_sample } = req.params;
            const body = req.body as ReferenceSampleCreationAttributes;
            if (req.user?.uuid_company) {
                body.uuid_company = req.user.uuid_company;
            }

            const response = await this.referenceSampleService.update(
                uuid_reference_sample,
                body,
                { uuid_company: req.user?.uuid_company }
            );

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    delete = async (
        req: AuthRequest & Request<IDeleteReferenceSampleParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { uuid_reference_sample } = req.params;

            const response = await this.referenceSampleService.delete(uuid_reference_sample, {
                uuid_company: req.user?.uuid_company
            });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };
}

export default ReferenceSampleController;
