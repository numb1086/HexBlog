const convertPagination = function(articles, currentPage) {
    const totalResult = articles.length;
    const perpage = 3; //每頁3筆資料
    const pageTotal = Math.ceil(totalResult/perpage);
    // let currentPage = 2; //當前頁數
    if(currentPage > pageTotal) {
      currentPage = pageTotal;
    }
    const minItem = (currentPage * perpage) - perpage + 1;
    const maxItem = (currentPage * perpage);
    const data = [];
    articles.forEach((item,i) => {
      let itemNum = i + 1;
      if( itemNum >= minItem && itemNum <= maxItem) {
        data.push(item);
      }
    });
    const page = {
      pageTotal,
      currentPage,
      hasPre: currentPage > 1,
      hasNext: currentPage < pageTotal
    }
    return {
        data,
        page
    };
}

module.exports = convertPagination;