export interface IUserManagerRepository<T> {
    manageUser(uuidUser: string): Promise<T | null>;
    findUserByName(name: string): Promise<T | null>;
    resetPassword(uuid_user: string, password: string): Promise<boolean>;
}
