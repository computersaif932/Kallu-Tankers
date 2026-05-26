const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

const app = express();

/* =========================
   PORT
========================= */

const PORT = process.env.PORT || 3000;

/* =========================
   ADMIN SECRET KEY
========================= */

const ADMIN_KEY = "00725426";

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =========================
   DATA FILE
========================= */

const DATA_FILE = path.join(
  __dirname,
  "playersData.json"
);

/* =========================
   CREATE FILE IF NOT EXISTS
========================= */

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}

/* =========================
   CREATE UPLOADS FOLDER
========================= */

const uploadsFolder = path.join(
  __dirname,
  "uploads"
);

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
}

/* =========================
   MULTER STORAGE
========================= */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, uploadsFolder);

  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() +
      path.extname(file.originalname)
    );

  }

});

const upload = multer({ storage });

/* =========================
   READ PLAYERS
========================= */

function readPlayers() {

  try {

    const data = fs.readFileSync(
      DATA_FILE,
      "utf8"
    );

    return JSON.parse(data || "[]");

  } catch (err) {

    return [];

  }

}

/* =========================
   WRITE PLAYERS
========================= */

function writePlayers(data) {

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2)
  );

}

/* =========================
   VERIFY ADMIN
========================= */

function verifyAdmin(
  req,
  res,
  next
) {

  const adminKey =
    req.headers["x-admin-key"];

  if (adminKey !== ADMIN_KEY) {

    return res.status(403).json({

      message:
      "Unauthorized Access"

    });

  }

  next();

}

/* =========================
   HOME ROUTE
========================= */

app.get("/", (req, res) => {

  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );

});

/* =========================
   GET PLAYERS
========================= */

app.get(
  "/players",
  (req, res) => {

    const players = readPlayers();

    res.json(players);

  }
);

/* =========================
   UPDATE PLAYER
========================= */

app.put(
  "/players/:id",
  verifyAdmin,
  (req, res) => {

    const id =
      parseInt(req.params.id);

    const players =
      readPlayers();

    const player =
      players.find(
        p => p.id === id
      );

    if (!player) {

      return res.status(404).json({

        message:
        "Player not found"

      });

    }

    player.name =
      req.body.name;

    player.role =
      req.body.role;

    player.dob =
      req.body.dob;

    player.phone =
      req.body.phone;

      player.placeOfBirth =
  req.body.placeOfBirth;

    writePlayers(players);

    res.json({

      message:
      "Player updated successfully",

      player

    });

  }
);

/* =========================
   UPLOAD PLAYER PHOTO
========================= */

app.post(
  "/upload/:id",
  verifyAdmin,
  upload.single("photo"),
  (req, res) => {

    const id =
      parseInt(req.params.id);

    const players =
      readPlayers();

    const player =
      players.find(
        p => p.id === id
      );

    if (!player) {

      return res.status(404).json({

        message:
        "Player not found"

      });

    }

    if (!req.file) {

      return res.status(400).json({

        message:
        "No file uploaded"

      });

    }

    player.image =
      `/uploads/${req.file.filename}`;

    writePlayers(players);

    res.json({

      message:
      "Photo uploaded successfully",

      image:
      player.image

    });

  }
);

/* =========================
   404 ROUTE
========================= */

app.use((req, res) => {

  res.status(404).json({

    message:
    "Route not found"

  });

});

/* =========================
   SERVER START
========================= */

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Server running on port ${PORT}`
  );

});