const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3306;
const jwt = require('jsonwebtoken');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'integrador',
  port: port,
});
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión: ' + err.stack);
    return;
  }

  console.log('Conectado como ID ' + connection.threadId);
});

app.use(express.json());
app.get('/', (req, res) => {
  res.send('API de Node.js');
});

//_________________________________________ALUMNOS________________________________________________________________________________________________________


// OBTENER LISTA alumnos
app.get('/api/alumnos', (req, res) => {
  connection.query('SELECT * FROM alumno', (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});
//LISTAR alumno
app.get('/api/alumnos/:id', (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM alumno WHERE id = ?', [id], (error, results, fields) => {
    if (error) throw error;
    if (results.length > 0) {
      res.send(results[0]);
    } else {
      res.status(404).send('Estudiante no encontrado');
    }
  });
});
// CREAR alumno
app.post('/api/alumnos', (req, res) => {
  const nombre = req.body.nombre;
  const apellido = req.body.apellido;
  const dni = req.body.dni;
  connection.query('INSERT INTO alumno (nombre, apellido, dni) VALUES (?, ?, ?)', [nombre, apellido, dni], (error, results, fields) => {
    if (error) throw error;
    res.send({
      id: results.insertId,
      nombre: nombre,
      apellido: apellido,
      dni: dni
    });
  });
});
//MODIFICAR alumno
app.put('/api/alumnos/:id', (req, res) => {
  const id = req.params.id;
  const nombre = req.body.nombre;
  const apellido = req.body.apellido;
  const dni = req.body.dni;
  connection.query('UPDATE alumno SET nombre = ?, apellido = ?, dni = ? WHERE id = ?', [nombre, apellido, dni, id], (error, results, fields) => {
    if (error) throw error;
    if (results.affectedRows > 0) {
      res.send({
        id: id,
        nombre: nombre,
        apellido: apellido,
        dni: dni
      });
    } else {
      res.status(404).send('Estudiante no encontrado');
    }
  });
});
//ELIMINAR alumno
app.delete('/api/alumnos/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM alumno WHERE id = ?', [id], (error, results, fields) => {
    if (error) throw error;
    if (results.affectedRows > 0) {
      res.send('Estudiante eliminado');
    } else {
      res.status(404).send('Estudiante no encontrado');
    }
  });
});


//________________________________CURSOS________________________________________________________________________________________________________________________________


// LISTAR cursos
app.get('/api/cursos', (req, res) => {
  connection.query('SELECT * FROM curso', (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});

// ELIMINAR cursos
app.delete('/api/cursos/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM curso WHERE id = ?', [id], (error, results, fields) => {
    if (error) throw error;
    if (results.affectedRows > 0) {
      connection.query('DELETE FROM alumno_curso WHERE id_curso = ?', [id], (error2, results2, fields2) => {
        if (error2) throw error2;
        res.send('Curso eliminado');
      });
    } else {
      res.status(404).send('Curso no encontrado');
    }
  });
});

// CREAR cursos
app.post('/api/cursos', (req, res) => {
  const nombre = req.body.nombre;
  const descripcion = req.body.descripcion;
  const imagen = req.body.imagen;
  const anio = req.body.anio;
  const activo = req.body.activo;
  connection.query('INSERT INTO curso (nombre, descripcion, imagen, anio, activo) VALUES (?, ?, ?, ?, ?)', [nombre, descripcion, imagen, anio, activo], (error, results, fields) => {
    if (error) throw error;
    res.send({
      id: results.insertId,
      nombre: nombre,
      descripcion: descripcion,
      imagen: imagen,
      anio: anio,
      activo: activo
    });
  });
});

// MODIFICAR cursos
app.put('/api/cursos/:id', (req, res) => {
  const id = req.params.id;
  const nombre = req.body.nombre;
  const descripcion = req.body.descripcion;
  const imagen = req.body.imagen;
  const anio = req.body.anio;
  const activo = req.body.activo;
  connection.query('UPDATE curso SET nombre = ?, descripcion = ?, imagen = ?, anio = ?, activo = ? WHERE id = ?', [nombre, descripcion, imagen, anio, activo, id], (error, results, fields) => {
    if (error) throw error;
    if (results.affectedRows > 0) {
      res.send({
        id: id,
        nombre: nombre,
        descripcion: descripcion,
        imagen: imagen,
        anio: anio,
        activo: activo
      });
    } else {
      res.status(404).send('Curso no encontrado');
    }
  });
});
// INSCRIBIR ALUMNO: Dado un ID de curso, y una lista de IDs de
// ALUMNOS cargar en alumno_curso la relación que corresponde a
// los alumnos inscriptos a dicho curso.
app.post('/api/cursos/:id/inscribir_alumnos', (req, res) => {
  const idCurso = req.params.id;
  const idsAlumnos = req.body.ids_alumnos;

  // Se inicia una transacción para asegurar que la operación se
  // complete por completo, es decir, que se inserten todas las filas
  // o no se inserte ninguna en caso de error.
  connection.beginTransaction((error) => {
    if (error) throw error;

    // Se eliminan primero las filas anteriores para garantizar que
    // no haya duplicados.
    connection.query('DELETE FROM alumno_curso WHERE id_curso = ?', [idCurso], (error, results, fields) => {
      if (error) {
        return connection.rollback(() => {
          throw error;
        });
      }

      // Se insertan las nuevas filas.
      const values = idsAlumnos.map((idAlumno) => {
        return [idAlumno, idCurso];
      });
      connection.query('INSERT INTO alumno_curso (id_alumno, id_curso) VALUES ?', [values], (error, results, fields) => {
        if (error) {
          return connection.rollback(() => {
            throw error;
          });
        }

        // Se confirma la transacción si todo ha ido bien.
        connection.commit((error) => {
          if (error) {
            return connection.rollback(() => {
              throw error;
            });
          }

          res.send('Alumnos inscriptos correctamente');
        });
      });
    });
  });
});

// LISTAR Alumnos para un ID de curso específico.
app.get('/api/cursos/:id/alumnos', (req, res) => {
  const idCurso = req.params.id;
  connection.query('SELECT a.* FROM alumno a INNER JOIN alumno_curso ac ON a.id = ac.id_alumno WHERE ac.id_curso = ?', [idCurso], (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});

//______________________________SEGURIDAD________________________________________________________________________________________________________________________________________ 

app.post('/api/login', (req, res) => {
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
});
