const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = 3000;

/* =========================
   ADMIN SECRET KEY
========================= */

const ADMIN_KEY = "vpl2026admin";

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const DATA_FILE = "./playersData.json";

/* =========================
   MULTER STORAGE
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
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
   READ & WRITE FUNCTIONS
========================= */

function readPlayers() {

  return JSON.parse(
    fs.readFileSync(DATA_FILE)
  );
}

function writePlayers(data) {

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2)
  );
}

/* =========================
   ADMIN VERIFY FUNCTION
========================= */

function verifyAdmin(
  req,
  res,
  next
) {

  const adminKey =
    req.headers["x-admin-key"];

  if (
    adminKey !== ADMIN_KEY
  ) {

    return res.status(403).json({
      message:
      "Unauthorized Access"
    });
  }

  next();
}

/* =========================
   GET PLAYERS (PUBLIC)
========================= */

app.get(
  "/players",
  (req, res) => {

    const players =
      readPlayers();

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

    /* UPDATE DATA */

    player.name =
      req.body.name;

    player.role =
      req.body.role;

    player.dob =
      req.body.dob;

    player.phone =
      req.body.phone;

    /* SAVE FILE */

    writePlayers(players);

    res.json({

      message:
      "Player updated successfully",

      player
    });
  }
);

/* =========================
   UPLOAD PHOTO
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

    player.image =
      `/uploads/${req.file.filename}`;

    writePlayers(players);

    res.json({

      message:
      "Photo uploaded",

      image:
      player.image
    });
  }
);

/* =========================
   SERVER START
========================= */

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );
});