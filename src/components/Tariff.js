import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import EditTariff from './EditTariff';
import { PiDotsThreeVertical,PiTrash, PiTagFill, PiTagLight, PiPencilSimple } from 'react-icons/pi';
import YesNoDialog from './YesNoDialog';
import {request} from '../App'

const Tariff = ({tariff,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [updateAuthority,setUpdateAuthority] = useState(false);
    const [highlighted,setHighlighted] = useState(false);
    const moreRef = useRef(null)

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const onEdit = (e) => {
        e.preventDefault();
        if(tariff && updateAuthority) {
            setDialog({
                show:true,
                Component:() => <EditTariff receivableId={tariff.receivableId} criteriaId={tariff.criteriaId} reload={reload}/>
            })
        }
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(tariff && updateAuthority) {
            setDialog({
                show:true,
                Component:() => 
                    <YesNoDialog 
                        title='Delete context role' 
                        message={`Are you sure you want to delete K${USDecimal.format(tariff.price)} ${tariff.criteria.name}?`} 
                        onYes={async (e) => {
                            await request('DELETE','tariff',null,{receivableId:tariff.receivableId, criteriaId:tariff.criteriaId},true)
                            .then(response => {
                                reload && reload();
                            })
                        }}
                    />
            })
        }
    }

    useEffect(() => {
        ( async () => {
            await request('GET','hasauthority',null,{
                contextName:'TARIFF',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status === 'YES') {
                    setUpdateAuthority(true);
                }  else {
                    setUpdateAuthority(false);
                }
            })
        }
        )();
    },[tariff]);

    return (
        <div className='flex flex-row w-full h-auto'>
            {tariff &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <div className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                    {tariff.default?
                        <PiTagFill size={32} className='text-[rgb(0,175,240)] shrink-0'/>:
                        <PiTagLight size={32} className='text-[rgb(0,175,240)] shrink-0'/>
                    }
                    <div className='flex flex-col w-full h-fit items-start'>
                        <p className={`w-full text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                        {`K ${USDecimal.format(tariff.price)}`}
                        </p>
                        {tariff.criteria && tariff.criteria.name &&
                            <p className='w-full text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular capitalize whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                {tariff.criteria.name}
                            </p>
                        }
                    </div>
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && updateAuthority && 
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                            <button 
                                                onClick={onEdit}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiPencilSimple size={20} className='flex shrink-0'/>
                                                <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Edit
                                                </p>
                                            </button>
                                            <button 
                                                onClick={onDelete}
                                                className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                                <PiTrash size={20} className='flex shrink-0'/>
                                                <p className='w-full text-sm text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                                    Delete
                                                </p>
                                            </button>
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

export default Tariff