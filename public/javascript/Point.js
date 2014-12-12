function Point(element, precedent) {
    this.element = element;
    this.precedent = precedent;
    this.suivant = null;
    
    this.ligne = null;
    
    //Ajout du listener
    this.element.addEventListener('click', function() {
        var trouve = false;
        if(window.typeClick === 2) {
            for(var i = 0; i < window.collectionPoints.length; i++) {
                //Si on a chopé le bon div
                if(window.collectionPoints[i].element.style.left === this.style.left && window.collectionPoints[i].element.style.top === this.style.top) {
                    
                    //Si y a une ligne sur ce point
                    if(window.collectionPoints[i].ligne) {
                        //On supprime la ligne
                        window.collectionPoints[i].ligne.remove();
                        window.collectionPoints[i].ligne = null;
                    }
                    
                    //Si y en a un avant lui
                    if(window.collectionPoints[i-1]) {
                        //On supprime la ligne
                        window.collectionPoints[i-1].ligne.remove();
                        window.collectionPoints[i-1].ligne = null;
                        //On indique le bon suivant
                        if(window.collectionPoints[i+1]) {
                            window.collectionPoints[i-1].setSuivant(window.collectionPoints[i+1].element);
                        }
                    }
                    //Si y en a un après lui
                    if(window.collectionPoints[i+1]) {
                        window.collectionPoints[i+1].precedent = window.collectionPoints[i-1].element;
                    }

                    window.collectionPoints.splice(i, 1);
                    this.remove();
                    
                }
            }
        }
    }, true);
}
Point.echelle = 0;

Point.prototype.setSuivant = function(div) {
    this.suivant = div;
    this.ligne = this.setLigne();
};


Point.prototype.getCentre = function() {
    if(this.suivant !== null) {
        var origine = Point.getOrigine(this.element),
            fin = Point.getOrigine(this.suivant);
    
        return Point.getCentre(origine, fin, this.getDistance());
    }
    return null;
};
Point.prototype.getDistance = function() {
    if(this.suivant !== null) {
        var origine = Point.getOrigine(this.element),
            fin = Point.getOrigine(this.suivant);
    
        return Point.getDistance(origine, fin);
    }
    return 0;
};

Point.prototype.getDistanceMetre = function() {
    return this.getDistance()/Point.echelle;
};

Point.prototype.getAngle = function() {
    if(this.suivant !== null) {
        return Point.getAngle(Point.getOrigine(this.element), Point.getOrigine(this.suivant));
    }
    return 0;
};

Point.prototype.setLigne = function() {
    var origine = Point.getOrigine(this.element),
        fin = Point.getOrigine(this.suivant),
        distance = Point.getDistance(origine, fin),
        centre = Point.getCentre(origine, fin, distance);
    return this.creationLigne(centre.x, centre.y, distance, Point.getAngle(origine, fin));
};

Point.prototype.creationLigne = function(left, top, distance, angle) {
    var div = document.createElement('div');

    div.style.width = distance+'px';
    div.style.left = left+'px';
    div.style.top = top+'px';
    div.style.transform = 'rotate('+angle+'deg)';
    div.className = 'ligne';

    document.querySelector('#cadrillage').appendChild(div);
    return div;
};








Point.getCentre = function(origine, fin, longueur, largeur) {
    if(typeof(largeur) === 'undefined') {
        largeur = 1;
    }
    
    return  {
                x: ((origine.x + fin.x) / 2) - (longueur / 2),
                y: ((origine.y + fin.y) / 2) - (largeur / 2)-1
            };
};

Point.getDistance = function(origine, fin) {
    return Math.sqrt(((fin.x-origine.x) * (fin.x-origine.x)) + ((fin.y-origine.y) * (fin.y-origine.y)));
};

Point.getAngle = function(origine, fin) {
    return Math.atan2((origine.y-fin.y),(origine.x-fin.x))*(180/Math.PI);
};

Point.getOrigine = function(element) {
    return  {
                x: parseInt(element.style.left)+5,
                y: parseInt(element.style.top)+5
            };   
};


Point.envoie = function() {
    var collection = window.collectionPoints,
        deplacements = {},
        distance, 
        ancienAngle = 90;
    for(var i = 0; i < collection.length-1; i++) {
        var angleActuel = collection[i].getAngle(),
            distance = collection[i].getDistanceMetre(), 
            angle,
            contreHoraire = false;
        angle = angleActuel-ancienAngle;
        ancienAngle = angleActuel;
        
        if(angle < -180) {
            angle = angle + 360;
        }
        
        if(angle > 180) {
            contreHoraire = true;
            angle = 360 - angle;
        }
            deplacements[i] =   {
                                    distance: distance,
                                    angle: angle,
                                    contreHoraire: contreHoraire
                                };
    }
    return deplacements;
};