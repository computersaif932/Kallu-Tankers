const container =
  document.getElementById("playersContainer");

const modal =
  document.getElementById("modal");

const closeBtn =
  document.getElementById("closeBtn");

const searchInput =
  document.getElementById("searchInput");

/* =========================
   ADMIN MODAL
========================= */

const adminModal =
  document.getElementById("adminModal");

const adminPassword =
  document.getElementById("adminPassword");

const adminLoginBtn =
  document.getElementById("adminLoginBtn");

const viewerBtn =
  document.getElementById("viewerBtn");

const adminOpenBtn =
  document.getElementById("adminOpenBtn");

/* =========================
   DATA
========================= */

let ADMIN_KEY = "";
let isAdminLoggedIn = false;
let allPlayers = [];

/* =========================
   DISABLE RESTORE SCROLL
========================= */

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.onload = () => {
  window.scrollTo(0, 0);
};

/* =========================
   CUSTOM POPUP
========================= */

function showPopup(
  title,
  message,
  type = "error"
) {

  const popup =
    document.getElementById("customPopup");

  const popupTitle =
    document.getElementById("popupTitle");

  const popupMessage =
    document.getElementById("popupMessage");

  const popupIcon =
    document.getElementById("popupIcon");

  popupTitle.innerText = title;
  popupMessage.innerText = message;

  if (type === "success") {

    popupIcon.innerHTML = "✓";

    popupIcon.style.background =
      "linear-gradient(135deg,#00c853,#64dd17)";

  } else {

    popupIcon.innerHTML = "⚠";

    popupIcon.style.background =
      "linear-gradient(135deg,#ff0055,#ff6a00)";
  }

  popup.style.display = "flex";

  setTimeout(() => {
    document.getElementById("popupBtn").focus();
  }, 100);
}

/* CLOSE POPUP */

document
  .getElementById("popupBtn")
  .addEventListener("click", () => {

    document.getElementById(
      "customPopup"
    ).style.display = "none";
  });

/* ENTER ON POPUP */

document.addEventListener(
  "keydown",
  (e) => {

    const popup =
      document.getElementById("customPopup");

    if (
      e.key === "Enter" &&
      popup.style.display === "flex"
    ) {

      document.getElementById(
        "popupBtn"
      ).click();
    }
  }
);

/* =========================
   NAVBAR SMOOTH SCROLL
========================= */

document
  .querySelectorAll(".nav-links a")
  .forEach(link => {

    link.addEventListener(
      "click",
      (e) => {

        e.preventDefault();

        const targetId =
          link
          .getAttribute("href")
          .replace("#", "");

        const target =
          document.getElementById(targetId);

        if (target) {

          target.scrollIntoView({
            behavior: "smooth"
          });
        }
      }
    );
  });

/* =========================
   OPEN ADMIN MODAL
========================= */

adminOpenBtn.addEventListener(
  "click",
  () => {

    adminModal.style.display = "flex";

    setTimeout(() => {
      adminPassword.focus();
    }, 100);
  }
);

/* CLOSE ADMIN */

viewerBtn.addEventListener(
  "click",
  () => {

    adminModal.style.display = "none";
  }
);

/* =========================
   ENTER KEY LOGIN
========================= */

adminPassword.addEventListener(
  "keydown",
  (e) => {

    if (e.key === "Enter") {
      adminLoginBtn.click();
    }
  }
);

/* =========================
   ADMIN LOGIN
========================= */

adminLoginBtn.addEventListener(
  "click",
  async () => {

    const enteredKey =
      adminPassword.value.trim();

    if (!enteredKey) {

      showPopup(
        "Empty Field",
        "Please Enter Password"
      );

      return;
    }

    try {

      const response =
        await fetch(
          "/players/999999",
          {

            method: "PUT",

            headers: {
              "Content-Type":
              "application/json",

              "x-admin-key":
              enteredKey
            },

            body: JSON.stringify({
              name: "test",
              role: "test",
              dob: "01-01-2000",
              phone: "0000000000"
            })
          }
        );

      if (
        response.status === 403
      ) {

        showPopup(
          "Access Denied",
          "Wrong Admin Password"
        );

        return;
      }

      ADMIN_KEY = enteredKey;

      isAdminLoggedIn = true;

      adminModal.style.display = "none";

      showPopup(
        "Welcome Admin",
        "Login Successful",
        "success"
      );

      fetchPlayers();

    } catch (error) {

      console.log(error);

      showPopup(
        "Server Error",
        "Login Failed"
      );
    }
  }
);

