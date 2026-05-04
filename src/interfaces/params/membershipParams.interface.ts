export interface IGetRoleMembershipParams {
    uuid_user: string,
    uuid_ranch: string
}

export interface IRemoveRoleMembershipParams {
    uuid_user: string,
    uuid_ranch: string
}

export interface IGetMembershipByUserParams {
    uuid_user: string,
}

export interface IGetMembershipByRanchParams {
    uuid_ranch: string
}
