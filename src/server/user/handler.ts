import {User} from './model';

export class UserHandler {

    public async searchUserByUsername(username: string){
        return await User.findOne({
            username: username,
        });
    }

    public async findUserByEmail(email: string) {
        return await User.findOne({
            email: email,
        });
    }

    public async createNewUserOnSignUp(user: any) {
        let searchedUser = await this.searchUserByUsername(user.username);
        searchedUser = !searchedUser ? await this.findUserByEmail(user.email) : searchedUser;
        return !searchedUser ? await User.create(user) : null;
    }
}
