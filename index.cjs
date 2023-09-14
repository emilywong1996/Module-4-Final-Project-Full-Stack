const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

require('dotenv').config();

const port = process.env.PORT;

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(async function(req, res, next) {
  try {
    req.db = await pool.getConnection();
    req.db.connection.config.namedPlaceholders = true;

    await req.db.query(`SET SESSION sql_mode = "TRADITIONAL"`);
    await req.db.query(`SET time_zone = '-8:00'`);

    await next();

    req.db.release();
  } catch (err) {
    console.log(err);
    if (req.db) req.db.release();
    throw err;
  }
});

app.use(express.json());

app.post('/data', async function(req, res) {
  try {
    const { equipment, year, breakdown_rate } = req.body;
    
    const query = await req.db.query(
      `INSERT INTO equipment_data (equipment, year, breakdown_rate) 
       VALUES (:equipment, :year, :breakdown_rate)`,
      {
        equipment,
        year,
        breakdown_rate,
      }
    );
    
    res.json('Data point successfully added!');
  } catch (err) {
    res.json('Error!')
  }
});

app.get('/data/:equipment', async function(req, res) {
  try {
    const { equipment } = req.params;

    const [query] = await req.db.query(`
      SELECT * FROM equipment_data WHERE equipment = :equipment AND NOT deleted_flag = 1 ORDER BY year ASC`,
      {
        equipment
      }
    );

    res.json(query);
  } catch (err) {
    res.json('Error!')
  }
});

app.put('/data', async function(req,res) {
  try {
  
    const { id, equipment, year, breakdown_rate } = req.body;
  
    const query = await req.db.query(
      `UPDATE equipment_data
        SET equipment = :equipment, year = :year, breakdown_rate = :breakdown_rate WHERE id = :id`,
      {
        id,
        equipment,
        year,
        breakdown_rate,
      }
    );
    res.json('Data successfully updated!');
  } catch (err) {
    res.json('Error!')
  }
});


app.delete('/data/:id', async function(req, res) {
  try {

    const { id } = req.params;

    const query = await req.db.query(
      `UPDATE equipment_data
        SET deleted_flag = 1 WHERE id = :id`,
      {
        id,
      }
    );

    res.json('Data successfully deleted!')
  } catch (err) {
    res.json('Error!')
  }
});

app.post('/register', async function (req, res) {
  try {
    let encodedUser;

    await bcrypt.hash(req.body.password, 10).then(async hash => {
      try {
        const [user] = await req.db.query(`
          INSERT INTO user (username, password)
          VALUES (:username, :password);
        `, {
          username: req.body.username,
          password: hash
        });

        encodedUser = jwt.sign(
          {
            userId: user.insertId,
            ...req.body
          },
          process.env.JWT_KEY
        );
      } catch (err) {
        console.log('Error!', err);
      }
    });
    res.json({ jwt: encodedUser});
  } catch (err) {
    res.json('Error!', err);
  }
});

app.post('/login', async function (req, res) {
  try {
    const { username, password } = req.body;
    const [[user]] = await req.db.query(`SELECT * FROM user WHERE username = :username`
    ,{
      username
    });

    if (!user) res.json('Email not found');
    const dbPassword = `${user.password}`
    const compare = await bcrypt.compare(password, dbPassword);

    if (compare) {
      const payload = {
        userId: user.id,
        username: user.username,
      }
      
      const encodedUser = jwt.sign(payload, process.env.JWT_KEY);

      res.json({ jwt: encodedUser });
    } else {
      res.json('Password not found');
    }
    
  } catch (err) {
    console.log('Error!', err);
  }
});

app.use(async function verifyJwt(req, res, next) {
  if (!req.headers.authorization) {
    res.json('Invalid authorization, no authorization headers');
  }

  const [scheme, token] = req.headers.authorization.split(' ');

  if (scheme !== 'Bearer') {
    res.json('Invalid authorization, invalid authorization scheme');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY);
    req.user = payload;
  } catch (err) {
    if (
      err.message &&
      (err.message.toUpperCase() === 'INVALID TOKEN' ||
      err.message.toUpperCase() === 'JWT EXPIRED')
    ) {
      req.status = err.status || 500;
      req.body = err.message;
      req.app.emit('jwt-error', err, req);
    } else {
      throw ((err.status || 500), err.message);
    }
  }

  await next();
});

app.listen(port, () => console.log(`229 Final Project listening on http://localhost:${port}`));