import express from "express";
import pool from "./src/database.js";
import { hashpassword,comparepassword,generateToken } from "./src/auth.js";
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

  //delete recipe

  app.delete("/recipes/:id", async (req,res)=>{
    const {id} = req.params
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(`DELETE FROM recipes WHERE id=$1`,[id])
      if(result.rowCount > 0){
        res.status(200).json({message:"recipe delete successfully!!"})
      }else{
        res.status(404).json({message:"no recipe found for delete"})
      }
    } catch (error) {
      res.status(500).json({message:"recipe deletetion failed!!",error:error.message})
    }finally{
      if(client) client.release()
    }
  })

  //register user

  app.post("/register",async (req,res)=>{
    const {username , password} = req.body
    let client = null

    if(!username || !password ){
      return res.status(400).json({message:"username or password missing!!!"})
    }
    
    try {
      const client = await pool.connect()
      const existinguser = await client.query(`
            SELECT id FROM users WHERE username=$1` ,[username]
        )
       if(existinguser.rows.length>0){
        return res.status(409).json({message:"username already exists!!"})
       } 
       const passwordhash = await hashpassword(password);
       const result = await client.query(`       
                    INSERT INTO users (username, password_hash) 
                    VALUES ($1, $2) RETURNING id, username, created_at`,[username,passwordhash])
        const newUser = result.rows[0];
        const token  = generateToken(newUser)            
        res.status(201).json({message:"user registered successfully!!",user:{id: newUser.id, username: newUser.username }, token })
    } catch (error) {
      console.error("user registration Failed!!",error)
      res.status(500).json({message:"server error,cannot register user",error:error.message})
    }finally{
      if(client) client.release()
    }
  })

  //login user

  app.post("/login",async (req,res)=>{
    const {username,password} = req.body
    let client = null

    if(!username || !password){
     return  res.status(400).json({message:"usename or password is missing !1"})
    }

    try {
       client = await pool.connect();
      const result = await client.query(`
        SELECT * FROM users WHERE username=$1
        `,[username])
        const user  = result.rows[0]

        if(!user){
          return res.status(401).json({message:"INVALID CREDIENTIAL"})
        }
      const ismatching = await comparepassword(password,user.password_hash)  
      if(!ismatching){
        return  res.status(401).json({message:"INVALID CREDIENTIAL"})
      }
      const token = generateToken(user)
      res.status(200).json({message:"user login successfully!!",token})
    
    } catch (error) {
       console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Login failed due to server error.', error: error.message });
    }finally{
      if(client) client.release()
    }
  })

app.listen(port, (req, res) => {
  console.log(`app is listening to port number ${port}`);
});
