export async function validationRequiredFields(requiredFields, inputvalue) {
   let missingFields = {}
    if (!inputvalue) return ;
    for(const item of inputvalue){ 
     let   missing = []; 
     requiredFields?.forEach(fields =>{ 
          if(item[fields] === undefined || item[fields] === null ){
            missing.push(`${fields} is required`); 
          }
     }); 
     if(missing.length > 0){
        missingFields[`${inputvalue.indexOf(item)+1}`] = missing
     }
   }
   return   missingFields
}