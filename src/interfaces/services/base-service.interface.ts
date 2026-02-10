import { ServiceResponse } from '../common/service-response.interface';

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