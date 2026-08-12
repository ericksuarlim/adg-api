import { ServiceResponse } from '../common/service-response.interface';
import {IBaseParams} from "../params/query.interface";

export interface IGetService<T> {
    getById(id: string): Promise<ServiceResponse<T | null>>;
}

export interface IGetAllService<T> {
    getAll(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
    }): Promise<ServiceResponse<T[]>>;
}

export interface ICreateService<T, InputDto> {
    create(data: InputDto): Promise<ServiceResponse<T>>;
}

export interface IUpdateService<T, UpdateDto> {
    update(id: string, data: UpdateDto): Promise<ServiceResponse<T | null>>;
}

export interface IDeleteService {
    delete(id: string): Promise<ServiceResponse<null>>;
}

export interface IBaseServiceInterface<T, C> {
    getById(params: { id: string | number, includeInactive?: boolean, uuid_company?: string }): Promise<ServiceResponse<T | null>>;
    getAll(params: IBaseParams): Promise<ServiceResponse<T[]>>;
    create(data: C, options?: unknown): Promise<ServiceResponse<T>>;
    update(id: string | number, data: C, tenantContext?: { uuid_company?: string }): Promise<ServiceResponse<T | null>>;
    delete(id: string | number, tenantContext?: { uuid_company?: string; requestingUuidUser?: string }): Promise<ServiceResponse<null>>;
}
