	var music = new Audio();	
var notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
var selectAccRandom = ["maj","maj7","m","m7","aug","dim","7","5","sus2","sus4"]; //sélection random d'un accord
var selectNoteRandom = notes; //sélection random d'un accord
var fileName = location.href.split("/").slice(-1).toString();
var extension = ".html";
var noteAccords = "";
var valueRoot;
var valueaccord;	
function init(){
	$("#accordTableau td").click(function(){
			var val = $(this).text();
			val = val.replace("majeur septième","maj7");
			val = val.replace("mineur septième","m7");
			val = val.replace("majeur","maj");
			val = val.replace("mineur","m");
			val = val.replace("augmenté","aug");
			val = val.replace("diminué","dim");
			val = val.replace("power","5");
			
			if(val.includes("septième de dominante")) val = "7";
		
			
			$(this).toggleClass("unselected");

			
			if($(this).hasClass("unselected")){
				
				
	
				var index = selectAccRandom.indexOf(val);

					if(index!=-1){

				   selectAccRandom.splice(index, 1);
				   console.log(selectAccRandom);
				  
				}
			
			}else{
				
				selectAccRandom.push(val);
				   console.log(selectAccRandom);
				
			}

		
		
		});
		
			$("#fondamentaleTableau td").click(function(){
			var val = $(this).text();
			val = val.slice(0,val.search("/"));

			
			if(val.includes("septième de dominante")) val = "7";
		
			
			$(this).toggleClass("unselected");

			
			if($(this).hasClass("unselected")){
				
				
	
				var index = selectNoteRandom.indexOf(val);

					if(index!=-1){

				   selectNoteRandom.splice(index, 1);
				
				  
				}
			
			}else{
				
				selectNoteRandom.push(val);
		
				
			}

		
		
		});
affinotes();
}


function affinotes(){

var context = document.getElementById('boo');

context.innerHTML = "";

fileName = fileName.replace(extension,"");

if(fileName == "recoAccord"){
	

/*	var cellAccord = document.getElementById("#cellAccord");
	var cellRoot = document.getElementById("#cellRoot");*/
	


	valueaccord = selectAccRandom[Math.floor(Math.random() * selectAccRandom.length)];
	console.log("VAL RAND : "+valueaccord);
	valueRoot = selectNoteRandom[Math.floor(Math.random() * notes.length)];
	console.log("NOTE RAND : "+valueRoot);

	
	
}
			






if(fileName == "geneAccords"){

	




var root = document.getElementById('fondamentale');

valueRoot = root.options[root.selectedIndex].value;
rootIndex = notes.indexOf(valueRoot);


var accord = document.getElementById('accord');

valueaccord = accord.options[accord.selectedIndex].value;

}
affiAccord(valueRoot,valueaccord);
	console.log("VAL RAND : "+valueaccord);
noteAccords = choixAccord(valueRoot,valueaccord);

console.log("array de notes : "+noteAccords);
console.log("ROOT : "+valueRoot);
var i;

/*for(i = 0; i < noteAccords.length; i++){
	
	if(i < noteAccords.length-1){
	noteAccords[i] = noteAccords[i]+"/w, ";
	}
	
	else{
		
	noteAccords[i] = noteAccords[i];
	}

}*/

var listeNotes = "";
music.pause();
noteAccords.forEach(function(note){
	
	listeNotes+= note+" ";
	console.log("NOTE ACCORD :"+note);


});



	
	listeNotes = "("+listeNotes+")/w";

console.log("LISTE :"+listeNotes);


const VF = Vex.Flow;

//créer un rendu SVG
var vf = new VF.Factory({renderer: {elementId: 'boo', width: "150", height: "120"}});
var score = vf.EasyScore();
var system = vf.System();

system.addStave({
  voices: [score.voice(score.notes(listeNotes))]
}).addClef('treble');

vf.draw();


}
function play(noteAccords){
	
	noteAccords.forEach(function(note){
	

	loadSound(note.trim());

	});
}
function choixAccord(root,valueaccord){
	
	var bemols = ["C4","Db4","D4","Eb4","E4","F4","Gb4","G4","Ab4","A4","Bb4","B4","C5","Db5","D5","Eb5","E5","F5","Gb5","G5","Ab5","A5","Bb5","B5"];
	var dieses = ["C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5"];
	var notesListe = [];
console.log("ROOT :"+root);
//AFFICHAGE BEMOLS DIESES EN FONCTION DU CYCLE DES QUINTES
	
	

switch (valueaccord.includes("maj")) {
	
	case true:

	
	notesListe = dieses;
	
	break;

	case false:
	
	notesListe = bemols;
	break;
	

}


var intervalles;
var notesAccord = [];
console.log("VALEUR VANT INTERVALLES : "+valueaccord);
switch(valueaccord){ //INTERVALLES ACCORDS EN DEMI-TONS


	case "maj":
	
		intervalles = [0,4,7];
	break;
	case "m":
	case "min":

		intervalles = [0,3,7];
		
	break;
	case "sus2":

		intervalles = [0,2,7];
		
	break;
	case "sus4":

		intervalles = [0,5,7];
		
	break;
	case "5":

		intervalles = [0,7];
		
	break;
	case "maj7":

		intervalles = [0,4,7,11];
		
	break;
	case "m7":
	case "min7":

		intervalles = [0,3,7,10];
		
	break;
	case "7":

		intervalles = [0,4,7,10];
		
	break;
	case "dim":

		intervalles = [0,3,6];
		
	break;
	case "aug":

		intervalles = [0,4,8];
		
	break;
	


}

intervalles.forEach(function(interval){

var offset = (notes.indexOf(root)+interval)%24;


notesAccord.push(notesListe[(offset%24)]);




});
console.log("PUSH : "+notesAccord);
return notesAccord;
}

