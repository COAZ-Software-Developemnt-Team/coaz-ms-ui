import React, {useState,useEffect,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import Message from './Message';
import {useFormValidator} from './FormValidator';
import Input from './Input';
import Table from './Table';
import Select from './Select';
import { useData } from '../App';

  const AddUsersTable = ({pages,setResults,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [password,setPassword] = useState('');
    const [message,setMessage] = useState({content:'',success:false});
    const [userType,setUserType] = useState(null);
    const [userGroup,setUserGroup] = useState(null);
    const [userTypes,setUserTypes] = useState([]);
    const [userGroups,setUserGroups] = useState([]);
    const [request] = useData();
    const columns = [
        {
            id:'username',
            name:'username',
            label:'Username'
        },
        {
            id:'firstname',
            name:'firstname',
            label:'Firstname'
        },
        {
            id:'lastname',
            name:'lastname',
            label:'Lastname'
        },
        {
            id:'middlename',
            name:'middlename',
            label:'Middlename'
        },
        {
            id:'sex',
            name:'sex',
            label:'Sex'
        },
        {
            id:'dateOfBirth',
            name:'dateOfBirth',
            label:'Date of Birth'
        },
        {
            id:'idType',
            name:'idType',
            label:'ID Type'
        },
        {
            id:'idNumber',
            name:'idNumber',
            label:'ID Number'
        },
        {
            id:'nationality',
            name:'nationality',
            label:'Nationality'
        },
        {
            id:'email',
            name:'email',
            label:'Email'
        },
        {
            id:'phone1',
            name:'phone1',
            label:'Phone 1'
        },
        {
            id:'phone2',
            name:'phone2',
            label:'Phone 2'
        },
        {
            id:'physicalAddress',
            name:'physicalAddress',
            label:'Physical Address'
        },
        {
            id:'postalAddress',
            name:'postalAddress',
            label:'PostalAddress'
        },
        {
            id:'district',
            name:['district','name'],
            label:'District'
        },
        {
            id:'program',
            name:'program',
            label:'Program'
        },
        {
            id:'institution',
            name:'institution',
            label:'Institution'
        },
        {
            id:'professionalCategory',
            name:'professionalCategory',
            label:'Professional Category'
        },
        {
            id:'employed',
            name:'employed',
            label:'Employed'
        },
        {
            id:'employer',
            name:'employer',
            label:'Employer'
        },
        {
            id:'organizationalUnit',
            name:'organizationalUnit',
            label:'Organizational Unit'
        },
        {
            id:'currentPosition',
            name:'currentPosition',
            label:'Current Position'
        },
        {
            id:'facility',
            name:'facility',
            label:'Facility'
        }
    ]

    const getUsers = async (filter,page) => {
        if(pages && page && page.pageNo < pages.length) {
            return {
                status:'SUCCESSFUL',
                content:pages[page.pageNo],
                pageNo:page.pageNo,
                pageSize:page.pageSize,
                totalElements:(()=>{
                    let count = 0;
                    for(let page of pages) {
                        count += page.length;
                    }
                    return count;
                })(),
                totalPages:Math.ceil(pages.length/page.pageSize),
                last:page.pageNo >= Math.ceil(pages.length/page.pageSize)
            }
        } else {
            setDialog(null);
        }
    }

    const onSubmit = async  () => {
        setLoading(true);
        setMessage({content:'',success:false});
        if(!userType || !password == password === '') {
            setMessage({content:'Missing fields',success:false});
            return;
        }
        let users = [];
        for(let page of pages) {
            for(let user of page) {
                users.push(user);
            }
        }
        try{
            await request('POST','users',users,{
                userTypeId:userType.id,
                userGroupId:userGroup?userGroup.id:'',
                password:password
            },true)
            .then(async (saveResponse) => {
                if(saveResponse.status) {
                    if(saveResponse.status === 'SUCCESSFUL' && saveResponse.content) {
                        setResults(saveResponse.content,{content:saveResponse.message,success:true})
                    } else if(saveResponse.message) {
                        setMessage({content:saveResponse.message,success:false});
                    }
                } else {
                    setMessage({content:saveResponse,success:false});
                }
                setLoading(false);
                reload && reload({});
            })
            .catch((error) => {
                setMessage({content:error.message,success:false});
                setLoading(false);
            }); 
        } catch (error) {
            setMessage({content:error.message,success:false});
            setLoading(false);
        }
    }

    const [register,handleChange,handleSubmit,errors] = useFormValidator(onSubmit);

    const inputWidth = 320;

    useEffect(() => {
        ( async () => {
            setLoading(true);
            await request('GET','usertypes',null,null,false)
            .then((response) => {
                setLoading(false);
                if(response.content) {
                    if(response.content && response.content.length > 0) {
                        let types = response.content.filter((type => !type.reserved));
                        if(types && types.length > 0) {
                            setUserTypes(types);
                            setUserType(types[0])
                        } else {
                            setUserTypes([]);
                        }
                    }  else {
                        setUserTypes([]);
                    }
                }  else {
                    setUserTypes([]);
                }
            })
            .catch((error) => {
                console.log(error.message);
                setUserTypes([]);
            })
            await request('GET','usergroups',null,null,false)
            .then((response) => {
                setLoading(false);
                if(response.content) {
                    setUserGroups(response.content);
                }  else {
                    setUserGroups([]);
                }
            })
            .catch((error) => {
                console.log(error.message);
                setUserGroups([]);
            })
        }
        )();
    },[]);

    return (
        <div className='relative flex flex-col w-full h-full'>
            <Table columns={columns} retrieveRecords={getUsers}/>
            <div className='flex flex-wrap w-full px-8 justify-between'>
                <Select 
                    label="User type"
                    type="text"
                    id="userType" 
                    name="userType"  
                    value={userType?userType.name:''}
                    onChange= {(e) => handleChange(e,(e) => {
                        if(userTypes) {
                            let value = userTypes.find(userType => {return userType.name == e.target.value});
                            if(value) {
                                setUserType(value);
                            }
                        }
                    })}
                    width={inputWidth}
                    register={register}
                    errors={errors}
                    >{userTypes && userTypes.map((userType,i) => 
                            <option key={i} value={userType.name}>{userType.name}</option>
                        )
                    }
                </Select>
                <Select 
                    label="User group"
                    type="text"
                    id="userGroup" 
                    name="userGroup"  
                    value={userGroup?userGroup.name:''}
                    onChange= {(e) => handleChange(e,(e) => {
                        if(userTypes) {
                            let value = userGroups.find(userGroup => {return userGroup.name == e.target.value});
                            if(value) {
                                setUserGroup(value);
                            }
                        }
                    })}
                    width={inputWidth}
                    >
                    <option value={''}>None</option>
                    {userGroups && userGroups.map((userGroup,i) => 
                            <option key={i} value={userGroup.name}>{userGroup.name}</option>
                        )
                    }
                </Select>
                <Input 
                    label="Password"
                    type="password"
                    id="password" 
                    name="password"  
                    value={password}
                    onChange= {(e) => handleChange(e,(e) => {
                        setPassword(e.target.value)
                    })}
                    width={inputWidth}
                    register={register}
                    errors={errors}
                />
            </div>
            <Message message={message}/>
            <button style={{'--width':inputWidth+'px'}}
                onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                Submit
            </button>
        </div>
    )
}

export default AddUsersTable

