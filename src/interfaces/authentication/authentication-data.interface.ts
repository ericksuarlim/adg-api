export interface LoginData {
    user_name: string;
    password: string;
}

export interface ResetPasswordData {
    uuid_user: number;
    code: string;
    [key: string]: any;
}

export interface LogoutData {
    user_name: string;
}
