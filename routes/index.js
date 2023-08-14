const express = require('express');
const router = express.Router();
const striptags = require('striptags');
const moment = require('moment');
const convertPagination = require('../modules/convertPagination');
const firebaseDB = require('../connections/firebase_admin');
const { render } = require('../app');
const categoriesPath = '/categories/';
const categoriesRef = firebaseDB.ref(categoriesPath);
const articlesPath = '/articles/';
const articlesRef = firebaseDB.ref(articlesPath);


/* GET home page. */
router.get('/', function(req, res, next) {
  const currentPage = Number.parseInt(req.query.page) || 1;
  let categories = {};
  let id = req.query.id;
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value');
  }).then((snapshot)=> {
    const articles = [];
    snapshot.forEach((snapshotChild) => {
      console.log(id,'',snapshotChild.val().category)
      console.log('boolean id:',Boolean(id))
      if(Boolean(id)) {
        if(id === snapshotChild.val().category) {
          articles.push(snapshotChild.val());
        }
      } else if('public' === snapshotChild.val().status) {
        articles.push(snapshotChild.val());
      }
    });
    articles.reverse();
    // 分頁
    const pageData = convertPagination(articles,currentPage);
    // 分頁結束
    res.render('index', { 
        title: 'Express',
        articles:pageData.data,
        page: pageData.page,
        categories,
        striptags,
        moment,
        id
    });
  });
});

router.get('/post/:id', function(req, res, next) {
  const id = req.params.id;
  let categories = {};
  categoriesRef.once('value').then((snapshot) => {
      categories = snapshot.val();
      return articlesRef.child(id).once('value');
  }).then((snapshot) => {
      const article = snapshot.val();
      if(!article) {
        return res.render('error',{
          title: '找不到該文章'
        });
      }
      let visitCount = (article.visitCount+1) || 1;
      article.visitCount = visitCount;
      articlesRef.child(id).set(article);
      res.render('post', { 
          title: 'Express',
          categories,
          article,
          striptags,
          moment,
          visitCount
      });
  })
});


router.get('/dashboard/signup', function(req, res, next) {
  res.render('dashboard/signup', { title: 'Express' });
});


module.exports = router;
