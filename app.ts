import { json, opine, urlencoded, serveStatic } from "https://deno.land/x/opine@2.3.3/mod.ts";
import { dirname, join } from "https://deno.land/x/opine@2.3.3/deps.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { getToken, getScopes, sendIndexView, generateCode, callback, getProfile } from "./handler.ts";

const app = opine();
const __dirname = dirname(import.meta.url);
app.use(json()); // for parsing application/json
app.use(urlencoded()); // for parsing application/x-www-form-urlencoded

app.use(serveStatic(join(__dirname, "public")));
app.use("/static", serveStatic(join(__dirname, "public")));

const port = parseInt(config().PORT) || 3000;

app.get("/", sendIndexView);
app.get("/scopes", getScopes);
app.get("/token", getToken);
app.post("/generate", generateCode);
app.get("/callback", callback);
app.get("/profile", getProfile);

app.listen(port, () =>
  console.log(`server has started on ${config().APP_BASE_URL}:${port} 🚀`)
);