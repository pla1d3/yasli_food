const Koa = require('koa');
const Router = require('koa-router');
const BodyParser = require('koa-bodyparser');

const db = new (require('./db'));
const app = new Koa();
const router = new Router();

app.use(BodyParser());
app.use(router.routes());
app.listen(3333);

router.post('/food', async (ctx) => ctx.body = await db.getFood().then((res) => res));
router.post('/eated', async (ctx) => ctx.body = await db.getEated(ctx.request.body.token).then((res) => res));
router.post('/push', (ctx) => {
    db.pushEated(ctx.request.body);
    ctx.status = 200;
});
