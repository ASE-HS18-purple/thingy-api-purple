import {BaseController} from './BaseController';
import * as Router from 'koa-router';
import {UserQueryService} from '../service/database/UserQueryService';
import {IUser} from '../models/User';

export class UserController extends BaseController {

    userQuerier: UserQueryService;
    protected zone: string = '/users';

    constructor(userQuerier: UserQueryService) {
        super();
        this.userQuerier = userQuerier;
    }

    private getUser = async (ctx: Router.IRouterContext) => {
        const userName = ctx.params.username;
        const user = await this.userQuerier.searchUserByUsername(userName);
        this.sendUserResponse(ctx, user, 302, 404);
    };

    private getUserByEmail = async (ctx: Router.IRouterContext) => {
        const email = ctx.params.email;
        const user = await this.userQuerier.findUserByEmail(email);
        this.sendUserResponse(ctx, user, 302, 404);
    };

    private signUpUser = async (ctx: Router.IRouterContext) => {
        const user = ctx.request.body;
        const createdUser = await this.userQuerier.createNewUserOnSignUp(user);
        this.sendUserResponse(ctx, createdUser, 201, 400);
    };

    private sendUserResponse(ctx: Router.IRouterContext, user: IUser, successCode: number, failCode: number) {
        ctx.response.status = user ? successCode : failCode;
        ctx.response.body = user;
    }

    getRoutes(router: Router): Router {
        router.get('/username/:username', this.getUser);
        router.get('/email/:email', this.getUserByEmail);
        router.post('/signup', this.signUpUser);
        return router;
    }

}