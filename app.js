//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-saugat:test123@cluster0.er4c8.mongodb.net/todolistDB");
// mongoose.connect("mongodb://localhost:27017/testDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your Todolist app."
});
const item2 = new Item({
  name: "Hit + button to add items."
});
const item3 = new Item({
  name: "<-- Hit this button to delete item."
});
const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {
    
  Item.find({})
  .then((result)=>{
    if( result.length === 0){
      Item.insertMany(defaultItems)
      .catch((err)=>{
        console.log(err);
      })
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  })
  .catch((err)=>{
    console.log(err);
  })
  });

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName})
  .then((result)=>{
    if(!result){
      //create new list
        const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }else{
      //show existing list
      res.render("list", {listTitle: result.name, newListItems: result.items});
    }
  })
  .catch((err)=>{
    console.log(err);
  })
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name: listName})
    .then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});



app.post("/delete", function(req, res){
  const checkedboxId = req.body.checkbox;
  const listItem = req.body.listItem;
  
  if(listItem === "Today"){
    Item.findByIdAndDelete(checkedboxId)
      .catch((err)=>{
      console.log(err);
    })
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listItem},{$pull: {items: {_id: checkedboxId}}})
    .then(()=>{
      res.redirect("/" + listItem);
    })
  }
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
