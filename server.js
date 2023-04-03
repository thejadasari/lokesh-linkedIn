const express = require('express');
const { SignIn, ScrapProfile } = require('.');
const app = express();

app.get('/',  async (req, res) => {
    res.send("Server Running");
});

app.get('/signIn',  async (req, res) => {
    try {
        res.send(await SignIn())
    } catch (error) {
        console.error(error);
        res.status(500)
        res.send(error.toString());   
    }
});

app.get('/scrap/*',  async (req, res) => {
    const profilePath = req.path.replace('/scrap/', '');
    try {
        res.send(await ScrapProfile(profilePath))
    } catch (error) {
        console.error(error);
        res.status(500)
        res.send(error.toString());   
    }
});
  
app.listen(3000)
