const passport = require('passport');
require('../salonpassport')(passport);
const config = require('../database');
const async = require('async');
const crypto = require('crypto');
const randomstring = require("randomstring");
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const path = require('path');
var md5 = require('md5');
const googledistance = require('google-distance');
let SalonDevices = require("../schema/salondevices");
const checkAuth = require("../middleware/check-auth");
var Request = require("request");
const { base64encode, base64decode } = require('nodejs-base64');

const base_url = '';

/* image downloader */
const download = require('image-downloader');

/** schemas */
let Salon = require("../schema/salon");
let Category = require("../schema/category");
let Barber = require("../schema/barber");
let CardInfo = require("../schema/cardInfo");
let Post = require("../schema/post");
let User = require("../schema/user");
let Ressort = require("../schema/ressort");


/* upload directories */
const profileassets = "./upload/salon/profile/";


/* jwt authentication  */
getToken = function (headers) {
  if (headers && headers.authorization) {
    return headers.authorization;
  } else {
    return null;
  }
};



/* image upload functionality*/
const fs = require('fs');
const multer = require('multer');



/* error handlers */
senderr = function (res) {
  return res.json({ status: "false", message: 'Something went to be wrong' });
};

// post api

router.get('/post_list', (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message:"Fatching posts failed"
      })
    })
});


router.get('/third_party', (req, res, next) => {
  let encoded = base64encode('hey there'); //
  console.log(encoded);
  Request.post({
    "headers": { "content-type": "application/json" },
    "url": "https://pay.payphonetodoesposible.com/api/transaction/Pay",
    "body": JSON.stringify({
      "cardToken": "ndi0mjqyndi0mjqyndi0mg==",
      "verificationCode": "mdy=",
      "amount": "1.52",
      "amountwithtax": 0.38,
      "amountwithouttax": 0.38,
      "tax": 0.304,
      "service": 0.2736,
      "tip": 0.1824,
      "clienttransactionid": "5ccc3145b9f12077652bb298",
      "email": "kpsharma35@gmail.com",
      "phoneNumber": "919755463923",
      "deferredType": ""
    })
}, (error, response, body) => {
    if(error) {
        res.status(200).json({
          error: error
        });
    }

    res.status(200).json({
      error: body
    });
});
});



router.post("/add_post", checkAuth, (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    creator:req.ueserData.userId
  });
  console.log(req.ueserData);
  post.save().then(createdPost => {
    res.status(201).json({
      message: "Post added successfully",
      postId: createdPost._id
    });
  }) 
  .catch(error => {
        res.status(500).json({
          message: "Creating a post failed!"
        });
      });
});


router.get("/posts/:id", checkAuth,(req, res, next) => {
  console.log(req.ueserData);
  Post.deleteOne({ _id: req.params.id})
  .then(result => {
      if (result.n > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
  })
  .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      });
    });
});

router.get("/post_detail/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  })
  .catch(error => {
      res.status(500).json({
        message: "Fetching post failed!"
      });
    });
});


