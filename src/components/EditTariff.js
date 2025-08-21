import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import TariffCriteria from './TariffCriteria';
import {useData} from '../data'

const EditTariff = ({receivableId,criteriaId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [tariff,setTariff] = useState(null);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const {request} = useData();

    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(tariff) {
            setLoading(true);
            request('POST','tariff',null,{
                receivableId:tariff.receivableId,
                criteriaId:tariff.criteriaId,
                price:tariff.price,
                duration:tariff.duration,
                isDefault:tariff.default
            },true)
            .then((response) => {
                setLoading(false);
                if(response.status) {
                    if(response.status === 'SUCCESSFUL' && response.content) {
                        reload && reload();
                        setDialog(null);
                    } else {
                        setMessage({content:response.message,success:false});
                    }
                } else  {
                    setMessage({content:response,success:false});
                }
            })
            .catch((error) => {
                setMessage({content:error.message,success:false});
                setLoading(false);
            });
        }
    };

    const [register,handleChange,handleSubmit,errors] = useFormValidator(submit);

    const inputs = [
        {
            label:'Receivable',
            type:'text', 
            name:'receivable',
            disabled:true,
            value:tariff && tariff.receivable && tariff.receivable.name?tariff.receivable.name:'',   
            placeholder:'Enter name...'
        },
        {
            label:'Criteria',
            type:'text', 
            name:'criteria',
            disabled:true,
            value:tariff && tariff.criteria && tariff.criteria.name?tariff.criteria.name:'',   
            placeholder:'Enter name...'
        },
        {
            label:'Price',
            type:'number', 
            name:'price',
            value:tariff && tariff.price,   
            placeholder:'Enter price...',
            onChange:(e) => {handleChange(e,(e) => {
                let value = e.target.value;
                if(isNaN(value)) {
                    return;
                }
                setTariff({...tariff,price: value});
            })},
            register:register,
            errors:errors
        },
        {
            label:'Duration in months',
            type:'number', 
            name:'duration',
            value:tariff && tariff.duration,   
            placeholder:'Enter price...',
            onChange:(e) => {handleChange(e,(e) => {
                let value = e.target.value;
                if(isNaN(value)) {
                    return;
                }
                setTariff({...tariff,duration: value});
            })},
            register:register,
            errors:errors
        },
        {
            label:'Default',
            type:'checkbox',
            name:'default',
            value:tariff && tariff.default,   
            onChange:(e) => {
                setTariff({...tariff,default: !tariff.default});
            }
        }
    ]

    useEffect(() => {
        (async () => { 
            await request('GET','tariff',null,{receivableId:receivableId,criteriaId:criteriaId},true)
            .then((response) => {
                if(response.content) {
                    setTariff(response.content)
                } else {
                    setDialog(null);
                }
            })
            .catch((error) => {
                setDialog(null);
            })
        })()
    },[])

    return (
        <div>
            <FormDialog title='Add Tariff'>
                <FormValidator>
                    <div className='flex flex-col w-full p-8'>
                        <div className='flex flex-col w-full h-auto shrink-0 space-y-4'>
                            <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_tariff' setCalcWidth={setInputWidth}/>
                            <Message message={message}/>
                            <button style={{'--width':inputWidth+'px'}} 
                                onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                                Submit
                            </button>
                        </div>
                    </div>
                </FormValidator>
            </FormDialog>
        </div>
      )
}

export default EditTariff