function affiAccord(valueroot,valueAccord){
	var qualite = valueAccord;
	switch(valueAccord){
		
		case "maj":
		
			qualite = "maj";
			
		break;
		case "maj7":
		
			qualite = "maj7";
			
		break;
		case "min":
		
			qualite = "m";
			
		break;
		case "min7":
		
			qualite = "m7";
			
		break;
		default:
		
			qualité = valueAccord;
		break;
	}
	
		var titre = document.getElementById('nomAccord');

	traduire(titre,valueroot,qualite);
		
	
}

function toggleLanguage(){
var titre = document.getElementById('langue');
	var txt = document.getElementById('langueT');

	if(titre.checked){txt.innerHTML="US"; return "US"}else {txt.innerHTML="FR";return "FR";}
	
	
}

function traduire(titre,valueroot,valueaccord){
	

console.log("lang : "+toggleLanguage());
	
	if(toggleLanguage() == "US"){
		
		
		
	}
	
	if(toggleLanguage() == "FR"){
		//ON REMPLACE LES NOTES PAR CELLES SU SOLFEGE
		
	var remplacement;
		if(valueroot.includes("C")){
			remplacement = valueroot.replace("C","Do");		
		}
		if(valueroot.includes("D")){
			remplacement = valueroot.replace("D","Ré");		
		}
		if(valueroot.includes("E")){
			remplacement = valueroot.replace("E","Mi");		
		}
		if(valueroot.includes("F")){
			remplacement = valueroot.replace("F","Fa");		
		}
		if(valueroot.includes("G")){
			remplacement = valueroot.replace("G","Sol");		
		}
		if(valueroot.includes("A")){
			remplacement = valueroot.replace("A","La");		
		}
		if(valueroot.includes("B")){
			remplacement = valueroot.replace("B","Si");		
		}
		
		valueroot = remplacement;
		
		
		
	
	var rAccord;
	
	switch(valueaccord){
		
		case "maj":
			rAccord = "majeur";
		break;
		case "m":
			rAccord = "mineur";
		break;
		case "maj7":
			rAccord = "majeur septième";
		break;
		case "m7":
			rAccord = "mineur septième";
		break;		
		case "5":
			rAccord = "power";
		break;
		case "aug":
			rAccord = "augmenté";
		break;
		case "dim":
			rAccord = "diminué";
		break;
		case "7":
			rAccord = "septième de dominante";
		break;				
		case "sus2":
			rAccord = "suspendu(2)";
		break;			
		case "sus4":
			rAccord = "suspendu(4)";
		break;			
		
	}
	
	valueaccord = " "+rAccord;
	}
	
	titre.innerHTML = valueroot+valueaccord;
}


function loadSound(note){
 {
		note = note.replace("Do","C");		
		note = note.replace("Ré","D");		
		note = note.replace("Mi","E");		
		note = note.replace("Fa","F");		
		note = note.replace("Sol","G");		
		note = note.replace("La","A");		
		note = note.replace("Si","B");		
		note = note.replace("Db","C#");		
		note = note.replace("Eb","D#");		
		note = note.replace("Gb","F#");		
		note = note.replace("Ab","G#");
		note = note.replace("Bb","A#");
		note = note.replace("#","%23");		
		
    music = new Audio("../notes/"+note+".mp3");
    music.play();
}
	
	
}

function playChord(){
	
	noteAccords.forEach(function(note){
	

	play(noteAccords);		

});


}