const ROWS = 9;
const COLUMNS = 15;
const MINES = 15;
const GRIDS = [];
let FAIL_DIALOG = null;
let COUNTER = {
  value: 0,
  callback: null,
  setValue: (entier) => {
    value = entier;
    if (callback) {
      callback(entier);
    }
  },
  setCallback: (func) => {
    callback = func;
  },
};
let timer = { sec: 0, gameEnded: false };
let interval;

function startGame() {
  initModel(ROWS, COLUMNS, MINES);
  displayGridQuery(ROWS, COLUMNS);
  displayMetaData();
}

function initModel(rows, columns, mines) {
  for (i = 0; i <= columns - 1; i++) {
    let GRID = [];
    for (y = 0; y <= rows; y++) {
      GRID.push(false);
    }
    GRIDS.push(GRID);
  }
  let m = 0;
  while (m < mines) {
    let y = Math.floor(Math.random() * 10); //2
    let x = Math.floor(Math.random() * 15); //10
    if (!GRIDS[x][y]) {
      GRIDS[x][y] = true;
      m++;
    }
  }
  // FAIL_DIALOG = $("#failed").dialog({ autoOpen: false });
  // $("#opener").on("click", function () {
  //   FAIL_DIALOG.dialog("open");
  // });
  console.log("GRID", GRIDS);
}

function displayGridQuery() {
  const divParent = $("#ms-box");
  const divGrid = $("<div></div>");
  const table = $("<table></table>");
  divGrid.attr("id", "ms-grid");

  for (let y = 0; y < GRIDS[0].length; y++) {
    row = $("<tr></tr>");
    for (let x = 0; x < GRIDS.length; x++) {
      cell = $("<td></td>")
        .on("click", function (e) {
          console.log("cell", e);
          reveal($(e.target));
        })
        .on("contextmenu", function (e) {
          e.preventDefault();
          flag($(e.target));
        });
      // if (GRIDS[x][y]) {
      //   cell.text("X");
      // }
      row.append(cell);
    }
    table.append(row);
    divParent.append(divGrid);
    divGrid.append(table);
  }
}

function getNumber(x, y) {
  let nbMines = 0;
  // Haut - bas
  for (let dir = -1; dir <= 1; dir++) {
    // console.log("get Number x", x);
    if (y + dir >= 0 && y + dir < GRIDS[x].length) {
      if (GRIDS[x][y + dir]) {
        nbMines++;
      }
    }
  }

  // Gauche - Droite
  for (let dir = -1; dir <= 1; dir++) {
    if (x + dir >= 0 && x + dir < GRIDS.length) {
      if (GRIDS[x + dir][y]) {
        nbMines++;
      }
    }
  }

  // D-H-G - D-B-D
  for (let dir = -1; dir <= 1; dir++) {
    if (
      y + dir >= 0 &&
      x + dir >= 0 &&
      y + dir < GRIDS[x].length &&
      x + dir < GRIDS.length
    ) {
      if (GRIDS[x + dir][y + dir]) {
        nbMines++;
      }
    }
  }

  // D-B-G - D-H-D
  for (let dir = -1; dir <= 1; dir++) {
    if (
      y - dir >= 0 &&
      x + dir >= 0 &&
      y - dir < GRIDS[x].length &&
      x + dir < GRIDS.length
    ) {
      if (GRIDS[x + dir][y - dir]) {
        nbMines++;
      }
    }
  }
  return nbMines;
}

function getPosition(cell) {
  y = $(cell).parent().index();
  x = $(cell).index();
  return { x, y };
}

