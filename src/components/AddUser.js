import React, {useState,useEffect,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import {sex,idTypes} from '../constants';
import FormValidator,{useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../data'

const AddUser = ({reload}) => {
    const {setDialog,setLoading} = useContext(GlobalContext);
    const [autoPassword,setAutoPassword] = useState(true);
    const [userTypes,setUserTypes] = useState([]);
    const [userGroups,setUserGroups] = useState([]);
    const [districts,setDistricts] = useState([]);
    const [nationalities,setNationalities] = useState([]);
    const [professionalCategories,setProfessionalCategories] = useState([]);
    const [confirmPassword,setConfirmPassword] = useState('');
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const [message,setMessage] = useState({content:'',success:false});
    const [user,setUser] = useState({});
    const {request} = useData();

    const onAutoPassword = (e) => {
        setAutoPassword(!autoPassword);
    }

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
            setUser({...user, [e.target.name]: null});
        } else {
            setUser({...user, [e.target.name]: value});
        }
    };

    const onConfirmPassword = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
    }; 

    const onUserType = (e) => {
        const value = e.target.value;
        const userType = userTypes.find((userType) => {return userType.id == value});
        if(userType) {
            setUser({...user,userType:userType});
        }
    };

    const onUserGroup = (e) => {
        const value = e.target.value;
        if(value !== '') {
            const userGroup = userGroups.find((userGroup) => {return userGroup.id == value});
            if(userGroup) {
                setUser({...user,userGroup:userGroup});
            }
        } else {
            setUser({...user,userGroup:null});
        }
    };

    const onDateOfBirth = (e) => {
        const value = e.target.value;
        setUser({...user, dateOfBirth: new Date(value)});
    };

    const onDistrict = (e) => {
        const value = e.target.value;
        const district = districts.find((dist) => {return dist.id == value});
        if(district) {
            setUser({...user,district:district});
        }
    };

    const onEmployed = (e) => {
        let value = !user.employed;
        setUser({...user,employed:value});
    }

    const onSubmit = async  () => {
        setLoading(true);
        setMessage({content:'',success:false});
        if((!autoPassword && (user.password !== confirmPassword))) {
            setLoading(false);
            setMessage({content:'Password mismatch',success:false});
            return;
        }
        await request('POST','user',user,{autoPassword:autoPassword},true)
        .then(async (saveResponse) => {
            setLoading(false);
            if(saveResponse.content && saveResponse.content != null && saveResponse.content != {}) {
                setMessage({content:saveResponse.message,success:true});
                reload && reload({});
                setDialog(null);
            } else {
                setMessage({content:saveResponse,success:false});
            }
        })
        .catch((error) => {
            setLoading(false);
            setMessage({content:error.message,success:false});
        }); 
    }

    const [register,handleChange,handleSubmit,errors] = useFormValidator(onSubmit);
    const inputs = [
        {
            label:'Username',
            type:'text',
            name:'username', 
            value:user && user.username?user.username:'',
            placeholder:'Enter username...',
            onChange:(e) => handleChange(e,onChange),
            register:register,
            errors:errors
        },
        {
            label:'User Type',
            type:'select',
            options:() => {
                let options = [];
                userTypes.map((option,i) => options.push(<option key={i} value={option.id}>{option.name}</option>));
                return options;
            },
            name:'userType', 
            value:user && user.userType?user.userType.id:'',
            onChange:(e) => handleChange(e,onUserType),
            register:register,
            errors:errors
        },
        {
            label:'User Group',
            type:'select',
            options:() => {
                let options = [<option value=''>None</option>];
                userGroups.map((option,i) => options.push(<option key={i} value={option.id}>{option.name}</option>));
                return options;
            },
            name:'userGroup', 
            value:user && user.userGroup?user.userGroup.id:'',
            onChange:(e) => handleChange(e,onUserGroup)
        },
        {
            label:'Auto Generate Password',
            type:'checkbox',
            name:'autoPassword',
            value:autoPassword,   
            onChange:(e) => onAutoPassword(e)
        },
        {
            label:'Password',
            type:'password',
            name:'password', 
            value:user && user.password?user.password:'',
            disabled:autoPassword,
            placeholder:'Enter password...',
            onChange:(e) => handleChange(e,onChange),
            register:register,
            errors:errors
        },
        {
            label:'Confirm Password',
            type:'password',
            name:'confirmPassword', 
            value:confirmPassword?confirmPassword:'',
            disabled:autoPassword,
            placeholder:'Confirm password...',
            onChange:(e) => handleChange(e,onConfirmPassword),
            register:register,
            errors:errors
        },
        {
            label:'Email',
            type:'text',
            name:'email',
            value:user && user.email?user.email:'',   
            placeholder:'Enter email...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'ID type',
            type:'select',
            options:() => {
                let options = [];
                idTypes.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'idType', 
            value:user && user.idType?user.idType:'',
            placeholder:'Select ID type...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'ID number',
            type:'text',
            name:'idNumber', 
            value:user && user.idNumber?user.idNumber:'',
            placeholder:'Enter ID number...',
            onChange:(e) => handleChange(e,onChange),
            register:register,
            errors:errors
        },
        {
            label:'Firstname',
            type:'text', 
            name:'firstname',
            value:user && user.firstname?user.firstname:'',   
            placeholder:'Enter firstname...',
            onChange:(e) => {handleChange(e,onChange)},
            register:register,
            errors:errors
        },
        {
            label:'Lastname',
            type:'text',
            name:'lastname', 
            value:user && user.lastname?user.lastname:'',
            placeholder:'Enter lastname...',
            onChange:(e) => handleChange(e,onChange),
            register:register,
            errors:errors
        },
        {
            label:'Middlename',
            type:'text',
            name:'middlename', 
            value:user && user.middlename?user.middlename:'',
            placeholder:'Enter middlename...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Sex',
            type:'select',
            options:() => {
                let options = [];
                sex.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'sex', 
            value:user && user.sex?user.sex:'',
            placeholder:'Select sex...',
            onChange:(e) => handleChange(e,onChange),
            register:register,
            errors:errors
        },
        {
            label:'Date of Birth',
            type:'date',
            name:'dateOfBirth', 
            value:user && user.dateOfBirth?user.dateOfBirth.toISOString().slice(0, 10):'',
            placeholder:'Pick date of birth...',
            onChange:(e) => handleChange(e,onDateOfBirth)
        },
        {
            label:'Nationality',
            type:'select',
            options:() => {
                let options = [];
                nationalities.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'nationality', 
            value:user && user.nationality?user.nationality:'',
            placeholder:'Select nationality...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Phone 1',
            type:'text',
            name:'phone1', 
            value:user && user.phone1?user.phone1:'',
            placeholder:'Enter phone 1...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Phone 2',
            type:'text',
            name:'phone2', 
            value:user && user.phone2?user.phone2:'',
            placeholder:'Enter phone 2...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Physical address',
            type:'text',
            name:'physicalAddress', 
            value:user && user.physicalAddress?user.physicalAddress:'',
            placeholder:'Enter physical address...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Postal Address',
            type:'text',
            name:'postalAddress', 
            value:user && user.postalAddress?user.postalAddress:'',
            placeholder:'Enter postal address...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'District',
            type:'select',
            options:() => {
                let options = [];
                districts.map((option,i) => options.push(<option key={i} value={option.id}>{option.name}</option>));
                return options;
            },
            name:'district', 
            value:user && user.district?user.district.id:'',
            placeholder:'Select district...',
            onChange:(e) => handleChange(e,onDistrict)
        },
        {
            label:'Program',
            type:'text', 
            name:'program',
            value:user && user.program?user.program:'',   
            placeholder:'Enter program...',
            onChange:(e) => {handleChange(e,onChange)}
        },
        {
            label:'Institution',
            type:'text',
            name:'institution', 
            value:user && user.institution?user.institution:'',
            placeholder:'Enter Institution...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Professional Category',
            type:'select',
            options:() => {
                let options = [<option value={''}>None</option>];
                professionalCategories.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'professionalCategory', 
            value:user && user.professionalCategory?user.professionalCategory:'',
            placeholder:'Select professional category...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Employed',
            type:'checkbox', 
            name:'employed',
            value:user?user.employed:'',   
            onChange:(e) => onEmployed(e)
        },
        {
            label:'Employer',
            type:'text',
            name:'employer', 
            value:user && user.employer?user.employer:'',
            disabled:user?!user.employed:true,
            placeholder:'Enter employer...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Organizational Unit',
            type:'text',
            name:'organizationalUnit', 
            value:user && user.organizationalUnit?user.organizationalUnit:'',
            disabled:user?!user.employed:true,
            placeholder:'Enter organizational unit...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Current Position',
            type:'text',
            name:'currentPosition', 
            value:user && user.currentPosition?user.currentPosition:'',
            disabled:user?!user.employed:true,
            placeholder:'Enter current position...',
            onChange:(e) => handleChange(e,onChange)
        },
        {
            label:'Facility',
            type:'text',
            name:'facility', 
            value:user && user.facility?user.facility:'',
            disabled:user?!user.employed:true,
            placeholder:'Enter facility...',
            onChange:(e) => handleChange(e,onChange)
        }
    ]

    useEffect(() => {
        ( async () => {
            setLoading(true);
            let userType = null;
            await request('GET','usertypes',null,null,false)
            .then((response) => {
                if(response.content && response.content.length > 0) {
                    setUserTypes(response.content);
                    userType = response.content[0];
                }  else {
                    setUserTypes([]);
                }
            })
            .catch((error) => {
                setUserTypes([]);
            })
            await request('GET','userGroups',null,null,false)
            .then((response) => {
                if(response.content) {
                    setUserGroups(response.content);
                }  else {
                    setUserGroups([]);
                }
            })
            .catch((error) => {
                setUserGroups([]);
            })
            let district = null;
            await request('GET','districts',null,null,false)
            .then((response) => {
                if(response.content && response.content.length > 0) {
                    setDistricts(response.content);
                    district = response.content[0];
                }  else {
                    setDistricts([]);
                }
            })
            .catch((error) => {
                setDistricts([]);
            })
            let nationality = null
            await request('GET','nationalities',null,null,false)
            .then((response) => {
                if(response.content) {
                    setNationalities(response.content);
                    nationality = response[0]
                }  else {
                    setNationalities([]);
                }
            })
            .catch((error) => {
                setNationalities([]);
            })
            await request('GET','professionalcategories',null,null,false)
            .then((response) => {
                if(response.content) {
                    setProfessionalCategories(response.content);
                }  else {
                    setProfessionalCategories([]);
                }
            })
            .catch((error) => {
                setProfessionalCategories([]);
            })
            setUser({
                ...user,
                userType:userType,
                sex:sex[0],
                district:district,
                nationality:nationality,
                dateOfBirth: new Date()
            });
            setLoading(false);
        }
        )();
    },[]);

  return (
    <FormDialog title='Add User'>
        {user && <FormValidator>
            <div className='flex flex-col w-full sm:w-[640px] h-[90vh] p-8'>
                <Scrollable vertical={true}>
                    <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_course' setCalcWidth={setInputWidth}/>
                    <Message message={message}/>
                    <button style={{'--width':inputWidth+'px'}} 
                        onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                        Submit
                    </button>
                </Scrollable>
            </div>
        </FormValidator>}
    </FormDialog>
  )
}

export default AddUser