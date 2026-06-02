import { AnimalWriteRequestBody } from "./animal-registration.interface";

export interface AnimalBatchRowInput {
    /** Client row index (0-based) so the UI can clear or keep the correct grid row. */
    index: number;
    animal: AnimalWriteRequestBody;
}

export interface AnimalBatchCreateRequestBody {
    rows: AnimalBatchRowInput[];
}

export interface AnimalBatchRowResult {
    index: number;
    success: boolean;
    animal_uuid?: string;
    error?: string;
}

export interface AnimalBatchCreateResult {
    created: number;
    failed: number;
    results: AnimalBatchRowResult[];
}
