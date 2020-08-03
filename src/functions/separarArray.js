function separarArray(array, max){
  var res = [];
  
  for (var i = 0; i < array.length; i = i+(max-1)) {
    res.push(array.slice(i,(i+max)));
  }
  res[res.length-1].push(array[0]);
  return res;
}

module.exports = separarArray;