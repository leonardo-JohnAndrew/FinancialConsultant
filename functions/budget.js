
export const computeTotals = (data)=> {
 const totals = { 
    approved_amount : 0 , 
    prev_amount: 0 , 
    month_amount: 0, 
    cumulative_amount : 0 , 
    remaining_amount : 0 
 } ;

 const traverse = (items) => {
    items.forEach((item)=> {
        const v = item.values || {} 
        totals.approved_amount += Number(v.approved_amount || 0); 
        totals.prev_amount += Number(v.prev_amount || 0); 
        totals.month_amount += Number(v.month_amount || 0 );
        totals.cumulative_amount += Number(v.cumulative_amount || 0); 
        totals.remaining_amount += Number(v.remaining_amount  || 0 ) 
        
        if(item.children?.length){
            traverse(item.children); 
        } 
     }); 
    }
    traverse(data) ; 
    return totals 
}