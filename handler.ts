import db from "./database.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

export const sendIndexView = async (context) => {
  const view = await Deno.readTextFile("./views/index.html");
  context.response.body = view;
};

export const getScopes = (context) => {
  const scopes = config().SCOPES;
  let data: string[] = [];
  if (scopes !== undefined && scopes !== null && scopes !== "") {
    data = scopes.split(",");
  }
  context.response.body = {
    data: data,
  };
};

export const getToken = (context) => {
  const data = db.queryEntries("SELECT * FROM tokens WHERE id = 1");
  context.response.body = {
    data: data.length >= 1 ? data[0] : null,
  };
};

export const generateCode = async (context) => {
  const body = context.request.body();
  const value = await body.value;

  if (
    value.get("username") === config().USERNAME &&
    value.get("password") === config().PASSWORD
  ) {
    const state = (Math.random() + 1).toString(36).substring(7);
    let scopes = [];

    if (value.getAll("scopes[]") !== undefined) {
      scopes = value.getAll("scopes[]").join(" ");
    } else {
      scopes = config().SCOPES.split(",");
    }
    context.response.redirect(
      `https://accounts.spotify.com/authorize?response_type=code&client_id=${
        config().CLIENT_ID
      }&scope=${encodeURI(scopes)}&state=${encodeURI(
        state
      )}&redirect_uri=${encodeURI(config().REDIRECT_URI_HOST + "/callback")}`
    );
  } else {
    context.response.redirect("/");
  }
};

export const callback = async (context) => {
  const value = context.request.url.searchParams;

  if (value.get("error") === null) {
    const getToken = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + btoa(config().CLIENT_ID + ":" + config().CLIENT_SECRET),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: value.get("code"),
        redirect_uri: config().REDIRECT_URI_HOST + "/callback",
        grant_type: "authorization_code",
      }),
    });

    if (getToken.status === 200) {
      const resp = await getToken.json();
      db.query(
        "UPDATE tokens SET access_token=?, token_type=?, expires_in=?, refresh_token=?, scope=? WHERE id=1",
        [
          resp.access_token,
          resp.token_type,
          resp.expires_in,
          resp.refresh_token,
          resp.scope,
        ]
      );
      context.response.redirect("/token");
    }
  } else {
    context.response.redirect("/");
  }
};

export const refresh = async (context) => {
  const data = db.queryEntries("SELECT * FROM tokens WHERE id = 1");
  if (data.length >= 1) {
    
    const getToken = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + btoa(config().CLIENT_ID + ":" + config().CLIENT_SECRET),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: data[0].refresh_token,
      }),
    });

    if (getToken.status === 200) {
      const resp = await getToken.json();
      
      db.query(
        "UPDATE tokens SET access_token=?, token_type=?, expires_in=?, scope=? WHERE id=1",
        [
          resp.access_token,
          resp.token_type,
          resp.expires_in,
          resp.scope,
        ]
      );
      
      context.response.body = {
        data: resp,
      };
    }
  } else {
    context.response.status = 404;
    context.response.body = {
      data: null,
    };
  }
};

export const getProfile = async (context) => {
  const data = db.queryEntries("SELECT * FROM tokens WHERE id = 1");
  if (data.length >= 1) {
    const action = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + data[0].access_token,
        "Content-Type": "application/json",
      },
    });

    if (action.status === 200) {
      const resp = await action.json();
      context.response.body = {
        data: resp,
      };
    } else {
      const resp = await action.json();
      console.log("Something wrong when fetch user profile:");
      console.log(resp);
      context.response.status = 404;
      context.response.body = {
        data: null,
      };
    }
  } else {
    context.response.status = 404;
    context.response.body = {
      data: null,
    };
  }
};
