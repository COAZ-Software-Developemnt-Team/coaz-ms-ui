import React from 'react'
import { MdOutlineRadioButtonChecked, MdOutlineRadioButtonUnchecked } from 'react-icons/md'
import { PiRadioButtonFill } from 'react-icons/pi'

const RadioButton = ({radioButton,selected,onSelect}) => {
  return (
    <>
    {radioButton && radioButton.id && radioButton.name &&
    <div id={radioButton.id} className='flex flex-row w-fit h-fit space-x-4 items-center text-[rgb(68,71,70)]'>
        <button onClick={e => onSelect(radioButton)}>
        {selected && selected.id && radioButton.id === selected.id?
            <MdOutlineRadioButtonChecked size={20} className='text-[rgb(0,175,240)]'/>:
            <MdOutlineRadioButtonUnchecked size={20}/>
        }
        </button>
        {radioButton.Icon && <radioButton.Icon size={20}/>}
        <p className='text-sm font-helveticaNeueRegular'>{radioButton.name}</p>
    </div>
    }
    </>
  )
}

export default RadioButton