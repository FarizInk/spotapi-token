import db from "./database.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

export const sendIndexView = async (req, res) => {
  const view = await Deno.readTextFile("./views/index.html");
  res.type(".html");
  res.send(view);
}

export const getScopes = (req, res) => {
  const scopes = config().SCOPES;
  let data: string[] = [];
  if (scopes !== undefined && scopes !== null && scopes !== "") {
    data = scopes.split(",");
  }
  res.send({
    data: data,
  })
};

export const getToken = (req, res) => {
  const data = db.queryEntries("SELECT * FROM tokens WHERE id = 1");
  res.send({
    data: data.length >= 1 ? data[0] : null,
  });
};

export const generateCode = (req, res) => {
  if (req.body.username === config().USERNAME && req.body.password === config().PASSWORD) {
    const state = (Math.random() + 1).toString(36).substring(7);
    let scopes = [];
    if (req.body.scopes !== undefined) {
      scopes = req.body.scopes.join(" ");
    } else {
      scopes = config().SCOPES.split(",");
    }
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${config().CLIENT_ID}&scope=${encodeURI(scopes)}&state=${encodeURI(state)}&redirect_uri=${encodeURI(config().APP_BASE_URL + ":" + config().PORT + "/callback")}`);
  } else {
    res.redirect('/')
  }
}

export const callback = async (req, res) => {
  if (req.query.error === undefined) {

    const getToken = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        'Authorization': 'Basic ' + btoa(config().CLIENT_ID + ':' + config().CLIENT_SECRET),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code: req.query.code,
        redirect_uri: config().APP_BASE_URL + ":" + config().PORT + "/callback",
        grant_type: "authorization_code",
      }),
    });

    if (getToken.status === 200) {
      const resp = await getToken.json();
      db.query("UPDATE tokens SET access_token=?, token_type=?, expires_in=?, refresh_token=?, scope=? WHERE id=1", [resp.access_token, resp.token_type, resp.expires_in, resp.refresh_token, resp.scope]);
      res.redirect('/token');
    }
  } else {
    res.redirect('/')
  }
}

export const getProfile = async (req, res) => {
  const data = db.queryEntries("SELECT * FROM tokens WHERE id = 1");
  if (data.length >= 1) {
    const action = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + data[0].access_token,
        'Content-Type': 'application/json'
      }
    });

    if (action.status === 200) {
      const resp = await action.json();
      res.send({
        data: resp,
      })
    } else {
      const resp = await action.json();
      console.log("Something wrong when fetch user profile:");
      console.log(resp);
      res.setStatus(404).send({
        data: null,
      })
    }
  } else {
    res.setStatus(404).send({
      data: null,
    })
  }
};
