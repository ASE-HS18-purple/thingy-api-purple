import * as jwt from 'jsonwebtoken';
import {readConfigFromFile} from '../util';

/**
 * Middleware to secure every request and to verify that the token is as expected.
 * @param ctx
 * @param next
 */
const enableSecurity = async (ctx: any, next: any) => {
    const originalURI = ctx.originalUrl;
    if (isPublicAPI(originalURI)) {
        await next();
    } else {
        const token = extractToken(ctx);
        if (!token) {
            ctx.throw('Not authorized!', 401);
        }
        const secretKey = readConfigFromFile('SECRET_KEY', '../auth-configs.json');
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

function extractToken(ctx: any): string {
    const header = ctx.header.authorization;
    const token = header ? header.split(' ')[1] : null;
    return token;
}

function isPublicAPI(api: string): boolean {
    let isPublic: boolean = false;
    const publicApis: string[] = readConfigFromFile('PUBLIC_APIS', '../server-configs.json') as string [];
    for (const pubApi of publicApis) {
        const matched = api.startsWith(pubApi);
        if (matched) {
            isPublic = true;
            break;
        }
    }
    return isPublic;
}

export {enableSecurity} ;
