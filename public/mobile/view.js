$(document).ready(function() {
    $('.close-btn').click(function(e) {
        hideNav();
    });

    $('.show-btn').click(function(e) {
        showNav();
    });

    function hideNav() {
        $('.nav-wrap').css('display', 'none');
        $('.chat').css('width', '100%');
    }

    function showNav() {
    	$('.nav-wrap').css('display', 'inline-block');
        $('.chat').css('width', '70%');
    }

    if(window.screen.width< window.screen.height){
        //portrait
        $('#message_text').css('font-size', '33px');
        $('#message_btn').css('font-size', '23px');
        $('.messages').css('font-size', '35px');
        $('.form').css('height', '80px');
        $('.messages').css('height', 'calc(100% - 100px)');
    }else{
        //landscape
        $('#message_text').css('font-size', '25px');
        $('#message_btn').css('font-size', '20px');
        $('.messages').css('font-size', '18px');
        $('.form').css('height', '50px');
        $('.messages').css('height', 'calc(100% - 70px)');
    }


    window.addEventListener("orientationchange", function() {
        if(window.screen.width< window.screen.height){
            //portrait
            $('#message_text').css('font-size', '33px');
            $('#message_btn').css('font-size', '23px');
            $('.messages').css('font-size', '35px');
            $('.form').css('height', '80px');
            $('.messages').css('height', 'calc(100% - 100px)');
        }else{
            //landscape
            $('#message_text').css('font-size', '25px');
            $('#message_btn').css('font-size', '20px');
            $('.messages').css('font-size', '18px');
            $('.form').css('height', '50px');
            $('.messages').css('height', 'calc(100% - 70px)');
        }
    }, false);


});