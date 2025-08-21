import React, {useEffect,useState,useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { IoCloseOutline } from "react-icons/io5";
import Scrollable from './Scrollable';
import { useRef } from 'react';

const FormDialog = ({title,children}) => {
    const {setDialog} = useContext(GlobalContext);
    const [height,setHeight] = useState(0);
    const [childrebHeight,setChildrenHeight] = useState(0);
    const childrenRef = useRef(null)

    useEffect(() => {
      if(childrenRef.current) {
        let maxHeight = window.innerHeight * (90/100);
        setChildrenHeight(childrenRef.current.offsetHeight);
        if(maxHeight < childrenRef.current.offsetHeight) {
          setHeight(maxHeight);
        } else {
          setHeight(0);
        }
      }
    },[childrebHeight])
  return (
    <div style={{height:!height || height == 0?'auto':height+'px'}}
      className={`flex flex-col w-[90vw] sm:w-[640px] shadow-xl text-sm font-jostBook tracking-wider bg-[rgb(252,252,252)] rounded-md overflow-hidden`}>
        <div className='flex flex-row w-full items-center justify-between h-10 px-4 shrink-0 text-[rgb(150,150,150)] bg-[rgb(247,247,247)]'>
            <p className='capitalize'>{title}</p>
            <button onClick={e => setDialog(null)} 
                    className='flex w-6 h-6 shrink-0 hover:bg-[rgb(235,235,235)]'>
                <IoCloseOutline size={24}/>
            </button>
        </div>
        <Scrollable>
          <div ref={childrenRef} className='w-full h-auto'>
            {children}
          </div>
        </Scrollable>
    </div>
  )
}

export default FormDialog