router.put("/post_edit/:id", checkAuth, (req, res, next) => {
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    creator: req.ueserData.userId
  });
  console.log(req.ueserData);
  Post.updateOne({ _id: req.params.id,creator : req.ueserData.userId}, post)
  .then(result => {
    if(result.nModified > 0) {
      res.status(200).json({ message: "Update successful!" });
    } else {
      res.status(400).json({message: "not authorized!"});
    }
   
  })
  .catch(error => {
      res.status(500).json({
        message: "Couldn't udpate post!"
      });
  });
});










 /* signup as salon */
  router.post('/signup', function (req, res) {
    if (!req.body.email || !req.body.password) {
      senderr(res);
    } else {
      Salon.countDocuments({ email: req.body.email }, function (err, count) {
        if (count > 0) {
          res.json({ status: "false", message: 'Email already exists' });
        }
        else {
          req.body.password = md5(req.body.password);
          req.body.category = JSON.parse(req.body.category);
          req.body.time_schedule = JSON.parse(req.body.time_schedule);
          let imagename = crypto.randomBytes(6).toString('hex') + '.jpeg';
          if (typeof req.body.imageurl != 'undefined') {
            req.body.profile_image = imagename;
          }
          let newSalon = new Salon(req.body);
          newSalon.save(function (err) {
            if (err) {
              senderr(res);
            }
            else {
              if (typeof req.body.imageurl != 'undefined') {
                let options = {
                  url: req.body.imageurl,
                  dest: profileassets + imagename
                }
                download.image(options)
                .then(({ filename, image }) => {
                  res.json({ status: "true", message: 'Your account has been created, please login to your account.' });
                }).catch((err) => {
                  senderr(res);
                })
              }
              else {
                res.json({ status: "true", message: 'Your account has been created, please login to your account.' });
              }
            }
          });
        }
      });
    }
  });



   /* signin as salon */
  router.post('/signin', function (req, res) {
    Salon.findOne({
      email: req.body.email
    }, function (err, salon) {
      if (!salon) {
        //console.log(err);
        res.json({ status: "false", message: 'Not registered' });
      }
      else {
         Salon.findOne({$and:[{"email":req.body.email},{"password": md5(req.body.password)}]}).exec(function (err, salon) {
          if (salon && !err) {
            /* authenticate with token */
            let signintoken = jwt.sign(salon.toObject(), config.secret);
            if (typeof req.body.country_code != 'undefined' && typeof req.body.phone_number != 'undefined') {
              /* save the otp details */
              salon.country_code = req.body.country_code;
              salon.phone_number = req.body.phone_number;
              salon.save();
            }
            let profile_image = salon.profile_image;
            if (typeof salon.profile_image == 'undefined') {
              let profile_image = 'salon.png';
            }
            let result = { status: "true", salon_id: salon._id, full_name: salon.full_name, email: salon.email, password: req.body.password,country_code: salon.country_code,phone_number: salon.phone_number, lat: req.body.lat, lon: req.body.lon, location: req.body.location, gender: req.body.gender, password: req.body.password, salon_name: salon.salon_name, specification: salon.specification, working_hour: salon.working_hour, opening_hour: salon.opening_hour, account_type: salon.account_type, closed_hour: salon.closed_hour, salon_image: base_url + profile_image, token: 'JWT ' + signintoken};
            res.json(result);
          } else {
            res.json({ status: "false", message: 'Incorrect username or password' });
          }
        });
      }
    });
  });



  /* register a salon device */
  router.post('/pushsignin', passport.authenticate('jwt', { session: false }), function (req, res) {
    if (!req.body.salon_id || !req.body.device_token || !req.body.device_type || !req.body.device_id) {
      senderr(res);
    } else {
      SalonDevices.count({ device_id: req.body.device_id }, function (err, count) {
        if (count > 0) {
           SalonDevices.findOneAndUpdate({ device_id: req.body.device_id }, { "$set": req.body }).exec(function (err, salondevices) {
            if (err) {
              senderr(res);
            } else {
              res.json({ status: "true", message: 'Registered successfully' });
            }
          });
        }
        else {
          let newDevices = new SalonDevices(req.body);
          newDevices.save();
          res.json({ status: "true", message: 'Registered successfully' });
        }
      });
    }
  });




  /* salon profile */
  router.post('/profile', passport.authenticate('jwt', { session: false }), function (req, res) {
    let token = getToken(req.headers);
    console.log(req.body.salonid);
    if (token) {
      Salon.findOne({
        _id: req.body.salonid
      }, function (err, salon) {
        if (err) throw err;
        if (!salon) {
          res.json({ status: "false", message: 'No salons found.' });
        } else {
          let profile_image = salon.profile_image;
          if (typeof salon.profile_image == 'undefined') {
            let profile_image = 'salon.png';
          }
          let result = {};
          result.status = "true";
          result.salon_id = salon._id;
          result.full_name = salon.full_name;
          result.email = salon.email;
          result.salon_image = base_url + profile_image;
          result.country_code = salon.country_code;
          result.phone_number = salon.phone_number;
          result.lat = salon.lat;
          result.lon = salon.lon;
          result.location = salon.location;
          result.gender = salon.gender;
          result.salon_name = salon.salon_name;
          result.specification = salon.specification;
          result.working_hour = salon.working_hour;
          result.category = salon.category;
          result.opening_hour = salon.time_schedule;
          result.closed_hour = salon.closed_hour;
          res.json(result);
        }
      });
    } else {
      senderr(res);
    }
  });


  /* edit name & edit country_code  & emergency contact*/
  router.post('/updateprofile', passport.authenticate('jwt', { session: false }), function (req, res) {
    if (!req.body.salon_id) {
      senderr(res);
    } else {
      if (typeof req.body.emergency_contact != 'undefined') {
        req.body.emergency_contact = JSON.parse(req.body.emergency_contact);
      }
      Salon.findOneAndUpdate({ _id: req.body.salon_id }, { "$set": req.body }).exec(function (err, salons) {
        if (err) {
          senderr(res);
        } else {
          console.log(req.body);
          res.json({ status: "true", message: 'Salon updated successfully' });
        }
      });
    }
  });


   /* category pages */
  router.post('/category_list', function (req, res) {
    Category.count(function (err, count) {
      if (err) res.json({ status: "false", message: "Category not found" });
      else {
        Category.find().exec(function (err, categories) {
          if (!err) { res.json({ status: "true", result: categories }); }
          else {
            res.json({ status: "false", message: "Something went to be wrong" });
          }
        });
      }
    });
  });



  /* add barber */
  router.post('/addBarber', function (req, res) {
    if (!req.body.full_name || !req.body.email || !req.body.phone_number || !req.body.show_status || !req.body.bio || !req.body.salon_id) {
      senderr(res);
    } else {
            Barber.count({$and:[{"email":req.body.email},{"salon_id": req.body.salon_id}]}, function (err, count) {
        if (count > 0) {
          res.json({ status: "false", message: 'Email already exists' });
        }
        else {
          let imagename = crypto.randomBytes(6).toString('hex') + '.jpeg';
          if (typeof req.body.imageurl != 'undefined') {
            req.body.profile_image = imagename;
          }
          let newBarber = new Barber(req.body);
          newBarber.save(function (err) {
            if (err) {
              res.json(err);
            }
            else {
                res.json({ status: "true", message: 'Barber added successfully.' });
            }
          });
        }
      });
    }
  });




  /* add card info */
  router.post('/addCardInfo', function (req, res) {
    if (!req.body.user_id || !req.body.token || !req.body.card_no) {
      senderr(res);
    } else {
          let newCardInfo = new CardInfo(req.body);
          newCardInfo.save( async function  (err) {
            if (err) {
              res.json(err);
            }
            else 
            {
                var card_list;
                await getCardListFunction(req.body.user_id).then(res=>{
                  card_list = res;
              });
              res.json({ status: "true",message: 'Card added successfully.',result: card_list}); 
        
            }
          }); 
    }
  });



   /* card list */
  router.post('/card_list', function (req, res) {

     let token = getToken(req.headers);
      if (token) 
      {
          CardInfo.find({"user_id":req.body.user_id}).exec(function (err, results) {
          if (!err) {
            if(results.length > 0) 
             {
               res.json({ status: "true",message: 'Card info fetch successfully.', result: results }); 
             }
             else
             {
               res.json({ status: "false",message: 'Card info not found' }); 
             }
          }
          else {
            res.json({ status: "false", message: "Something went to be wrong" });
          }
      });
     } 
     else 
     {
      senderr(res);
     }
  });


   /* card list */
  router.post('/delete_card',function (req, res) {

     let token = getToken(req.headers);
      if (token) 
      {
        CardInfo.findByIdAndRemove({_id: req.body.id},async function(err, page){
          if (!err) {

            var card_list;
             await getCardListFunction(req.body.user_id).then(res=>{
              card_list = res;
          });
              res.json({ status: "true",message: 'Card delete successfully',result: card_list}); 
          }
          else {
            res.json({ status: "false", message: "Something went to be wrong" });
          }
        });
      } 
      else 
      {
        senderr(res);
      }
  });


   function getCardListFunction(user_id)
   {
      return new Promise(function(resolve,reject)
      {
          
          CardInfo.find({"user_id":user_id}).exec(function (err, results) {
          if (!err) {
            if(results.length > 0) 
             {
              resolve(results);
             }
             else
             {
               resolve(results);
             }
          }
          else {
            var results = array();
            resolve(results);
          }
        });
      }); 
   }


  router.post('/async_function', async  function (req, res) {
    try{
          var data = "hello world";
          await first(data).then(res=>{
            console.log(res);
          });

          second();
       }
    catch(error)
    {
      console.log(error);
    }
     
  });


  function first(data)
  {
    return new Promise(function(resolve,reject){
      setTimeout(function(){
        resolve(data)
      },8000);
      
    })
  }

  function second()
  {
    console.log('second function');
  }

  


   /* barber list */
  router.post('/barber_list', function (req, res) {

     let token = getToken(req.headers);
      if (token) 
      {
          Barber.find({"salon_id":req.body.salon_id}).exec(function (err, results) {
          if (!err) {
            if(results.length > 0) 
             {
               res.json({ status: "true",message: 'Barber fetch successfully.', result: results }); 
             }
             else
             {
               res.json({ status: "false",message: 'Barber not found' }); 
             }
          }
          else {
            res.json({ status: "false", message: "Something went to be wrong" });
          }
      });
     } 
     else 
     {
      senderr(res);
     }
  });



  /* barber profile */
  router.post('/barberDetail', passport.authenticate('jwt', { session: false }), function (req, res) {
    let token = getToken(req.headers);
    
    if (token) {
      Barber.findOne({
        _id: req.body.barber_id
      }, function (err, barber) {
        if (err) throw err;
        if (!barber) {
          res.json({ status: "false", message: 'No barber found.' });
        } else {
          let profile_image = barber.profile_image;
          if (typeof barber.profile_image == 'undefined') {
            let profile_image = 'barber.png';
          }
          let result = {};
          result.status = "true";
          result.salon_id = barber._id;
          result.full_name = barber.full_name;
          result.email = barber.email;
          result.profile_image = base_url + '/gallery/salons/' + profile_image;
          result.phone_number = barber.phone_number;
          result.show_status = barber.show_status;
          result.bio = barber.bio;
         
          
          res.json(result);
        }
      });
    } else {
      senderr(res);
    }
  });


  /* edit name & edit country_code  & emergency contact*/
  router.post('/updateBarber', passport.authenticate('jwt', { session: false }), function (req, res) {
    if (!req.body.barber_id) {
      senderr(res);
    } else {
      if (typeof req.body.emergency_contact != 'undefined') {
        req.body.emergency_contact = JSON.parse(req.body.emergency_contact);
      }
      Barber.findOneAndUpdate({ _id: req.body.barber_id }, { "$set": req.body }).exec(function (err, salons) {
        if (err) {
          senderr(res);
        } else {
          console.log(req.body);
          res.json({ status: "true", message: 'barber updated successfully' });
        }
      });
    }
  });


   /* change password */
  router.post('/changepassword', passport.authenticate('jwt', { session: false }), function (req, res) {
    if (!req.body.salon_id || !req.body.newpassword) {
      senderr(res);
    } else {
      Salon.findOne({ _id: req.body.salon_id }, function (err, user) {
        if (!user) {
          senderr(res);
        }
        Salon.password = md5(req.body.newpassword);
        Salon.save(function (err) {
          res.json({ status: "true", message: 'Password changed successfully' });
        });
      });
    }
  });

  



  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __basedir + globalString)
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
  });


 router.post('/uploadSingleImage', function (req, res) {
   globalString = "/upload/salon/profile/";
   console.log(__basedir + globalString);
   
    let upload = multer({
      storage: storage,
      fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
          return callback(res.end('Only images are allowed'), null)
        }
        callback(null, true)
      }
    }).single('userImage');
    upload(req, res, function (err) {
      let result = {};
      result.status = "true";
      result.image_name = "/gallery/profile/"+res.req.file.filename;
      res.json(result);
    })
  });


 






  module.exports = router;