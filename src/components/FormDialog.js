import React, {useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { IoCloseOutline } from "react-icons/io5";

const FormDialog = ({title,children}) => {
    const {setDialog} = useContext(GlobalContext);
  return (
    <div className={`flex flex-col w-full sm:w-auto h-auto shadow-xl text-sm font-jostBook tracking-wider bg-[rgb(252,252,252)] rounded-md overflow-hidden`}>
        <div className='flex flex-row w-full items-center justify-between h-10 px-4 shrink-0 text-[rgb(150,150,150)] bg-[rgb(247,247,247)]'>
            <p className='capitalize'>{title}</p>
            <button onClick={e => setDialog(null)} 
                    className='flex w-6 h-6 shrink-0 hover:bg-[rgb(235,235,235)]'>
                <IoCloseOutline size={24}/>
            </button>
        </div>
        {children}
    </div>
  )
}

export default FormDialog