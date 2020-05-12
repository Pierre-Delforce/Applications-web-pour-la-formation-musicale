var music = new Audio();
var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var selectAccRandom = ["maj", "maj7", "m", "m7", "aug", "dim", "7", "5", "sus2", "sus4"]; //sélection random d'un accord
var selectNoteRandom = notes; //sélection random d'une fondamentale
var fileName = location.href.split("/").slice(-1).toString(); // va déterminer le nom de la page HTML qui a appelé ce fichier. Pratique quand on veut exécuter du code lors de l'exécution d'une page spécifique
var extension = ".html";
var noteAccords = "";
var valueRoot; //va contenir la valeur de la fondamentale de l'accord sélectionné
var valueaccord; //va contenir la qualité de l'accord sélectionné (maj, m, m7, sus2, ...)


/////////////////////////////////////////////////////////////////////	MODULE D'AFFICHAGE/GESTION AFFICHAGE	//////////////////////////////////////////////////////////////////


/*
Fonction init : 

dans le cas de la génération d'accords, va remplacer les valeurs par des valeurs d'accords exploitables (ex : maj, m, 7) lors du clic sur l'un des éléments des tableaux.
en général, cette fonction est lancée dès le load du body, et va permettre de capturer les informations lors d'événements sur le clic.
Ensuite, elle appelle la fonction affinotes qui va directement afficher un accord. Dans le cas de recoAccord.html, cet accord sera aléatoire. Dans le cas de geneaccords , cet accord sera le premier accord sélectionné, au lancement, soit un Do majeur.

*/
function init() {
    $("#accordTableau td").click(function() {
        var val = $(this).text();
        val = val.replace("majeur septième", "maj7");
        val = val.replace("mineur septième", "m7");
        val = val.replace("majeur", "maj");
        val = val.replace("mineur", "m");
        val = val.replace("augmenté", "aug");
        val = val.replace("diminué", "dim");
        val = val.replace("power", "5");

        if (val.includes("septième de dominante")) val = "7";


        $(this).toggleClass("unselected"); //Ajouter/enlever la classe "unselected" lors du clic 


        if ($(this).hasClass("unselected")) { //si la case est non-selectionnée, alors, il faut enlever du tableau de selection random avec un splice()



            var index = selectAccRandom.indexOf(val);

            if (index != -1) {

                selectAccRandom.splice(index, 1);


            }

        } else {

            selectAccRandom.push(val); //si la case est cochée, on la rentre dans l'array de sélection


        }



    });

    $("#fondamentaleTableau td").click(function() {
        var val = $(this).text();
        val = val.slice(0, val.search("/"));


        if (val.includes("septième de dominante")) val = "7";


        $(this).toggleClass("unselected"); //Ajouter/enlever la classe "unselected" lors du clic 


        if ($(this).hasClass("unselected")) { //si la case est non-selectionnée, alors, il faut enlever du tableau de selection random avec un splice()



            var index = selectNoteRandom.indexOf(val);

            if (index != -1) {

                selectNoteRandom.splice(index, 1);


            }

        } else {

            selectNoteRandom.push(val); //si la case est cochée, on la rentre dans l'array de sélection


        }



    });
    affinotes();
}
/*

fonction affinotes():

c'est la fonction la plus complexe et la plus longue. Elle est le centre des autres fonctions et la fonction principale de accords.js pour l'exploitation des partitions.

Dans la page de reconnaissance d'accord,celle ci va d'abord générer de manière aléatoire une notre de fondamentale, et une qualité d'accord. 

Dans la page de génération, on va récupérer les valeurs demandées par le user , sans les formater.

Ensuite, l'appel à la fonction affiaccord est effectué, puis celui à noteAccords.

affinotes() va formater le renvoi de la fonction notesAccords pour le rendre exploitable avec l'API VexFlow, et ensuite afficher la partition.

Cette partition accepte en paramètres (au travers de easyScore) le format "(note1 note2 ... noteN)/duration" avec duration valant une durée , par exemple /w pour Whole (ronde).

Attention : la mesure est obligée d'être remplie pour apparaître, donc mettre /w permet de remplir la mesure (easy en 4/4).



*/

