import { Response, NextFunction } from 'express';
import { AuthRequest } from '../interfaces/middleware/auth-middleware.interface';
import { CompanyModel, RanchCompanyRouteModel } from '../database/models';
import ApiError from '../errors/apiError';
import HttpStatusCodes from '../errors/httpStatusCodes';
import { UserRole } from '../interfaces/roles/roles.interface';
import { getTenantPoolEntry } from '../database/tenant/tenant-sequelize-lru';
import { tenantRequestStorage } from '../database/tenant/tenant-request-context';
import { buildGetAllParams } from '../utils/query.builder';
import { listRanchesForSaasOwner } from '../helpers/ranch-saas-global-list.helper';

function readUuidCompanyFromQuery(req: AuthRequest): string | undefined {
    const raw = req.query?.uuid_company;
    return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : undefined;
}

/**
 * Resolves the tenant PostgreSQL database for the current request and exposes models via AsyncLocalStorage.
 * Must run after `authenticate`. SaaS owners: `GET /ranch` without `uuid_company` lists all ranches across
 * tenant DBs. Otherwise supply `uuid_company` (query/body) or `uuid_ranch` in `ranch_company_route`.
 */
export const resolveTenantOperationalContext = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(
                new ApiError({
                    name: 'Unauthorized',
                    statusCode: HttpStatusCodes.UNAUTHORIZED,
                    description: 'Authentication required',
                })
            );
        }

        const roles = req.user.roles ?? [];
        const isSaasOwner = roles.includes(UserRole.SAAS_OWNER);

        if (isSaasOwner && req.method === 'GET' && req.path === '/ranch' && !readUuidCompanyFromQuery(req)) {
            const payload = await listRanchesForSaasOwner(req.query as Record<string, unknown>);
            return res.status(200).json(payload);
        }

        let companyUuid: string | undefined;
        if (isSaasOwner) {
            companyUuid =
                readUuidCompanyFromQuery(req) ??
                (typeof req.body?.uuid_company === 'string' ? req.body.uuid_company.trim() : undefined);
            const uuidRanchParam = typeof req.params?.uuid_ranch === 'string' ? req.params.uuid_ranch : undefined;
            if (!companyUuid && uuidRanchParam) {
                const route = await RanchCompanyRouteModel.findByPk(uuidRanchParam);
                companyUuid = route?.uuid_company ?? undefined;
            }
            if (!companyUuid) {
                return next(
                    new ApiError({
                        name: 'ValidationError',
                        statusCode: HttpStatusCodes.BAD_REQUEST,
                        description: 'uuid_company is required (query or body) unless uuid_ranch can be resolved via ranch_company_route',
                    })
                );
            }
        } else {
            companyUuid = req.user.uuid_company;
        }

        const company = await CompanyModel.findOne({
            where: { uuid_company: companyUuid, is_active: true },
        });

        if (!company) {
            return next(
                new ApiError({
                    name: 'NotFound',
                    statusCode: HttpStatusCodes.NOT_FOUND,
                    description: 'Company not found',
                })
            );
        }

        const tenantDatabase = company.tenant_database?.trim();
        if (!tenantDatabase) {
            /**
             * Ranch rows live in the tenant DB. Legacy or mis-provisioned companies may have no
             * tenant_database; listing ranches should return an empty page instead of 503 so SaaS
             * UIs (user management, company detail) can still load users.
             */
            const isRanchCollectionList = req.method === 'GET' && req.path === '/ranch';
            if (isRanchCollectionList) {
                const params = buildGetAllParams(req.query);
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: {
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: params.page,
                        order: params.order,
                        pageSize: params.size,
                    },
                });
            }

            return next(
                new ApiError({
                    name: 'ServiceUnavailable',
                    statusCode: HttpStatusCodes.SERVICE_UNAVAILABLE,
                    description:
                        'This company has no tenant database configured. Create the company from SaaS (provisions tenant) or run the legacy migration checklist.',
                })
            );
        }

        const { sequelize, models } = await getTenantPoolEntry(tenantDatabase);

        tenantRequestStorage.run(
            {
                uuid_company: companyUuid,
                tenantDatabaseName: tenantDatabase,
                sequelize,
                models,
            },
            () => next()
        );
    } catch (error) {
        next(error);
    }
};
