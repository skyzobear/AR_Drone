window.points = [];
window.collectionPoints = [];

window.typeClick = 0;
//Type click = 0 : Normal
//Type click = 1 : Ajout
//Type click = 2 : Enlever

var echelle = document.querySelector('.echelle'),
    unite = echelle.offsetWidth,
    fenetre = document.querySelector('#cadrillage'),
    positionCadrillage =    {
                                left: document.querySelector('#cadrillage').getBoundingClientRect().left,
                                top: document.querySelector('#cadrillage').getBoundingClientRect().top
                            },
    tailleFenetre = {
                        hauteur: fenetre.offsetHeight,
                        largeur: fenetre.offsetWidth
                    };
Point.echelle = unite;
function getCentre(origine, fin, longueur, largeur) {
    return  {
                x: ((origine.x + fin.x) / 2) - (longueur / 2),
                y: ((origine.y + fin.y) / 2) - (largeur / 2)-1
            };
}
function getOrigine(point) {
    return  {
                x: parseInt(point.style.left)+5,
                y: parseInt(point.style.top)+5
            };   
}
function getDistance(origine, fin) {
    return Math.sqrt(((fin.x-origine.x) * (fin.x-origine.x)) + ((fin.y-origine.y) * (fin.y-origine.y)));
}
function toMetre(distance) {
    return distance/unite;
}
function creationLigne(left, top, distance, angle) {
    var div = document.createElement('div');
    div.style.width = distance+'px';
    div.style.left = left+'px';
    div.style.top = top+'px';
    div.style.transform = 'rotate('+angle+'deg)';
    div.className = 'ligne';
    document.querySelector('#cadrillage').appendChild(div);
}
function getAngle(origine, fin) {
    return Math.atan2((origine.y-fin.y),(origine.x-fin.x))*(180/Math.PI);
}

document.querySelector('#cadrillage').addEventListener('click', function(e) {
    if(window.typeClick === 1) {
        var div = document.createElement('div'),
            index = window.collectionPoints.length - 1;

        div.className = 'point';
        div.style.left = (e.clientX-5-positionCadrillage.left)+'px';
        div.style.top = (e.clientY-5-positionCadrillage.top)+'px';
        this.appendChild(div);


        if(window.collectionPoints[index]) {
            window.collectionPoints[index].setSuivant(div);
        }
        
        
       
        window.collectionPoints.push(new Point(div, window.collectionPoints[index]));
    }
});

/**
* Au lancement de la page
*/
function cadrillage() {
    var horizontal = [],
        vertical = [], 
        j = 0;
    for(var i = 0; i < tailleFenetre.largeur; i += unite) {
        var ligneHorizontale = document.createElement('div'),
            ligneVerticale = document.createElement('div');
    
        ligneVerticale.className = 'vertical';
        ligneVerticale.style.left = i+'px';
        ligneVerticale.style.width = '0';
        vertical.push(ligneVerticale);
        document.querySelector('#cadrillage').appendChild(ligneVerticale);
        
        ligneHorizontale.style.width = '0';
        ligneHorizontale.className = 'horizontal';
        ligneHorizontale.style.top = i+'px';
        horizontal.push(ligneHorizontale);
        document.querySelector('#cadrillage').appendChild(ligneHorizontale);
    }
    decalage(horizontal, j, 300, 'width');
    decalage(vertical, j, 300, 'height');
}
function decalage(collection, index, temps, style) {
    setTimeout(function() {
        if(collection[index]) {
            if(style === 'height') {
                collection[index].style.width = '100%';
                collection[index].style.top = -(index)+'px';
            }
            else {
                collection[index].style.width = '100%';
            }
            decalage(collection, index+1, temps, style);
        }
    }, temps);
}
var boutons = document.querySelectorAll('#controleHaut [data-role="boutonTypeClick"]');
for(var i =0; i< boutons.length; i++) {
    boutons[i].addEventListener('click', function() {
        
        var boutons = document.querySelectorAll('#controleHaut [data-role="boutonTypeClick"]');
        for(var i =0; i< boutons.length; i++) {
            boutons[i].classList.remove('active');
        }
        
        var attribute = parseInt(this.getAttribute('data-type'));
        if(window.typeClick === attribute) {
            window.typeClick = 0;
        }
        else {
            this.classList.add('active');
            window.typeClick = attribute;
        }
        
        
    }, true);
}
cadrillage();