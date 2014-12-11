$(document).ready(function() {
    //Chargement onglet informations
    $('.onglet-content.information').show();
    var socket = io.connect("http://localhost:3000");
    console.log('oucou');
        socket.on("navdata", function(data){
            console.log(data);
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