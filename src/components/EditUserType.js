import React, {useEffect,useState, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../data';

const EditUserType = ({id,reload}) => {
    const {setLoading,setDialog,setReloadUser} = useContext(GlobalContext);
    const [userType,setUserType] = useState(null);
    const [criteriaPaths,setCriteriaPaths] = useState([]);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const {request} = useData();

    const submit = async (e) => {
        setMessage({content:'',success:false});
        setLoading(true);
        request('PUT','usertype',userType,null,true)
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
    };

    const [register,handleChange,handleSubmit,errors] = useFormValidator(submit);

    const inputs = [
        {
            label:'name',
            type:'text', 
            name:'name',
            value:userType && userType.name?userType.name:'',   
            placeholder:'Enter name...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'Tariff Applicable',
            type:'checkbox',
            name:'tariffApplicable',
            value:userType?userType.tariffApplicable:false,   
            onChange:(e) => {
                setUserType({...userType,tariffApplicable: !userType.tariffApplicable});
            }
        },
        {
            label:'Criteria paths',
            type:'select',
            options:() => {
                let options = [];
                userType && userType.tariffApplicable && criteriaPaths.map((option,i) => options.push(<option key={i} value={option.id}>{option.id}</option>));
                return options;
            },
            name:'criteriaPathItem', 
            value:userType && userType.criteriaPathItem?userType.criteriaPathItem.id:'',
            disabled:userType && !userType.tariffApplicable,
            onChange:(e) => handleChange(e,onCriteriaPath)
        }
    ]

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
            setUserType({...userType, [e.target.name]: null});
        } else {
            setUserType({...userType, [e.target.name]: value});
        }
    }

    const onCriteriaPath = (e) => {
        if(e.target.value === '') {
            setUserType({...userType, [e.target.name]: null});
        } else {
            let value = criteriaPaths.find((path) => {return path.id === e.target.value});
            setUserType({...userType, criteriaPathItem: value});
        }
    }

    useEffect(() => {
        ( async () => {
            setLoading(true);
            request('GET',`usertype/${id}`,null,null,true)
            .then((response) => {
                setLoading(false);
                if(response.content) {
                    setUserType(response.content);
                }  else {
                    setUserType(null);
                    setDialog(null);
                }
            })
            .catch((error) => {
                console.log(error.message);
                setLoading(false);
                setUserType(null);
                setDialog(null);
                setReloadUser({reload:true});
            })
            request('GET','criteriapath/leaves',null,null,true)
            .then((response) => {
                if(response.status) {
                    if(response.status === 'SUCCESSFUL' && response.content && response.content.length > 0) {
                        setCriteriaPaths(response.content);
                    } else {
                        setCriteriaPaths([]);
                    }
                } else  {
                    setCriteriaPaths([]);
                }
            })
        }
        )();
    },[]);

    return (
        <div>
            <FormDialog title='Edit User Type'>
                {userType && <FormValidator>
                    <div className='flex flex-col w-full h-auto p-8'>
                        <div className='flex flex-col w-full h-auto shrink-0'>
                            <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_role' setCalcWidth={setInputWidth}/>
                            <Message message={message}/>
                            <button style={{'--width':inputWidth+'px'}} 
                                onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                                Submit
                            </button>
                        </div>
                    </div>
                </FormValidator>}
            </FormDialog>
        </div>
      )
}

export default EditUserType