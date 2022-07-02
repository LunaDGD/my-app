const express = require("express");
const morgan = require("morgan");
const { Prohairesis } = require("prohairesis");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const mySQLstring = process.env.CLEARDB_DATABASE_URL;
const database = new Prohairesis(mySQLstring);

app
  .use(morgan("dev"))
  .use(express.static("public"))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())

  .get("/api/user", async (req, res) => {
    const users = await database.query(`
        SELECT
        *
        FROM
            User
        ORDER BY
            date_added DESC
    `);

    res.contentType("html");

    res.end(`
        ${users
          .map((user) => {
            return `<p>${user.first_name} ${user.last_name} is ${user.email} years old</p>`;
          })
          .join("")}
    `);
  })

  .post("/api/user", async (req, res) => {
    const body = req.body;

    await database.execute(
      `
    INSERT INTO User (
        first_name,
        last_name,
        email,
        date_added
    ) VALUES (
        @firstName,
        @lastName,
        @email,
        NOW()
    )
`,
      {
        firstName: body.first,
        lastName: body.last,
        email: body.email,
      }
    );

    res.end("Added user");
  })

  .listen(port, () => console.log(`Server listening on port ${port}`));
