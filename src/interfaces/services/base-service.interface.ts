import { ServiceResponse } from '../common/serviceResponse.interface';

export interface IGetService<T> {
    getById(id: string): Promise<ServiceResponse<T | null>>;
}

export interface IGetAllService<T> {
    getAll(): Promise<ServiceResponse<T[]>>;
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