interface User { 
    id?: number;
    accountNumber?: string,
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export default User;