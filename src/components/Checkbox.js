import React from 'react'
import { ImCheckboxChecked,ImCheckboxUnchecked } from 'react-icons/im';

const Checkbox = ({name,width,checked,disabled,onClick}) => {
  
  return (
    <div onClick={disabled?() => {} :(e) => onClick(e)} 
        style={{'--input-width':width+'px'}} 
        className={`flex flex-row w-[var(--input-width)] h-10 items-center shrink-0 space-x-2 ${disabled?"":"cursor-pointer"} overflow-hidden`}>
        {checked?<ImCheckboxChecked size={16} className={`w-4 h-4 ${disabled?"text-slate-400":"text-slate-600"} my-auto`}/>:
            <ImCheckboxUnchecked size={16} className={`w-4 h-4 ${disabled?"text-slate-400":"text-slate-600"} my-auto`}/>}
        <p className='h-5 text-sm text-gray-600 my-auto'>{name}</p>
    </div>
  )
}

export default Checkbox