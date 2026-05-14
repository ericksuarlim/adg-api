export interface IUserManagerRepository<T> {
    manageUser(uuidUser: string): Promise<T | null>;
    findUserByName(name: string): Promise<T | null>;
    resetPassword(uuid_user: string, password: string): Promise<boolean>;
    findConflictingEmail(email: string, excludeUuid?: string): Promise<T | null>;
    findConflictingUsername(username: string, excludeUuid?: string): Promise<T | null>;
    findConflictingIdCard(idCard: string, uuidCompany: string, excludeUuid?: string): Promise<T | null>;
}
