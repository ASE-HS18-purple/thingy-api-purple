import * as jwt from 'jsonwebtoken';
import * as Koa from 'koa';
import {AuthenticationService} from '../service/AuthenticationService';

/**
 * Middleware to secure every request and to verify that the token is as expected.
 * @param authenticationService
 */
const enableSecurity = function (authenticationService: AuthenticationService, secretKey: string): Koa.Middleware {
    return async (ctx: any, next: any) => {
        const originalURI = ctx.originalUrl;
        if (authenticationService.isPublicAPI(originalURI)) {
            await next();
        } else {
            const token = authenticationService.extractToken(ctx);
            if (!token) {
                ctx.throw('Not authorized!', 401);
            }
            let user = null;
            try {
                user = await jwt.verify(token, secretKey);
            } catch (e) {
                ctx.throw(401, 'Not valid token. Expired token');
            }
            ctx.state.user = user;
            await next();
        }
    };
};

export {enableSecurity} ;
