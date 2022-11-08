import { Application, Router, send, Status } from "https://deno.land/x/oak/mod.ts";
import { dirname, join } from "https://deno.land/x/opine@2.3.3/deps.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { getToken, getScopes, sendIndexView, generateCode, callback, getProfile } from "./handler.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const router = new Router();
const __dirname = dirname(import.meta.url);

const port = parseInt(config().PORT) || 3000;

router.get("/", sendIndexView);
router.get("/scopes", getScopes);
router.get("/token", getToken);
router.post("/generate", generateCode);
router.get("/callback", callback);
router.get("/profile", getProfile);


const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods())

// static content
app.use(async (context, next) => {
    const root = `${Deno.cwd()}/public`
    try {
        await context.send({ root })
    } catch {
        next()
    }
})

// page not found
app.use(context => {
  context.response.status = Status.NotFound
  context.response.body = `"${context.request.url}" not found`
})

console.info(`CORS-enabled web server listening on port ${port}`);
await app.listen({ port });