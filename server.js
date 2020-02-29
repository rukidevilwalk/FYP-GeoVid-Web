const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const PORT = 8000;
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
const crypto = require('crypto');
const router = express.Router();
const morgan = require('morgan');
const passport = require("passport");
const users = require("./routes/api/users");

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(morgan('tiny'))

// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", users);

const conn = mongoose.connection;

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db);
  console.log('Database connection established')
});

let videoname;
// Create storage engine
const storage = new GridFsStorage({

  url: "mongodb://localhost/GeoVid"
  ,

  file: (req, file) => {

    console.log("In Storage: ");


    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }

        const filename = buf.toString("hex") + path.extname(file.originalname);

        if (file.mimetype == 'application/octet-stream' || filename.substring(filename.length - 3) == 'srt') {
          const fileInfo = {
            filename: videoname,
            bucketName: "subtitles"
          }
          console.log("fileInfo");
          console.log(fileInfo);
          resolve(fileInfo);

        } else if (file.mimetype == 'video/mp4' || filename.substring(filename.length - 3) == 'mp4') {
          videoname = filename.substr(0, filename.length - 4)
          const fileInfo = {
            filename: videoname,
            bucketName: "videos"
          }
          console.log("fileInfo");
          console.log(fileInfo);
          resolve(fileInfo);

        } else {

          reject('Error, wrong file type')
        }

      });
    });
  }
});

const upload = multer({ storage }).any();

router.post('/upload', (req, res) => {
  try {
    upload(req, res, function (err) {
      if (err) {
        console.log(err);
        return res.end("Error uploading file.");
      } else {

        res.end("File has been uploaded");
      }
    });
  } catch (error) {
    console.log(error)
  }

});

router.get('/videos', (req, res) => {

  try {
    gfs.collection('subtitles')

    gfs.files.find().toArray((err, files) => {

      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        });
      }

      return res.json(files);


    });
  } catch (error) {
    console.log(error)
  }


});

router.get('/search', (req, res) => {

  try {

    gfs.collection('subtitles')

    let dataArr = [];
    gfs.files.find().toArray((err, files) => {

      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        });
      }



      files.forEach(function (file) {
        const chunks = []
        const readstream = gfs.createReadStream(file.filename)

        readstream.on("data", function (chunk) {
          chunks.push(chunk)
        })

        readstream.on("end", function () {
          let obj = (Buffer.concat(chunks).toString('utf8'));

          dataArr.push(file.filename + '|' + obj)
          if (dataArr.length === files.length)
            res.json(dataArr)
        })

      })
    })
  } catch (error) {
    console.log(error)
  }

})

router.get('/video/:selectedVideos', (req, res) => {

  try {
    gfs.collection('videos')
    gfs.files.findOne({ filename: req.params.selectedVideos.substring(0, 32) }, (err, file) => {
      const fileSize = file.length
      const range = req.headers.range
      if (range) {

        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
          ? parseInt(parts[1], 10)
          : fileSize - 1
        const chunksize = (end - start) + 1
        const readStream = gfs.createReadStream({
          filename: file.filename,
          range: {
            startPos: start,
            endPos: end
          }
        });
        const head = {
          'Expires': 0,
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        }

        res.writeHead(206, head);
        readStream.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        gfs.createReadStream(file.filename).pipe(res)
      }



    });
  } catch (e) {
    console.log('Error:' + e)
  }

})

router.get('/subtitle/:selectedVideos', (req, res) => {

  try {
    gfs.collection('subtitles')

    let videoArr = req.params.selectedVideos.split(',');
    let dataArr = [];

    videoArr.forEach(function (filename) {

      gfs.files.findOne({ filename: filename.substring(0, 32) }, (err, file) => {

        if (!file || file.length === 0) {
          return res.status(404).json({
            err: 'No file exists'
          });
        }

        const chunks = [];
        console.log('Creating read stream for subtitle: ' + file.filename)
        const readstream = gfs.createReadStream(file.filename);


        readstream.on("data", function (chunk) {
          chunks.push(chunk);
        });

        readstream.on("end", function () {
          let obj = (Buffer.concat(chunks).toString('utf8'));

          dataArr.push(file.filename + '|' + obj)
          if (dataArr.length === videoArr.length)
            res.json(dataArr)
        });

      });

    })

  } catch (e) {
    console.log('Error:' + e)
  }

});

app.use('/', router)

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});