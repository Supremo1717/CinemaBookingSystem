const express = require('express');
const route = express.Router()
const adminServices = require('../services/admins/admin')
const userServices = require('../services/users/users')
const bcrypt = require('bcrypt')
const {getAccounts, deleteAccount, updateAccount, createAccount} = adminServices()
const {createaccount, deleteaccount, updateaccount, getAccounts: getaccount} = userServices()
//PASSPORT AUTH
const initializePassports = require('../passport-config/adminPassport');
const passport = require('passport');


initializePassports(passport, 
    async (adminname) => {
        const admins = await getAccounts();
        return admins.find(admin => admin.adminname == adminname)},
    async (adminID) => {
        const admins = await getAccounts();
        return admins.find(admin => admin.adminID == adminID)
    } 
    )

    
const checkIfAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/admin/login')
}

const alreadyAuthenticated = (req, res, next) =>{
    if(req.isAuthenticated()){
        res.redirect('/admin')
    }
    return next()
}
route.get('/admin/login', (req, res)=>{
    res.render('./admin/login')
})
route.post('/admin/login', passport.authenticate('admin', {
    successRedirect: "/admin",
    failureRedirect:"/admin/login",
    failureFlash:true
    }), (req, res)=>{
        
        res.json({message: req.message})
    })

route.delete('/admin/logout', (req, res)=>{
    req.logOut(()=>{
        res.redirect('/admin/login')
    })
})
route.get("/admin", (req, res)=>{
    res.render("./admin/home")
})
route.get('/admin/admins', async (req, res) => {
    const admin = await getAccounts();
   
    res.render('./admin/admins', { admin: admin });
  });
  
route.get("/admin/bookings", async (req, res)=>{
    const user = await getaccount()
    res.render("./admin/bookings", {user: user})
})
route.get("/admin/movies",  (req, res)=>{
    res.render("./admin/movies")
})
route.get("/admin/users", async (req, res)=>{
    const user = await getaccount()
    res.render("./admin/users", {user: user})
})

route.post("/admin/register",  async (req, res)=>{
    try {
        const {adminName, password} = req.body
        if(adminName == "" || password == ""){  
            res.json({message: "Please fill-up all the fields!"})  
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10)
        res.json({message: "Registered Successfully!"})
        await createAccount(adminName, hashedPassword)}

    } catch (error) {
        res.status(500).json({message: "Unsuccessful!"})
    }
})

route.delete("/admin/delete",  async (req, res)=>{
    try {
        const {adminID} = req.body
        if(adminID == ""){  
            res.json({message: "Please fill-up all the fields!"})  
        }
        else{
        await deleteAccount(adminID)
        res.json({message: "Deleted Successfully!"})
    }

    } catch (error) {
        res.status(500).json({message: "Unsuccessful!"})
    }
})

route.post("/admin/edit",  async (req, res)=>{
    try {
        const {adminID, adminName, password} = req.body
        if(adminName == "" || password == "" || adminID == ""){  
            res.json({message: "Please fill-up all the fields!"})  
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10)
            await updateAccount(adminID, adminName, hashedPassword)}
            res.json({message: "Updated Successfully!"})
       
    } catch (error) {
        res.status(500).json({message: "Unsuccessful!"})
    }
})

module.exports = route;