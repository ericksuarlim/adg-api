export interface ServiceResponse<T> {
    success: boolean;
    data?: T | null;
    error?: string;
    code?: number;
    pagination?: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        order: string
    };
}
