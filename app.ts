import { json, opine, urlencoded } from "https://deno.land/x/opine@2.3.3/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { getToken, getScopes, sendIndexView, generateCode, callback } from "./handler.ts";

const app = opine();
app.use(json()); // for parsing application/json
app.use(urlencoded()); // for parsing application/x-www-form-urlencoded

const port = parseInt(config().PORT) || 3000;

app.get("/", sendIndexView);
app.get("/scopes", getScopes);
app.get("/token", getToken);
app.post("/generate", generateCode);
app.get("/callback", callback);

app.listen(port, () =>
  console.log(`server has started on ${config().APP_BASE_URL}:${port} 🚀`)
);