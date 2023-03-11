const express = require('express');
const app = express();


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

app.get('/', getAll);
app.post('/', createUser);
app.put("/:id", updateUsuario);
app.delete("/:id", deleteUsuario);
/* app.post('/api/login',loginusuario); */



function getAll(req, res) {

    connection.query("SELECT * FROM usuario", function (err, result, fields) {
        if (err) {
            res.status(500).send(err)

        }
        else {
            res.json({ result })
        }
    });

}

function createUser(req, res) {
    const { email, nickname, password, rol } = req.body
    connection.query("INSERT INTO usuario(email,nickname,password,rol) values(?,?,?,?)", [email, nickname, password, rol]),
        function (err, result, fields) {
            if (err) { res.status(500).send(err) }

            else {
                res.status(201).json({ result })

            }
            connection.end();
        }

}

function updateUsuario(req, res) {
    const { email, nickname, password, rol } = req.body
    const{id}=req.params
    connection.query("UPDATE usuario SET email=?,nickname=?,password=?,rol=? WHERE id=?",[email, nickname, password, rol,id]),
    function (err, result, fields) {
        if (err) { res.status(500).send(err) }

        else {
            res.status(201).json({ result })

        }
        connection.end();
    }
}

function deleteUsuario(req, res){
    const{id}=req.params
    connection.query("DELETE FROM usuario WHERE id=?",[id]),
    function (err, result, fields) {
        if (err) { res.status(500).send(err) }

        else {
            res.status(201).json({ result })

        }
        connection.end();
    }
}

 /* function loginusuario (req, res) {
    const nickname = req.body.nickname;
    const password = req.body.password;
    connection.query('SELECT * FROM usuario WHERE nickname = ? AND password = ?', [nickname, password], (error, results, fields) => {
      if (error) throw error;
      if (results.length > 0) {
        const user = results[0];
        const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, 'secret-key', { expiresIn: '24h' });
        res.send({ token: token });
      } else {
        res.status(401).send('Nickname o password incorrectos');
      }
    });
  };
 */
module.exports = app;