import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    private users = [];

    async create(user) {
        this.users.push({ id: Date.now(), ...user });
        return { message: 'User registered successfully' };
    }

    async findByEmail(email: string) {
        return this.users.find(user => user.email === email);
    }
}
