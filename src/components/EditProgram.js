import React, {useEffect,useState, useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FormValidator, {useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import TextArea from './TextArea';
import Message from './Message';
import Scrollable from './Scrollable';
import FormDialog from './FormDialog';
import { useData } from '../App';

const EditProgram = ({id,reload}) => {
    const {setLoading,setDialog,setReloadUser} = useContext(GlobalContext);
    const [program,setProgram] = useState(null);
    const [criteriaPaths,setCriteriaPaths] = useState([]);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const [request] = useData();

    const submit = async (e) => {
        setMessage({content:'',success:false});
        setLoading(true);
        request('PUT','program',program,null,true)
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
            value:program && program.name?program.name:'',   
            placeholder:'Enter name...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'Tariff Applicable',
            type:'checkbox',
            name:'tariffApplicable',
            value:program?program.tariffApplicable:false,   
            onChange:(e) => {
                setProgram({...program,tariffApplicable: !program.tariffApplicable});
            }
        },
        {
            label:'Criteria paths',
            type:'select',
            options:() => {
                let options = [];
                program && program.tariffApplicable && criteriaPaths.map((option,i) => options.push(<option key={i} value={option.id}>{option.id}</option>));
                return options;
            },
            name:'criteriaPathItem', 
            value:program && program.criteriaPathItem?program.criteriaPathItem.id:'',
            disabled:program && !program.tariffApplicable,
            onChange:(e) => handleChange(e,onCriteriaPath)
        }
    ]

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
          setProgram({...program, [e.target.name]: null});
        } else {
          setProgram({...program, [e.target.name]: value});
        }
    }

    const onCriteriaPath = (e) => {
        if(e.target.value === '') {
            setProgram({...program, [e.target.name]: null});
        } else {
            let value = criteriaPaths.find((path) => {return path.id === e.target.value});
            setProgram({...program, criteriaPathItem: value});
        }
    }

    useEffect(() => {
        ( async () => {
            setLoading(true);
            await request('GET',`program/${id}`,null,null,true)
            .then((response) => {
                setLoading(false);
                if(response.content) {
                    response.content.startDate = response.content.startDate?new Date(response.content.startDate):new Date();
                    setProgram(response.content);
                }  else {
                    setProgram(null);
                    setDialog(null);
                }
            })
            .catch((error) => {
                console.log(error.message);
                setLoading(false);
                setProgram(null);
                setDialog(null);
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
        <FormDialog title='Edit Course Category'>
            {program && <FormValidator>
                <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                    <Scrollable vertical={true}>
                        <div className='flex flex-col w-full h-auto shrink-0'>
                            <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_role' setCalcWidth={setInputWidth}/>
                            <TextArea
                                label='Description'
                                id='description'
                                name='description'
                                value={program.description?program.description:''}
                                placeholder='Enter description'
                                onChange={(e) => handleChange(e,onChange)}
                                register={register}
                                errors={errors}
                            /> 
                            <Message message={message}/>
                            <button style={{'--width':inputWidth+'px'}} 
                                onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                                Submit
                            </button>
                        </div>
                    </Scrollable>
                </div>
            </FormValidator>}
        </FormDialog>
    )
}

export default EditProgram