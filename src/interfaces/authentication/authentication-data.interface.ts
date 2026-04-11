export interface LoginData {
    user_name: string;
    password: string;
}

export interface ResetPasswordData {
    uuid_user: string;
    code: string;
    password: any;
}

export interface LogoutData {
    user_name: string;
}
