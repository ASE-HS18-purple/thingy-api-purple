import * as jwt from 'jsonwebtoken';
import * as Router from 'koa-router';
import {UserHandler} from '../user';
import {readConfigFromFile} from '../util';

const router = new Router();

router.post('/authenticate', async (ctx) => {
    const requestBody = ctx.request.body as any;
    const usernameOrEmail: string = requestBody.usernameOrEmail;
    const password: string = requestBody.password;
    // Search the user based on email and (if necessary) username.
    const user = await searchUser(usernameOrEmail);
    // If the user is not found or password is not correct 403 status code.
    if (!user) ctx.throw('Unknown username or email', 401);
    if (password !== user.password) ctx.throw('The password is not correct!', 401);
    // Read the secret key and generate token.
    const secretKey = readConfigFromFile('SECRET_KEY', '../auth-configs');
    const token = await jwt.sign({user}, secretKey , {expiresIn: '2 days'});
    ctx.response.body = {
        token: token,
        user: user,
    };
});

const searchUser: any = async (usernameOrEmail: string) => {
    const userHandler = new UserHandler();
    let user: any = await userHandler.searchUserByUsername(usernameOrEmail);
    user = !user ? await userHandler.findUserByEmail(usernameOrEmail) : user;
    return user;
};

export const authenticationRouter = router.routes();
