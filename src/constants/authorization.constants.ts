import { UserRole } from "../interfaces/roles/roles.interface";

export enum Permission {
    COMPANY_READ = 'COMPANY_READ',
    COMPANY_WRITE = 'COMPANY_WRITE',
    USER_READ = 'USER_READ',
    USER_WRITE = 'USER_WRITE',
    RANCH_READ = 'RANCH_READ',
    RANCH_WRITE = 'RANCH_WRITE',
    MEMBERSHIP_READ = 'MEMBERSHIP_READ',
    MEMBERSHIP_WRITE = 'MEMBERSHIP_WRITE',
    CATTLE_READ = 'CATTLE_READ',
    CATTLE_WRITE = 'CATTLE_WRITE',
    CATTLE_WORK_SESSION_READ = 'CATTLE_WORK_SESSION_READ',
    CATTLE_WORK_SESSION_WRITE = 'CATTLE_WORK_SESSION_WRITE',
    REFERENCE_SAMPLE_READ = 'REFERENCE_SAMPLE_READ',
    REFERENCE_SAMPLE_WRITE = 'REFERENCE_SAMPLE_WRITE',
}

export const PERMISSION_ROLE_MAP: Record<Permission, UserRole[]> = {
    [Permission.COMPANY_READ]: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.COMPANY_WRITE]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.USER_READ]: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.USER_WRITE]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.RANCH_READ]: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.RANCH_WRITE]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.MEMBERSHIP_READ]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.MEMBERSHIP_WRITE]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.CATTLE_READ]: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.CATTLE_WRITE]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.CATTLE_WORK_SESSION_READ]: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.CATTLE_WORK_SESSION_WRITE]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.REFERENCE_SAMPLE_READ]: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    [Permission.REFERENCE_SAMPLE_WRITE]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
};
