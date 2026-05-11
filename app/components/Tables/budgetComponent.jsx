'use client'
import axios from 'axios';
import { FaPlus , FaMinus } from 'react-icons/fa';
 // import { list } from 'postcss'
import React, { useEffect, useState } from 'react'
import { computeTotals } from '@/functions/budget';
import { formatMoney } from '@/functions/formatCurrency';
import { useBanner } from '@/hooks/Context/banner';


  const Row = React.memo(function Row({ 
  item,
  level = 0,
  updateField,
  addSub,
  deleteItem,
  deleteMain, 
  isLast = false

  }) {
  const v = item.values || {};
  const isMain = level === 0;
  const show = (val) => (isMain ? "" : val);
  
  return (
    <>
      <tr style={{ fontWeight: isMain ? "bold" : "normal" }} className="text-center border border-dotted">
        <td style={{ paddingLeft: `${level * 20}px` }} >
          {item.code}
        </td>

        <td className="border-r-2 p-1 text-left flex">
          <input
            type="text"
            value={item.description || ""}
            onChange={(e) =>
              updateField(item.id, "description", e.target.value, item.parent_id)
            }
            style={{ width: `${(item.description || "").length}ch` }}
            className= ' border-r-2 border-gray-300 w-full   bg-gray-100'
          />
          {isMain && ( 
            <div className='flex w-full justify-end items-end'>
             <button
              onClick={() => addSub(item.id)}
              className="bg-black hover:bg-white hover:text-black border border-black text-white px-2 py-1 rounded text-xs "
              >
              <FaPlus  size={10}/>
            </button>
            </div>
          )}
        </td>
   {/* Approved */}
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="text"
              value={v.approved_unit || ""}
              onChange={(e) =>
                updateField(item.id, "approved_unit", e.target.value, item.parent_id)
              }
               style={{ width: `${(v.approved_unit || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.approved_rate || ""}
              onChange={(e) =>
                updateField(item.id, "approved_rate", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.approved_rate || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.approved_qty || ""}
              onChange={(e) =>
                updateField(item.id, "approved_qty", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.approved_qty || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.approved_amount || ""}
              onChange={(e) =>
                updateField(item.id, "approved_amount", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.approved_amount || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td> 
        {/*Modified  */}
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.revision_rate || ""}
              onChange={(e) =>
                updateField(item.id, "revision_rate", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.revision_rate || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.revision_qty || ""}
              onChange={(e) =>
                updateField(item.id, "revision_qty", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.revision_qty || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.revision_cost || ""}
              onChange={(e) =>
                updateField(item.id, "revision_cost", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.revision_cost || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td> 
        {/* Previous Claimed */} 
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.prev_qty || ""}
              onChange={(e) =>
                updateField(item.id, "prev_qty", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.prev_qty || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.prev_amount || ""}
              onChange={(e) =>
                updateField(item.id, "prev_amount", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.prev_amount || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        {/* This month */}
         <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.month_qty || ""}
              onChange={(e) =>
                updateField(item.id, "month_qty", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.month_qty || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.month_amount || ""}
              onChange={(e) =>
                updateField(item.id, "month_amount", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.month_amount || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        {/* cumulative */}
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.cumulative_qty || ""}
              onChange={(e) =>
                updateField(item.id, "cumulative_qty", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.cumulative_qty || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.cumulative_amount || ""}
              onChange={(e) =>
                updateField(item.id, "cumulative_amount", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.cumulative_amount || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        {/* Remaining Balance */}
         <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.remaining_qty || ""}
              onChange={(e) =>
                updateField(item.id, "remaining_qty", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.remaining_qty || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
        <td className='border-r-2 text-left'>
          {!isMain && (
            <input
              type="number"
              value={v.remaining_amount || ""}
              onChange={(e) =>
                updateField(item.id, "remaining_amount", e.target.value, item.parent_id)
              }
               style={{ width: `${String(v.remaining_amount || "").length + 3}ch` }}
               className= 'border border-gray-300 px-1 bg-gray-100'
            />
          )}
        </td>
          

        
 <td>
  {/* {isMain && (
    <button
      onClick={() => addSub(item.id)}
      className="bg-black hover:bg-white hover:text-black border border-black text-white px-2 py-1 rounded text-xs"
    >
      <FaPlus  size={10}/>
    </button>
  )} */} 
   { isMain && ( 
      //delete button only show if main item has no sub items
        <button
    onClick={() => deleteMain(item.id)}
    className="bg-darkRed border border-darkRed text-white  hover:bg-white hover:text-black px-2 py-1 rounded text-xs"
  >
    <FaMinus size={10} />
  </button>
      )
    }
  {!isMain && (
  <button
    onClick={() => deleteItem(item.id, item.parent_id)}
    className="bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded text-xs"
  >
    <FaMinus size={10} />
  </button>
)}
</td>

      </tr>

{item.children?.map((child, idx, arr) => (
  <Row
    key={child.id}
    item={child}
    level={level + 1}
    updateField={updateField}
    addSub={addSub}
    deleteItem={deleteItem}
    deleteMain={deleteMain}
    isLast={idx === arr.length - 1}
  />
))}
    </>
  );
});

const BudgetComponentTable = (props) => {
    const {items, setItems} = props 
    const [isSave , setSave] = useState(false);  
    // const [total , setTotal] = useState(); 
    const total =  computeTotals(items); 
    const {showSuccess , showError} = useBanner(); 
// renumber 
// const renumber = (list) =>{ 
//   return list.map((item, i) => {
//   const newCode = `${i + 1 }`; 
//   const children =  item.children.map((child, i)=> ({
//     ...child, 
//     code: `${newCode}.${i + 1}`
//   }));
//    return { 
//     ...item, 
//     code: newCode, 
//     children
//    };
// })
// }
const renumber = (list, prefix = "") => {
  return list.map((item, i) => {
    const newCode = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;

    return {
      ...item,
      code: newCode,
      children: renumber(item.children || [], newCode)
    };
  });
};

    //add Main 
    const addMain = () => { 
      const nextNumber = items.length + 1  
      const NewItem = { 
       id: Date.now(), 
        code : `${nextNumber}`, 
        description: "Enter Main Description", 
        level: 1 , 
        parent_id : null , 
        
        children: [] , 
        values : { }
      }
      setItems([...items, NewItem]); 
    }

  useEffect(()=>{
     console.log(items); 
  }, [])
   const addSub = (parentId) => { 
    const update = items.map(item => { 
      if(item.id === parentId ) { 
        const nextSub = item.children.length  + 1; 
        const newChild = { 
           id: Date.now(),
           code: `${item.code}.${nextSub}`, 
           description: "Enter Sub-Main Descriptions", 
           level: 2  , 
           parent_id : item.id, 
           children: [], 
           values: {} 
        }; 
        return { 
          ...item, 
          children : [...item.children, newChild]
        }; 
      }
        return item
    }); 
    setItems(renumber(update)); 
   } 


   //update 
const updateField = (id, field, value) => {
  const updateTree = (list) => {
    return list.map(item => {
      if (item.id === id) {
        return applyUpdate(item);
      }

      return {
        ...item,
        children: updateTree(item.children || [])
      };
    });
  };

  const applyUpdate = (obj) => {
    if (field === "description") {
      return { ...obj, description: value };
    }

    return {
      ...obj,
      values: {
        ...obj.values,
        [field]: value,
      },
    };
  };

  setItems(updateTree(items));
};
   //dlete 
   const deleteItem = (id , parentId = null ) => { 
    let update; 
    if(!parentId){ 
      update = items.filter(i => i.id !== id)
    }else {
       update = items.map(item => { 
        if(item.id === parentId){
          return { 
            ...item, 
            children: 
            item.children.filter(c=> c.id !== id)
          }; 
        }
         return item
       })
    }
    setItems(renumber(update)); 
   }
   // delete Main 
   const deleteMain = (mainId) => {
   const updated = items.filter(item => item.id !== mainId);
   setItems(renumber(updated));
};
    // handle update 
   const handlesave = async() => {
         const  cleanSave =  cleanItems(items); 
       const res = await axios.put("/api/budgets/1" , { 
           cleanSave 
       }) 
       if(res.status === 200 || res.status === 201){
           showSuccess("Successfully Save")
       }else { 
          showError("Failed to Save"); 
         console.log("error: ",res.error_message); 
       }
   }
   // clean data 
   const cleanItems = (list) => {
  return list.map(item => ({
    id: item.id,
    code: item.code,
    description: item.description,
    level: item.level,
    parent_id: item.parent_id,
    project_id: item.project_id,

    values: item.values
      ? {
          approved_unit: item.values.approved_unit,
          approved_rate: item.values.approved_rate,
          approved_qty: item.values.approved_qty,
          approved_amount: item.values.approved_amount,

          revision_qty: item.values.revision_qty,
          revision_rate: item.values.revision_rate,
          revision_cost: item.values.revision_cost,

          prev_qty: item.values.prev_qty,
          prev_amount: item.values.prev_amount,

          month_qty: item.values.month_qty,
          month_amount: item.values.month_amount,

          cumulative_qty: item.values.cumulative_qty,
          cumulative_amount: item.values.cumulative_amount,

          remaining_qty: item.values.remaining_qty,
          remaining_amount: item.values.remaining_amount,
        }
      : null,

    children: cleanItems(item.children || [])
  }));
}; 

  return (
    <div className='overflow-x-auto'>  
      {/* ADD MAIN BUTTON */}
    <div className="flex justify-end items-end mb-3">
      <button
        onClick={addMain}
        className="bg-lightRed hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-semibold"
      >
        + Add Main Item
      </button>
    </div>
       <table   cellPadding={5} className='border border-collapse w-full border-black '>
            <thead>
                {/* GROUP HEADERS */}
          <tr>
            <th className='bg-black text-white border border-white' rowSpan="2">SN</th>
            <th className='bg-black text-white border border-white' rowSpan="2">Description</th>
            <th className='bg-black text-white border border-white' colSpan="4">Approved</th>
            <th className='bg-black text-white border border-white' colSpan="3">Modified Cost</th>
            <th className='bg-black text-white border border-white' colSpan="2">Previous Claimed</th>
            <th className='bg-black text-white border border-white'colSpan="2">This Month</th>
            <th className='bg-black text-white border border-white' colSpan="2">Cumulative Claimed</th>
            <th className='bg-black text-white border border-white' colSpan="2">Remaining Balance</th>
           <th className='bg-black text-white border border-white' rowSpan="2"> Action </th>
          </tr>

          {/* SUB HEADERS */}
          <tr>
            {/* Approved */}
            <th className='bg-black text-white border border-white'>Unit</th>
            <th className='bg-black text-white border border-white'>Rate</th>
            <th className='bg-black text-white border border-white'>Qty</th>
            <th className='bg-black text-white border border-white'>Amount</th>

            {/* Revision */}
            <th className='bg-black text-white border border-white'>Rate</th>
            <th className='bg-black text-white border border-white'>Qty</th>
            <th className='bg-black text-white border border-white'>Cost</th>

            {/* Previous */}
            <th className='bg-black text-white border border-white'>Qty</th>
            <th className='bg-black text-white border border-white'>Amount</th>

            {/* This Month */}
            <th className='bg-black text-white border border-white'>Qty</th>
            <th className='bg-black text-white border border-white'>Amount</th>

            {/* Cumulative */}
            <th className='bg-black text-white border border-white'>Qty</th>
            <th className='bg-black text-white border border-white'>Amount</th>
            
            {/* Remaining */}
            <th className='bg-black text-white border border-white'>Qty</th>
            <th className='bg-black text-white border border-white'>Amount</th>
            
            
          </tr>

            </thead>
            <tbody>
            {items.map((item) => (
             <Row key={item.id} item={item} updateField={updateField} 
              addSub = {addSub} deleteItem = {deleteItem} deleteMain = {deleteMain}/>
             ))}
              
             <tr className='text-center border-t-2' >
              <td className='font-semibold' colSpan= "2">TOTAL REIMBURSABLES</td>
               <td></td>
               <td></td>
               <td></td>
               <td className='border-r px-1'>
                  {formatMoney(parseFloat(total?.approved_amount ||0),'PHP','en-PH' )}
               </td>
               <td colSpan= '4' ></td>
               <td className='border-r px-1'>{formatMoney(parseFloat(total.prev_amount||0),'PHP', 'en-PH')}</td>
               <td></td>
               <td className='border-r px-1 '>{formatMoney(parseFloat(total.month_amount||0), 'PHP', 'en-PH')}</td>
               <td></td>
               <td className='border-r px-1'>{formatMoney(parseFloat(total.cumulative_amount||0), 'PHP', 'en-PH')}</td>
               <td></td>
               <td className='border-r px-1'>{formatMoney(parseFloat(total.remaining_amount||0), 'PHP', 'en-PH')}</td>
    
             </tr>
           </tbody>
             
       </table>
        <div className='flex justify-end items-end'>
           <button 
            onClick={(e) => handlesave()}
           className='rounded bg-lightRed p-2 px-5 mr-4 mt-4 text-white font-semibold border border-darkRed hover:bg-white hover:text-darkRed'>Save</button>
        </div>
        {/* {isSave && ( 
           <div> 
                {JSON.stringify(items)}
           </div>
        )} */}
        
    </div>
  )
}

export default BudgetComponentTable