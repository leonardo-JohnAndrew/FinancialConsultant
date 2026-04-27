import { useBanner } from '@/hooks/Context/banner';

import React, { useEffect, useState } from 'react';
const AutoSuggestInput = React.memo((props) => {
  const { item, index, onChange, name, value } = props;

  const [filtered, setFiltered] = useState([]);
  const [show, setShow] = useState(false);

  const handleChange = (e) => {
    const input = e.target.value;

    if (input.length > 0) {
      const matches = item.filter(i =>
        i.toLowerCase().startsWith(input.toLowerCase())
      );
      setFiltered(matches);
      setShow(true);
    } else {
      setShow(false);
    }

    onChange(index, name, input); //parent controls value
  };

  const handleSelect = (selected) => {
    setShow(false);
    onChange(index, name, selected);
  };

  return (
    <div className="relative w-52">
      <input
        type="text"
        value={value} //controlled
        onChange={handleChange}
        onFocus={() => value && setShow(true)}
        className="border border-gray-300 bg-gray-200 text-black"
      />

      {show && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border mt-1 max-h-40 overflow-y-auto">
          {filtered.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSelect(item)}
              className="px-3 py-2 cursor-pointer hover:bg-blue-100"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
export default AutoSuggestInput