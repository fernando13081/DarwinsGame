//constantes utiles pour le jeu:
const HAUTEURDUNCARREAU = 15;
const LARGEURDUNCARREAU = 15;
const HAUTEURDUTABLEAU = 30;
const LARGEURDUTABLEAU = 80;
const CANONOFFSET = 200;
const ESPACECANON = 5;
const CANOND = 40;

//mouvement selon la direction:
const NORD = 1;
const EST = 2;
const SUD = -1;
const OUEST = -2;
const FINMOUV = -99;

//conditions initiales:
var canonsdeplaces = 0;
var jeuenroute = false;
var jeuenpause = false;
var nombredanimaux = 10;
var intervalle = null;
var vagues = 0;
var vies = 10;
var pointsactuels = 20;
var scoreactuel = 0;
var positioncanon = new Array();
var nombredecanons = 0;

//CODE POUR LES CANONS:

//couleurs des canons différents
function couleurcanon(nomducanon) {
  switch (nomducanon) {
    case "canon0":
      return "#ae81ff";
    case "canon1":
      return "#fd971f";
    case "canon2":
      return "#66d9ef";
    case "canon3":
      return "#a6e22e";
    case "canon4":
      return "#f92672";
  }
}

//nombre de points pour acheter les canons différents
function prixcanon(nomducanon) {
  switch (nomducanon) {
    case "canon0":
      return 10;
    case "canon1":
      return 50;
    case "canon2":
      return 100;
    case "canon3":
      return 150;
    case "canon4":
      return 200;
  }
}

//portée des missiles (distance)
function porteecanon(nomducanon) {
  switch (nomducanon) {
    case "canon0":
      return 3 * LARGEURDUNCARREAU;
    case "canon1":
      return 5 * LARGEURDUNCARREAU;
    case "canon2":
      return 10 * LARGEURDUNCARREAU;
    case "canon3":
      return 15 * LARGEURDUNCARREAU;
    case "canon4":
      return 20 * LARGEURDUNCARREAU;
  }
}

//intensité des dégats selon le canon
function degatcanon(nomducanon) {
  switch (nomducanon) {
    case "canon0":
      return 1;
    case "canon1":
      return 3;
    case "canon2":
      return 5;
    case "canon3":
      return 10;
    case "canon4":
      return 20;
  }
}

function canonClick(canon) {
    function cclick(evt) {
      if (!jeuenroute || jeuenpause) {
        return;
      }

      //possibilité (ou non) d'acheter un canon
      if (pointsactuels < prixcanon(canon.id)) {
        return;
      }

      evt = evt || window.evt;

      //coordonnées de la page (utilisé pour le placement des canons)
      var x = 0;
      var y = 0;

      if (evt.pageX) {
        x = evt.pageX;
        y = evt.pageY;
      } else if (evt.clientX) {
        var offsetX = 0;
        var offsetY = 0;
        if (document.documentElement.scrollLeft) {
          offsetX = document.documentElement.scrollLeft;
          offsetY = document.documentElement.scrollTop;
        } else if (document.body) {
          offsetX = document.body.scrollLeft;
          offsetY = document.body.scrollTop;
        }
        x = evt.clientX + offsetX;
        y = evt.clientY + offsetY;
      }

      //placer le canon à l'endroit voulu (création d'un canon)	
      var canonsouris = document.createElement("div");
      canonsouris.setAttribute("id", canon.id + ":" + canonsdeplaces++);
      canonsouris.setAttribute("class", "deplacementcanon");
      canonsouris.style.left = x + "px";
      canonsouris.style.top = y + "px";
      canonsouris.style.backgroundColor = couleurcanon(canon.id);
      canonsouris.setAttribute("draggable", "true");
      evenement(canonsouris, "dragstart", deplacementcanon(canonsouris));
      document.body.appendChild(canonsouris);
      //mise à jour du nombre de points
      pointsactuels -= prixcanon(canon.id);
    }
    return cclick;
  }
  
//FIN DU CODE POUR LES CANONS

//CODE POUR LES EVENEMENTS DIFFERENTS:

function evenement(eventTarget, eventType, eventHandler) {
  if (eventTarget.addEventListener) {
    eventTarget.addEventListener(eventType, eventHandler, false);
  } else if (eventTarget.attachEvent) {
    eventType = "on" + eventType;
    eventTarget.attachEvent(eventType, eventHandler);
  } else {
    eventTarget["on" + eventType] = eventHandler;
  }
}

function annulerlevenement(event) {
  if (event.preventDefault) {
    event.preventDefault();
  } else {
    event.returnValue = false;
  }
}

function annulerpropogation(event) {
    if (event.stopPropogation) {
      event.stopPropogation();
    } else {
      event.cancelBubble = true;
    }
  }
  