function affinotes() {

    var context = document.getElementById('boo');

    context.innerHTML = "";

    fileName = fileName.replace(extension, "");

    if (fileName == "recoAccord") {
        //Si on est sur la page de reconnaissance, alors on va générer aléatoirement , depuis les tableaux correspondant, une qualité d'accord et une root




        valueaccord = selectAccRandom[Math.floor(Math.random() * selectAccRandom.length)];

        valueRoot = selectNoteRandom[Math.floor(Math.random() * notes.length)];




    }




    if (fileName == "geneAccords") {
        //Si on est dans la génération d'un accord particulier, on va prendre les données fournies par l'utilisateur pour la root et l'accord



        var root = document.getElementById('fondamentale');

        valueRoot = root.options[root.selectedIndex].value;
        rootIndex = notes.indexOf(valueRoot);


        var accord = document.getElementById('accord');

        valueaccord = accord.options[accord.selectedIndex].value;

    }
    affiAccord(valueRoot, valueaccord);
    console.log("VAL RAND : " + valueaccord);
    noteAccords = choixAccord(valueRoot, valueaccord);

    console.log("array de notes : " + noteAccords);
    console.log("ROOT : " + valueRoot);
    var i;


    var listeNotes = ""; //reset de la liste des notes de l'accord avant de la remplir


    //formatter chaque note issue de noteAccords() individuellement 
    noteAccords.forEach(function(note) {

        listeNotes += note + " ";
        console.log("NOTE ACCORD :" + note);


    });




    listeNotes = "(" + listeNotes + ")/w"; //mise en forme pour VexFlow

    console.log("LISTE :" + listeNotes);


    const VF = Vex.Flow;

    //créer un rendu SVG
    var vf = new VF.Factory({
        renderer: {
            elementId: 'boo',
            width: "150",
            height: "120"
        }
    });
    var score = vf.EasyScore();
    var system = vf.System();

    system.addStave({
        voices: [score.voice(score.notes(listeNotes))] //ajout d'une voix avec l'accord
    }).addClef('treble');

    vf.draw();

    music.pause();

}



/////////////////////////////////////////////////////////////////////	MODULE DE SELECTION DE NOTES	//////////////////////////////////////////////////////////////////


/* 

fonction choixAccord(root, valueaccord):

cette fonction est très importante et très polyvalente. 

Premièrement, elle va repérer s'il faut utiliser des bémols ou des dièses.

Ensuite, elle va convertir une qualité ecrite d'un accord en un array contenant les intervalles en demi-tons correspondants.

par exemple, si valueaccord vaut "maj", alors l'array intervalles vaudra [0,4,7].

ex : C E G (Cmaj) . E est la tierce majeure de C (donc 4 demi-tons) , et G est la quinte juste (donc 7 demi-tons).

Ensuite, elle va parcourir les notes (bémols ou dièses), et sortir les notes correspondant aux intervalles PAR RAPPORT à la fondamentale.

Par exemple, sur un accord de Ré majeur (D4 F#4 A4), la fonction va déterminer la place de D dans les notes. ici, D4 est en 3e position , soit notesListe[2].

la variable offset vaudra ici 3, car l'emplacement de la fondamentale dans la liste est en 3e place (notesListe[2])

elle va y ajouter un "offset" , soit la place de la note sélectionné par le tableau d'intervalles, plus la place de la fondamentale dans la liste. Ici, la fondamentale est D, donc le décalage sera de 0. Ainsi , la note à 0 demi-tons de D4, est bien D4.

Passons à F#4. On doit donc avoir la notes 4 demi-tons au-dessus de F#, et non pas de la première note de la liste.

. donc 4 demi-tons +3 = 7.

C'est juste, car la 7e note de notesListe est bien F#4 ou Gb4 !

de même pour A4, 7+3 = 10. A4 est bien en 10e position.


J'y ai laissé des console.log pour mieux comprendre, en ouvrant la console du navigateur.

J'ai aussi travaillé sur une gestion du modulo, pour retourner au départ de la liste si on atteint la fin. bien que cela soit inutile car aucun accord ici ne dépasse l'octave , on ne sait jamais.

Cette fonction retourne un array qui contient les notes de l'accord.

par exemple, choixAccord("E","maj7") va retourner [E4,G#4,B4,D#5]. Cette fonction est très pratique et peut être facilement améliorée par ajout de cas dans les switch.


*/
function choixAccord(root, valueaccord) {

    var bemols = ["C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4", "C5", "Db5", "D5", "Eb5", "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5"];
    var dieses = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"];
    var notesListe = [];
    console.log("ROOT :" + root);
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
    console.log("VALEUR AVANT INTERVALLES : " + valueaccord);
    switch (valueaccord) { //INTERVALLES ACCORDS EN DEMI-TONS


        case "maj":

            intervalles = [0, 4, 7];
            break;
        case "m":
        case "min":

            intervalles = [0, 3, 7];

            break;
        case "sus2":

            intervalles = [0, 2, 7];

            break;
        case "sus4":

            intervalles = [0, 5, 7];

            break;
        case "5":

            intervalles = [0, 7];

            break;
        case "maj7":

            intervalles = [0, 4, 7, 11];

            break;
        case "m7":
        case "min7":

            intervalles = [0, 3, 7, 10];

            break;
        case "7":

            intervalles = [0, 4, 7, 10];

            break;
        case "dim":

            intervalles = [0, 3, 6];

            break;
        case "aug":

            intervalles = [0, 4, 8];

            break;



    }

    intervalles.forEach(function(interval) {

        var offset = (notes.indexOf(root) + interval) % 24;


        notesAccord.push(notesListe[(offset % 24)]);




    });
    console.log("PUSH : " + notesAccord);
    return notesAccord;
}

