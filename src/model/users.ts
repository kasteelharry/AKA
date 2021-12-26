export interface BasicUser {
    id: number;
}

export interface User extends BasicUser {
    name: string;
    dateOfBirth?: Date;
    bankAccount?: string;
    active?: boolean;
}