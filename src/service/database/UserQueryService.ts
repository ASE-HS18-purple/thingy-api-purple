import {IUser, User} from '../../models/User';

export class UserQueryService {

    public searchUserByUsername = async (username: string): Promise<IUser> => {
        return await User.findOne({
            username: username,
        });
    };

    public findUserByEmail = async (email: string): Promise<IUser> => {
        return await User.findOne({
            email: email,
        });
    };

    public createNewUserOnSignUp = async (user: any): Promise<IUser> | null => {
        let searchedUser = await this.searchUserByUsername(user.username);
        searchedUser = !searchedUser ? await this.findUserByEmail(user.email) : searchedUser;
        return !searchedUser ? await User.create(user) : null;
    };
}
