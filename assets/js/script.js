$(document).ready(function() {
    //Chargement onglet informations
    $('.onglet-content.information').show();
    var socket = io.connect("http://localhost:3000"),
        duree = 0,
        timeoutChrono;

        socket.on("navdata", function(data){
            var batterie = $('.information .infos-batterie'),
                niveau = data['demo']['batteryPercentage'];
            $('.information .infos-altitude').html(data['demo']['altitude']+' m');
            $('.information .infos-vitesse').html(data['demo']['xVelocity']+' m/s');
            if(niveau > 20) {
                batterie.removeClass('danger');
            }
            else {
                batterie.addClass('danger');
            }
            batterie.html(niveau+'%');
            $('.information .infos-inclinaison').html(data['demo']['rotation']['clockwise']+'°');
            $('.information .infos-frontBack').html(data['demo']['rotation']['frontBack']+'°');
            $('.information .infos-leftRight').html(data['demo']['rotation']['leftRight']+'°');

        });
  
    //Lancement du stream
  //  new NodecopterStream(document.getElementById("droneStream"));

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
    });
    
    $('#stop').on('click', function() {
        duree = 0;
        clearTimeout(timeout);
        $('.distance .infos').html('0 s');
        socket.emit('arretDrone', '1');
    });
    
    function incrementationChrono() {
        var minute = parseInt(duree / 60),
            secondes = duree % 60,
            chaine = secondes+' s';
        duree++;
        if(minute > 0) {
            chaine = minute+' min '+chaine;
        }
        $('.distance .infos').html(chaine);
        timeout = setTimeout(incrementationChrono, 1000);
    }
});

function getUpDownOnglets() {
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
}

function changeOnglet(next) {
    $('.backoffice .onglets').animate({
        bottom: '179px'
    }, 400);
    $('.backoffice .action').animate({
        bottom: '185px'
    }, 400);
    $('.onglet-content').fadeOut();
    $('.backoffice .dashboard').slideDown();
    $('.backoffice .arrow img').attr('src', '/assets/img/backoffice/arrow.png');
    $('.onglets .single').removeClass('active');
    $('.onglets .single').addClass('inactive');
    $('.onglet-content.' + next).fadeIn();
    $('.onglets .single.' + next).removeClass('inactive');
    $('.onglets .single.' + next).addClass('active');
}