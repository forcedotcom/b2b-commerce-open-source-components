function addPageObject(pageObjArray, isRange, pageNumber, currentPage) {
  const id = pageObjArray.length;
  pageObjArray.push({
    id,
    pageNumber,
    isRange,
    isCurrentPage: pageNumber != null && pageNumber === currentPage
  });
}
function getRangeArray(length, start) {
  return Array.from({
    length
  }, (v, k) => k + start);
}
export function generatePagesForRange(currentPage, totalPage, maxPageButtons) {
  let pages = [];
  let balanceLength;
  let lastPageNumber;
  const pageRange = [];
  balanceLength = maxPageButtons - 2;
  if (maxPageButtons > totalPage) {
    pages = getRangeArray(totalPage, 1);
  } else if (currentPage < balanceLength) {
    pages = getRangeArray(balanceLength, 1);
    pages.push(totalPage);
  } else if (currentPage > totalPage - balanceLength + 1) {
    pages = getRangeArray(balanceLength, totalPage - balanceLength + 1);
    pages.unshift(1);
  } else {
    balanceLength = maxPageButtons - 4;
    let beginIndex = 0;
    const halfRB = balanceLength >> 1;
    if (halfRB) {
      beginIndex = currentPage - halfRB;
      if (balanceLength === 2) {
        beginIndex += 1;
      }
    } else {
      beginIndex = currentPage;
    }
    pages = getRangeArray(balanceLength, beginIndex);
    pages.unshift(1);
    pages.push(totalPage);
  }
  pages.forEach(pageNumber => {
    if (lastPageNumber) {
      if (pageNumber - lastPageNumber === 2) {
        addPageObject(pageRange, false, lastPageNumber + 1, currentPage);
      } else if (pageNumber - lastPageNumber !== 1) {
        addPageObject(pageRange, true, undefined, undefined);
      }
    }
    addPageObject(pageRange, false, pageNumber, currentPage);
    lastPageNumber = pageNumber;
  });
  return pageRange;
}