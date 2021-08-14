// Express Module
const express = require("express");

// Initialized express to app variable
const app = express();

// Mongoose Module
const mongoose = require("mongoose");

// CREATING THE DATABASE
mongoose.connect('mongodb+srv://Admin-Aaron:AaronxReyes0728@cluster0.hssuh.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

// Lodash Module
const _ = require("lodash");

// Use for body-parser or getting the input in form
app.use(express.urlencoded({extended: true}));

// Use for public files or connecting the public files to server
app.use(express.static("public"));

// Use for declaring the ejs files
app.set('view engine', 'ejs');

// Creating a collection structure
const itemsSchema = new mongoose.Schema({
    name: String,
  });

// Creating the collection
const Item = mongoose.model('Item', itemsSchema);

// Data of the collection
const item1 = new Item ({
    name: "Eat",
});

// Data of the collection
const item2 = new Item ({
    name: "Play",
});

// Data of the collection
const item3 = new Item ({
    name: "Sleep",
});

const defaultArray = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
  });

  const List = mongoose.model('List', listSchema);
 

// Home Route
app.get("/", (req, res) => {
    
    Item.find({}, (err, foundItems) => {
        if(err) {
        console.log(err);
        } else {
            if (foundItems.length === 0){
                Item.insertMany(defaultArray, err => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully insert the default items in DB");
                    }
                })
                res.redirect("/");    
            } else {
                // Render the ejs file in the view directory for the home route
                res.render("index", {
                    listItems: "Today", 
                    newItems: foundItems,
                });  
            }
        }
    });
    
})

// Home Route Post
app.post("/", (req, res) => {
    let itemName = req.body.newItem; // Use to get the value of input
    const listName = req.body.list;

    const newItem = new Item ({
        name: itemName,
    })

    if (listName === "Today"){
        newItem.save();     
        res.redirect("/");
    } else {
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        })
    }




})

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    List.findOne({name: listName}, (err, foundList) => {
        if (listName === "Today"){
            Item.findByIdAndRemove(checkedItemId, function(err){
                if (!err) {
                  console.log("Successfully deleted checked item.");
                  res.redirect("/");
                }
              });
        } else {
           List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
               if (!err) {
                   res.redirect("/" + listName);
               }
           })
        }
    })





});

// customListName Route
app.get("/:customListName", (req, res)=> {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, (err, foundList) => {
        if(!err){
            if(!foundList){
                // Create a new list
                const list = new List ({
                name: customListName,
                items: defaultArray,
                })
                list.save();
                res.redirect("/" + customListName);
 
            } else {
                // Show the existing list
                res.render("index", {
                    listItems: foundList.name, 
                    newItems: foundList.items,
                }); 
            }
        } else {
            console.log(err);
        }
    })
})

// app.post("/:customListName", (req, res) => {
//     let itemName = req.body.newItem; // Use to get the value of input
    
//     const newItem = new Item ({
//         name: itemName,
//     })

//     newItem.save(); 
//     res.redirect("/" + customListName);

// })

// About Me Route
app.get("/aboutme", (req,res) => {
    // Render the ejs file in the view directory for the aboutme route
    res.render("aboutme");
})


app.listen(process.env.PORT || 1000, ()=>{
    console.log("Server is running at port 1000");
})