/*

fonction affiaccord(valueroot,valueAccord):

cette fonction va simplement mettre en forme le texte pour afficher le nom de l'accord, en dessous de la partition. Celle ci fait appelle à la fonction traduire().

*/
function affiAccord(valueroot, valueAccord) {
    var qualite = valueAccord;
    switch (valueAccord) {

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

    traduire(titre, valueroot, qualite);


}




/////////////////////////////////////////////////////////////////////	MODULE DE TRADUCTION	//////////////////////////////////////////////////////////////////

/*

fonction toggleLanguage(){
	
	cette fonction sert à faire un toggle de langues : FR/US
Elle est appelée à chaque appui sur le switch de langue, et retourne "US" ou "FR".
*/
function toggleLanguage() {
    var titre = document.getElementById('langue');
    var txt = document.getElementById('langueT');

    if (titre.checked) {
        txt.innerHTML = "US";
        return "US"
    } else {
        txt.innerHTML = "FR";
        return "FR";
    }


}
/*

fonction traduire(titre, valueroot, valueaccord):

cette fonction va traduire en français ou US (en fonction du retour de toggleLanguage()), puis traduire aussi la qualité de l'accord pour le mettre dans titre.innerHTML , qui est le nom de l'accord en dessous de la partition.

ne retourne rien, mais permet de traduire directement la langue.

*/
function traduire(titre, valueroot, valueaccord) {


    console.log("lang : " + toggleLanguage());

    if (toggleLanguage() == "US") {



    }

    if (toggleLanguage() == "FR") {
        //ON REMPLACE LES NOTES PAR CELLES SU SOLFEGE

        var remplacement;
        if (valueroot.includes("C")) {
            remplacement = valueroot.replace("C", "Do");
        }
        if (valueroot.includes("D")) {
            remplacement = valueroot.replace("D", "Ré");
        }
        if (valueroot.includes("E")) {
            remplacement = valueroot.replace("E", "Mi");
        }
        if (valueroot.includes("F")) {
            remplacement = valueroot.replace("F", "Fa");
        }
        if (valueroot.includes("G")) {
            remplacement = valueroot.replace("G", "Sol");
        }
        if (valueroot.includes("A")) {
            remplacement = valueroot.replace("A", "La");
        }
        if (valueroot.includes("B")) {
            remplacement = valueroot.replace("B", "Si");
        }

        valueroot = remplacement;




        var rAccord;

        switch (valueaccord) {

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

        valueaccord = " " + rAccord;
    }

    titre.innerHTML = valueroot + valueaccord;
}



/////////////////////////////////////////////////////////////////////	MODULE DE SON	//////////////////////////////////////////////////////////////////




/*

fonction play(noteAccords) :

cette fonction va jouer chaque note d'un array contenant des notes. si l'array contient [C5,C6,B4] alors celle ci va jouer ces 3 notes en simultané.
le trim() va enlever tout espace superflu.
Celle ci fait appel à la fonction loadSound() qui permet de formatter les notes françaises en anglais et de rajouter le chemin d'accès.

*/
function play(noteAccords) {
    noteAccords.forEach(function(note) {


        loadSound(note.trim());

    });
}
/*

fonction loadSound(note):

cette fonction va : 

-transformer le nom d'une note pour le rendre exploitable
-charger un fichier ayant pour nom le nom de la note, au format mp3, dans le dossier "../notes/".
-le jouer

Aucun retour.

*/
function loadSound(note) {

    note = note.replace("Do", "C");
    note = note.replace("Ré", "D");
    note = note.replace("Mi", "E");
    note = note.replace("Fa", "F");
    note = note.replace("Sol", "G");
    note = note.replace("La", "A");
    note = note.replace("Si", "B");
    note = note.replace("Db", "C#");
    note = note.replace("Eb", "D#");
    note = note.replace("Gb", "F#");
    note = note.replace("Ab", "G#");
    note = note.replace("Bb", "A#");
    note = note.replace("#", "%23");

    music = new Audio("../notes/" + note + ".mp3");

    music.play();
}


/*

function playChord():

même chose que play, mais joue directement l'accord ACTUELLEMENT chargé. d'ou l'absence de paramètres dans le prototype de la fonction. Utile pour le bouton "jouer accord" car les paramètres en HTML ne sont pas très explicites
*/

function playChord() {
    music.pause();
    noteAccords.forEach(function(note) {


        play(noteAccords);

    });


}