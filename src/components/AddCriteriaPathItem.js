import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../App';

const AddCriteriaPathItem = ({previouId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [previous,setPrevious] = useState({});
    const [criteriaPathItem,setCriteriaPathItem] = useState({});
    const [criteriaPathItems,setCriteriaPathItems] = useState([]);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const [request] = useData()

    const submit = async (e) => {
        setMessage({content:'',success:false});
        setLoading(true);
        if(criteriaPathItem) {
            criteriaPathItem.previous = previous;
            request('POST','criteriapath',criteriaPathItem,null,true)
            .then((response) => {
                setLoading(false);
                if(response.status) {
                    if(response.status === 'SUCCESSFUL' && response.content) {
                        setDialog(null);
                        reload && reload();
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
            label:'name',
            type:'text', 
            name:'name',
            value:previous && previous.name?previous.name:'',
            disabled:true
        },
        {
            label:'Criteria paths items',
            type:'select',
            options:() => {
                let options = [];
                criteriaPathItems.map((option,i) => options.push(<option key={i} value={option.name}>{option.name}</option>));
                return options;
            },
            name:'criteriaPathItems', 
            value:criteriaPathItem && criteriaPathItem.name?criteriaPathItem.name:'',
            placeholder:'Select criteria path item...',
            onChange:(e) => handleChange(e,onChange)
        }
    ]

    const onChange = (e) => {
        const value = criteriaPathItems.find((item) => {return item.name === e.target.value});
        if(value) {
          setCriteriaPathItem(value);
        } 
    }

    useEffect(() => {
        (async () => {
            if(previouId) {
                let prev = null;
                await request('GET',`criteriapath/${previouId}`,null,null,true)
                .then((response) => {
                    if(response.content) {
                        prev = response.content;
                        setPrevious(prev);
                    }  else {
                        setPrevious(null);
                    }
                })
                .catch((error) => {
                    setPrevious(null);
                })
                if(prev) {
                    request('GET','criteriapaths/create',null,{className:prev.className},true)
                    .then((response) => {
                        if(response.content && response.content.length > 0) {
                            setCriteriaPathItems(response.content);
                            setCriteriaPathItem(response.content[0])
                        }  else {
                            setCriteriaPathItems([]);
                        }
                    })
                    .catch((error) => {
                        setCriteriaPathItems([]);
                    })
                }
            }
        })()
    },[]);

    return (
        <FormDialog title='Add Criteria Path'>
            <FormValidator>
                <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                    <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_course' setCalcWidth={setInputWidth}/>
                    <Message message={message}/>
                    <button style={{'--width':inputWidth+'px'}} 
                        onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                        Submit
                    </button>
                </div>
            </FormValidator>
        </FormDialog>
      )
}

export default AddCriteriaPathItem