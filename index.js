//imports
const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_ice_db');
const app = express();

//static routes
app.use(express.json());
app.use(require("morgan")("dev"));

//app routes
app.get("/api/flavors", async (req, res, next) => {
    try {
      const SQL = `
          SELECT * from flavors ORDER BY id;
          `;
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (error) {
      next(error);
    }
  });

app.post("/api/flavors", async (req, res, next) => {
    try {
      const SQL = `
          INSERT INTO flavors(id, flavor)
          VALUES($1, $2)
          RETURNING *;
          `;
      const response = await client.query(SQL, [req.body.id, req.body.flavor]);
      res.send(response.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/flavors/:id', async (req, res, next) => {
    try {
      const SQL = `
        UPDATE flavors
        SET flavor=$1, is_favorite=$2, is_vegan=$3
        WHERE id=$4 RETURNING *
      `;
      const response = await client.query(SQL, [req.body.flavor, req.body.is_favorite, req.body.is_vegan, req.params.id]);
      res.send(response.rows[0]);
    } catch (err) {
      next(err);
    }
  });

app.delete("/api/flavors/:id", async (req, res, next) => {
    try {
      const SQL = `
          DELETE FROM flavors
          WHERE id=$1
      `;
      await client.query(SQL, [
        req.params.id
      ]);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

//function
const init = async () => {
    await client.connect();
    console.log("connected to database");
    let SQl = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY NOT NULL,
        flavor VARCHAR(55) NOT NULL,
        is_favorite BOOLEAN DEFAULT FALSE,
        is_vegan BOOLEAN DEFAULT FALSE
    );
    `;
    await client.query(SQl)
    console.log('tables created');
    SQL = `
    INSERT INTO flavors(id, flavor, is_favorite, is_vegan) VALUES(1, 'Vanilla', true, false);
    INSERT INTO flavors(id, flavor, is_favorite, is_vegan) VALUES(2, 'Double Cookie Crunch', false, true);
    INSERT INTO flavors(id, flavor, is_favorite, is_vegan) VALUES(3, 'Chocolate', true, false);
    INSERT INTO flavors(id, flavor, is_favorite, is_vegan) VALUES(4, 'Oatmeal Dream Pie', false, true);
    `;
    await client.query(SQL);
    console.log('data seeded');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
    console.log(`App listening in port ${PORT}`)});
};

init();