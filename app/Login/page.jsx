"use client"
import logoImg from "../../public/OIP.webp"

const Login = () => {
  return (
  <>
    <div className='flex items-center justify-center h-screen relative'>
     
       {/* main container */} 
      <div className='h-180 w-350 bg-pink drop-shadow-lg relative'>
           <div className='absolute top-0 w-30 h-20 left-0 ml-5'>
        <img src = "/nstren.png" alt="" className="w-full h-full" />
            </div>
         {/* 2 separate container */}
         <div className='flex flex-row gap-10 px-20 py-20 w-full h-full'>
            <div className='bg-pink w-full h-full flex flex-col py-5'>
              {/* headers text*/}
              <div className='flex-1 p-3 '>
                 <h2 className='text-5xl font-medium block'>Welcome to Faculty</h2>
                 <h2 className='text-5xl font-semibold text-lightRed mt-4'>Consultant !</h2>
                  <div className='items-center justify-center flex mt-5'>
                      <h4 className='font-semibold text-black opacity-50'>Please Enter your UserID and password</h4>
                  </div>
              </div>
              {/* Input fields */}
              <div className='flex flex-col flex-1 p-4  pr-10 gap-2' > 
                   <div>
                     <h1 className='font-semibold text-xl mb-2'>UserID: </h1>
                     <input type="text" className="border-lightRed border rounded-md w-full h-10"  />
                   </div>
                   <div>
                     <h1 className='font-semibold text-xl mb-2'>Password: </h1>
                     <input type="password" className="border-lightRed border rounded-md w-full h-10"  />
                   </div>
                    <div className="relative m-1">
                        <h4 className="absolute right-0 text-lightRed">Forgot Password</h4>
                    </div>
              </div>
              {/* buttons  */}
              <div className='flex-1 pr-10 relative'>          
                  <button className="w-full h-10 absolute bottom-0 outline outline-lightRed bg-lightRed hover:bg-white hover:outline-darkRed">Submit </button>      
              </div>
            </div >
            <div className='bg-darkRed w-full h-full rounded-xl relative '>
            <div className="text-white px-10 py-15">
              <h1 className="text-4xl font-bold">Hello, Users!</h1>
              <h1 className="text-sm font-light mt-4">Create a Digital Purchase Requisition Form with automatic item price computation. Easy to view all your request and support e-signature 
 
Helps admin in reviewing user request and perform fast approval.    </h1>
            </div>
           
           
               <div className='bg-pink h-40 w-80 absolute left-10 top-55'>
                  <img src="/detailed_form.png" alt="submit form"  />
               </div>
               <div className='bg-pink h-50 w-80 absolute right-10 bottom-10'>
                  <img src="/form.png" alt="submit form" className="h-" />
               </div>
            </div>
         </div>
      </div>
    </div> 
  </>
  )
}

export default Login