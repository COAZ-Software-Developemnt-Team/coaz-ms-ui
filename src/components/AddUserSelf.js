import React, {useState,useEffect,useContext, Component} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import {sex,idTypes} from '../constants';
import FormValidator,{useFormValidator} from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import Login from './Login';
import { request } from '../App';

const AddUserSelf = ({reload}) => {
    const {setLoading,setAccess} = useContext(GlobalContext);
    const [userTypes,setUserTypes] = useState([]);
    const [districts,setDistricts] = useState([]);
    const [nationalities,setNationalities] = useState([]);
    const [professionalCategories,setProfessionalCategories] = useState([]);
    const [confirmPassword,setConfirmPassword] = useState('');
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const [message,setMessage] = useState({content:'',success:false});
    const [user,setUser] = useState({});

    const onChange = (e) => {
        const value = e.target.value;
        if(value === '') {
            setUser({...user, [e.target.name]: null});
        } else {
            setUser({...user, [e.target.name]: value});
        }
    };

    const onUserType = (e) => {
        const value = e.target.value;
        const userType = userTypes.find((userType) => {return userType.id == value});
        if(userType) {
            setUser({...user,userType:userType});
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

    const submit = async () => {
        setMessage({content:'',success:false});
        if(user.password != confirmPassword) {
            setMessage({content:'Password and confirm password mismatch',success:false});  
            return;
        }
        setLoading(true);
        await request('POST','user/self',user,null,false)
        .then(async (response) => {
            if(response.content) {
                setAccess({Component:() => <Login reload={reload}/>})
            } else {
                setMessage({content:response,success:false});
            }
            setLoading(false);
        })
        .catch((error) => {
            setMessage({content:error.message,success:false});
            setLoading(false);
        }); 
    }

    const [register,handleChange,handleSubmit,errors] = useFormValidator(submit);
    
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
            placeholder:'Select user type...',
            onChange:(e) => handleChange(e,onUserType),
            register:register,
            errors:errors
        },
        {
            label:'Password',
            type:'password',
            name:'password', 
            value:user.password,
            placeholder:'Enter password...',
            onChange:(e) => handleChange(e,onChange),
            register:register,
            errors:errors
        },
        {
            label:'Confirm Password',
            type:'password',
            name:'confirmPassword', 
            value:confirmPassword,
            placeholder:'Confirm password...',
            onChange:(e) => handleChange(e,(e)=> setConfirmPassword(e.target.value)),
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
            placeholder:'Select phone2...',
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
                let options = [<option value={null}>None</option>];
                professionalCategories.map((option,i) => options.push(<option key={i}>{option}</option>));
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
            let usrType = null;
            await request('GET','usertypes',null,null,true)
            .then((response) => {
                if(response.content && response.content.length > 0) {
                    let types = response.content.filter((type => !type.reserved));
                    setUserTypes(types);
                    usrType = types[0];
                }  else {
                    setUserTypes([]);
                }
            })
            .catch((error) => {
                setUserTypes([]);
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
                if(response.content && response.content.length > 0) {
                    setNationalities(response.content);
                    nationality = response.content[0];
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
            setUser({...user,
                userType:usrType,
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
    <div className='relative flex flex-col w-[95%] sm:w-[640px] h-[95%] p-8 bg-white rounded-xl shadow-md'>
        <FormValidator>
            <Scrollable vertical={true}>
                <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_course' setCalcWidth={setInputWidth}/>
                <Message message={message}/>
                <button style={{'--width':inputWidth+'px'}} 
                    onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                    Submit
                </button>
            </Scrollable>
        </FormValidator>
    </div>
  )
}

export default AddUserSelf