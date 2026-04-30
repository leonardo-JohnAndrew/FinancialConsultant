import * as  XLSX from "exceljs"; 
import { NextResponse } from "next/server";

export async function  ExportExcelFile(dataField , model, name) {


    try {
        let data = await model.findAll({
            attributes: dataField , 
            raw: true
        }); 
       // console.log(data); 
         if(!data || data.length === 0) {
            return "No data to export"; 
         }
         data = [
            { 
                Date : "02/06/2026", 
                Cheque_Date : "", 
                Cheque_no: "", 
                Cheque_release_no: "", 
                Description: "Balance forwarded", 
                Payor: "", 
                Unpaid_Amount: "", 
                Receipt: "", 
                Disbursement: "", 
                Balance: 31167586.98,
                Remarks :""
            },
            { 
                Date : "02/06/2026", 
                Cheque_Date : "", 
                Cheque_no: "619096", 
                Cheque_release_no: "", 
                Description: "PCF", 
                Payor: "OCG", 
                Unpaid_Amount: "", 
                Receipt: "", 
                Disbursement: 50000, 
                Balance: 31117586.98,
                Remarks :""
            },
            { 
                Date : "02/06/2026", 
                Cheque_Date : "", 
                Cheque_no: "619091", 
                Cheque_release_no: "", 
                Description: "PCF", 
                Payor: "OCG", 
                Unpaid_Amount: "", 
                Receipt: "", 
                Disbursement:  108130, 
                Balance: 31009456.98,
                Remarks :""
            },
            { 
                Date : "02/06/2026", 
                Cheque_Date : "", 
                Cheque_no: "Online Payment", 
                Cheque_release_no: "", 
                Description: "Driver's Overtime payment - January 2026", 
                Payor: "Erjan", 
                Unpaid_Amount: "", 
                Receipt: "", 
                Disbursement: 1290386.56, 
                Balance: 29719070.42,
                Remarks :""
            },
            { 
                Date : "02/06/2026", 
                Cheque_Date : "", 
                Cheque_no: "Online Payment", 
                Cheque_release_no: "", 
                Description: "Car Rental January 2026", 
                Payor: "Erjan", 
                Unpaid_Amount: "", 
                Receipt: "", 
                Disbursement: 4284185.38, 
                Balance: 25434885.04,
                Remarks :""
            },
            { 
                Date : "02/06/2026", 
                Cheque_Date : "", 
                Cheque_no: "619093", 
                Cheque_release_no: "", 
                Description: "Office Supplies", 
                Payor: "MKK", 
                Unpaid_Amount: "", 
                Receipt: "", 
                Disbursement: 36808.20, 
                Balance: 25398076.84,
                Remarks :""
            },
            { 
                Date : "02/10/2026", 
                Cheque_Date : "", 
                Cheque_no: "619092", 
                Cheque_release_no: "", 
                Description: "Security Service", 
                Payor: "NDGuzman", 
                Unpaid_Amount: "", 
                Receipt: "", 
                Disbursement: 46754.78, 
                Balance: 25351322.06,
                Remarks :""
            },
           
         ]

         
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
                 col.width = 18
             }
         })
         worksheet.getCell("A9").value = "Period Covered:"
         worksheet.getCell("E9").value = "Feb. 6 - March 9, 2026"
         
         //Column value
         const columnValue = [
            'Date', 
            'Cheque Date', 
            'Cheque No./Online Ref. No', 
            'Cheque Release Date', 
            'Description', 
            'Payor/Payee', 
            'Unpaid Amount', 
            'Receipt', 
            'Disbursement', 
            'Balance', 
            'Remarks'
        ]
        columnValue.map((c, i) => { 
            const colLetter = String.fromCharCode(65 + i); // 65 = 'A'
            worksheet.getCell(`${colLetter}10`).value = c;
            worksheet.getCell(`${colLetter}10`).font = { 
                bold: true
            }
            worksheet.getCell(`${colLetter}10`).border = {
                top : {style: "thin"},
                bottom : {style: "thin"}
            }
        })
        //data row 
        data.map((d, index)=> {
          worksheet.getCell(`A:${ 10 + index+1}`).value =  d.Date
          worksheet.getCell(`B:${ 10 + index+1}`).value =  d.Cheque_Date; 
          worksheet.getCell(`C:${ 10 + index+1}`).value = d.Cheque_no;
          worksheet.getCell(`D:${ 10 + index+1}`).value = d.Cheque_release_no;
          worksheet.getCell(`E:${ 10 + index+1}`).value = d.Description; 
          worksheet.getCell(`F:${ 10 + index+1}`).value = d.Payor
          worksheet.getCell(`G:${ 10 + index+1}`).value = d.Unpaid_Amount
          worksheet.getCell(`H:${ 10 + index+1}`).value = d.Receipt
          worksheet.getCell(`I:${ 10 + index+1}`).value = d.Disbursement
          worksheet.getCell(`J:${ 10 + index+1}`).value = d.Balance 
          worksheet.getCell(`K:${ 10 + index+1}`).value = d.Remarks
        })

        // number formatting 
         const targetColumns = ["I","J"]
         targetColumns.forEach(col => { 
           worksheet.getColumn(col).numFmt = "#,##0.00"; 
         })

        //borders
        worksheet.getCell("K1").border = {
            right : {style: undefined}
        }
        worksheet.getCell("K10").border = {
             top : {style: "thin"},
            bottom : {style: "thin"},
            right: {style: "thin"}
        }
        worksheet.getRow(10).height =38; 
        worksheet.autoFilter = {
            from : "A10", 
            to: "K10"
        }
         for(let i = 11 ; i< 70 ; i++){ 
            worksheet.getCell(`K${i}`).border  = { 
                right: {style: "thin"}
            }
         }

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