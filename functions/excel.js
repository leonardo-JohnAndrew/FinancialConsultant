import * as XLSX from "exceljs";
import { NextResponse } from "next/server";
import { text } from "node:stream/consumers";

export async function ExportExcelFile(dataField, model, name) {
  try {
    let data = await model.findAll({
      attributes: dataField,
      raw: true,
    });
    // console.log(data);
    if (!data || data.length === 0) {
      return "No data to export";
    }
    data = [
      {
        Date: "02/06/2026",
        Cheque_Date: "",
        Cheque_no: "",
        Cheque_release_no: "",
        Description: "Balance forwarded",
        Payor: "",
        Unpaid_Amount: "",
        Receipt: "",
        Disbursement: "",
        Balance: 31167586.98,
        Remarks: "",
      },
      {
        Date: "02/06/2026",
        Cheque_Date: "",
        Cheque_no: "619096",
        Cheque_release_no: "",
        Description: "PCF",
        Payor: "OCG",
        Unpaid_Amount: "",
        Receipt: "",
        Disbursement: 50000,
        Balance: 31117586.98,
        Remarks: "",
      },
      {
        Date: "02/06/2026",
        Cheque_Date: "",
        Cheque_no: "619091",
        Cheque_release_no: "",
        Description: "PCF",
        Payor: "OCG",
        Unpaid_Amount: "",
        Receipt: "",
        Disbursement: 108130,
        Balance: 31009456.98,
        Remarks: "",
      },
      {
        Date: "02/06/2026",
        Cheque_Date: "",
        Cheque_no: "Online Payment",
        Cheque_release_no: "",
        Description: "Driver's Overtime payment - January 2026",
        Payor: "Erjan",
        Unpaid_Amount: "",
        Receipt: "",
        Disbursement: 1290386.56,
        Balance: 29719070.42,
        Remarks: "",
      },
      {
        Date: "02/06/2026",
        Cheque_Date: "",
        Cheque_no: "Online Payment",
        Cheque_release_no: "",
        Description: "Car Rental January 2026",
        Payor: "Erjan",
        Unpaid_Amount: "",
        Receipt: "",
        Disbursement: 4284185.38,
        Balance: 25434885.04,
        Remarks: "",
      },
      {
        Date: "02/06/2026",
        Cheque_Date: "",
        Cheque_no: "619093",
        Cheque_release_no: "",
        Description: "Office Supplies",
        Payor: "MKK",
        Unpaid_Amount: "",
        Receipt: "",
        Disbursement: 36808.2,
        Balance: 25398076.84,
        Remarks: "",
      },
      {
        Date: "02/10/2026",
        Cheque_Date: "",
        Cheque_no: "619092",
        Cheque_release_no: "",
        Description: "Security Service",
        Payor: "NDGuzman",
        Unpaid_Amount: "",
        Receipt: "",
        Disbursement: 46754.78,
        Balance: 25351322.06,
        Remarks: "",
      },
    ];
    const workbook = new XLSX.Workbook();
    const worksheet = workbook.addWorksheet(name);
    // logo picture
    // header/ layout
    worksheet.mergeCells("A1:B4");
    const imageId = worksheet.workbook.addImage({
      filename: "../financial-app/public/NstrenWhite.png",
      extension: "png",
    });
    worksheet.getColumn(2).width = 20;
    worksheet.getRow(2).height = 20;

    worksheet.addImage(imageId, {
      tl: { col: 0.7, row: 0 },
      ext: { width: 120, height: 80 },
    });
    worksheet.getCell("E2").value =
      "CONSULTANCY SERVICES FOR NORTH SOUTH COMMUTER RAILWAY(NSCR)\nMALOLOS, TUTUBAN GENERAL CONSULTANT\nContact No. PNRN1-01 (JICA L/A No. PH 256)";
    worksheet.mergeCells("E2: H4");
    worksheet.getCell("I2").value =
      "Joint Venture of\nOriental Consultants Global Co, Ltd, Japan, Katahira and Engineers\nInternational, Tonichi Engineering Consultants Inc, Pacific Consultant Co\nLtd, & Nippon Koei in association with";
    worksheet.getCell("I2").font = {
      size: 8,
    };
    worksheet.mergeCells("I2:K4");

    worksheet.mergeCells("A6:K7");
    worksheet.getCell("A6").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
    worksheet.getCell("A6").value = "Bank Transaction History - PHP";
    //column width
    worksheet.columns.forEach((col, index) => {
      if (index === 4 || index === 5) {
        col.width = 40;
      } else {
        col.width = 18;
      }
    });
    worksheet.getCell("A9").value = "Period Covered:";
    worksheet.getCell("E9").value = "Feb. 6 - March 9, 2026";

    //Column value
    const columnValue = [
      "Date",
      "Cheque Date",
      "Cheque No./Online Ref. No",
      "Cheque Release Date",
      "Description",
      "Payor/Payee",
      "Unpaid Amount",
      "Receipt",
      "Disbursement",
      "Balance",
      "Remarks",
    ];
    columnValue.map((c, i) => {
      const colLetter = String.fromCharCode(65 + i); // 65 = 'A'
      worksheet.getCell(`${colLetter}10`).value = c;
      worksheet.getCell(`${colLetter}10`).font = {
        bold: true,
      };
      worksheet.getCell(`${colLetter}10`).border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    });
    //data row
    data.map((d, index) => {
      worksheet.getCell(`A:${10 + index + 1}`).value = d.Date;
      worksheet.getCell(`B:${10 + index + 1}`).value = d.Cheque_Date;
      worksheet.getCell(`C:${10 + index + 1}`).value = d.Cheque_no;
      worksheet.getCell(`D:${10 + index + 1}`).value = d.Cheque_release_no;
      worksheet.getCell(`E:${10 + index + 1}`).value = d.Description;
      worksheet.getCell(`F:${10 + index + 1}`).value = d.Payor;
      worksheet.getCell(`G:${10 + index + 1}`).value = d.Unpaid_Amount;
      worksheet.getCell(`H:${10 + index + 1}`).value = d.Receipt;
      worksheet.getCell(`I:${10 + index + 1}`).value = d.Disbursement;
      worksheet.getCell(`J:${10 + index + 1}`).value = d.Balance;
      worksheet.getCell(`K:${10 + index + 1}`).value = d.Remarks;
    });

    // number formatting
    const targetColumns = ["I", "J"];
    targetColumns.forEach((col) => {
      worksheet.getColumn(col).numFmt = "#,##0.00";
    });

    //borders
    worksheet.getCell("K1").border = {
      right: { style: undefined },
    };
    worksheet.getCell("K10").border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    worksheet.getRow(10).height = 38;
    worksheet.autoFilter = {
      from: "A10",
      to: "K10",
    };
    for (let i = 11; i < 70; i++) {
      worksheet.getCell(`K${i}`).border = {
        right: { style: "thin" },
      };
    }

    //alignment
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          wrapText: true,
          vertical: "middle",
          horizontal: "center",
        };
      });
    });
    worksheet.getCell("I2").alignment = {
      wrapText: true,
      vertical: "top",
      horizontal: "left",
    };
    worksheet.getCell("E2").alignment = {
      wrapText: true,
      vertical: "top",
      horizontal: "left",
    };
    worksheet.getCell("A1").alignment = {
      vertical: "bottom",
      horizontal: "center",
    };

    worksheet.getCell("B1").alignment = {
      vertical: "bottom",
      horizontal: "center",
    };
    worksheet.getCell("E2").font = {
      size: 10,
      bold: true,
    };

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
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}

