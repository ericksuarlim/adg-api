import {ServiceResponse} from "../common/service-response.interface";

export interface IGetAllActiveService<T> {
    getAllActive(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
    }): Promise<ServiceResponse<T[]>>;
}

export interface IGetActiveService<T> {
    getActiveById(id: string): Promise<ServiceResponse<T | null>>;
}