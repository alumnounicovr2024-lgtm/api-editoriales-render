require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// CONEXIÓN A MYSQL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10
});

// INICIO
app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Editoriales funcionando"
  });
});

// CONSULTAR EDITORIALES
app.get("/editoriales", async (req, res) => {
  try {
    const [datos] = await db.query(
      "SELECT * FROM editorial"
    );
    res.json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al consultar editoriales"
    });
  }
});

// REGISTRAR EDITORIAL
app.post("/editoriales", async (req, res) => {
  try {
    const { NomEditorial, Email, Pais } = req.body;

    if (!NomEditorial || !Email || !Pais) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios"
      });
    }

    const [resultado] = await db.execute(
      "INSERT INTO editorial (NomEditorial, Email, Pais) VALUES (?, ?, ?)",
      [NomEditorial, Email, Pais]
    );

    res.status(201).json({
      mensaje: "Editorial registrada correctamente",
      id: resultado.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al registrar editorial"
    });
  }
});

// ACTUALIZAR EDITORIAL
app.put("/editoriales/:id", async (req, res) => {
  try {
    const { NomEditorial, Email, Pais } = req.body;

    if (!NomEditorial || !Email || !Pais) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios"
      });
    }

    const [resultado] = await db.execute(
      `UPDATE editorial
       SET NomEditorial=?, Email=?, Pais=?
       WHERE IdEditorial=?`,
      [NomEditorial, Email, Pais, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: "Editorial no encontrada"
      });
    }

    res.json({
      mensaje: "Editorial actualizada correctamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al actualizar editorial"
    });
  }
});

// ELIMINAR EDITORIAL
app.delete("/editoriales/:id", async (req, res) => {
  try {
    const [resultado] = await db.execute(
      "DELETE FROM editorial WHERE IdEditorial=?",
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: "Editorial no encontrada"
      });
    }

    res.json({
      mensaje: "Editorial eliminada correctamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al eliminar editorial"
    });
  }
});

// INICIAR SERVIDOR EN RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor iniciado en puerto " + PORT);
});
