import * as Router from 'koa-router';
import * as jwt from 'jsonwebtoken';
import {UserQueryService} from '../service/database/UserQueryService';
import {IUser} from '../models/User';
import {BaseController} from './BaseController';

export class AuthenticationController extends BaseController {

    userhandler: UserQueryService;
    protected zone: string = '';
    private secretKey: string;

    constructor(userHandler: UserQueryService, secretKey: string) {
        super();
        this.userhandler = userHandler;
        this.secretKey = secretKey;
    }

    getRoutes(router: Router): Router {
        router.post('/authenticate', this.authenticate);
        return router;
    }

    public authenticate = async (ctx: Router.IRouterContext) => {
        const requestBody = ctx.request.body as any;
        const usernameOrEmail: string = requestBody.usernameOrEmail;
        const password: string = requestBody.password;
        // Search the user based on email and (if necessary) username.
        const user: IUser = await this.searchUser(usernameOrEmail);
        // If the user is not found or password is not correct 403 status code.
        if (!user) ctx.throw('Unknown username or email', 401);
        if (password !== user.password) ctx.throw('The password is not correct!', 401);
        // Read the secret key and generate token.
        const token = await jwt.sign({user}, this.secretKey, {expiresIn: '2 days'});
        ctx.response.body = {
            token: token,
            user: user,
        };
    };

    public searchUser = async (usernameOrEmail: string): Promise<IUser> => {
        const userHandler = new UserQueryService();
        let user: any = await userHandler.searchUserByUsername(usernameOrEmail);
        user = !user ? await userHandler.findUserByEmail(usernameOrEmail) : user;
        return user;
    };

}