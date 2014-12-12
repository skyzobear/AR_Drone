$(document).ready(function() {
    //Chargement onglet informations
    $('.onglet-content.information').show();
    var socket = io.connect("http://localhost:8080"),
            duree = 0,
            timeoutChrono;

    socket.on("navdata", function(data) {
        var batterie = $('.information .infos-batterie'),
                niveau = data['demo']['batteryPercentage'];
        $('.information .infos-altitude').html(data['demo']['altitude'] + ' m');
        $('.information .infos-vitesse').html(data['demo']['xVelocity'] + ' m/s');
        if (niveau > 20) {
            batterie.removeClass('danger');
        }
        else {
            batterie.addClass('danger');
        }
        batterie.html(niveau + '%');
        $('.information .infos-inclinaison').html(data['demo']['rotation']['clockwise'] + '°');
        $('.information .infos-frontBack').html(data['demo']['rotation']['frontBack'] + '°');
        $('.information .infos-leftRight').html(data['demo']['rotation']['leftRight'] + '°');

    });



    //Lancement du stream
    new NodecopterStream(document.getElementById("droneStream"));

    //Changement de background sur la batterie
    var batteryValue = $.trim($('.batterie .infos').html());
    if (batteryValue <= '40%') {
        $('.backoffice .dashboard .rubrique .batterie').css('background-color', 'rgba(199, 19,56, 0.3)');
    }

    //Animation pour cacher contenu onglet
    $('.onglets .arrow').click(function() {
        getUpDownOnglets();
    });

    //Animation pour changer onglet
    $('.onglets .single').click(function() {
        if ($(this).hasClass('information')) {
            changeOnglet('information');
//            alert('ok');
        } else if ($(this).hasClass('historique')) {
            changeOnglet('historique');
//            alert('ok2');
        } else if ($(this).hasClass('parcours')) {
            changeOnglet('parcours');
//            alert('ok3');
        }
    });

    //Animation drone inclinaison
    $('#fly').hover(function() {
        $(this).stop().rotate({animateTo: 360, duration: 1000})
    },
            function() {
                // $(this).stop().animate({opacity:'1'},{duration:1000})
                $(this).stop().rotate({animateTo: 0, duration: 1000})
            });

    $('#fly2').hover(function() {
        $(this).stop().rotate({animateTo: 30, duration: 1000})
    },
            function() {
                // $(this).stop().animate({opacity:'1'},{duration:1000})
                $(this).stop().rotate({animateTo: 0, duration: 1000})
            });
    $("#localVideo").lightGallery({
        thumbnail: false,
        addClass: 'localVideo'
    });

    $("#demo2").als({
        visible_items: 4,
        scrolling_items: 2,
        orientation: "horizontal",
        circular: "yes",
        autoscroll: "no",
        interval: 5000,
        speed: 500,
        easing: "linear",
        direction: "right",
        start_from: 0
    });

    $('#play').on('click', function() {
        incrementationChrono();
        socket.emit('lancementDrone', '1');
        socket.emit('lancerVideo','1');
    });

    $('#stop').on('click', function() {
        duree = 0;
        clearTimeout(timeout);
        $('.distance .infos').html('0 s');
        socket.emit('arretDrone', '1');
        socket.emit('stopVideo');
    });

    function incrementationChrono() {
        var minute = parseInt(duree / 60),
                secondes = duree % 60,
                chaine = secondes + ' s';
        duree++;
        if (minute > 0) {
            chaine = minute + ' min ' + chaine;
        }
        $('.distance .infos').html(chaine);
        timeout = setTimeout(incrementationChrono, 1000);
    }

    //Slider parcours rotation et altitude
    $("#slider-altitude").slider();
    $("#slider-rotation").slider();

    //Changement de valeur pour l'altitude
    $(".backoffice .dashboard .rubrique .content #slider-altitude .ui-state-default").mousemove(function() {
//        console.log($(this));
        var left = $('#slider-altitude .ui-slider-handle.ui-state-default.ui-corner-all.ui-state-hover').position();
        var altitude = (left['left'] * 3) / 289;
        $('.parcours .infos-altitude').html((Math.round(altitude * 100) / 100) + ' m');
    });
    //Changement de valeur pour 9+çla rotation
    $(".backoffice .dashboard .rubrique .content #slider-rotation .ui-state-default").mousemove(function() {
//        console.log($(this));
        var left = $('#slider-rotation .ui-slider-handle.ui-state-default.ui-corner-all.ui-state-hover').position();
        var rotation = (-360) + ((left['left'] * 720) / 192);
        $('.parcours .infos-rotation').html((Math.round(rotation * 100) / 100) + ' °');
    });

    //Agrandissement de la carte
    $('.map').mouseenter(function() {
        stop();
        $(this).animate({
            width: '500px',
            height: '300px'
        });
    });
    //Diminution de la carte
    $('.map').mouseleave(function() {
        stop();
        $(this).animate({
            width: '210px',
            height: '180px'
        });
    });
});

function getUpDownOnglets() {
    if ($('.single.parcours').hasClass('active')) {
        $('.backoffice .dashboard .parcours .rubrique .content').css('height', '300px');
        $('.backoffice .dashboard').css('height', '300px');
        $('.backoffice .onglets').css('bottom', '300px');
        $('.backoffice .action').css('bottom', '300px');
    }
    if ($('.backoffice .dashboard').is(':visible')) {
        $('.backoffice .onglets').animate({
            bottom: 0
        }, 400);
        $('.backoffice .action').animate({
            bottom: '3px'
        }, 400);
        $('.backoffice .dashboard').slideUp();
        $('.backoffice .arrow img').attr('src', '/assets/img/backoffice/arrow-up.png');
    } else {
        $('.backoffice .onglets').animate({
            bottom: '179px'
        }, 400);
        $('.backoffice .action').animate({
            bottom: '185px'
        }, 400);
        $('.backoffice .dashboard').slideDown();
        $('.backoffice .arrow img').attr('src', '/assets/img/backoffice/arrow.png');
    }
//    }
}