export async function ExportExcelBudgetFile(items, name) {
  try {
    // =========================================
    // WORKBOOK
    // =========================================

    const workbook = new XLSX.Workbook();

    const worksheet = workbook.addWorksheet("Budget");

    // =========================================
    // COLUMN WIDTHS
    // =========================================

    worksheet.columns = [
      { width: 8 }, // A SN
      { width: 8.3 }, // B DESCRIPTION
      { width: 35 }, // C DESCRIPTION

      { width: 10 }, // d UNIT
      { width: 10 }, // E RATE
      { width: 10 }, // F QTY
      { width: 14 }, // G AMOUNT

      { width: 10 }, // H RATE
      { width: 10 }, // I QTY
      { width: 14 }, // J COST

      { width: 10 }, // K QTY
      { width: 14 }, // L AMOUNT

      { width: 10 }, // M QTY
      { width: 14 }, // N AMOUNT

      { width: 10 }, // O QTY
      { width: 14 }, // P AMOUNT

      { width: 10 }, // Q QTY
      { width: 14 }, // R AMOUNT
    ];

    // =========================================
    // TOP HEADER
    // =========================================

    worksheet.mergeCells("A1:B4");
    worksheet.mergeCells("D1:G4");

    worksheet.getCell("D1").value =
      "CONSULTANCY SERVICES FOR NORTH SOUTH COMMUTER RAILWAY (NSCR)\n" +
      "MALOLOS - TUTUBAN GENERAL CONSULTANT\n" +
      "Contract No. PNRN1-01 (JICA L/A No. PH 262)";

    worksheet.getCell("D1").font = {
      bold: true,
      size: 8,
    };

    worksheet.getCell("D1").alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "left",
    };

    // =========================================
    // HEADER
    // =========================================

    worksheet.mergeCells("A12:A13");
    worksheet.mergeCells("B12:C13");

    worksheet.mergeCells("D12:G12");
    worksheet.mergeCells("H12:J12");
    worksheet.mergeCells("K12:L12");
    worksheet.mergeCells("M12:N12");
    worksheet.mergeCells("O12:P12");
    worksheet.mergeCells("Q12:R12");

    worksheet.getCell("A12").value = "SN";
    worksheet.getCell("B12").value = "DESCRIPTION";
    worksheet.getCell("D12").value = "Approved Cost";
    worksheet.getCell("H12").value = "Modified Cost";
    worksheet.getCell("K12").value = "Previous Claimed";
    worksheet.getCell("M12").value = "This Month";
    worksheet.getCell("O12").value = "Cumulative Claimed";
    worksheet.getCell("Q12").value = "Remaining Balance";
    worksheet.getCell("A14").value = "||";
    worksheet.getCell("B14").value = "Reimbursables";

    // sub
    //Approved
    worksheet.getCell("D13").value = "Unit";
    worksheet.getCell("E13").value = "Rate";
    worksheet.getCell("F13").value = "Qty";
    worksheet.getCell("G13").value = "Amount";
    //Modified
    worksheet.getCell("H13").value = "Rate";
    worksheet.getCell("I13").value = "Qty";
    worksheet.getCell("J13").value = "Cost";
    //previous
    worksheet.getCell("K13").value = "Qty";
    worksheet.getCell("L13").value = "Amount";
    //this month
    worksheet.getCell("M13").value = "Qty";
    worksheet.getCell("N13").value = "Amount";
    //Cumulative
    worksheet.getCell("O13").value = "Qty";
    worksheet.getCell("P13").value = "Amount";
    // Remaining Balance
    worksheet.getCell("Q13").value = "Qty";
    worksheet.getCell("R13").value = "Amount";

    // =========================================
    // HELPERS
    // =========================================

    const mediumBorder = {
      style: "medium",
      color: { argb: "000000" },
    };

    const thinBorder = {
      style: "thin",
      color: { argb: "000000" },
    };

    const dottedBorder = {
      style: "dotted",
      color: { argb: "000000" },
    };

    const formatNumber = (cell) => {
      cell.numFmt = "#,##0.00";
    };

    // =========================================
    // HEADER STYLE
    // =========================================

    [12, 13].forEach((rowNum) => {
      const row = worksheet.getRow(rowNum);

      row.height = 22;

      row.eachCell((cell) => {
        cell.font = {
          bold: false,
          color: { argb: "000000" },
        };

        if (cell.value === "SN" || cell.value === "DESCRIPTION") {
          cell.alignment = {
            vertical: "bottom",
            horizontal: "left",
          };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        }

        cell.border = {
          top: mediumBorder,
          bottom: mediumBorder,
          left: thinBorder,
          right: thinBorder,
        };
      });
    });

    // =========================================
    // FLATTEN TREE
    // =========================================

    const rows = [];

    const flatten = (data = []) => {
      data.forEach((item) => {
        rows.push(item);

        if (item.children?.length) {
          flatten(item.children);
        }
      });
    };

    flatten(items);

    // =========================================
    // BODY
    // =========================================

    let rowIndex = 15;

    rows.forEach((item) => {
      const values = item.values || {};

      const row = worksheet.getRow(rowIndex);

      // MAIN ROW
      if (item.level === 1) {
        worksheet.mergeCells(`B${rowIndex}:C${rowIndex}`);
        row.values = [
          item.code || "",
          item.description || "",

          "",
          "",
          "",
          "",

          "",
          "",
          "",

          "",
          "",

          "",
          "",

          "",
          "",

          "",
          "",
        ];
      } else {
        row.values = [
          "",
          item.code,
          item.description || "",

          values.approved_unit || "",

          values.approved_rate || 0,
          values.approved_qty || 0,
          values.approved_amount || 0,

          values.revision_rate || 0,
          values.revision_qty || 0,
          values.revision_cost || 0,

          values.prev_qty || 0,
          values.prev_amount || 0,

          values.month_qty || 0,
          values.month_amount || 0,

          values.cumulative_qty || 0,
          values.cumulative_amount || 0,

          values.remaining_qty || 0,
          values.remaining_amount || 0,
        ];
      }

      row.eachCell((cell, colNumber) => {
        cell.font = {
          bold: item.level === 1,
        };

        cell.alignment = {
          vertical: "middle",
          horizontal:
            colNumber === 1 ? "center"
            : colNumber >= 3 ? "center"
            : "left",
        };

        // DESCRIPTION INDENT
        if ((colNumber === 3 && item.level > 1) || cell.value === "SN") {
          cell.alignment = {
            vertical: "bottom",
            horizontal: "left",
          };
        }
        cell.border = {
          top: dottedBorder,
          bottom: dottedBorder,
          left: item.description ? undefined : thinBorder,
          right: thinBorder,
        };
      });
      const colB = worksheet.getColumn("B");
      colB.eachCell((cell, rowNumber) => {
        // Only affect row 16 onward and cells with values
        if (rowNumber >= 15 && cell.value !== null && cell.value !== "") {
          cell.border = {
            top: undefined,
            left: undefined,
            right: undefined,
            bottom: undefined,
          };
        }
      });
      // NUMBER FORMAT
      [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].forEach((col) => {
        const cell = row.getCell(col);

        if (cell.value && cell.value !== 0) {
          formatNumber(cell);
        }
      });

      rowIndex++;
    });

    // =========================================
    // TOTALS
    // =========================================

    const totalRow = worksheet.getRow(rowIndex);

    worksheet.mergeCells(`A${rowIndex}:E${rowIndex}`);

    totalRow.getCell(1).value = "TOTAL REIMBURSABLES";

    totalRow.getCell(6).value = {
      formula: `SUM(F15:F${rowIndex - 1})`,
    };

    totalRow.getCell(11).value = {
      formula: `SUM(K15:K${rowIndex - 1})`,
    };

    totalRow.getCell(13).value = {
      formula: `SUM(M15:M${rowIndex - 1})`,
    };

    totalRow.getCell(15).value = {
      formula: `SUM(O15:O${rowIndex - 1})`,
    };

    totalRow.getCell(17).value = {
      formula: `SUM(Q15:Q${rowIndex - 1})`,
    };

    totalRow.eachCell((cell) => {
      cell.font = {
        bold: true,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      cell.border = {
        top: mediumBorder,
        bottom: mediumBorder,
        left: thinBorder,
        right: thinBorder,
      };

      if (typeof cell.value !== "string") {
        formatNumber(cell);
      }
    });

    // =========================================
    // OUTER BORDERS
    // =========================================

    worksheet.eachRow((row) => {
      // LEFT OUTER
      row.getCell(1).border = {
        ...row.getCell(1).border,
        left: mediumBorder,
      };

      // RIGHT OUTER
      row.getCell(17).border = {
        ...row.getCell(17).border,
        right: mediumBorder,
      };
    });

    // =========================================
    // EXPORT
    // =========================================

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename=${name}.xlsx`,

        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error_message: err.message,
      },
      {
        status: 500,
      },
    );
  }
}
