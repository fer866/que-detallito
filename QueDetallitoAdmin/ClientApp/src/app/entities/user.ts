export class ListUser {
    id?: number;
    idRole?: number;
    roleName?: string;
    name?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    rfc?: string;
    lastAccess?: string;
    active?: boolean;
}

export class UserData {
    id?: number;
    name?: string;
    lastName?: string;
    email?: string;
    fullName?: string;
}

export const PasswordRegex: RegExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+.\-_#])[A-Za-z\d@$!%*?&+.\-_#]+$/);