//FIN DU CODE POUR LES EVENEMENTS DIFFERENTS

//DEPLACEMENT DES CANONS:

function dragOver(evt) {
  if (evt.preventDefault) evt.preventDefault();
  evt = evt || window.event;
  evt.dataTransfer.dropEffect = 'copy';
  return false;
}

function placementducanon(mapzone) {
  function drop(evt) {
    annulerpropogation(evt);
    evt = evt || window.event;
    evt.dataTransfer.dropEffect = 'copy';
    var id = evt.dataTransfer.getData("Text");
    var canon = document.getElementById(id);
    canon.style.left = mapzone.style.left;
    canon.style.top = mapzone.style.top;

    //coordonnées de l'endroit où le canon va être placé
    var x = mapzone.style.left.replace(/\D/g, "");
    var y = mapzone.style.top.replace(/\D/g, "");

    // the id is up to the colon in the string
    var nomducanon = canon.id.substring(0, canon.id.indexOf(":"));

    // store an entry in the turret position array
    positioncanon[nombredecanons++] = new Array(porteecanon(nomducanon), degatcanon(nomducanon), x, y);

    //empeche la déplacement du canon une fois positionné		
    canon.setAttribute("draggable", "false");
    evenement(canon, "dragstart", nodrag);
  }
  return drop;
}

function deplacementcanon(canon) {
  function drag(evt) {
    evt = evt || window.event;
    evt.dataTransfer.effectAllowed = 'copy';
    evt.dataTransfer.setData("Text", canon.id);
  }
  return drag;
}

function nodrag(evt) {}

//FIN DU CODE POUR LE DEPLACEMENT DES CANONS

//CREATION DE L'ENVIRONNEMENT:

function environnement(i, j) {
  if ((i == 0 && (j >= 0 && j <= 2)) || (j == 2 && (i >= 0 && i < 70)) || (i == 70 && (j >= 2 && j <= 28)) || (j == 28 && (i <= 70 && i >= 60)) || (i == 60 && (j <= 28 && j >= 5)) || (j == 5 && (i <= 60 && i >= 40)) || (i == 40 && (j >= 5 && j <= 25)) || (j == 25 && (i <= 40 && i >= 30)) || (i == 30 && (j >= 20 && j <= 25)) || (j == 20 && (i <= 30 && i >= 5)) || (i == 5 && (j <= 20 && j >= 10)) || (j == 10 && (i >= 5 && i <= 80))) {
    return true;
  }
  return false;
}

function drawMap() {
    // create the map zone
    for (var j = 0; j < HAUTEURDUTABLEAU; j++) {
      for (var i = 0; i < LARGEURDUTABLEAU; i++) {
        var mapzone = document.createElement("div");
        mapzone.setAttribute("id", "mapzone" + i);
        mapzone.setAttribute("class", "mapzone");
        mapzone.style.left = HAUTEURDUNCARREAU * i + "px";
        mapzone.style.top = LARGEURDUNCARREAU * j + "px";
        if (environnement(i, j)) {
          mapzone.style.backgroundColor = "#1E90FF";
        } else {
          // if it isn't part of the map, its a drop target for a turret
          evenement(mapzone, "dragenter", annulerlevenement);
          evenement(mapzone, "dragover", dragOver);
          evenement(mapzone, "drop", placementducanon(mapzone));
        }
        document.body.appendChild(mapzone);
      }
    }

    //création des canons
    for (var k = 0; k < 5; k++) {
      var canon = document.createElement("div");
      canon.setAttribute("id", "canon" + k);
      canon.setAttribute("class", "canon");
      canon.style.left = CANONOFFSET + (CANOND + ESPACECANON) * k + "px";
      canon.style.borderColor = couleurcanon(canon.id);
      canon.innerHTML = "<p>" + k + "<br /><br />$" + prixcanon(canon.id) + "</p>";

      //fait en sorte qu'on puisse bouger les canona
      evenement(canon, "click", canonClick(canon));
      document.body.appendChild(canon);
    }

    //bouton pour commencer le jeu
    var bouttonpourcommencer = document.createElement("div");
    bouttonpourcommencer.setAttribute("id", "bouttonpourcommencer");
    bouttonpourcommencer.setAttribute("class", "bouttonpourcommencer");
    bouttonpourcommencer.innerHTML = "<p> Commencer! </p>";
    evenement(bouttonpourcommencer, "click", debutdelavague);
    document.body.appendChild(bouttonpourcommencer);

    //boutton pour réinitialiser le jeu
    var bouttonpourreinitialiser = document.createElement("div");
    bouttonpourreinitialiser.setAttribute("id", "bouttonpourreinitialiser");
    bouttonpourreinitialiser.setAttribute("class", "bouttonpourreinitialiser");
    bouttonpourreinitialiser.innerHTML = "<p> Recommencer! </p>";
    evenement(bouttonpourreinitialiser, "click", resetwave);
    document.body.appendChild(bouttonpourreinitialiser);

    //barre avec le score/les points... du joueur 
    var infosdujoueur = document.createElement("div");
    infosdujoueur.setAttribute("id", "infosdujoueur");
    infosdujoueur.setAttribute("class", "infosdujoueur");
    infosdujoueur.innerHTML = '<p> Points: <span id="pointsobt">0</span> Score: <span id="score">0</span> Wave: <span id="wave">0</span> Lives: <span id="lives">0</span></p>';
    document.body.appendChild(infosdujoueur);
  }
  
