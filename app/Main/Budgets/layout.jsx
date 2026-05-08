import Header from '@/app/components/header'
import React from 'react'

const layout = ({children}) => {
  return (
    <div>
        <div className='m-4 mt-3 bg-[white] p-10 print:p-0' id= "print-area">
            <Header  title = {"Reimbursable Expenses"}/>
            {children}
        </div>
    </div>
  )
}

export default layout