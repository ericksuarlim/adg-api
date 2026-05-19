import { UserRole } from "../interfaces/roles/roles.interface";

export enum Permission {
    /** Listar / operar todas las compañías (solo SaaS). */
    COMPANY_READ = "COMPANY_READ",
    /** Alta / baja global de compañía (solo SaaS). */
    COMPANY_WRITE = "COMPANY_WRITE",
    /** Ver compañía concreta, pagos, etc. (SaaS o administrador de esa compañía). */
    COMPANY_TENANT_READ = "COMPANY_TENANT_READ",
    /** Actualizar datos de la propia compañía y pagos (SaaS o administrador de esa compañía). */
    COMPANY_TENANT_WRITE = "COMPANY_TENANT_WRITE",
    USER_READ = "USER_READ",
    USER_WRITE = "USER_WRITE",
    RANCH_READ = "RANCH_READ",
    /** Crear / editar / eliminar rancho (solo SaaS y administrador). */
    RANCH_WRITE = "RANCH_WRITE",
    PADDOCK_READ = "PADDOCK_READ",
    PADDOCK_WRITE = "PADDOCK_WRITE",
    MEMBERSHIP_READ = "MEMBERSHIP_READ",
    MEMBERSHIP_WRITE = "MEMBERSHIP_WRITE",
    ANIMAL_READ = "ANIMAL_READ",
    ANIMAL_WRITE = "ANIMAL_WRITE",
    ANIMAL_WORK_SESSION_READ = "ANIMAL_WORK_SESSION_READ",
    ANIMAL_WORK_SESSION_WRITE = "ANIMAL_WORK_SESSION_WRITE",
    REFERENCE_SAMPLE_READ = "REFERENCE_SAMPLE_READ",
    REFERENCE_SAMPLE_WRITE = "REFERENCE_SAMPLE_WRITE",
}

export const PERMISSION_ROLE_MAP: Record<Permission, UserRole[]> = {
    [Permission.COMPANY_READ]: [UserRole.SAAS_OWNER],
    [Permission.COMPANY_WRITE]: [UserRole.SAAS_OWNER],
    [Permission.COMPANY_TENANT_READ]: [UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.COMPANY_TENANT_WRITE]: [UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.USER_READ]: [UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.USER_WRITE]: [UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.RANCH_READ]: [UserRole.RANCH_STAFF, UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.RANCH_WRITE]: [UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.PADDOCK_READ]: [UserRole.RANCH_STAFF, UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.PADDOCK_WRITE]: [UserRole.RANCH_STAFF, UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.MEMBERSHIP_READ]: [UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.MEMBERSHIP_WRITE]: [UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.ANIMAL_READ]: [UserRole.RANCH_STAFF, UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.ANIMAL_WRITE]: [UserRole.RANCH_STAFF, UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.ANIMAL_WORK_SESSION_READ]: [UserRole.RANCH_STAFF, UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.ANIMAL_WORK_SESSION_WRITE]: [UserRole.RANCH_STAFF, UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.REFERENCE_SAMPLE_READ]: [UserRole.RANCH_STAFF, UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
    [Permission.REFERENCE_SAMPLE_WRITE]: [UserRole.ADMINISTRATOR, UserRole.SAAS_OWNER],
};
