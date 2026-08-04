export enum CorralWorkSessionStatus {
    DRAFT = 'DRAFT',
    IN_PROGRESS = 'IN_PROGRESS',
    CLOSED = 'CLOSED',
}

export enum CorralPlannedActivityType {
    ATTENDANCE = 'ATTENDANCE',
    HEALTH = 'HEALTH',
    PADDOCK_REORGANIZATION = 'PADDOCK_REORGANIZATION',
}

export const CORRAL_PLANNED_ACTIVITY_TYPES = Object.values(CorralPlannedActivityType);
