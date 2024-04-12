let serial;// variable to hold an instance of the serialport library
let portName = 'COM3';// fill in your serial port name here
let outByte = 0;// for outgoing data

// ---
let bright = 0; // variable to hold the data we're sending
let dark, light; // variables to hold the bgcolor
let mX;
let mY = 0;
// ---

//EmotionRec
let capture;
let capturewidth = 640;    
let captureheight = 480;
let emotions = ["neutral","happy", "sad", "angry","fearful", "disgusted","surprised"];
let faceapi;
let detections = [];
//EmotionRec


//sound
let song, chimes, rain, thunder, white_noise;
let hasPlayed;
//sound

function preload() {
  chimes = loadSound('chimes.mp3');
  rain = loadSound('rain.mp3');
  thunder = loadSound('thunder.mp3');
  white_noise = loadSound('white-noise.mp3');
  white_noise.setVolume(0.01);
  song = white_noise;
  songs = [chimes, rain, thunder, white_noise];
  songHasPlayed = [false, false, false, false];
  songIndex = 3;
}

function setup() {


  //EmotionRec
  createCanvas(capturewidth, captureheight);
  capture = createCapture(VIDEO);
  capture.position(0,0);
  capture.hide();
  const faceOptions = {withLandmarks: true, withExpressions: true, withDescriptors: false};
  faceapi = ml5.faceApi(capture, faceOptions, faceReady);
  //EmotionRec

  
  serial = new p5.SerialPort();    // make a new instance of the serialport library
  serial.on('error', serialError); // callback for errors
  serial.open(portName);           // open a serial port
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function faceReady(){
  faceapi.detect(gotFaces);
}

function gotFaces(error, result){
  if (error){
    console.log(error);
    return
  }
    detections = result;
    faceapi.detect(gotFaces);
   // console.log(detections);
}
  

function draw() {
  
  background(0);
  
  capture.loadPixels();
  
  push();
  fill('green');
      if(detections.length>0){
        for (i=0; i<detections.length; i ++){
          var points = detections[i].landmarks.positions;

          for (j=0; j<points.length; j ++){
            circle( points[j]._x,points[j]._y, 5);
          }
          
          var neutralLevel = detections[i].expressions.neutral;
          var happyLevel = detections[i].expressions.happy;
          var sadLevel = detections[i].expressions.sad;
          var angryLevel = detections[i].expressions.angry;
          var fearfulLevel = detections[i].expressions.fearful;
          var disgustedLevel = detections[i].expressions.disgusted;
          var surprisedLevel = detections[i].expressions.surprised;
          
          push();
          
          for (k = 0; k<emotions.length; k++) {
            
            var thisemotion = emotions[k];
            
            var thisemotionlevel= detections[i].expressions[thisemotion];
            
            text(thisemotion + " value: " + thisemotionlevel,40,30 + 30 * k );
            rect(40, 30 + 30 * k, thisemotionlevel * 100,10 );
            
            
            
          } 
            
          if (happyLevel > 0.01){
            textSize(60);
            text("😊", 450, 350);
            // twinkle, pastel-color
            mY += 10;
            songIndex = 0;
          }
          else if (neutralLevel > 0.997 || happyLevel > 0.003) {
            textSize(60);
            text("🙂", 450, 350);
            // waves, white
            mY -= 5;
          }
          else if (sadLevel > 0.05 && angryLevel < 0.05 && disgustedLevel < 0.1) {
            textSize(60);
            text("😢", 450, 350);
            mY -= 10;
            songIndex = 3;
          }
          else if ((neutralLevel < 0.997 || sadLevel > 0.01) && angryLevel < 0.05 && disgustedLevel < 0.1) {
            textSize(60);
            text("😐", 450, 350);
            // white-noise, black
            mY -= 5;
            songIndex = 3;
          }
          else if (angryLevel > 0.05 || disgustedLevel > 0.2) {
            textSize(60);
            text("😡", 450, 350);
            // blaze, vibrant-color
            mY = 0;
            songIndex = 2;
          }
          
          }    
    }
    //sound
    console.log(songIndex);
  
  //if song is NOT already Playing, and has NOT already been played
  // if (!songs[songIndex].isPlaying() && !songHasPlayed[songIndex]) {
  // if song is NOT already Playing
  if (!songs[songIndex].isPlaying() && !songHasPlayed[songIndex]) {

    let songIsPlaying = false;

    for(let i=0; i<songHasPlayed.length; i++) {
      console.log(songHasPlayed);
      // determine if any of the songs are playing, and which song isPlaying & stop it
      if (songs[i].isPlaying()) {
        console.log('stopping: ', songs[i]);
        songs[i].stop();
        songHasPlayed[i] = false;
        console.log('AFTER stopping ', songHasPlayed);
      }

      else { // if none of the songs are playing, set play white noise and reset songHasPlayed
        // songIndex = 3;
        for (let i =0; i<songHasPlayed.length; i++) {
          songHasPlayed[i] = false;
        }
      }
    }
    // play song
    songs[songIndex].play();
    if (songIndex != 3) {
      songs[songIndex].setLoop(false);
    }
    else {
      songs[songIndex].setLoop(true);
    }
    userStartAudio();
    songHasPlayed[songIndex] = true;
    console.log('starting ', songs[songIndex]);
    console.log('AFTER starting ', songHasPlayed);
  }
    //sound
    pop();

    // Serial
    bright = floor(map(mY, 0, 512, 0, 255));
    bright = constrain(bright, 0, 255);
    serial.write(bright);
    console.log(bright);
}

function gotResults(err, results) {
  if (err) console.log(err);
  if (results) {
    console.log(results);
    if (results[0].confidence < 0.7) return;
    resultDiv.html('Result is: ' + results[0].label);
    if (results[0].label === 'Red') {
      //commented out
      //outByte = 1;
      mY -= 50;
    } else if (results[0].label === 'Green') {
       //commented out
      //outByte = 2;
      mY += 50;
    } else {
       //commented out
      //outByte = 0;
      mY = 0;
    }
    // send it out the serial port:
    //commented out
    // console.log('outByte: ', outByte)
    // serial.write(outByte + '\n');

    // ---

    bright = floor(map(mY, 0, 512, 0, 255));
    bright = constrain(bright, 0, 255);
    serial.write(bright);
    console.log(bright);
    // ---
  }
}