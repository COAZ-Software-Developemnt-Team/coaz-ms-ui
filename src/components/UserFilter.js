import React, {useState,useEffect,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import {sex} from '../constants';
import FormValidator from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {useData} from '../data'

const UserFilter = ({reload}) => {
    const {setDialog,setLoading,userFilter,setUserFilter} = useContext(GlobalContext);
    const [userTypes,setUserTypes] = useState([]);
    const [userGroups,setUserGroups] = useState([]);
    const [provinces,setProvinces] = useState([]);
    const [districts,setDistricts] = useState([]);
    const [nationalities,setNationalities] = useState([]);
    const [professionalCategories,setProfessionalCategories] = useState([]); 
    const [statuses,setStatuses] = useState([]);
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const [message,setMessage] = useState({content:'',success:false});
    const {request} = useData();

    const onChange = (e) => {
        if(userFilter && setUserFilter) {
            const value = e.target.value;
            if(value === '') {
                setUserFilter({...userFilter, [e.target.name]: null});
            } else {
                setUserFilter({...userFilter, [e.target.name]: value});
            }
        }
    };

    const onProvince = async (e) => {
        if(userFilter && setUserFilter) {
            const value = e.target.value;
            if(value === '') {
                setUserFilter({...userFilter, province: '',district:''});
                let dists = [];
                for(let province of provinces) {
                    for(let dist of province.districts) {
                        dists.push(dist);
                    }
                }
                setDistricts(dists);
            } else {
                setUserFilter({...userFilter, province: value,district:''});
                await request('GET','districts/province',null,{
                    province:value
                },false)
                .then((response) => {
                    if(response.content) {
                        setDistricts(response.content);
                    }
                })
                .catch((error) => {
                    setDistricts([])
                })
            }
        }
    }

    const onSubmit = async  () => {
        if(reload) {
            setLoading(true);
            await reload(userFilter)
            .then((response) => {
                setLoading(false);
                setDialog(null);
            })
            .catch((error) => {
                setLoading(false);
                setDialog(null);
            }); 
        }
    }

    const inputs = [
        {
            label:'Username',
            type:'text',
            name:'username', 
            value:userFilter && userFilter.username?userFilter.username:'',
            placeholder:'Enter username...',
            onChange:(e) => onChange(e)
        },
        {
            label:'User Type',
            type:'select',
            options:() => {
                let options = [<option value={''}>All</option>];
                userTypes.map((option,i) => options.push(<option key={i} value={option.id}>{option.name}</option>));
                return options;
            },
            name:'userTypeId', 
            value:userFilter && userFilter.userTypeId?userFilter.userTypeId:'',
            onChange:(e) => onChange(e)
        },
        {
            label:'User Group',
            type:'select',
            options:() => {
                let options = [<option value={''}>All</option>];
                userGroups.map((option,i) => options.push(<option key={i} value={option.id}>{option.name}</option>));
                return options;
            },
            name:'userGroupId', 
            value:userFilter && userFilter.userGroupId?userFilter.userGroupId:'',
            onChange:(e) => onChange(e)
        },
        {
            label:'Firstname',
            type:'text', 
            name:'firstname',
            value:userFilter && userFilter.firstname?userFilter.firstname:'',   
            placeholder:'Enter firstname...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Lastname',
            type:'text',
            name:'lastname', 
            value:userFilter && userFilter.lastname?userFilter.lastname:'',
            placeholder:'Enter lastname...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Middlename',
            type:'text',
            name:'middlename', 
            value:userFilter && userFilter.middlename?userFilter.middlename:'',
            placeholder:'Enter middlename...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Email',
            type:'text',
            name:'email',
            value:userFilter && userFilter.email?userFilter.email:'',   
            placeholder:'Enter email...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Sex',
            type:'select',
            options:() => {
                let options = [<option value={''}>All</option>];
                sex.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'sex', 
            value:userFilter && userFilter.sex?userFilter.sex:'',
            placeholder:'Select sex...',
            onChange:(e) => onChange(e)
        },
        {
            label:'ID number',
            type:'text',
            name:'idNumber', 
            value:userFilter && userFilter.idNumber?userFilter.idNumber:'',
            placeholder:'Enter ID number...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Nationality',
            type:'select',
            options:() => {
                let options = [<option value=''>All</option>];
                nationalities.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'nationality', 
            value:userFilter && userFilter.nationality?userFilter.nationality:'',
            placeholder:'Select nationality...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Province',
            type:'select',
            options:() => {
                let options = [<option value=''>All</option>];
                provinces.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'province', 
            value:userFilter && userFilter.province?userFilter.province:'',
            placeholder:'Enter province...',
            onChange:(e) => onProvince(e)
        },
        {
            label:'District',
            type:'select',
            options:() => {
                let options = [<option value=''>All</option>];
                districts.map((option,i) => options.push(<option key={i} value={option.id}>{option.name}</option>));
                return options;
            },
            name:'district', 
            value:userFilter && userFilter.district?userFilter.district:'',
            placeholder:'Select district...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Program',
            type:'text', 
            name:'program',
            value:userFilter && userFilter.program?userFilter.program:'',   
            placeholder:'Enter program...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Institution',
            type:'text',
            name:'institution', 
            value:userFilter && userFilter.institution?userFilter.institution:'',
            placeholder:'Enter Institution...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Professional Category',
            type:'select',
            options:() => {
                let options = [<option value={''}>All</option>];
                professionalCategories.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'professionalCategory', 
            value:userFilter && userFilter.professionalCategory?userFilter.professionalCategory:'',
            placeholder:'Select professional category...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Employer',
            type:'text',
            name:'employer', 
            value:userFilter && userFilter.employer?userFilter.employer:'',
            placeholder:'Enter employer...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Organizational Unit',
            type:'text',
            name:'organizationalUnit', 
            value:userFilter && userFilter.organizationalUnit?userFilter.organizationalUnit:'',
            placeholder:'Enter organizational unit...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Current Position',
            type:'text',
            name:'currentPosition', 
            value:userFilter && userFilter.currentPosition?userFilter.currentPosition:'',
            placeholder:'Enter current position...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Facility',
            type:'text',
            name:'facility', 
            value:userFilter && userFilter.facility?userFilter.facility:'',
            placeholder:'Enter facility...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Status',
            type:'select',
            options:() => {
                let options = [<option value=''>All</option>];
                statuses.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'status', 
            value:userFilter && userFilter.status?userFilter.status:'',
            placeholder:'Select status...',
            onChange:(e) => onChange(e)
        }
    ]

    useEffect(() => {
        ( async () => {
            setLoading(true);
            await request('GET','usertypes',null,null,false)
            .then((response) => {
                if(response.content) {
                    setUserTypes(response.content);
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

            await request('GET','provinces',null,null,false)
            .then((response) => {
                if(response.content) {
                    setProvinces(response.content);
                }  else {
                    setProvinces([]);
                }
            })
            .catch((error) => {
                setProvinces([]);
            })

            if(userFilter && userFilter.province && userFilter.province != '') {
                await request('GET','districts/province',null,{
                    province:userFilter.province
                },true)
                .then((response) => {
                    if(response.content) {
                        setDistricts(response.content);
                    }
                })
                .catch((error) => {
                    setDistricts([])
                })
            } else {
                await request('GET','districts',null,null,true)
                .then((response) => {
                    if(response.content) {
                        setDistricts(response.content);
                    }
                })
                .catch((error) => {
                    setDistricts([])
                })
            }

            await request('GET','nationalities',null,null,false)
            .then((response) => {
                if(response.content) {
                    setNationalities(response.content);
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

            await request('GET','statuses',null,null,false)
            .then((response) => {
                if(response.content) {
                    setStatuses(response.content);
                }  else {
                    setStatuses([]);
                }
            })
            .catch((error) => {
                setStatuses([]);
            })
            setLoading(false);
        }
        )();
    },[]);

  return (
    <FormDialog title='Filter'>
        {<FormValidator>
            <div className='flex flex-col w-full h-[90vh] p-8'>
                <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='filter' setCalcWidth={setInputWidth}/>
                <Message message={message}/>
                <button style={{'--width':inputWidth+'px'}} 
                    onClick={onSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                    Submit
                </button>
            </div>
        </FormValidator>}
    </FormDialog>
  )
}

export default UserFilter