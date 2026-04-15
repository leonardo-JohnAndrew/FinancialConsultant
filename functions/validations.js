export async function validationRequiredFields(requiredFields, inputvalue) {
   let missingFields = {}

    if (!inputvalue) return ;
  
    
    for(const item of inputvalue){ 
     let   missing = []; 
     requiredFields?.forEach(fields =>{ 
          if( !item[fields]) { 
            missing.push(`${fields} is required`); 
            
          }else{
              const currentItem = item[fields].trim(); 
             if(currentItem === undefined || currentItem === null|| !currentItem ){
               missing.push(`${fields} is required`); 
             }
          }
     }); 
     if(missing.length > 0){
        missingFields[`data ${inputvalue.indexOf(item)+1}`] = missing
     }
   }
   return  missingFields
}