import React from 'react'
import Sidebar from '../components/sidebar'

const Navbar = ({children}) => {
  return (
    <div className='flex'>
        <Sidebar />
       <main className="flex-1 bg-gray-100 p-6 ">
            {children}
          </main>
    </div>
  )
}

export default Navbar