/* =========================
   FETCH PLAYERS
========================= */

async function fetchPlayers() {

  try {

    const response =
      await fetch("/players");

    const players =
      await response.json();

    allPlayers = players;

    renderPlayers(players);

  } catch (error) {

    console.log(error);

    container.innerHTML = `
      <h2 style="
      color:white;
      text-align:center;
      width:100%;
      margin-top:50px;
      ">
      Players Not Loading
      </h2>
    `;
  }
}

/* =========================
   RENDER PLAYERS
========================= */

function renderPlayers(players) {

  container.innerHTML = "";

  if (players.length === 0) {

    container.innerHTML = `
      <h2 style="
      color:white;
      text-align:center;
      width:100%;
      margin-top:50px;
      ">
      No Players Found
      </h2>
    `;

    return;
  }

  const fragment =
    document.createDocumentFragment();

  players.forEach((player) => {

    const card =
      document.createElement("div");

    card.className = "player-card";

    const age =
      calculateAge(player.dob);

    card.innerHTML = `

      <img
      src="${player.image}"
      loading="lazy"
      class="player-image">

      <div class="player-info">

        <h2>${player.name}</h2>

        <p>${player.role}</p>

        <p>Age: ${age}</p>

        ${
          isAdminLoggedIn
          ?
          `
          <div class="card-buttons">

            <button class="edit-btn">
              Edit
            </button>

            <button class="upload-btn">
              Upload
            </button>

          </div>
          `
          :
          ""
        }

      </div>
    `;

    card.addEventListener(
      "click",
      () => {

        openModal(player, age);
      }
    );

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
  "input",
  () => {

    const value =
      searchInput.value
      .toLowerCase();

    const filtered =
      allPlayers.filter(
        player =>
          player.name
          .toLowerCase()
          .includes(value)
      );

    renderPlayers(filtered);
  }
);

/* =========================
   AGE
========================= */

function calculateAge(dob) {

  if (!dob) return 0;

  const parts =
    dob.split("-");

  const birthDate =
    new Date(
      parts[2],
      parts[1] - 1,
      parts[0]
    );

  const diff =
    Date.now() -
    birthDate.getTime();

  const ageDate =
    new Date(diff);

  return Math.abs(
    ageDate.getUTCFullYear() -
    1970
  );
}

/* =========================
   OPEN MODAL
========================= */

function openModal(
  player,
  age
) {

  modal.style.display = "flex";

  document.getElementById(
    "modalImage"
  ).src = player.image;

  document.getElementById(
    "modalName"
  ).innerText = player.name;

  document.getElementById(
    "modalRole"
  ).innerText =
    `Role: ${player.role}`;

  document.getElementById(
    "modalDOB"
  ).innerText =
    `DOB: ${player.dob}`;

  document.getElementById(
    "modalAge"
  ).innerText =
    `Age: ${age}`;

  document.getElementById(
    "modalPlace"
  ).innerText =
    `Place: ${
      player.placeOfBirth ||
      "Not Available"
    }`;

  document.getElementById(
    "modalPhone"
  ).innerText =
    `Phone: ${
      player.phone ||
      "Not Available"
    }`;
}

/* CLOSE MODAL */

closeBtn.addEventListener(
  "click",
  () => {

    modal.style.display = "none";
  }
);

window.addEventListener(
  "click",
  (event) => {

    if (
      event.target === modal
    ) {

      modal.style.display = "none";
    }

    if (
      event.target === adminModal
    ) {

      adminModal.style.display = "none";
    }
  }
);

/* =========================
   LOADER
========================= */

window.addEventListener(
  "load",
  () => {

    const loader =
      document.getElementById("loader");

    setTimeout(() => {

      loader.style.opacity = "0";

      loader.style.visibility =
        "hidden";

    }, 1200);
  }
);

/* =========================
   GALLERY
========================= */

function openGallery(src){

  document.getElementById(
    "galleryModal"
  ).style.display = "flex";

  document.getElementById(
    "galleryModalImg"
  ).src = src;
}

function closeGallery(){

  document.getElementById(
    "galleryModal"
  ).style.display = "none";
}

function openGalleryPopup(){

  document.getElementById(
    "galleryPopup"
  ).style.display = "block";
}

function closeGalleryPopup(){

  document.getElementById(
    "galleryPopup"
  ).style.display = "none";
}

/* =========================
   AUTO LOAD
========================= */

fetchPlayers();