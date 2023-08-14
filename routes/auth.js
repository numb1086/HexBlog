const express = require('express');
const firebaseClient = require('../connections/firebase_client');
const auth = firebaseClient.auth();
const router = express.Router();

router.get('/signup',(req,res) => {
    const message = req.flash('error');
    res.render('dashboard/signup', {
        message,
        hasErrors: message.length > 0,
    })
});

router.get('/signin',(req,res) => {
    const message = req.flash('error');
    res.render('dashboard/signin', {
        message,
        hasErrors: message.length > 0,
    })
});

router.get('/signout',(req,res) => {
    req.session.uid = '';
    res.redirect('/auth/signin');
})

router.post('/signup',(req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirm_password;
    if(password !== confirmPassword) {
        req.flash('error','兩個密碼輸入不符合');
        res.redirect('/auth/signup');
    }

    auth.createUserWithEmailAndPassword(email,password)
    .then(() => {
        console.log(req.session.uid);
        res.redirect('/auth/signin');
    }).catch((error) => {
        console.log(error);
        res.redirect('/auth/signup');
    });
});

router.post('/signin',(req,res) => {
    const email = req.body.email;
    const password = req.body.password;

    auth.signInWithEmailAndPassword(email,password)
    .then((user) => {
        req.session.uid = user.uid;
        req.session.mail = req.body.email;
        console.log(req.session.uid);
        res.redirect('/dashboard');
    }).catch((error) => {
        console.log(error);
        req.flash('error',error.message);
        res.redirect('/auth/signin');
    });
});

module.exports = router;