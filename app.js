const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const request = require('request');
const bcrypt = require('bcryptjs');
const app = express()
const multer  = require('multer')

// =========== image===========
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    //ตั้งชื่อไฟล์
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const fileFilter = (req,file,cb)=>{
    // reject file
    if(file.mimetype === 'image/jpeg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}
const upload = multer({ storage: storage, 
    limits :{
        fileSize:1024 * 1024 * 5
    },
    fileFilter:fileFilter
})
//var upload = multer({ dest: 'uploads/' })


//===================================
const MemberRounter = require('./member')

// ===========================================
var Member = require('./Model/MemberModel')
var House = require('./Model/HouseModel')
var EventType = require('./Model/EvenTypeModel')
var CreatedBy = require('./Model/CreatedByModel')


//=========================================
mongoose.connect('mongodb://localhost:27017/DBcoe').then((doc) => {
    console.log('@@@@ Success to connect with Database @@@')
}, (err) => {
    console.log('!!!!!!!!!! error to connect with database !!!!!!!!!')
})

//app.use(express.static('public'))
app.use("/", express.static(__dirname + "/public"));
app.use("/views", express.static(__dirname + "/views"));
//app.use(express.static('uploads'));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.set('view engine', 'hbs')
app.use(bodyParser.json()) // ส่งข้อมูลแบบ JSon
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use((req, res, next) => { // allow the other to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader("Access-Control-Expose-Headers", "X-HMAC-CSRF, X-Secret, WWW-Authenticate");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization, X-Access-Token')
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})

app.use('/member',MemberRounter)

//==================================================================
app.get('/MemberInsert',(req,res)=>{
    res.render('admin_MemberInsert.hbs',{})
    //console.log('hello')
})

app.get('/error',(req,res)=>{
    res.render('admin_error.hbs',{})
    //console.log('hello')
})

app.get('/edit',(req,res)=>{
    res.render('admin_edit.hbs',{})
    //console.log('hello')
})

app.get('/MemberAll',(req,res)=>{
    Member.find({},(err,dataMember)=>{
        if(err) console.log(err)
    }).then((dataMember)=>{
        res.render('admin_MemberAll.hbs',{
            dataMember:encodeURI(JSON.stringify(dataMember))
        })
    })
})

// ==================== save data and upload photo =====================

app.post('/save', upload.single('photos'), function (req, res) {
    console.log(req.file)
    let newMember = new Member({
        Member_ID : req.body.Member_ID,
        Member_Password:req.body.Member_Password,
        Member_Name:req.body.Member_Name,
        Member_Lastname:req.body.Member_Lastname,
        Member_House:req.body.Member_House,
        Member_Profile :req.file.path,
        Member_Status:req.body.Member_Status,
        Member_Tel : req.body.Member_Tel
    })
    newMember.save().then((doc)=>{
        
        let newHouse = new House({
            House_name:req.body.Member_House,
            House_MemberID:req.body.Member_ID
        })

        newHouse.save().then((doc)=>{
            res.render('admin_MemberInsert.hbs',{})
        })

    },(err)=>{
        res.render('admin_error.hbs',{})
        // res.status(400).send(err)
    })
})

app.post('/edit',(req,res)=>{
    let id = req.body.Member_ID
     Member.findOne({Member_ID:id}).then((d)=>{
         d.Member_ID = id
         d.Member_Name = req.body.Member_Name
         d.Member_Lastname = req.body.Member_Lastname
         d.Member_House = req.body.Member_House
         d.Member_Status = req.body.Member_Status
         d.Member_Name = req.body.Member_Name
         d.Member_Tel = req.body.Member_Tel
 
         d.save().then((success)=>{
             console.log(' **** Success to edit Member ****')
             Member.find({},(err,dataMember)=>{
                 if(err) console.log(err)
             }).then((dataMember)=>{
                 res.render('admin_MemberAll.hbs',{
                     dataMember:encodeURI(JSON.stringify(dataMember))
                 })
             })
         },(e)=>{
             res.status(400).send(e)
         },(err)=>{
             res.status(400).send(err)
         })
     })    
 })

//======================== HOUSE ====================
app.get('/Bill',(req,res)=>{
    let bill = 'Bill Gates'
        Member.find({Member_House:bill},(err,dataHouse)=>{
            if(err) console.log(err)
        }).then((dataHouse)=>{
            res.render('admin_HouseBill.hbs',{
                dataHouse:encodeURI(JSON.stringify(dataHouse))
            })
        })
})

app.get('/Larry',(req,res)=>{
    let bill = 'Larry Page'
        Member.find({Member_House:bill},(err,dataHouse)=>{
            if(err) console.log(err)
        }).then((dataHouse)=>{
            res.render('admin_HouseLarry.hbs',{
                dataHouse:encodeURI(JSON.stringify(dataHouse))
            })
        })
})

app.get('/Elon',(req,res)=>{
    let bill = 'Elon Mask'
        Member.find({Member_House:bill},(err,dataHouse)=>{
            if(err) console.log(err)
        }).then((dataHouse)=>{
            res.render('admin_HouseElon.hbs',{
                dataHouse:encodeURI(JSON.stringify(dataHouse))
            })
        })
})

app.get('/Mark',(req,res)=>{
    let bill = 'Mark Zuckerberg'
        Member.find({Member_House:bill},(err,dataHouse)=>{
            if(err) console.log(err)
        }).then((dataHouse)=>{
            res.render('admin_HouseMark.hbs',{
                dataHouse:encodeURI(JSON.stringify(dataHouse))
            })
        })
})

// ============== Event Type ===================
app.get('/EventTypeDisplay',(req,res)=>{
    res.render('admin_EventTypeInsert.hbs',{})
})

app.get('/EventTypeInsert',(req,res)=>{
    res.render('admin_EventTypeInsert.hbs',{})
})

app.post('/saveEventType',(req,res)=>{

    let newEventType = new EventType({
        EventType_Name:req.body.EventType_Name,
        EventType_ID:req.body.EventType_ID
    })
    newEventType.save().then((doc)=>{
        console.log(doc)
        res.render('admin_EventTypeInsert.hbs',{})
    },(err)=>{
        res.status(400).send(err)
    })
    
})

// ============== Created By ===================
app.get('/CreatedByDisplay',(req,res)=>{
    res.render('admin_CreatedByDisplay.hbs',{})
})

app.get('/CreatedByInsert',(req,res)=>{
    res.render('CreatedByInsert.hbs',{})
})

app.post('/saveCreatedBy',(req,res)=>{

    let newCreatedBy = new CreatedBy({
        CreatedBy_Name:req.body.CreatedBy_Name,
        CreatedBy_ID:req.body.CreatedBy_ID
    })
    newCreatedBy.save().then((doc)=>{
        console.log(doc)
        res.render('admin_CreatedByInsert.hbs',{})
    },(err)=>{
        res.status(400).send(err)
    })
    
})

//===================================================
app.listen(3000, () => {
    console.log('listin port 3000')
})