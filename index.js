import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000; 

const API_key = "06291d7cf0cc0b9f7acd3e42";
const API_URL = "https://v6.exchangerate-api.com/v6";

// let amountTarget;
// let amountSource;
// let conversion_rate;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());    // Middleware for parsing JSON bodies

app.use(express.static("public"));

// app.get("/", (req, res) => {
//     res.render("index.ejs", {
//         amountTarget: amountTarget,
//         conversion_rate: conversion_rate
//     });
// })

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/receive-data-from-source", async (req, res) => {
    const currencySource = req.body.currencySource;
    const amountSource = req.body.amountSource;
    const currencyTarget = req.body.currencyTarget;

    // console.log('Received currency code:', currencySource); 
    // console.log('Received amount:', amountSource); 
    // console.log('Received target:', currencyTarget);

    try {
        const result = await axios.get(`${API_URL}/${API_key}/pair/${currencySource}/${currencyTarget}`);
        console.log(result.data);
        const conversion_rate = result.data.conversion_rate
        const amountTarget = conversion_rate * amountSource;
        
        // Send back the results as JSON instead of redirecting. Because the the initial request was made via AJAX, the redirect will not cause the entire page to refresh, and therefore the updated values for amountTarget and conversion_rate will not be rendered on the page.
        res.json({
            amountTarget: amountTarget,
            conversion_rate: conversion_rate
        });
    } catch(error) {
        res.status(500).send(error.message);

    }

});


app.post("/receive-data-from-target", async (req, res) => {
    const currencySource = req.body.currencySource;
    const amountTarget = req.body.amountTarget;
    const currencyTarget = req.body.currencyTarget;

    try {
        const result = await axios.get(`${API_URL}/${API_key}/pair/${currencySource}/${currencyTarget}`);
        console.log(result.data);
        const conversion_rate_reverse = result.data.conversion_rate
        if (conversion_rate_reverse != 0) {
            const amountSource = amountTarget/conversion_rate_reverse;
            
            res.json({
                amountSource: amountSource,
                conversion_rate_reverse: conversion_rate_reverse
            })
        }
    } catch(error) {
        res.status(500).send(error.message);

    }

});




app.listen(port, () => {
    console.log(`Server has started on port ${port}.`);
})