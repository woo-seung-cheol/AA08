// db33rgb.js

var serialport = require('serialport');
var portName = 'COM4';  // check your COM port!!
var port    =   process.env.PORT || 3000;  // port for DB

var io = require('socket.io').listen(port);

// MongoDB
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/project", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("mongo db connection OK.");
});
// Schema
var axisSchema = new Schema({
    date : String,
    accel_x : String,
    accel_y : String,
    accel_z : String,
    gyro_x : String,
    gyro_y : String,
    gyro_z : String,
    mag_x : String,
    mag_y : String,
    mag_z : String
}, {
    versionKey : false
});
// Display data on console in the case of saving data.
axisSchema.methods.info = function () {
    var axisInfo = this.date ?
    "Current date: " + this.date 
    + ", accel_x : " + this.accel_x  + ", accel_y : " + this.accel_y + ", accel_z : " + this.accel_z 
    + ", gyro_x : " + this.gyro_x + ", gyro_y : " + this.gyro_y + ", gyro_z : " + this.gyro_z 
    + ", mag_x: " + this.mag_x + ", mag_y : " + this.mag_y + ", mag_z: " + this.mag_z : "I don't have a date";

    console.log("axisInfo: " + axisInfo);
}


const Readline = require("@serialport/parser-readline");

// serial port object
var sp = new serialport(portName, {
  baudRate: 9600, // 9600  38400
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: false,
  parser: new Readline("\r\n"),
  //   parser: serialport.parsers.readline("\r\n"), // new serialport.parsers.Readline
});

// set parser
const parser = sp.pipe(new Readline({ delimiter: "\r\n" }));

// Open the port 
// sp.on("open", () => {
//     console.log("serial port open");
//   });

var readData = '';  // this stores the buffer
var accel_x  = '';
var accel_y  = '';
var accel_z  = '';
var gyro_x  = '';
var gyro_y  = '';
var gyro_z  = '';
var mag_x  = '';
var mag_y  = '';
var mag_z  = '';

var mdata =[]; // this array stores date and data from multiple sensors
var first = 0;
var second = 0;
var third = 0;
var fourth = 0;
var fifth = 0;
var sixth = 0;
var seventh = 0;
var eighth = 0;
var nineth = 0;

var Sensor = mongoose.model("Sensor", axisSchema);  // sensor data model

// process data using parser
parser.on('data', (data) => { // call back when data is received
    readData = data.toString(); // append data to buffer
    first = readData.indexOf(','); 
    second = readData.indexOf(',',first+1);
    third = readData.indexOf(',',second+1);
    fourth = readData.indexOf(',',third+1);
    fifth = readData.indexOf(',',fourth+1);
    sixth = readData.indexOf(',',fifth+1);
    seventh = readData.indexOf(',',sixth+1);
    eighth = readData.indexOf(',',seventh+1);
    nineth = readData.indexOf(',',eighth+1);
    tenth = readData.indexOf(',', nineth+1);

    // parsing data into signals
    if (readData.lastIndexOf(',') > first && first > 0) {
        accel_x = readData.substring(first+1, second);
        accel_y = readData.substring(second+1, third);
        accel_z = readData.substring(third+1, fourth);
        gyro_x = readData.substring(fourth+1, fifth);
        gyro_y = readData.substring(fifth+1,sixth);
        gyro_z = readData.substring(sixth+1,seventh);
        mag_x = readData.substring(seventh+1,eighth);
        mag_y = readData.substring(eighth+1,nineth);
        mag_z = readData.substring(readData.lastIndexOf(',')+1);
        readData = '';
        
        dStr = getDateString();

        mdata[0]=dStr;   
        mdata[1]=accel_x;   
        mdata[2]=accel_y;  
        mdata[3]=accel_z;    
        mdata[4]=gyro_x;   
        mdata[5]=gyro_y;  
        mdata[6]=gyro_z;      
        mdata[7]=mag_x;       
        mdata[8]=mag_y;
        mdata[9]=mag_z;
        
        //console.log(mdata);
        var axisData = new Sensor({date:dStr, accel_x:accel_x, accel_y:accel_y, accel_z:accel_z
                                            , gyro_x:gyro_x, gyro_y:gyro_y, gyro_z:gyro_z
                                            , mag_x:mag_x, mag_y:mag_y, mag_z:mag_z})

        // save axis data to MongoDB
        axisData.save(function(err,data) {
            if(err) return handleEvent(err);
            data.info();  // Display the information of axis data  on console.
        })
        io.sockets.emit('message', mdata);  // send data to all clients 
    } else {  // error 
        console.log(readData);
    }
});


io.sockets.on('connection', function (socket) {
    // If socket.io receives message from the client browser then 
    // this call back will be executed.
    socket.on('message', function (msg) {
        console.log(msg);
    });
    // If a web browser disconnects from Socket.IO then this callback is called.
    socket.on('disconnect', function () {
        console.log('disconnected');
    });
});

// helper function to get a nicely formatted date string
function getDateString() {
    var time = new Date().getTime();
    // 32400000 is (GMT+9 Korea, GimHae)
    // for your timezone just multiply +/-GMT by 3600000
    var datestr = new Date(time +32400000).
    toISOString().replace(/T/, ' ').replace(/Z/, '');
    return datestr;
}