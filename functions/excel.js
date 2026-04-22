import * as  XLSX from "xlsx"; 
import { NextResponse } from "next/server";
export async function  ExportExcelFile(dataField , model, name) {
    try {
        const data = await model.findAll({
            attribute : dataField , 
            raw: true
        }); 

         if(!data || data.length === 0) {
            return "No data to export"; 
         }

         // worksheet create 
         const worksheet = XLSX.utils.json_to_sheet(data, {
            header: dataField
            
         }); 
         //workbook 
         const workbook = XLSX.utils.book_new(); 
         XLSX.utils.book_append_sheet(workbook , worksheet ,name); 

         const buffer = XLSX.write(workbook, { 
            type: "buffer", 
            bookType: "xlsx"
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