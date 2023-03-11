const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'integrador'
});

connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("DB Conectada correctamente");
    }
});

 app.post('/login',loginusuario); 
 /*app.post('/login', (req, res) => {
    const { nickname, password } = req.body;
     const nickname = req.body.nickname;
    const password = req.body.password; 

    connection.query('SELECT * FROM usuario WHERE nickname = ? AND password = ?', [nickname, password], (error, results, fields) => {
        if (error) throw error;
        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, 'siliconsecret', { expiresIn: '24h' });
            res.send({ token: token });

        } else {
            res.status(401).send('Nickname o password incorrectos');
        }
    });
}); */



function loginusuario(req, res) {
    const nickname = req.body.nickname;
    const password = req.body.password;
    connection.query('SELECT * FROM usuario WHERE nickname = ? AND password = ?', [nickname, password], (error, results, fields) => {
        if (error) throw error;
        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, 'siliconsecret', { expiresIn: '24h' });
            res.send({ token: token });
        } else {
            res.status(401).send('Nickname o password incorrectos');
        }
    });
};

function verificarToken(req, res, next) {
    if (!req.headers["authorization"]) {
        res.status(403).send("No se recibio header autentication");
    } else {
        try {
            const token = req.headers["authorization"];
            const verified = jwt.verify(token, "siliconsecret");
            if (verified) {
                next();
            } else {
                res.status(403).send("Error autentication");
            }
        } catch (error) {
            res.status(403).send("Error autentication");
        }
    }
}

module.exports = { app, verificarToken };