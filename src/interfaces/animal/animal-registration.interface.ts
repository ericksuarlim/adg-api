import { AnimalCreationAttributes } from "./animal.interface";

/**
 * HTTP body for creating/updating animals. Parents may be sent as registration numbers
 * (same ranch); resolved server-side to `mother_animal_uuid` / `father_animal_uuid`.
 */
export type AnimalWriteRequestBody = AnimalCreationAttributes & {
    mother_registration_number?: string | null;
    father_registration_number?: string | null;
};
