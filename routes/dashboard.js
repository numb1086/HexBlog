const express = require('express');
const router = express.Router();
const striptags = require('striptags');
const moment = require('moment');
const firebaseDB = require('../connections/firebase_admin');
const optsArg = require('mkdirp/lib/opts-arg');

const categoriesRef = firebaseDB.ref('/categories');
const articlesRef = firebaseDB.ref('/articles');


router.get('/',(req,res) => {
    const messages = req.flash('error');
    articlesRef.once('value').then((snapshot) => {
        let count = 0;
        let articles = [];
        snapshot.forEach((child) => {
            articles.push(child.val());
            count++;
        });
        res.render('dashboard/index', {
            articles: articles,
            currentPath: '/',
            count: count,
            hasErrors: messages.length > 0,
          });
    });
});

router.get('/archives', function(req, res, next) {
    const status = req.query.status || 'public';
    let categories = {};
    categoriesRef.once('value').then((snapshot) => {
        categories = snapshot.val();
        return articlesRef.orderByChild('update_time').once('value');
    }).then((snapshot) => {
        const articles = [];
        snapshot.forEach((snapshotChild) => {
            // console.log('child',snapshotChild.val())
            if(status === snapshotChild.val().status) {
                articles.push(snapshotChild.val())
            }
        });
        articles.reverse();
        res.render('dashboard/archives', { 
            title: 'Express',
            articles,
            categories,
            striptags,
            moment,
            status
        });
    });
});

router.get('/article/create', function(req, res, next) {
    categoriesRef.once('value').then((snapshot) => {
        const categories = snapshot.val();
        console.log(categories);
        res.render('dashboard/article', { 
            title: 'Express',
            categories
        });
    });
    
});

router.get('/article/:id', function(req, res, next) {
    const id = req.params.id;
    let categories = {};
    categoriesRef.once('value').then((snapshot) => {
        categories = snapshot.val();
        return articlesRef.child(id).once('value');
    }).then((snapshot) => {
        const article = snapshot.val();
        console.log(article);
        res.render('dashboard/article', { 
            title: 'Express',
            categories,
            article
        });
    })
    
});

router.post('/article/create', (req, res) => {
    // console.log(req.body);
    const data = req.body;
    const articleRef = articlesRef.push();
    const key = articleRef.key;
    const updateTime = Math.floor(Date.now() /1000);
    data.id = key;
    data.update_time = updateTime;
    console.log(data);
    articleRef.set(data).then(()=> {
        res.redirect(`/dashboard/article/${key}`);
    });
});

router.post('/article/update/:id', (req, res) => {
    const data = req.body;
    const id = req.params.id;
    const updateTime = Math.floor(Date.now() /1000);
    data.update_time = updateTime;
    console.log(data);
    articlesRef.child(id).update(data).then(()=> {
        res.redirect(`/dashboard/article/${id}`);
    });
});

router.post('/article/delete/:id',(req, res) => {
    const id = req.params.id;
    articlesRef.child(id).remove();
    req.flash('info','文章已刪除');
    res.send('文章已刪除');
    res.end();
});

router.get('/categories', function(req, res, next) {
    categoriesRef.once('value').then((snapshot) => {
        const category = snapshot.val();
        res.render('dashboard/categories', { 
            title: 'Express' ,
            category,
            info: req.flash('info'),
        });
    });
});

router.post('/categories/create',(req, res) => {
    const data = req.body;
    const categoryRef = categoriesRef.push();
    const key = categoryRef.key;
    data.id = key;
    categoriesRef.orderByChild('path').equalTo(data.path).once('value')
    .then((snapshot) => {
       if(snapshot.val() !== null){
        req.flash('info','已有相同路徑');
        res.redirect('/dashboard/categories');
       } else {
            categoryRef.set(data).then(() => {
            res.redirect('/dashboard/categories');
        });
       }
    });
});

router.post('/categories/delete/:id',(req, res) => {
    const id = req.params.id;
    console.log(id);
    categoriesRef.child(id).remove();
    res.redirect('/dashboard/categories');
});



module.exports = router;