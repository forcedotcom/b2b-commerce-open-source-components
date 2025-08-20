const getMatchingIndexes = (text = '', words) => {
  let output = [];
  if (!text || !words.length) {
    return output;
  }
  const matchIndexes = {};
  const lowerCasedText = text.toLowerCase();
  words.forEach(word => {
    const lowerCasedWord = word.toLowerCase();
    let index = 0,
      start = 0,
      numMatches = 0;
    while (start < text.length && index !== -1 && numMatches < 1) {
      index = lowerCasedText.indexOf(lowerCasedWord, start);
      if (index > -1) {
        const endIndex = index + lowerCasedWord.length;
        matchIndexes[index] = endIndex;
        numMatches++;
        start = endIndex;
      }
    }
  });
  output = Object.keys(matchIndexes).map(interval => {
    return [parseInt(interval, 10), matchIndexes[interval]];
  });
  return output;
};
const mergeIntervals = intervals => {
  intervals.sort((a, b) => {
    return a[0] - b[0];
  });
  let prev = intervals[0];
  const output = [prev];
  intervals.forEach(interval => {
    if (interval[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], interval[1]);
    } else {
      output.push(interval);
      prev = interval;
    }
  });
  return output;
};
const splitTextFromMatchingIndexes = (text, intervals) => {
  const output = [];
  const _intervals = mergeIntervals(intervals);
  let prevMatchEndIdx = 0;
  _intervals.forEach(([startIdx, endIdx]) => {
    const prevText = text.substring(prevMatchEndIdx, startIdx);
    if (prevText) {
      output.push(prevText);
    }
    output.push(`<strong>${text.substring(startIdx, endIdx)}</strong>`);
    prevMatchEndIdx = endIdx;
  });
  const remainingText = text.substring(prevMatchEndIdx);
  if (remainingText) {
    output.push(remainingText);
  }
  return output.join('');
};
export const computeMarkedItems = (items = [], term = '') => {
  if (!term) {
    return [...items];
  }
  if (!items || !items.length) {
    return [];
  }
  const words = term.trim().split(' ').filter((w, i, ar) => {
    return ar.indexOf(w) === i;
  });
  const markedItems = items.map(item => {
    const {
      text
    } = item;
    const intervals = getMatchingIndexes(text, words);
    if (!intervals.length) {
      item.text = text;
    } else {
      const markedText = splitTextFromMatchingIndexes(text, intervals);
      item.text = markedText;
    }
    return item;
  });
  return markedItems;
};