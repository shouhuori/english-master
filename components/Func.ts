const sw = require('stopword');
const _ = require('lodash');

export const cleanString = (string) => {
    let s = string.replace(/[^\w\s\-]/g, "");
    return s;
} 

export const cleanWordArray = (string) => {
    let strings = cleanString(string.toLocaleLowerCase()).split(' ');
    let wordArray = _.uniqBy(sw.removeStopwords(strings), (e) => {
        return e;
    })
    let cleanedArray = _.remove(wordArray, (w) => {
        if (!/^\d+$/.test(w)) {
            return w;
        }
    });
    return cleanedArray;
}