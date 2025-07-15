import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import TariffCriteria from './TariffCriteria';
import {useData} from '../App'

const AddTariff = ({receivableId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [receivable,setReceivable] = useState(null);
    const [criteria,setCriteria] = useState(null);
    const [criterias,setCriterias] = useState([]);
    const [price,setPrice] = useState(0);
    const [duration,setDuration] = useState(0);
    const [isDefault,setDefault] = useState(false);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const [request] = useData();
    const submit = async (e) => {
        setMessage({content:'',success:false});
        if(receivable && criteria) {
            setLoading(true);
            request('POST','tariff',null,{
                receivableId:receivable.id,
                criteriaId:criteria.id,
                price:price,
                duration:duration,
                isDefault:isDefault
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
            value:receivable && receivable.name?receivable.name:'',   
            placeholder:'Enter name...'
        },
        {
            label:'Criteria',
            type:'select',
            options:() => {
                let options = [];
                criterias && criterias.map((option,i) => options.push(<option key={i} value={option.id}>{option.name}</option>));
                return options;
            },
            name:'criteria', 
            value:criteria && criteria.id?criteria.id:'',
            onChange:(e) => handleChange(e,(e) => {
                if(e.target.value === '') {
                    setCriteria(null);
                } else {
                    let value = criterias.find((crit) => {return crit.id == e.target.value});
                    setCriteria(value);
                }
            })
        },
        {
            label:'Price',
            type:'number', 
            name:'price',
            value:price,   
            placeholder:'Enter price...',
            onChange:(e) => {handleChange(e,(e) => {
                let value = e.target.value;
                if(isNaN(value)) {
                    return;
                }
                setPrice(value);
            })},
            register:register,
            errors:errors
        },
        {
            label:'Duration in months',
            type:'number', 
            name:'duration',
            value:duration,   
            placeholder:'Enter price...',
            onChange:(e) => {handleChange(e,(e) => {
                let value = e.target.value;
                if(isNaN(value)) {
                    return;
                }
                setDuration(value);
            })},
            register:register,
            errors:errors
        },
        {
            label:'Default',
            type:'checkbox',
            name:'default',
            value:isDefault,   
            onChange:(e) => {
                setDefault(!isDefault);
            }
        }
    ]

    useEffect(() => {
        (async () => { 
            let receiv = null;
            await request('GET',`receivable/${receivableId}`,null,null,true)
            .then((response) => {
                if(response.content) {
                    receiv = response.content
                } 
            })
            if(receiv && receiv.criteriaPathItem && receiv.criteriaPathItem.type) {
                let tariffs = []
                await request('GET',`tariffs/${receiv.id}`,null,null,true)
                .then((response) => {
                    if(response.content && response.content.length > 0) {
                        tariffs = response.content;
                    } 
                })
                await request('GET',`auditables/${receiv.criteriaPathItem.type}`,null,null,true)
                .then((response) => {
                    if(response.content && response.content.length > 0) {
                        let avai = [];
                        if(tariffs.length > 0) {
                            for(let crit of response.content) {
                                let found = tariffs.find((tariff) => {return tariff.criteriaId == crit.id});
                                if(!found) {
                                    avai.push(crit);
                                }
                            }
                            setCriterias(avai);
                            setCriteria(avai[0]);
                        } else {
                            setCriterias(response.content);
                            setCriteria(response.content[0]);
                        }
                    } else {
                        setCriterias([]);
                    }
                })
                .catch((error) => {
                    setCriterias([]);
                })
            }
            setReceivable(receiv);
        })()
    },[])

    return (
        <div>
            <FormDialog title='Add Tariff'>
                <FormValidator>
                    <div className='flex flex-col w-full sm:w-[640px] h-[400px] p-8'>
                        <Scrollable vertical={true}>
                            <div className='flex flex-col w-full h-auto shrink-0 space-y-4'>
                                <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_tariff' setCalcWidth={setInputWidth}/>
                                <Message message={message}/>
                                <button style={{'--width':inputWidth+'px'}} 
                                    onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                                    Submit
                                </button>
                            </div>
                        </Scrollable>
                    </div>
                </FormValidator>
            </FormDialog>
        </div>
      )
}

export default AddTariff