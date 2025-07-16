import express from "express"
const app=express();
const port=3000;

app.get("/",(req,res)=>{
    res.json({message:"Welcome to the Recipe Service"});
})

app.get("/recipes",(req,res)=>{
     const recipes = [
    { id: 1, name: 'Spaghetti Carbonara', ingredients: ['pasta', 'eggs', 'bacon'], instructions: 'Cook pasta, mix with eggs and bacon.' },
    { id: 2, name: 'Chicken Curry', ingredients: ['chicken', 'curry powder', 'coconut milk'], instructions: 'Cook chicken, add curry powder and coconut milk.' }
  ];
  res.json(recipes);
})

app.listen(port,(req,res)=>{
    console.log(`app is listening to port number ${port}`)
})