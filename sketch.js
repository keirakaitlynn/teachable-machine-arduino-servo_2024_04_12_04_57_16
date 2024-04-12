const mySoundModelURL = 'https://teachablemachine.withgoogle.com/models/3x0FZN4iO/';
let mySoundModel;
let resultDiv;
let serial;// variable to hold an instance of the serialport library
let portName = 'COM3';// fill in your serial port name here
let outByte = 0;// for outgoing data

// ---
let bright = 0; // variable to hold the data we're sending
let dark, light; // variables to hold the bgcolor
let mX;
let mY = 0;
// ---

function preload() {
  mySoundModel = ml5.soundClassifier(mySoundModelURL+ 'model.json');
}

function setup() {

  // ---
  // createCanvas(512, 512);
  // // define the colors
  // dark = color(0);
  // light = color(255, 204, 0);
  // ---


  resultDiv = createElement('h1',  '...');
  serial = new p5.SerialPort();    // make a new instance of the serialport library
  serial.on('error', serialError); // callback for errors
  serial.open(portName);           // open a serial port
  mySoundModel.classify(gotResults);
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
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


// ---
// function drawGradient(c1, c2) {
//   noFill();
//   for (let y = 0; y < height; y++) {
//     let interp = map(y, 0, height, 0, 1);
//     let c = lerpColor(c1, c2, interp);
//     stroke(c);
//     line(0, y, width, y);
//   }
// }

// function draw() {
//   drawGradient(dark, light);
//   stroke(255);
//   strokeWeight(3);
//   noFill();
//   ellipse(mouseX, mouseY, 10, 10);
// }
// ---