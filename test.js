

  const columnValue = [
            'Column1', 
            'Column2', 
            'Column3', 
            'Column4', 
            'Column5', 
            'Column6', 
            'Column7', 
            'Column8', 
            'Column9', 
            'Column10', 
            'Column11'
]
const rs = {}; 
columnValue.map((c, index)=> {
   const colLetter = String.fromCharCode(65 + index);
   rs[`${colLetter}10`] = c
})
console.log(rs); 