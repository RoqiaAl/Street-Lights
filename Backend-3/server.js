//Starts the server and handles additional tasks
const connectDB = require("./config/db.config");
const http = require("http");
const dotenv = require("dotenv");
const app = require("./app");
dotenv.config({ path: "./config.env" });

const { init } = require("./controllers/utilities");
//Database connection string
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const start = async () => {
  try {
    await connectDB(DB);
    console.log("DB Connected");
  } catch (error) {
    console.log(error);
  }
};

let server;
server = http.createServer(app);
const port = process.env.PORT || 8900;
init(server); // Initialize Socket.IO with the server
require("./controllers/controlProfileController");
server.listen(port, () =>
  console.log(`Server is running and listening on ${port}`)
);

start();

//functions for 3rd party API
//functions relatd to OAuth 2.0 token
async function requestOAuthToken() {
  const url = "https://passport.tvilight.io/oauth/token";
  const params = new URLSearchParams();
  params.append("client_id", process.env.TVLIGHT_API_KEY);
  params.append("client_secret", process.env.secretKey);
  params.append("grant_type", "password");
  params.append("username", "443203036@student.ksu.edu.sa"); //optional
  params.append("password", process.env.userPassword); //optional

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(), // Pass form data as a URL-encoded string
    });

    if (!response.ok) {
      throw new Error(
        `Failed to obtain token: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json(); // Parse the JSON response
    console.log("OAuth 2.0 Token:", data);
    return data.access_token; // Extract and return the access token
  } catch (error) {
    console.error("Error:", error.message);
  }
}
//requestOAuthToken();
//refreshToken();
async function refreshToken() {
  const url = "https://passport.tvilight.io/oauth/token";
  const refreshToken = process.env.refreshToken;
  const params = new URLSearchParams();
  params.append("client_id", process.env.TVLIGHT_API_KEY);
  params.append("client_secret", process.env.secretKey);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(), // Send the data as form-encoded
    });

    if (!response.ok) {
      throw new Error(
        `Failed to refresh token: ${response.status} - ${response.statusText}`
      );
    }
    const data = await response.json(); // The new access token
    console.log("New access token:", data.access_token);
    // You would store the new access token and refresh token (if provided) for future use
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}
//fetchOrganizationsData();
async function fetchOrganizationsData() {
  try {
    const tvlightAPI = process.env.TVLIGHT_API_KEY;
    const key = process.env.secretKey;

    const response = await fetch("https://ctl.tvilight.io/api/organisations", {
      method: "GET",
      headers: {
        "x-api-key": tvlightAPI, // The API Key for identifying the request
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.accessToken}`, // Use the Bearer token
        Accept: "application/vnd.tvilight.v1.0+json", // Specify the API version
      },
    });

    if (!response.ok)
      throw new Error(
        `Could not fetch resource: ${response.status} - ${response.statusText}`
      );

    const data = await response.json();
    console.log("TVILIGHT API connection succesful!");
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
