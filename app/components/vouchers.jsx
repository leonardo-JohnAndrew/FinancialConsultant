import React from 'react'

const VourcherComponent = () => {
  return (
     <div  className='mt-10'>
         <div className='flex flex-row'>
              <div className='flex flex-2 flex-col'>
                    <h4 className='text-xl font-semibold'>PAYMENT VOUCHER</h4>
                     <h4 className='text-lg font-bold'>Date</h4>
                     <h4>26 YR 0 4 MO 2 0 Day </h4>
               </div>
               <div className='self-end-safe border-2 h-auto border-black'>
                    <div className='flex flex-col '>
                       <h4 className='border-b-2 p-3 px-5 border-black font-bold'>Cash</h4>
                       <h4 className='p-3'>00111</h4>
                    </div>
               </div>
               <div className='border-2 h-auto border-black border-l-0'>
                    <div className='flex flex-col '>
                       <h4 className='border-b-2 p-3 px-5 border-black font-bold'>PM</h4>
                       <h4></h4>
                    </div>
               </div>

         </div>
          {/* table start  */}
           <div className='flex justify-center items-center'>
                <h4 className='font-bold'>Amount-Php 24,999.50</h4>
           </div>
          {/* flex rows FIrst Part */}
            <div className='flex flex-row'>
                  <div className='border-2 p-2 border-black'> 
                      <h4 className='font-semibold'> PAYMENT ITEM</h4>
                  </div>
                  <div className='border-2 p-2 px-5.5 border-l-0 border-black'>
                      <h4>515</h4>
                      <h4>515B</h4>
                  </div>
                  <div className='border-2 p-2 border-l-0' >
                      <h4 className='font-semibold'>PAYEE (NAME)</h4>
                  </div>
                  <div className= 'flex-2 flex justify-center items-center border-2 border-l-0 border-r-0'> 
                     {/* Payee Name */}
                      <h4 className='italic'>Triple C Medical Trading Corporation</h4>
                  </div>
                  <div className='w-87.5 border-2 flex justify-center items-end'>
                     <h4>SIGNATURE</h4>
                  </div> 
            </div>
                  {/*2ND Rows  */} 
              <div className='flex flex-row '>
                    <div className='w-87.5 flex flex-col border-2 border-t-0'>
                          <div className='flex justify-center items-center border-b-2'>
                               <h4>Job#</h4> 
                          </div>
                          <div className='grid grid-cols-10  '> 
                              <h4 className=' flex justify-center items-center border-r'>4</h4>
                              <h4 className=' flex justify-center items-center border-r'>5</h4>
                              <h4 className=' flex justify-center items-center border-r'>6</h4>
                              <h4 className=' flex justify-center items-center border-r'>7</h4>
                              <h4 className=' flex justify-center items-center border-r'>8</h4>
                              <h4 className=' flex justify-center items-center border-r'>9</h4>
                              <h4 className=' flex justify-center items-center border-r'>#</h4>
                              <h4 className=' flex justify-center items-center border-r'>#</h4>
                              <h4 className=' flex justify-center items-center border-r'>#</h4>
                              <h4 className=' flex justify-center items-center '>#</h4>                          
                          </div>
                    </div>
                    <div className='flex-2 border-b-2 flex items-center justify-center'>
                         <h4 className= 'font-bold text-2xl italic'  >DESCRIPTION</h4>
                    </div>
                    <div className='w-87.5 flex-col border-2 border-t-0'>
                        <div className='flex justify-center items-center border-b-2'>
                             <h4 className='font-bold'>AMOUNT</h4>
                        </div>
                         <div className='grid grid-cols-9'>
                             <h4 className=' flex justify-center items-center border-r'>16</h4>
                              <h4 className=' flex justify-center items-center border-r'>17</h4>
                              <h4 className=' flex justify-center items-center border-r'>18</h4>
                              <h4 className=' flex justify-center items-center border-r'>19</h4>
                              <h4 className=' flex justify-center items-center border-r'>20</h4>
                              <h4 className=' flex justify-center items-center border-r'>21</h4>
                              <h4 className=' flex justify-center items-center border-r'>22</h4>
                              <h4 className=' flex justify-center items-center border-r'>23</h4>
                              <h4 className=' flex justify-center items-center '>24</h4>
                             
                         </div>
                     </div>
                   </div>
                    {/* 3RD ROWS */}
                <div className='flex flex-row'>
                    <div className='flex justify-center items-center border-2 border-t-0 p-10 w-87.5'>
                        <h4>9665R7268</h4>
                    </div>
                    <div className='flex-2 flex-col'>
                         <div className='flex-1 border-b-2  p-3.5 flex justify-center items-center'>
                             {/* <h4 className='italic'>Purchase of Various medicines for Office Consumption with SI#125269</h4> */}
                              <input type="text" className='w-full text-center italic' value={"Purchase of Various medicines for Office Consumption with SI#125269"} />
                         </div>
                         <div className='flex-1 border-b-2  p-3.5 flex justify-center items-center'>
                          {/* <h4 className='italic'>Purchase of Various medicines for Office Consumption with SI#125270</h4> */}
                              <input type="text" className='w-full text-center italic' value={"Purchase of Various medicines for Office Consumption with SI#125270"} />
                         </div>
                    </div>
                    <div className='w-87.5 flex-col'>
                        <div className='flex flex-row border-2 border-t-0 justify-start'> 
                             <div className='p-3 pr-7 
                              border-r-2'>
                                <h4 className='text-lg'>PHP</h4>
                             </div>
                             <div className='flex-2 p-2 flex justify-end items-center'>
                                {/* <h4 className='text-lg'>13.195.09</h4> */}
                               <input type="number" className='text-lg text-end' value={13195.09} />
                             </div>
                        </div>
                        <div className='flex flex-row border-2 border-t-0 justify-start'> 
                             <div className='p-3 pr-7 
                              border-r-2'>
                                <h4 className='text-lg'>PHP</h4>
                             </div>
                             <div className='flex-2 p-2 flex justify-end items-center'>
                                {/* <h4 className='text-lg'>9,125.89</h4> */}
                               <input type="number" className='text-lg text-end' value={9125.89} />
                             </div>
                        </div>
                       
                    </div>
                 </div>
                 {/* 4TH ROWS */}
                  <div className='flex flex-row '>
                      <div className='w-87.5
                       grid grid-cols-10'>
                         <div className="border-r-2 border-b-2 p-4 py-5 border-l-2 "></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                      </div>
                      <div className='flex-2 border-b-2'>

                      </div>
                       <div className='w-87.5 border-2 border-t-0'>
                       
                    </div>
                  </div>
                  {/* 5th rows */}
                   <div className='flex flex-row '>
                      <div className='w-87.5
                       grid grid-cols-10'>
                         <div className="border-r-2 border-b-2 p-4 py-5 border-l-2 "></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                      </div>
                      <div className='flex-2 border-b-2'>

                      </div>
                       <div className='w-87.5 border-2 border-t-0'>
                       
                    </div>
                  </div>
                  {/* 6th rows */}
                   <div className='flex flex-row '>
                      <div className='w-87.5
                       grid grid-cols-10'>
                         <div className="border-r-2 border-b-2 p-4 py-5 border-l-2 "></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                         <div className="border-r-2 border-b-2 p-4 py-5"></div>
                      </div>
                      <div className='flex-2 border-b-2'>

                      </div>
                       <div className='w-87.5 border-2 border-t-0'>
                       
                    </div>
                  </div>
                  {/* 7th rows */}
                  <div className='flex flex-row'>
                       <div className='w-87.5 h-16   flex flex-col '>
                           <div className = 'border-2 border-t-0 flex justify-center items-center'>
                            <h4 className='font-semibold p-1'>ISSUING DEPT.</h4>  
                           </div>
                           <div className='border-2 border-t-0 flex justify-center items-center'>
                            <h4 className='font-semibold p-0.5'>JOB DEPT.</h4>  
                           </div>
                       </div>
                       <div className='flex-2 flex flex-row  h-15.5 border-b-2'>
                            <div className='flex-1 border-r-2'></div>
                            <div className='flex-3 flex justify-center items-center'>
                                <h4 className='font-semibold'>TOTAL</h4>
                            </div>
                       </div>
                       <div className='w-87.5'>
                         <div className='flex  h-15.5 flex-row border-2 border-t-0 justify-start'> 
                             <div className='pr-7 
                              border-r-2'>
                                <h4 className='text-lg pl-3 pt-3'>PHP</h4>
                             </div>
                             <div className='flex-2 p-3 flex justify-end items-center'>
                                 <input type="number" className='text-lg text-end' value={22320.98} />
                             </div>
                        </div>
                       </div>
                  </div>
    </div> 

  )
}

export default VourcherComponent