function changeOnglet(next) {
    if (next == 'parcours') {
        $('.backoffice .dashboard .parcours .rubrique .content').css('height', '300px');
        $('.backoffice .dashboard').css('height', '300px');
        $('.backoffice .onglets').css('bottom', '300px');
        $('.backoffice .action').css('bottom', '300px');
         window.points = [];
        window.collectionPoints = [];

        window.typeClick = 0;
        //Type click = 0 : Normal
        //Type click = 1 : Ajout
        //Type click = 2 : Enlever

        var echelle = document.querySelector('.echelle'),
                unite = echelle.offsetWidth,
                fenetre = document.querySelector('#cadrillage'),
                positionCadrillage = {
            left: $('#cadrillage').offset().left,
            top: $('#cadrillage').offset().top
        },
        tailleFenetre = {
            hauteur: fenetre.offsetHeight,
            largeur: fenetre.offsetWidth
        };
        Point.echelle = unite;
        console.log(Point.echelle);
        function getCentre(origine, fin, longueur, largeur) {
            return  {
                x: ((origine.x + fin.x) / 2) - (longueur / 2),
                y: ((origine.y + fin.y) / 2) - (largeur / 2) - 1
            };
        }
        function getOrigine(point) {
            return  {
                x: parseInt(point.style.left) + 5,
                y: parseInt(point.style.top) + 5
            };
        }
        function getDistance(origine, fin) {
            return Math.sqrt(((fin.x - origine.x) * (fin.x - origine.x)) + ((fin.y - origine.y) * (fin.y - origine.y)));
        }
        function toMetre(distance) {
            return distance / unite;
        }
        function creationLigne(left, top, distance, angle) {
            var div = document.createElement('div');
            div.style.width = distance + 'px';
            div.style.left = left + 'px';
            div.style.top = top + 'px';
            div.style.transform = 'rotate(' + angle + 'deg)';
            div.className = 'ligne';
            document.querySelector('#cadrillage').appendChild(div);
        }
        function getAngle(origine, fin) {
            return Math.atan2((origine.y - fin.y), (origine.x - fin.x)) * (180 / Math.PI);
        }

        document.querySelector('#cadrillage').addEventListener('click', function(e) {
            if (window.typeClick === 1) {
                var div = document.createElement('div'),
                        index = window.collectionPoints.length - 1;

                div.className = 'point';
                console.log(e);
                console.log($('#cadrillage').offset());
                div.style.left = (e.clientX - 5 - $('#cadrillage').offset().left) + 'px';
                div.style.top = (e.clientY - 5 - $('#cadrillage').offset().top) + 'px';
                this.appendChild(div);

                if (window.collectionPoints[index]) {
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
            for (var i = 0; i < tailleFenetre.largeur; i += unite) {
                var ligneHorizontale = document.createElement('div'),
                        ligneVerticale = document.createElement('div');

                ligneVerticale.className = 'vertical';
                ligneVerticale.style.left = i + 'px';
                ligneVerticale.style.width = '0';
                vertical.push(ligneVerticale);
                document.querySelector('#cadrillage').appendChild(ligneVerticale);

                ligneHorizontale.style.width = '0';
                ligneHorizontale.className = 'horizontal';
                ligneHorizontale.style.top = i + 'px';
                horizontal.push(ligneHorizontale);
                document.querySelector('#cadrillage').appendChild(ligneHorizontale);
            }
            decalage(horizontal, j, 300, 'width');
            decalage(vertical, j, 300, 'height');
        }
        function decalage(collection, index, temps, style) {
            setTimeout(function() {
                if (collection[index]) {
                    if (style === 'height') {
                        collection[index].style.width = '100%';
                        collection[index].style.top = -(index) + 'px';
                    }
                    else {
                        collection[index].style.width = '100%';
                    }
                    decalage(collection, index + 1, temps, style);
                }
            }, temps);
        }
        var boutons = document.querySelectorAll('#controleHaut [data-role="boutonTypeClick"]');
        for (var i = 0; i < boutons.length; i++) {
            boutons[i].addEventListener('click', function() {

                var boutons = document.querySelectorAll('#controleHaut [data-role="boutonTypeClick"]');
                for (var i = 0; i < boutons.length; i++) {
                    boutons[i].classList.remove('active');
                }

                var attribute = parseInt(this.getAttribute('data-type'));
                if (window.typeClick === attribute) {
                    window.typeClick = 0;
                }
                else {
                    this.classList.add('active');
                    window.typeClick = attribute;
                }


            }, true);
        }
        cadrillage();
    } else {
        $('.backoffice .onglets').animate({
            bottom: '179px'
        }, 400);
        $('.backoffice .action').animate({
            bottom: '185px'
        }, 400);
        $('.backoffice .dashboard .parcours').css('height', '179px');
        $('.backoffice .dashboard').css('height', '179px');
        $('.backoffice .onglets').css('bottom', '179px');
        $('.backoffice .action').css('bottom', '179px');
    }
    $('.onglets .single').removeClass('active');
    $('.onglets .single').addClass('inactive');
    $('.onglets .single.' + next).addClass('active');
    $('.onglets .single.' + next).removeClass('inactive');
    $('.backoffice .dashboard').slideDown();
    $('.backoffice .arrow img').attr('src', '/assets/img/backoffice/arrow.png');
    $('.onglet-content').fadeOut();
    $('.onglet-content.' + next).fadeIn();

}