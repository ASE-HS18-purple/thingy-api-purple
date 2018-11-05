import * as Router from 'koa-router';


export abstract class BaseController {

    protected abstract zone: string;

    protected abstract getRoutes(router: Router): Router;

    public routes = (router: Router) => {
        router.use(this.zone, this.getRoutes(new Router()).routes())
    }

}
