$(document).ready(function () {
	$('.close-btn').click(function(e){
		hideNav();
		console.log('da');
	});

	function hideNav(){
		$('nav-wrap').style('display', 'none');
	}

	function showNav(){
		
	}
});