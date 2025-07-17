import React, {useEffect,useState, useContext, useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate } from 'react-router-dom';
import FormValidator, {useFormValidator} from './FormValidator';
import { PiTrashLight } from "react-icons/pi";
import { LiaPlusSolid } from "react-icons/lia";
import Inputs from './Inputs';
import Message from './Message';
import Scrollable from './Scrollable';
import FormDialog from './FormDialog';
import {useData} from '../data';

const EditRole = ({id,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [role,setRole] = useState(null);
    const [addingAuthority,setAddingAuthority] = useState(false);
    const [selectedAuth,setSelectedAuth] = useState(null);
    const [addAuthority,setAddAuthority] = useState(null);
    const [message,setMessage] = useState({content:'',success:false});
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const {request} = useData();
    const addButtonRef = useRef(null);


    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
            setRole({...role, [e.target.name]: null});
        } else {
            setRole({...role, [e.target.name]: value});
        }
    }

    const add = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAddingAuthority(true);
        if(addButtonRef.current) {
            let maxHeight = 200;
            let padding = 0;
            let itemHeight = 32;
            let avaiAuthorities = [];

            await request('GET','authorities',null,null,true)
            .then((response) => {
                if(response.content && response.content.length > 0) {
                    for(let authority of response.content) {
                        if(!role.authorities.find((roleAuthority)=>{return roleAuthority == authority})) {
                            avaiAuthorities.push(authority);
                        }
                    }
                }
            })
            .catch((error)=>{
                console.log(error.message);
            });
            let height = (padding * 2) + (avaiAuthorities.length * itemHeight);
            height = height > maxHeight? maxHeight:height;
            let rect = addButtonRef.current.getBoundingClientRect();
            let vh = document.documentElement.clientHeight;
            let top = rect.bottom;
            if (rect.bottom + height > vh) {
                top = rect.top - height;
            }
            setAddAuthority({Component:() => 
                <div onClick={e => e.stopPropagation()} 
                    style={{left:rect.left+'px',top:top+'px',height:height+'px',paddingTop:padding+'px',paddingBottom:padding+'px'}} 
                    className='fixed flex flex-col w-fit shadow-lg bg-[rgb(238,238,238)] overflow-y-auto'>
                    {avaiAuthorities.map((authority,i) => 
                        <div key={i} 
                            onClick={(e) => {
                                let roleAuthorities = role.authorities;
                                roleAuthorities.push(authority);
                                setRole({...role,authorities:roleAuthorities});
                                setAddAuthority(null);
                                setAddingAuthority(false);
                            }} 
                            style={{height:itemHeight+'px'}} 
                            className='flex w-full shrink-0 items-center font-jostBook text-sm text-[rgb(93,93,93)] hover:text-white hover:bg-[rgb(0,175,240)] cursor-pointer'>
                                <p className='px-8'>{authority}</p>
                        </div>
                    )}
                </div>
            });
        }
    }

    const submit = async (e) => {
        setMessage({content:'',success:false});
        setLoading(true);
        request('PUT','role',role,null,true)
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
            value:role && role.name?role.name:'',   
            placeholder:'Enter name...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'Display Name',
            type:'text', 
            name:'displayName',
            value:role && role.displayName?role.displayName:'',   
            placeholder:'Enter display name...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'Reserved',
            type:'checkbox',
            name:'reserved',
            value:role?role.reserved:false,   
            onChange:(e) => {
                setRole({...role,reserved: !role.reserved});
            }
        }
    ]

    useEffect(() => {
        ( async () => {
            setLoading(true);
            await request('GET',`role/${id}`,null,null,true)
            .then((response) => {
                setLoading(false);
                if(response.content) {
                    response.content.date = new Date(response.content.date);
                    setRole(response.content);
                }  else {
                    setRole(null);
                    setDialog(null);
                }
            })
            .catch((error) => {
                console.log(error.message);
                setLoading(false);
                setRole(null);
                setDialog(null);
            })
        }
        )();
    },[]);

    return (
        <div onClick={(e) => {
                setAddAuthority(null);
                setAddingAuthority(false);
            }} 
            >
            <FormDialog title='Edit Role'>
                {role && <FormValidator>
                    <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                        <Scrollable vertical={true}>
                            <div className='flex flex-col w-full h-auto shrink-0'>
                                <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_role' setCalcWidth={setInputWidth}/>
                                <div className='flex flex-col w-full h-auto space-y-2'>
                                    <p className='text-gray-600 text-sm capitalize'>Authorities</p>
                                    <div className='flex flex-col w-full h-auto p-4 space-y-4 border rounded-lg'>
                                        {role && role.authorities && role.authorities.map((authority,i) => 
                                        <div key={i} 
                                            onClick={(e) => {
                                                setSelectedAuth(authority); 
                                            }}
                                            className='flex flex-row space-x-4'>
                                            <p className={`flex flex-row w-full h-auto text-sm tracking-wider whitespace-nowrap overflow-ellipsis capitalize font-jostBook ${selectedAuth === authority?'text-[rgb(0,175,240)]':''} cursor-pointer`}>
                                                {authority}
                                            </p>
                                        </div>)
                                        }
                                    </div>
                                    <div className='flex flex-row w-auto h-auto space-x-4'>
                                        <button ref={addButtonRef} 
                                            onClick={(e) => {
                                                add(e);
                                            }} 
                                            className={`flex w-6 h-6 items-center justify-center ${addingAuthority?'border border-[rgb(0,175,240)] text-[rgb(0,175,240)]':'bg-[rgb(0,175,240)] text-white hover:bg-[rgba(0,175,240,.7)]'}  rounded-sm`}>
                                            <LiaPlusSolid size={16}/>
                                        </button>
                                        <button onClick={(e) => {
                                                let authorities = role.authorities.filter((roleAuthority => roleAuthority !== selectedAuth));
                                                setRole({...role,authorities:authorities});
                                                setSelectedAuth(null);
                                            }} 
                                            disabled={!selectedAuth}
                                            className={`flex w-6 h-6 items-center justify-center ${selectedAuth?'bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)]':'bg-[rgba(0,175,240,.7)]'} text-white rounded-sm`}>
                                            <PiTrashLight size={16}/>
                                        </button>
                                    </div>
                                </div>
                                <Message message={message}/>
                                <button style={{'--width':inputWidth+'px'}} 
                                    onClick={handleSubmit} className='flex shrink-0 w-full lg:w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                                    Submit
                                </button>
                            </div>
                        </Scrollable>
                    </div>
                </FormValidator>}
                {addAuthority && 
                <addAuthority.Component/>
                }
            </FormDialog>
        </div>
      )
}

export default EditRole