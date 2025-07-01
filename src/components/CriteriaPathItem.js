import React, {useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { PiTrash,PiDotsThreeVertical, PiPathLight } from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import {request} from '../App'

const CriteriaPathItem = ({criteriaPathItem,deleteAuthority,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const moreRef = useRef(null)

    const navigate = useNavigate();

    const onDelete = (e) => {
        e.preventDefault();
        if(criteriaPathItem && criteriaPathItem.previous) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Delete Path' 
                        message={`Are you sure you want to delete ${criteriaPathItem.name}?`} 
                        onYes={async (e) => {
                            await request('DELETE','criteriapath',null,{id:criteriaPathItem.id},true)
                            .then(response => {
                                reload && reload();
                            })
                        }}
                    />
            })
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {criteriaPathItem &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                    onMouseLeave={(e) => setHighlighted(false)} 
                    className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div onClick={(e) => navigate(`/paths/${criteriaPathItem.id}`)}
                    className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                    <PiPathLight size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit'>
                        <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                            {`${criteriaPathItem.name}`}
                        </p>
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && criteriaPathItem.previous && 
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            {deleteAuthority && 
                                                <button 
                                                    onClick={onDelete}
                                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                    <PiTrash size={20} className='flex shrink-0'/>
                                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                        Delete
                                                    </p>
                                                </button>
                                            }
                                        </div>
                                })
                            }}
                            className='flex w-10 h-10 items-center justify-center shrink-0 hover:bg-[rgba(0,0,0,.06)] rounded-full'>
                            <PiDotsThreeVertical size={20} />
                        </button>
                    }
                </div>
            </div>}
        </div>
    )
}

export default CriteriaPathItem