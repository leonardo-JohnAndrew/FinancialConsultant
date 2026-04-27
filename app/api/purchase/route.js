import sequelize from "@/db/connection";
import { ItemsLists, Purchase, PurchaseItems, User } from "@/db/models";
import { NextResponse } from "next/server";
import { generatePurchaseId } from "@/functions/autogenerate";
import { DATE, Op } from "sequelize";

// insert 
export async function  POST(request){ 
    await sequelize.sync(); 
    const requiredFields = [ 
        "ItemName", 
        "Unit", 
        "UnitPrice",
        "UserID"
    ]
    const body = await request.json(); 
    console.log(body); 
    if(!body.purchaseItem){ 
        return NextResponse.json( 
            {message: "Data is required"},
            {status: 400}
        ); 
    }
     let missingFields  = {};      
    //item valdation 
    for(const item of body.purchaseItem){ 
      let missing  =[]; 
      requiredFields.forEach(field => { 
        if(item[field] === undefined || item[field] === null){ 
            missing.push(`${field} is required`); 
        }
        }); 
        if(missing.length > 0){ 
            missingFields[`purchaseItem_${body.purchaseItem.indexOf(item)+1}`] = missing; 
        }
    } 
    console.log(missingFields); 
    if(Object.keys(missingFields).length > 0){ 
        return NextResponse.json( 
            {message: "Validation failed", errors: missingFields},
            {status: 400}
        ); 
    }  
   

     // insert data 
    try{ 
        let list = []
        //ItemList Databse 
     for (const item of body.purchaseItem){
        const { ItemName, Unit, UnitPrice } = item;

       // Check if item exists
        const existingItem = await ItemsLists.findOne({
            attributes: ['ItemName', 'UnitPrice'], 
        where: { ItemName }
     });

     if (!existingItem) {
     // Create new item
       await ItemsLists.create({
       ItemName,
       Unit,
       UnitPrice
     });
    } else {
     // Check if UnitPrice is different
    //  if (existingItem.UnitPrice !== UnitPrice) {
    //     await existingItem.update({
    //     UnitPrice,
    //     Unit
    //   });
    // }
  }
}
 
        // get name of purchase items  
        const codeID = generatePurchaseId();
        const purchase = await  Purchase.create({ 
            PurchaseID: codeID,
             UserID: body?.purchaseItem[0]?.UserID,
            timeStamp: new Date(),
        }); 
        const purchaseItemsData = body.purchaseItem.map(item => ({ 
            PurchaseID: purchase.PurchaseID, 
            ItemName: item.ItemName,
            Unit: item.Unit, 
            UnitPrice: item.UnitPrice
        })); 
       const items =   await sequelize.models.purchaseItems.bulkCreate(purchaseItemsData);
       // check if 

       if(!items || items.length === 0 || items === undefined ){
          await purchase.destroy({
              where: {PurchaseID: purchase.PurchaseID}
          });   
          return NextResponse.json(
            {message: "Failed to create purchase items, purchase rolled back"},
            {status: 500}
          );         
        } 
        return NextResponse.json({
            message: "Purchase created successfully",
            purchase: purchase , 
            items 
        } ,{status: 201}); 
    }catch(error){ 
        console.error("Error inserting data:", error); 
        return NextResponse.json( 
            {message: "Internal Server Error"},
            {status: 500}
        ); 
    }
  
 }

 //get all 
export async function GET(request){ 
    const url = new URL(request.url);
    const searchParams = url.searchParams; 
    const page = parseInt(searchParams.get("page")) || 1 
    const limit = parseInt(searchParams.get("limit"))|| 10; 
     
    const offset = (page-1)*limit // skip page 
  try {
     await sequelize.sync(); 
     const dates = await Purchase.findOne({
        attributes:[
            [sequelize.Sequelize.fn('MIN', sequelize.col('createdAt')), 'earliestDate'], 
            [sequelize.Sequelize.fn('MAX', sequelize.col('createdAt')), 'latestDate']
        ]
     });  
     const startParam = searchParams.get("dateStart")
     const endParam =  searchParams.get("dateEnd") 
     const rangeStart = startParam? `${startParam} 00:00:00` : dates.dataValues.earliestDate; 
     const rangeEnd = endParam? `${endParam} 23:59:59`: dates.dataValues.latestDate
   
     const {rows , count} = await Purchase.findAndCountAll({
        offset: offset, 
        limit: limit, 
         distinct: true, 
        order: [['PurchaseID', 'DESC']], 
         where: {
       createdAt: {
      [Op.between]: [rangeStart, rangeEnd]
      }
  },
  include: [
    { model: User },
    { 
      model: PurchaseItems,
      include: [{ model: ItemsLists }]
    }
  ]
       
     })

    //  const purchases = await Purchase.findAll({ 
    //     include: [{ 
    //      model: User
    //     }], 
    //     include: [{ 
    //         model: PurchaseItems, 
    //         include: [{ 
    //             model: ItemsLists,
    //         }]
    //     }]
    //  }); 
        return NextResponse.json({
        data:rows, 
        total:count , page , 
        rangeStart, 
        rangeEnd, 
        totalPages: Math.ceil(count /limit)
        }, {status: 200});
  }catch (error) {
     return NextResponse.json(
        {message: "Internal Server Error" , error: error.message},
        {status: 500}
    );
  }  
 }