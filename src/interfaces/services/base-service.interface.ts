import { ServiceResponse } from '../common/service-response.interface';
import {Order, Status} from "../params/query.interface";

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
    getById(params: { id: string | number, includeInactive?: boolean }): Promise<ServiceResponse<T | null>>;
    getAll(params: {
        page: number;
        size: number;
        sortBy: string;
        order: Order;
        status?: Status;
    }): Promise<ServiceResponse<T[]>>;
    create(data: C): Promise<ServiceResponse<T>>;
    update(id: string | number, data: C): Promise<ServiceResponse<T | null>>;
    delete(id: string | number): Promise<ServiceResponse<null>>;
}