//FIN DU CODE POUR LA CREATION DE L'ENVIRONNEMENT

//CODE POUR LES VAGUES D'ENNEMIIS
function debutdelavague(evt) {
  if (jeuenroute) return;
  jeuenroute = true;

  //code pour que le boutton "Pause" soit visible
  var sb = document.getElementById("bouttonpourcommencer");
  sb.innerHTML = "<p> Pause </p>";
  evenement(sb, "click", pausewave);
  //reinitialisation du jeu	
  vagues = 0;
  vies = 10;
  pointsactuels = 20;
  scoreactuel = 0;
  positioncanon.length = 0;
  nombredecanons = 0;

  //augmenter le nombre de vagues
  vagues++;

  //supprimer tous les canons placés
  var canons = document.querySelectorAll(".deplacementcanon");
  for (var i = 0; i < canons.length; i++) {
    document.body.removeChild(canons[i]);
  }

  //créer tous les animaux
  for (var i = 0; i < nombredanimaux; i++) {
    var animal = document.createElement("div");
    animal.setAttribute("id", "animal" + i);
    animal.setAttribute("class", "animal");
    document.body.appendChild(animal);
  }

  //faire en sorte que le minuteur marche
  var movex = new Array();
  var movey = new Array();
  //la direction
  var currentDir = new Array();
  var minion_c = 1;
  var lachementdanimaux = new Array();
  var hpdunanimal = new Array();
  var premiermeurtre = new Array();
  var minions_killed = 0;
  var viesperdues = 0;
  var wave_over = false;
  //faire en sorte que tous les animaux soient disponibles
  var animaux = document.getElementsByClassName("animal");
  for (var i = 0; i < animaux.length; i++) {
    movex[i] = 0;
    movey[i] = 0;
    currentDir[i] = SUD;
    lachementdanimaux[i] = 0;
    animaux[i].style.display = "none";
    hpdunanimal[i] = minionhp();
    premiermeurtre[i] = true;
  }
  intervalle = setInterval(function() {
    if (!jeuenpause) {
      for (var i = 0; i < minion_c; i++) {
        // what direction do we want to go?
        currentDir[i] = whereToMove(movex[i], movey[i], currentDir[i]);

        if (currentDir[i] == FINMOUV) {
          // lose a life, one escaped!
          if (animaux[i].style.display != "none") {
            vies--;
            viesperdues++;
          }
          // we have reached the end of the map
          animaux[i].style.display = "none";
          if (vies == 0) {
            // game over
            wave_over = true;
            break;
          }
          // do we have minions killed?
          if (minions_killed == (animaux.length - viesperdues)) {
            // wave over!
            wave_over = true;
          }
          continue;
        }

        switch (currentDir[i]) {
          case NORD:
            movey[i] -= 1;
            break;
          case SUD:
            movey[i] += 1;
            break;
          case EST:
            movex[i] += 1;
            break;
          case OUEST:
            movex[i] -= 1;
            break;
        }
        animaux[i].style.display = "block";
        animaux[i].style.top = movey[i] + "px";
        animaux[i].style.left = movex[i] + "px";

        //code pour voir si certains canons sont assez proche 
        var degats = canonsprochesoupas(animaux[i], movex[i], movey[i]);
        //réduire l'hp de l'animal lorsqu'une balle le touche
        hpdunanimal[i] -= degats;
        if (hpdunanimal[i] <= 0) {
          //mort de l'animal
          if (premiermeurtre[i]) {
            premiermeurtre[i] = false;
            minions_killed++;
            //augmentation de points 
            pointsactuels += minionreward();
            scoreactuel++;
            if (minions_killed == (animaux.length - viesperdues)) {
              //fin de la vague
              wave_over = true;
            }
          }
          animaux[i].style.display = "none";
        }
        // stagger the minions coming out, release one every 15 pixels
        if ((lachementdanimaux[i] == 100 * minion_c) && minion_c < animaux.length) {
          minion_c++;
        }
        lachementdanimaux[i]++;
      }
      // update the status
      updateStatus();

      // is the wave over?
      if (wave_over) {
        if (vies == 0) {
          var lives = document.getElementById("lives");
          lives.innerHTML = "Game Over";
          resetwave(null);
        }
        // reset for the next wave!
        minion_c = 1;
        minions_killed = 0;
        wave_over = false;
        vagues++;
        for (var i = 0; i < animaux.length; i++) {
          movex[i] = 0;
          movey[i] = 0;
          currentDir[i] = SUD;
          lachementdanimaux[i] = 0;
          animaux[i].style.display = "none";
          hpdunanimal[i] = minionhp();
          premiermeurtre[i] = true;
        }
      }
    }
  }, 10);
}

