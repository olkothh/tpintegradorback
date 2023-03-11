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

app.get('/', getAllalumnos);
app.post('/', createAlumno);
app.put("/:id", updateAlumno);
app.delete("/:id", deleteAlumno);




function getAllalumnos(req, res) {

    connection.query("SELECT * FROM alumno", function (err, result, fields) {
        if (err) {
            res.status(500).send(err)

        }
        else {
            res.json({ result })
        }
    });

}

function createAlumno(req, res) {
    const { nombre,apellido,dni } = req.body
    connection.query("INSERT INTO alumno (nombre,apellido,dni) values(?,?,?)", [nombre,apellido,dni]),
        function (err, result, fields) {
            if (err) { res.status(500).send(err) }

            else {
                res.status(201).json({ result })

            }
            connection.end();
        }

}

function updateAlumno(req, res) {
    const { nombre,apellido,dni } = req.body
    const{id}=req.params
    connection.query("UPDATE alumno SET nombre=?,apellido=?,dni=? WHERE id=?",[nombre,apellido,dni,id]),
    function (err, result, fields) {
        if (err) { res.status(500).send(err) }

        else {
            res.status(201).json({ result })

        }
        connection.end();
    }
}

function deleteAlumno(req, res){
    const{id}=req.params
    connection.query("DELETE FROM alumno WHERE id=?",[id]),
    function (err, result, fields) {
        if (err) { res.status(500).send(err) }

        else {
            res.status(201).json({ result })

        }
        connection.end();
    }
}

module.exports = app;