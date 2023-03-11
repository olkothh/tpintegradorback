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


app.get('/', getAllcurso);
app.delete('/curso/:id', deleteCurso);
app.post('/curso', createCurso);
app.put('/curso/:id', updateCurso);
app.post('/curso/:id/inscribir-alumnos', inscribirAlumnos);
app.get('/curso/:id/alumnos', getAlumnosPorCurso); 
app.get('/curso/:id',getcurso);

function getAllcurso(req, res) {
    connection.query("SELECT * FROM curso", function (err, result, fields) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ result });
        }
    });
}

function getcurso(req, res) {
    const id = req.params.id;
    connection.query("SELECT * FROM curso where id = ?",[id], function (err, result, fields) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ result });
        }
    });
}

function deleteCurso(req, res) {
    const id = req.params.id;
    connection.query("DELETE FROM curso WHERE id = ?", [id], function (err, result, fields) {
        if (err) {
            res.status(500).send(err);
        } else {
            // Eliminar las filas de alumno_curso correspondientes al ID de curso eliminado
            connection.query("DELETE FROM alumno_curso WHERE id_curso = ?", [id], function (err, result, fields) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.json({ message: `Curso con ID ${id} eliminado correctamente.` });
                }
            });
        }
    });
    connection.end();
}

function createCurso(req, res) {
    const { nombre, descripcion, imagen, anio, activo } = req.body;
    connection.query("INSERT INTO curso (nombre, descripcion, imagen, anio, activo) VALUES (?, ?, ?, ?, ?)",
        [nombre, descripcion, imagen, anio, activo],
        function (err, result, fields) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(201).json({ message: "Curso creado correctamente." });
            }
        }
    );
}

function updateCurso(req, res) {
    const id = req.params.id;
    const { nombre, descripcion, imagen, anio, activo } = req.body;
    connection.query("UPDATE curso SET nombre = ?, descripcion = ?, imagen = ?, anio = ?, activo = ? WHERE id = ?",
        [nombre, descripcion, imagen, anio, activo, id],
        function (err, result, fields) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ message: `Curso con ID ${id} actualizado correctamente.` });
            }
        }
    );
}

function inscribirAlumnos(req, res) {
  const { id } = req.params;
  const { alumnos } = req.body;
  const query = 'INSERT INTO alumno_curso (id_alumno, id_curso) VALUES ?';

  // Crear matriz de valores a insertar
  const values = alumnos.map((alumnoId) => [alumnoId, id]);

  connection.query(query, [values], (error, result) => {
      if (error) {
          res.status(500).send(error);
      } else {
          res.status(201).json({ result });
      }
  });
}


app.get('/curso/:id/alumnos', (req, res) => {
  const { id } = req.params; // ID del curso

  // Buscar los alumnos inscritos en el curso
  connection.query('SELECT alumno.* FROM alumno INNER JOIN alumno_curso ON alumno.id = alumno_curso.id_alumno WHERE alumno_curso.id_curso = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ result });
    }
  });
});

app.get('/curso/:id/alumnos', getAlumnosPorCurso);

function getAlumnosPorCurso(req, res) {
    const { id } = req.params;
    connection.query("SELECT alumno.* FROM alumno JOIN alumno_curso ON alumno.id = alumno_curso.id_alumno WHERE alumno_curso.id_curso = ?", [id], function (err, result, fields) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.json({ result });
        }
    });
} 

module.exports = app;