function whereToMove(xpos, ypos, currentDir) {
  // convert the xpos and ypos to block coordinates
  xpos = (xpos + LARGEURDUNCARREAU / 2) / LARGEURDUNCARREAU;
  ypos = (ypos + HAUTEURDUNCARREAU / 2) / HAUTEURDUNCARREAU;

  var xnewpos = Math.floor(xpos);
  var ynewpos = Math.floor(ypos);

  // test out some possible move locations
  switch (currentDir) {
    case NORD:
      ynewpos -= 1;
      break;
    case SUD:
      ynewpos += 1;
      break;
    case EST:
      xnewpos += 1;
      break;
    case OUEST:
      xnewpos -= 1;
      break;
  }

  // are we still on the map?
  if (environnement(Math.floor(xnewpos), Math.floor(ynewpos))) {
    // ok! keep going in the same direction
    return currentDir;
  }

  // we have fallen off the map! Find out where to go...
  if (environnement(Math.floor(xpos) + 1, Math.floor(ypos)) && currentDir != -EST) {
    return EST;
  }
  if (environnement(Math.floor(xpos) - 1, Math.floor(ypos)) && currentDir != -OUEST) {
    return OUEST;
  }
  if (environnement(Math.floor(xpos), Math.floor(ypos) + 1) && currentDir != -SUD) {
    return SUD;
  }
  if (environnement(Math.floor(xpos), Math.floor(ypos) - 1) && currentDir != -NORD) {
    return NORD;
  }

  // if all fails, we have reached the end of the map
  return FINMOUV;
}

function pausewave(evt) {
  jeuenpause = !jeuenpause;
}

function resetwave(evt) {
  if (!jeuenroute) return;
  jeuenroute = false;

  // make the start button visible
  var sb = document.getElementById("bouttonpourcommencer");
  sb.innerHTML = "<p> Start! </p>";
  evenement(sb, "click", debutdelavague);

  // stop the timers
  clearInterval(intervalle);

  // remove all the minions	
  var animaux = document.querySelectorAll(".animal");
  for (var i = 0; i < animaux.length; i++) {
    document.body.removeChild(animaux[i]);
  }

}

function updateStatus() {
  // update all the status variables
  var pointsobt = document.getElementById("pointsobt");
  pointsobt.innerHTML = pointsactuels;

  var score = document.getElementById("score");
  score.innerHTML = scoreactuel;

  var wave = document.getElementById("wave");
  wave.innerHTML = vagues;

  var lives = document.getElementById("lives");
  lives.innerHTML = vies;

  // highlight turrets we can purchase
  var canons = document.getElementsByClassName("canon");
  for (var i = 0; i < canons.length; i++) {
    if (pointsactuels >= prixcanon(canons[i].id)) {
      canons[i].style.opacity = 1;
    } else {
      canons[i].style.opacity = 0.5;
    }
  }
}

function canonsprochesoupas(animal, x, y) {
  var score = document.getElementById("score");
  var degats = 0;
  for (var i = 0; i < nombredecanons; i++) {
    // get the x and y positions of the turret
    var xt = positioncanon[i][2];
    var yt = positioncanon[i][3];

    if (euclidDistance(x, xt, y, yt) <= positioncanon[i][0]) {
      animal.style.backgroundColor = "#FF0000";
      degats += positioncanon[i][1]; // return the damage
    }
  }
  if (degats == 0) {
    // nothing in range
    animal.style.backgroundColor = "#000000";
  }
  return degats;
}

function euclidDistance(x1, x2, y1, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function minionhp() {
  return Math.pow(2, vagues) * 100;
}

function minionreward() {
    return Math.pow(vagues + 1, 2);
  }
  ////////////////////////// END WAVE HANDLING

//code qui permet de charger le javascript lorsque la page HTML est ouverte
window.onload = function() {
  drawMap();
}