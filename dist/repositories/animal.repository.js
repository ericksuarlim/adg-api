"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
const search_where_util_1 = require("../utils/search-where.util");
class AnimalRepository {
    async findAll(params) {
        const { AnimalModel, RanchModel } = (0, tenant_request_context_1.requireTenantModels)();
        const { page, size, sortBy, order, status } = params;
        const offset = (page - 1) * size;
        const where = {};
        if (status === 'active') {
            where.is_active = true;
        }
        else if (status === 'inactive') {
            where.is_active = false;
        }
        const sex = params.sex?.trim().toUpperCase();
        if (sex === "MALE" || sex === "FEMALE") {
            where.sex = sex;
        }
        const searchClause = (0, search_where_util_1.buildSearchOrClause)(params.search, [
            "registration_number",
            "chip_number",
            "breed_code",
            "color",
            "description",
        ]);
        if (searchClause) {
            Object.assign(where, searchClause);
        }
        const needsRanchJoin = Boolean(params.uuid_company) || Boolean(params.uuid_ranch_in?.length);
        const ranchWhere = { is_active: true };
        if (params.uuid_company) {
            ranchWhere.uuid_company = params.uuid_company;
        }
        if (params.uuid_ranch_in?.length) {
            ranchWhere.uuid_ranch = { [sequelize_1.Op.in]: params.uuid_ranch_in };
        }
        const include = needsRanchJoin ? [{
                model: RanchModel,
                as: 'ranch',
                required: true,
                where: ranchWhere
            }] : [];
        return await AnimalModel.findAndCountAll({
            where,
            include,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }
    async findById(params) {
        const { AnimalModel, RanchModel } = (0, tenant_request_context_1.requireTenantModels)();
        const { id, includeInactive, uuid_company, uuid_ranch_in } = params;
        const where = { animal_uuid: id };
        if (!includeInactive) {
            where.is_active = true;
        }
        const needsRanchJoin = Boolean(uuid_company) || Boolean(uuid_ranch_in?.length);
        const ranchWhere = { is_active: true };
        if (uuid_company) {
            ranchWhere.uuid_company = uuid_company;
        }
        if (uuid_ranch_in?.length) {
            ranchWhere.uuid_ranch = { [sequelize_1.Op.in]: uuid_ranch_in };
        }
        const include = needsRanchJoin ? [{
                model: RanchModel,
                as: 'ranch',
                required: true,
                where: ranchWhere
            }] : [];
        return await AnimalModel.findOne({ where, include });
    }
    async create(data) {
        const { AnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        return await AnimalModel.create(data);
    }
    async update(animal_uuid, data) {
        const { AnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        const [count, updated] = await AnimalModel.update(data, {
            where: { animal_uuid, is_active: true },
            returning: true,
        });
        if (count === 0)
            return null;
        return updated[0];
    }
    async delete(animal_uuid, options) {
        const { AnimalModel, RanchModel } = (0, tenant_request_context_1.requireTenantModels)();
        let canDelete = true;
        if (options?.uuid_company || options?.uuid_ranch_in?.length) {
            const current = await AnimalModel.findOne({ where: { animal_uuid, is_active: true } });
            if (current) {
                const plain = current.get({ plain: true });
                if (options.uuid_ranch_in?.length && !options.uuid_ranch_in.includes(plain.ranch_uuid)) {
                    canDelete = false;
                }
                else {
                    const ranchWhere = {
                        uuid_ranch: plain.ranch_uuid,
                        is_active: true,
                    };
                    if (options.uuid_company) {
                        ranchWhere.uuid_company = options.uuid_company;
                    }
                    const ranch = await RanchModel.findOne({ where: ranchWhere });
                    canDelete = Boolean(ranch);
                }
            }
            else {
                canDelete = false;
            }
        }
        if (!canDelete) {
            return false;
        }
        const [count] = await AnimalModel.update({ is_active: false }, { where: { animal_uuid, is_active: true } });
        return count > 0;
    }
    async countActiveByCompany(uuid_company) {
        const { AnimalModel, RanchModel } = (0, tenant_request_context_1.requireTenantModels)();
        return AnimalModel.count({
            where: { is_active: true },
            distinct: true,
            col: 'animal_uuid',
            include: [{
                    model: RanchModel,
                    as: 'ranch',
                    required: true,
                    attributes: [],
                    where: { uuid_company, is_active: true },
                }],
        });
    }
    async findAnimalUuidByRanchAndChip(ranch_uuid, chip_number, options) {
        const { AnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = {
            ranch_uuid,
            chip_number: chip_number.trim(),
            is_active: true,
        };
        if (options?.excludeAnimalUuid) {
            where.animal_uuid = { [sequelize_1.Op.ne]: options.excludeAnimalUuid };
        }
        const found = await AnimalModel.findOne({
            where,
            attributes: ['animal_uuid'],
        });
        return found ? found.get('animal_uuid') : null;
    }
    async findAnimalUuidByRanchAndRegistration(ranch_uuid, registration_number, options) {
        const { AnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = {
            ranch_uuid,
            registration_number: registration_number.trim(),
            is_active: true,
        };
        if (options?.excludeAnimalUuid) {
            where.animal_uuid = { [sequelize_1.Op.ne]: options.excludeAnimalUuid };
        }
        const found = await AnimalModel.findOne({
            where,
            attributes: ['animal_uuid'],
        });
        return found ? found.get('animal_uuid') : null;
    }
    async listByRanchForParentSelection(ranch_uuid, sex) {
        const { AnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        const rows = await AnimalModel.findAll({
            where: { ranch_uuid, sex, is_active: true },
            attributes: ['animal_uuid', 'registration_number'],
            order: [['registration_number', 'ASC']],
        });
        return rows.map((r) => {
            const p = r.get({ plain: true });
            return { animal_uuid: p.animal_uuid, registration_number: p.registration_number };
        });
    }
    async findActiveUuidByRanchRegistrationAndSex(ranch_uuid, registration_number, sex) {
        const { AnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        const row = await AnimalModel.findOne({
            where: {
                ranch_uuid,
                registration_number: registration_number.trim(),
                sex,
                is_active: true,
            },
            attributes: ['animal_uuid'],
        });
        return row ? row.get('animal_uuid') : null;
    }
}
exports.default = AnimalRepository;
