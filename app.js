import express from "express";
import pool from "./src/database.js";
const app = express();
const port = 3000;

app.use(express.json());
//API ENDPOINTS

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Recipe Service" });
});

app.get("/recipes", async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT * FROM recipes`);
    res.json(result.rows);
  } catch (error) {
    console.error("api fetching error:", error);
    res.status(400).json({
      message: "data fetching error",
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
});

app.get("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT * FROM recipes WHERE id= $1 `, [
      id,
    ]);
    const recipe = await result.rows[0];
    if (recipe) {
      res.json(recipe);
    } else {
      res.status(404).json({
        message: "recipe not found",
      });
    }
  } catch (error) {
    console.error("error fetching error", error);
    res.status(500).json({
      message: "fetching failed",
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
});

app.post("/recipes", async (req, res) => {
  const { name, ingredients, instructions } = req.body;

    console.log('--- POST /recipes Debug ---');
    console.log('Full req.body received:', JSON.stringify(req.body, null, 2));
    console.log('Value of ingredients:', ingredients);
    console.log('Type of ingredients:', typeof ingredients);
    console.log('Is ingredients an Array (Array.isArray):', Array.isArray(ingredients));
    console.log('--- END DEBUG ---');

  let client;

  if (!name || !ingredients || !instructions ) {
    return res
      .status(400)
      .json({ message: "Name, ingredients, and instructions are required." });
  }
  if (!Array.isArray(ingredients)) {
    // Ensure ingredients is an array
    return res.status(400).json({ message: "Ingredients must be an array." });
  }
  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO recipes
      (name,ingredients,instructions) 
      values($1,$2,$3) RETURNING *`,
      [name, JSON.stringify(ingredients), instructions]
    );
    const Newrecipe = result.rows[0];
    res
      .status(201)
      .json({ message: "recipe added successfully!!!", recipe: Newrecipe });
  } catch (error) {
    res
      .status(500)
      .json({ message: "API fetching failed", error: error.message });
  } finally {
    if (client) client.release();
  }
});

//update recipe

app.put("/recipes/:id",async (req,res) =>{
  const {id} = req.params
  const {name, ingredients,instructions} = req.body
  let client;

  if(!name || !ingredients || !instructions){
    return res.status(400).json({message:"name,ingredients or instructions misssing"})
  }
   if (!Array.isArray(ingredients)) {
    // Ensure ingredients is an array
    return res.status(400).json({ message: "Ingredients must be an array." });
  }
 
  try {
    
    client = await pool.connect();
    const result =  await client.query(`UPDATE recipes 
      SET name=$1, ingredients=$2, instructions=$3 WHERE id=$4`,
      [name,JSON.stringify(ingredients),instructions,id])
    if(result.rowCount>0){
      const updatedresultquery = await client.query(`SELECT * FROM recipes WHERE id=$1`,[id])
      const updatedresult = updatedresultquery.rows[0]
      res.status(200).json({message:"recipe updated successfully",recipe:updatedresult})
    }else{ res.status(404).json({ message: 'Recipe not found or no changes were made.' });
    } 
  } catch (error) {
    res.status(500).json({message:"updation failed",error:error.message})
  }finally{
    if(client) client.release()
  }
  })

app.listen(port, (req, res) => {
  console.log(`app is listening to port number ${port}`);
});