function reveal(cell) {
  if (!cell.hasClass("revealed") && !cell.hasClass("flagged")) {
    let position = getPosition(cell);
    let x = position.x;
    let y = position.y;
    if (GRIDS[x][y]) {
      console.log("kboom");
      endGame(false);
    } else {
      cell.addClass("revealed");
      console.log("case : ", x, " ", y);
      let mines = getNumber(x, y);
      if (mines > 0) {
        cell.text(mines);
      } else {
        //Droite
        if (x < GRIDS.length - 1) {
          console.log("vers la droite");
          reveal(cell.next());
        }
        //Gauche
        if (x !== 0) {
          console.log("vers la gauche");
          reveal(cell.prev());
        }
        //   Haut
        if (y > 0) {
          console.log("Haut");
          reveal(cell.parent().prev().children().eq(x));
        }
        // Bas
        if (y < GRIDS[x].length - 1) {
          console.log("Bas");
          reveal(cell.parent().next().children().eq(x));
        }
        // D-H-G - D-B-D
        if (x != 0 && y > 0 && x < GRIDS.length - 1) {
          // DHG
          reveal(
            cell
              .parent()
              .prev()
              .children()
              .eq(x - 1)
          );
        }

        //DBD
        if (x < GRIDS.length - 1 && y < GRIDS[x].length - 1) {
          reveal(
            cell
              .parent()
              .next()
              .children()
              .eq(x + 1)
          );
        }
        // D-B-G - D-H-D

        if (
          x < GRIDS.length - 1 &&
          x < GRIDS.length - 1 &&
          y < GRIDS[x].length - 1
        ) {
          //  D - B - G;
          reveal(
            cell
              .parent()
              .next()
              .children()
              .eq(x - 1)
          );
        }
        // D-H-D
        if (y > 0 && x < GRIDS.length - 1) {
          reveal(
            cell
              .parent()
              .prev()
              .children()
              .eq(x + 1)
          );
        }
      }
    }
  }
  if (isVictory()) {
    endGame(true);
  }
}

function endGame(win) {
  for (let x = 0; x < GRIDS.length; x++) {
    for (let y = 0; y < GRIDS[x].length; y++) {
      if (GRIDS[x][y]) {
        let trMined = $("tr").eq(y);
        let tdMined = trMined.children().eq(x);
        tdMined.addClass("mined");
      }
    }

    $("td").off("click");
    $("td").off("contextmenu");
    $("td").css("cursor", "default");
    $(".mined").text("");
  }

  if (win) {
    FAIL_DIALOG.dialog("open");
    FAIL_DIALOG.append("<p>Vous avez réussit avec brio!</p>");
    clearInterval(interval);
  } else {
    FAIL_DIALOG.dialog("open");
    FAIL_DIALOG.append("<p>Vous avez échoué lamentablement !</p>");
    clearInterval(interval);
  }
}

function flag(cell) {
  if (!cell.hasClass("revealed")) {
    cell.toggleClass("flagged");
  }

  COUNTER.setValue($(".flagged").length);
}

function prepareDialog() {
  FAIL_DIALOG = $(".dialog").dialog({ autoOpen: false });
  let closeFailedDialog = $("#close-failed-dialog").on("click", function () {
    FAIL_DIALOG.dialog("close");
  });
  startGame();
}

function isVictory() {
  let nbMines = MINES;
  let revealed = $(".revealed");
  let noneRevealed = $("td").length - revealed.length;

  let isVictory = false;

  if (noneRevealed == nbMines) {
    isVictory = true;
  }
  console.log("isVictory", false);
  return isVictory;
}

function displayMetaData() {
  $("#ms-box")
    .append("<div></div>")
    .append(
      '<p>Faites un clic droit pour poser un drapeau sur une case.</p><p>Mines restantes : <span id="counter"></span></p>'
    );

  COUNTER.setCallback((entier) => $("#counter").text(MINES - entier));
  COUNTER.setValue(0);

  $("#ms-box")
    .append("<div></div>")
    .append('<p>Temps écoulé : <span id="time"></span></p>');

  interval = setInterval(() => {
    timer.sec++;
    let m = Math.floor(timer.sec / 60);
    let s = timer.sec % 60;
    $("#time").text(m + ":" + (s < 10 ? "0" + s : s));
  }, 1000);
  interval;
}

// function displayGrid() {
//   const divParent = document.getElementById("ms-box");
//   const divGrid = document.createElement("div");
//   const table = document.createElement("table");

//   const td = document.createElement("td");
//   divGrid.setAttribute("id", "ms-grid");
//   divParent.appendChild(divGrid);
//   divGrid.appendChild(table);

//   GRIDS.forEach((GRID) => {
//     const tr = document.createElement("tr");
//     table.appendChild(tr);
//     GRID.forEach((element) => {
//       const td = document.createElement("td");
//       if (element) {
//         td.innerText = "X";
//       } else {
//         td.innerText = " ";
//       }
//       tr.appendChild(td);
//     });
//   });
// }

$(prepareDialog);
