function updateScore(j1, j2, score1, score2){
	$('#score').text(j1 + " " + score1 + " X " + score2 + " " + j2);  				
}

function setSetup(){
	$('#game').hide();
	$('#setup').fadeIn(1200);
	$('#j1').val("");
	$('#j2').val("");
	$('#alert').hide();
}

function setGame(j1){
	$('#setup').hide();
	$('#game').fadeIn(1200);
	$('#player-turn').text("Vez de " + j1);
}

function turn($this, currentPlayer, j1, j2){
	$this.attr("disabled", "disabled");
	if(currentPlayer){
		$this.text("x");
		$this.addClass("j1");
		$('#player-turn').text("Vez de " + j2);  					
	}
	else{
		$this.text("o");
		$this.addClass("j2");
		$('#player-turn').text("Vez de " + j1);  					
	}
	checkWinner(currentPlayer);
}

function checkWinner(currentPlayer){
	var classPlayer;
	if(currentPlayer){
		classPlayer = "j1";
	}
	else{
		classPlayer = "j2";
	}
	if(	$("#btn1").hasClass(classPlayer) && $("#btn2").hasClass(classPlayer) && $("#btn3").hasClass(classPlayer) ||
		$("#btn4").hasClass(classPlayer) && $("#btn5").hasClass(classPlayer) && $("#btn6").hasClass(classPlayer) ||
		$("#btn7").hasClass(classPlayer) && $("#btn8").hasClass(classPlayer) && $("#btn9").hasClass(classPlayer) ||
		$("#btn1").hasClass(classPlayer) && $("#btn4").hasClass(classPlayer) && $("#btn7").hasClass(classPlayer) ||
		$("#btn2").hasClass(classPlayer) && $("#btn5").hasClass(classPlayer) && $("#btn8").hasClass(classPlayer) ||
		$("#btn3").hasClass(classPlayer) && $("#btn6").hasClass(classPlayer) && $("#btn9").hasClass(classPlayer) ||
		$("#btn1").hasClass(classPlayer) && $("#btn5").hasClass(classPlayer) && $("#btn9").hasClass(classPlayer) ||
		$("#btn3").hasClass(classPlayer) && $("#btn5").hasClass(classPlayer) && $("#btn7").hasClass(classPlayer) 
	){
		return true;
	}
	return false;  				
}

function checkDraw(){
	var count = 0;
	$(".btn-game").each(function(){
		if($(this).hasClass("j1") || $(this).hasClass("j2")) count+=1; 					
	});
	if(count == 9) return true;
	return false;
}

function restartGame(){
	$(".btn-game").each(function(){
		$(this).removeAttr("disabled");
		$(this).removeClass("j1");
		$(this).removeClass("j2");
		$(this).text(""); 					
	});
}

$(document).ready(function(){
	var j1 = "";
	var j2 = "";
	var score1 = 0;
	var score2 = 0;
	var currentPlayer = true;
	$('#game').hide();
	$('#alert').hide();

	$('#btn-game').click(function(){

		if($('#j1').val() == "" || $('#j2').val() == ""){
			$('#alert').fadeIn(400);
		}
		else{
			j1 = $('#j1').val();
			j2 = $('#j2').val();
			setGame(j1);
			updateScore(j1, j2, score1, score2);
		}
		
	});

	$('#change-names').click(function(){
		score1 = 0;
		score2 = 0;  					
		setSetup();
		restartGame();
	});

	$('.btn-game').click(function(){
		turn($(this), currentPlayer, j1, j2);
		if(checkWinner(currentPlayer)){
			if(currentPlayer){
				alert(j1+ " " + "ganhou!");
				score1 += 1;
				$('#score').text(j1 + " " + score1 + " X " + score2 + " " + j2);
				restartGame();
				$('#player-turn').text("Vez de " + j2);
			}
			else{
				alert(j2+ " " + "ganhou!");
				score2 += 1;
				$('#score').text(j1 + " " + score1 + " X " + score2 + " " + j2);
				restartGame();
				$('#player-turn').text("Vez de " + j1);
			}
		}
		if(checkDraw()){
			alert("Empate!");
			restartGame();
			if(currentPlayer){
				$('#player-turn').text("Vez de " + j2);
			}
			else{
				$('#player-turn').text("Vez de " + j1);
			}
		}
		currentPlayer = !currentPlayer;  					  					
	});

	$('#restart').click(function(){
		restartGame();
	});
});