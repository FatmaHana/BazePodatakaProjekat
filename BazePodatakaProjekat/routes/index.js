var express = require('express');
var router = express.Router();
const mysql = require('mysql2');

require('dotenv').config();


const config = {
  connectionLimit: process.env.DB_CONNECTION_LIMIT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectTimeout: process.env.DB_CONNECT_TIMEOUT,
  port: process.env.DB_PORT,
};
const pool = new mysql.createPool(config);


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/izvjestaj', function(req, res, next) {
  res.render('izvjestaj_forma');
});

router.get('/rezultat', function(req, res, next) {
  let {datum1, datum2, sort_order} = req.query;

  pool.getConnection(function(err, connection) {
    if(err) {
      console.error('Error acquiring database connection:', err.message);
      return res.status(500).send('Internal Server Error');
    }

    connection.query('call putninalog_p12(?,?,?)', [datum1, datum2, sort_order], function (err, result, field) {
      connection.release();
      if (err){
        console.error('Error executing query:', err.message);
        return res.status(500).send('Internal Server Error');
      }
      res.render('izvjestaj_rezultat', {result})
    });
  });
});

router.get('/vozaci', function(req, res, next) {
  pool.getConnection((err, conn) => {
    if(err) {
      console.error('Error acquiring database connection:', err.message);
      return res.status(500).send('Internal Server Error');
    }
    conn.query('select rv.ime, rv.prezime from RegistarVozaca rv', (err, result, field) => {
      conn.release();
      if (err){
        console.error('Error executing query:', err.message);
        return res.status(500).send('Internal Server Error');
      }
      res.render('pregled_vozaca', {result});
    })
  })
});

router.get('/vozac/:id', (req, res, next) => {
  pool.getConnection((error, connection) => {
    if(error)
      return res.status(404).send('Internal Server Error')
    connection.query('select * from RegistarVozaca rv where rv.vozac_id = ?', [req.params.id], (error, results, fields) => {
      connection.release();
      if(error)
        return res.status(500).send('Internal Server Error');
      res.send({results});
    })
  })
})

router.post('/vozac/dodaj', (req, res, next) => {
  let {ime, prezime, datum_isteka_licence, datum_isteka_dozvole, indikator_aktivnosti_vozaca} = req.body;
  pool.getConnection((error, connection) => {
    if(error)
      return res.status(404).send('Internal Server Error');
    connection.query('insert into RegistarVozaca (ime, prezime, datum_isteka_licence, datum_isteka_dozvole, indikator_aktivnosti_vozaca) values(?,?,?,?,?)', [ime, prezime, datum_isteka_licence, datum_isteka_dozvole, indikator_aktivnosti_vozaca], (error, results, fields) => {
      connection.release();
      if(error)
        return res.status(500).send('Internal Server Error');
      res.send('Inserted successfully!');
    })
  })

})

router.delete('/vozac/izbrisi/:id', (req, res, next) => {
  pool.getConnection((error, connection) => {
    if(error)
      res.status(500).send('Internal Server Error')
    connection.query('delete from RegistarVozaca where vozac_id = ?', [req.params.id], (error, results, fields) => {
      connection.release();
      if(error)
        res.status(500).send('Internal Server Error')
      res.send('Deleted successfully!')
    })
  })
})

router.get('/putninalog/:id', (req, res, next) => {
  pool.getConnection((error, connection) => {
    if(error)
      return res.status(404).send('Internal Server Error')
    connection.query('call putninalog_p14(?)', [req.params.id], (error, results, fields) => {
      connection.release();
      if(error)
        return res.status(500).send('Internal Server Error');
      res.send(results[0]);
    })
  })
})

module.exports = {router, config};
