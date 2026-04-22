import * as  XLSX from "xlsx"; 
import { NextResponse } from "next/server";
export async function  ExportExcelFile(dataField , model, name) {
    try {
        const data = await model.findAll({
            attributes: dataField , 
            raw: true
        }); 

         if(!data || data.length === 0) {
            return "No data to export"; 
         }

         //format data break 
         const formatted = data.map((row)=>({
           ...row, 
           merged_field: `E: ${row.e_value || "2-4"}\nK: ${row.k_value || "2-4"}`
         }))
         //create worksheet 
         const worksheet = XLSX.utils.json_to_sheet(formatted);

         //apply wrapText to all cells 
         const range = XLSX.utils.decode_range(worksheet["!ref"]); 

         for(let R = range.s.r; R<= range.e.r; ++R){
            for(let C = range.s.c ; C<= range.e.c ; ++C){ 
                const cellAddress =XLSX.utils.encode_cell({r:R , c:C}); 
                if(!worksheet[cellAddress]) continue; 

                worksheet[cellAddress].s = {
                    alignment: {wrapText : true}
                }
            }
         } 
          //  Step 4: Merge cells (example: column E to K per row)  
worksheet["!merges"] = [];  

for (let i = 1; i <= formatted.length; i++) {  
  worksheet["!merges"].push({  
    s: { r: i, c: 4 }, // E column  
    e: { r: i, c: 10 }, // K column  
  });  

  //  Step 5: Put value in first cell of merge (E column)  
  const cellAddress = XLSX.utils.encode_cell({ r: i, c: 4 });  

  worksheet[cellAddress] = {  
    v: formatted[i - 1].merged_field,  
    t: "s",  
    s: {  
      alignment: { wrapText: true },  
    },  
  };  
}  

//  Step 6: Create workbook  
const workbook = XLSX.utils.book_new();  
XLSX.utils.book_append_sheet(workbook, worksheet, name);  

//  Step 7: Generate buffer  
const buffer = XLSX.write(workbook, {  
  type: "buffer",  
  bookType: "xlsx",  
});  

      
         
         // response 
         return new NextResponse(buffer, {
           status: 200,
           headers: {
           "Content-Disposition": `attachment; filename=${name}.xlsx`,
           "Content-Type":
           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
         },
    });
    }catch(err){ 
         return NextResponse.json(
         { error_message: err.message },
         {status: 500 }
    );
    }
}