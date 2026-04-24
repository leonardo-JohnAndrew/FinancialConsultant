import usePurchaseContext from '@/hooks/Context/purchaseContext';
import React, { useEffect, useState } from 'react';
const AutoSuggestInput = React.memo((props) => {
 const {item, index , onChange, name, data} = props; 
  const [value, setValue] = useState('');
  const {purchase} = usePurchaseContext(); 
  const [filtered, setFiltered] = useState([]);
  const [show, setShow] = useState(false);
  
  const suggestionsList = item;

  const handleChange = (e) => {
    const input = e.target.value;
    setValue(input);
    if (input.length > 0) {
        const matches = suggestionsList.filter(item =>
            item.toLowerCase().startsWith(input.toLowerCase())
        );
        setFiltered(matches);
        setShow(true);
         onChange(index, name, input); 
    } else {
        setShow(false);
        
    }
};

useEffect(() => { 
  if (name !== "ItemName") return;
     const array = purchase; 
    
}, [purchase]);
const handleSelect = (item) => {
    setValue(item);
    setShow(false);
    onChange(index, name, item); 
  };

  return (
    <div className="relative w-52">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => value && setShow(true)}
        className='border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent'
    
      />

      {show && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md max-h-40 overflow-y-auto">
          {filtered.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-100"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
})
export default AutoSuggestInput