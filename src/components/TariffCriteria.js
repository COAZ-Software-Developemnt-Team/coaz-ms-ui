import React,{useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { LiaAngleDownSolid } from "react-icons/lia";
import { RiDeleteBin6Line } from "react-icons/ri"
import {useData} from '../data'

const TariffCriteria = ({receivableId,criteria,setCriteria}) => {
    const [newKey,setNewkey] = useState(null);
    const [newValue,setNewValue] = useState(null);
    const [keys,setKeys] = useState([]);
    const [values,setValues] = useState([]);
    const {request} = useData();

    const onNewKey = async (option) => {
        setNewkey(option);
        let vals = [];
        if(option) {
            await request('GET',`auditables/${option.name}`,null,null,true)
            .then((response) => {
                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                    for(let auditable of response.content) {
                        vals.push(auditable)
                    }
                    
                }
            })
        } 
        setValues(vals);
        setNewValue(null);
    }

    const onNewValue = (option) => {
        setNewValue(option);
    }

    const onAdd = () => {
        if(newKey && newKey.name && newKey.name !== '' && newValue && newValue.id && newValue.id !== '') {
            criteria.set(newKey.name,newValue);
            let newCriteria = new Map(JSON.parse(JSON.stringify(Array.from(criteria))));
            setCriteria(newCriteria);
            setNewkey(null);
            setNewValue(null);
        }
    }

    const onDelete = (key) => {
        criteria.delete(key);
        let newCriteria = new Map(JSON.parse(JSON.stringify(Array.from(criteria))));
        setCriteria(newCriteria);
    }

    useEffect(() => {
        (async () => {
            let kys = [];
            await request('GET','criteriapath/leaves',null,{id:receivableId},true)
            .then((response) => {
                if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                    for(let context of response.content) {
                        if(!criteria.has(context.name)) {
                            kys.push({id:context.name,name:context.name});
                        } 
                    }
                }
            })
            setKeys(kys);
        })()
    },[criteria])

  return (
    <div className='flex flex-col w-full h-auto space-y-2'>
        <p className='text-gray-600 text-sm capitalize'>Criteria</p>
        <div className='flex flex-col w-full h-auto px-2 bg-transparent border rounded-lg'>
            <div className='flex flex-row w-full h-10 items-center font-semibold text-gray-600 text-sm capitalize'>
                <p className='w-1/2'>Key</p>
                <p className='w-1/2'>Value</p>
            </div>
            {criteria && (() => {
                let rows = [];
                for(let [key,value] of criteria) {
                    rows.push(
                        <KeyValuePair key={key} keyValuePair={{key:key,value:value}} onDelete={onDelete}/>
                    )
                }
                return rows
            })()}
            <div onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onAdd();
                        }
                    }
                } 
                className='flex flex-row w-full h-10 items-center text-gray-600 text-sm capitalize'>
                <CriteriaDropdown 
                    val={newKey}
                    onChange={onNewKey} 
                    placeholder='New key...' 
                    options={keys} 
                    className='flex flex-row w-1/2 h-full pr-2 items-center'/>
                <CriteriaDropdown 
                    val={newValue}
                    onChange={onNewValue} 
                    placeholder='New value...' 
                    options={values} 
                    className='flex flex-row w-1/2 h-full pr-2 items-center'/>
            </div>
        </div>
    </div>
  )
}

export default TariffCriteria

const KeyValuePair = ({keyValuePair,onDelete}) => {
    const [highlighted,setHighlighted] = useState(false)
    
    return (
        <div onMouseEnter={(e) => setHighlighted(true)}  
            onMouseLeave={(e) => setHighlighted(false)}
            className='relative flex flex-row w-full h-8 items-center text-gray-600 text-sm capitalize'>
            <p className='w-1/2'>{keyValuePair.key}</p>
            <p className='w-1/2'>{keyValuePair.value.name}</p>
            <button onClick={(e) => {
                    e.preventDefault();
                    onDelete(keyValuePair.key);
                }}
                className={`absolute ${highlighted?'flex':'hidden'} items-center justify-center right-0 w-8 h-8 text-[rgb(68,71,70)] hover:bg-[rgb(234,235,239)] rounded-full shrink-0`}>
                <RiDeleteBin6Line size={16} />
            </button>
        </div>
    )
}

const CriteriaDropdown = ({val,onChange,placeholder,options,className}) => {
    const {setPopupData} = useContext(GlobalContext);
    const [value,setValue] = useState(null);
    const [dropdownWidth,setDropdownWidth] = useState(0);
    const dropdownRef = useRef(null);

    const onSelect = (option) => {
        onChange(option);
    }
    useEffect(() => {
        setValue(val?val.name:'');
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                setDropdownWidth(entry.target.getBoundingClientRect().width);
            }
        });

        if(dropdownRef.current) {
            observer.observe(dropdownRef.current)
        }

        return () => {
            observer.disconnect();
        }
    },[val])

    return (
        <div ref={dropdownRef}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if(options && options.length > 0) {
                    setPopupData({
                        show:true,
                        parentElement:dropdownRef.current,
                        Component:
                            <div style={{width:dropdownWidth+'px'}}
                                className='flex flex-col h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                {options.map((option,i) => 
                                    <button key={i}
                                        onClick={(e) => onSelect(option)}
                                        className='flex flex-row px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                        <p className='text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>{option.name}</p>
                                    </button>
                                )}
                            </div>
                    })
                }
            }} 
            className={className}> 
            <input
                name='newKey'
                value={value?value:''}
                placeholder={placeholder}
                onChange={(e) => {}}
                onClick={(e) => e.stopPropagation()}
                className='w-full h-full focus:outline-none font-thin bg-transparent'/>
            <LiaAngleDownSolid size={12} className='shrink-0'/>
        </div>
    )
}

