

export class AuthenticationService {

    private publicApis: string[];

    constructor(publicApis: string[]) {
        this.publicApis = publicApis;
    }

    public extractToken(ctx: any): string {
        const header = ctx.header.authorization;
        return header ? header.split(' ')[1] : null;
    }

    public isPublicAPI(api: string): boolean {
        let isPublic: boolean = false;
        for (const pubApi of this.publicApis) {
            const matched = api.startsWith(pubApi);
            if (matched) {
                isPublic = true;
                break;
            }
        }
        return isPublic;
    }

}
