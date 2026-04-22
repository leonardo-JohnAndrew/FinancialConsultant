import * as  XLSX from "exceljs"; 
import { NextResponse } from "next/server";
import { buffer } from "node:stream/consumers";
export async function  ExportExcelFile(dataField , model, name) {
    try {
        const data = await model.findAll({
            attributes: dataField , 
            raw: true
        }); 

         if(!data || data.length === 0) {
            return "No data to export"; 
         }
         
         const workbook = new XLSX.Workbook(); 
         const worksheet = workbook.addWorksheet(name); 
     
         // logo picture 
         // header/ layout
         worksheet.mergeCells("A1:B4"); 
         const imageId = worksheet.workbook.addImage({
             filename : "../financial-app/public/NstrenWhite.png", 
             extension: "png"
         })
         worksheet.getColumn(2).width =20 
         worksheet.getRow(2).height = 20

        worksheet.addImage(imageId, { 
         tl:{col: 0.7 , row: 0}, 
         ext:{width: 120, height: 80}
        })
         worksheet.getCell("E2").value = "CONSULTANCY SERVICES FOR NORTH SOUTH COMMUTER RAILWAY(NSCR)\nMALOLOS, TUTUBAN GENERAL CONSULTANT\nContact No. PNRN1-01 (JICA L/A No. PH 256)"
         worksheet.mergeCells("E2: H4"); 
         worksheet.getCell("I2").value = "Joint Venture of\nOriental Consultants Global Co, Ltd, Japan, Katahira and Engineers\nInternational, Tonichi Engineering Consultants Inc, Pacific Consultant Co\nLtd, & Nippon Koei in association with"
         worksheet.getCell("I2").font ={
            size: 8, 
         }
         worksheet.mergeCells("I2:K4"); 

         worksheet.mergeCells("A6:K7")
         worksheet.getCell("A6").border = {
            top: {style : "thin"}, 
            left: {style : "thin"}, 
            right: {style : "thin"}, 
            bottom: {style : "thin"}, 
         }     
        worksheet.getCell("A6").value = "Bank Transaction History - PHP"
         //column width 
         worksheet.columns.forEach((col , index) => {
             if(index === 4 || index === 5){
                col.width = 40; 
             }else {
                 col.width = 16.50
             }
         })
         worksheet.getCell("A9").value = "Period Covered:"
         worksheet.getCell("E9").value = "Feb. 6 - March 9, 2026"
            //alignment 
            worksheet.eachRow((row)=>{
                row.eachCell((cell)=> {
                    cell.alignment = {
                        wrapText : true, 
                        vertical: "middle", 
                        horizontal: "center"
                    }
                })
            })
            worksheet.getCell("I2").alignment = {
                  wrapText : true, 
                  vertical: "top", 
                  horizontal: "left"
            }
            worksheet.getCell("E2").alignment = {
               wrapText : true, 
               vertical: "top", 
               horizontal: "left"
         }
         worksheet.getCell("E2").font = {
            size : 10, 
            bold: true
         }

         //export 
         const buffer = await workbook.xlsx.writeBuffer();         

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