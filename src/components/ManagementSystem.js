import React,{useState,useEffect,useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate,useLocation,Outlet} from 'react-router-dom';
import { PiUser,PiUsersFour, PiUsersThree, PiMaskHappy,PiChartLine,PiGraduationCap, PiBook, PiPath, PiCalendarDots, PiMoneyWavy, PiArrowsLeftRight, PiBank} from "react-icons/pi";
import Menu from './Menu';
import MobileMenu from './MobileMenu';
import Login from './Login';
import LoadingIcons from 'react-loading-icons'
import { request } from '../App';

const ManagementSystem = () => {
    const path = useLocation().pathname;
    const {setAccess,currentUser,logout} = useContext(GlobalContext)
    const [menus,setMenus] = useState([]);
    const [openMobileMenu,setOpenMobileMenu] = useState(false)
    const [loading,setLoading] = useState(false);

    const navigate = useNavigate();

    const onLogin = (e) => {
        e.preventDefault();
        setAccess({Component:() => <Login reload={load}/>})
    }

    const onLogout = (e) => {
        logout();
        navigate('/')
    }

    const load = async () => {
        setLoading(true);
        let mnus = [];
        mnus.push({name:'Users', link:'/users', Icon:PiUser});
        let createUserType = false;
        let readUserType = false;
        let updateUserType = false;
        let deleteUserType = false;
        await request('GET','hasauthority',null,{
            contextName:'USERTYPE',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                createUserType = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'USERTYPE',
            authority:'READ'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                readUserType = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'USERTYPE',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                updateUserType = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'USERTYPE',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                deleteUserType = true;
            }
        })
        if(createUserType || readUserType || updateUserType || deleteUserType) {
            mnus.push({name:'User types', link:'/usertypes', Icon:PiUsersThree});
        }

        let createUserGroup = false;
        let readUserGroup = false;
        let updateUserGroup = false;
        let deleteUserGroup = false;
        await request('GET','hasauthority',null,{
            contextName:'USERGROUP',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                createUserGroup = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'USERGROUP',
            authority:'READ'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                readUserGroup = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'USERGROUP',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                updateUserGroup = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'USERGROUP',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                deleteUserGroup = true;
            }
        })
        if(createUserGroup || readUserGroup || updateUserGroup || deleteUserGroup) {
            mnus.push({name:'User groups', link:'/usergroups', Icon:PiUsersFour});
        }

        let createRole = false;
        let readRole = false;
        let updateRole = false;
        let deleteRole = false;
        await request('GET','hasauthority',null,{
            contextName:'ROLE',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                createRole = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'ROLE',
            authority:'READ'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                readRole = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'ROLE',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                updateRole = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'ROLE',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                deleteRole = true;
            }
        })
        if(createRole || readRole || updateRole || deleteRole) {
            mnus.push({name:'Roles', link:'/roles', Icon:PiMaskHappy});
        }
        let enroll = false;
        await request('GET','hasauthority',null,{
            contextName:'PROGRAM',
            authority:'ENROLL'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                enroll = true;
                mnus.push({name:'My statistics', link:'/statistics', Icon:PiChartLine})
            }
        })
        let createProgram = false;
        let updateProgram = false;
        let deleteProgram = false;
        await request('GET','hasauthority',null,{
            contextName:'PROGRAM',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                createProgram = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'PROGRAM',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                updateProgram = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'PROGRAM',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                deleteProgram = true;
            }
        })
        if(enroll || createProgram || updateProgram || deleteProgram) {
            mnus.push({name:'Programs', link:'/programs', Icon:PiGraduationCap})
        } 

        let createCourse = false;
        let updateCourse = false;
        let deleteCourse = false;
        let teach = false;
        await request('GET','hasauthority',null,{
            contextName:'COURSE',
            authority:'TEACH'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                teach = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'COURSE',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                createCourse = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'COURSE',
            authority:'UPDATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                updateCourse = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'COURSE',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                deleteCourse = true;
            }
        })
        if(teach || createCourse || updateCourse || deleteCourse) {
            mnus.push({name:'CPDs', link:'/courses', Icon:PiBook})
        }
        if(currentUser) {
            mnus.push({name:'Events', link:'/events', Icon:PiCalendarDots})
        }
        let createCriteriaPath = false;
        let deleteCriteriaPath = false;
        await request('GET','hasauthority',null,{
            contextName:'CRITERIA_PATH_ITEM',
            authority:'CREATE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                createCriteriaPath = true;
            }
        })
        await request('GET','hasauthority',null,{
            contextName:'CRITERIA_PATH_ITEM',
            authority:'DELETE'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                deleteCriteriaPath = true;
            }
        })
        if(createCriteriaPath || deleteCriteriaPath) {
            mnus.push({name:'Criteria Paths', link:'/paths', Icon:PiPath})
        }

        await request('GET','hasauthority',null,{
            contextName:'ACCOUNT',
            authority:'READ'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                mnus.push({name:'Accounts', link:'/accounts', Icon:PiBank});
            }
        })

        await request('GET','hasauthority',null,{
            contextName:'TRANSACTION',
            authority:'READ'
        },true)
        .then((response) => {
            if(response.status && response.status === 'YES') {
                mnus.push({name:'Transactions', link:'/transactions', Icon:PiArrowsLeftRight})
            }
        })
        
        setMenus(mnus);
        setLoading(false)
    }

    useEffect(() => {
        if(path === '/m' || !currentUser) {
            navigate('/home')
        }
        load();
    },[currentUser]);

  return (
    <div className='flex w-full h-full bg-[url(/public/images/bg_cpd.jpg)] bg-cover bg-center overflow-hidden'>
        <div className='flex flex-col sm:flex-row w-[90%] h-[90%] m-auto shadow-2xl rounded-2xl overflow-hidden'>
            {loading? 
                <div className='flex w-full h-full items-center justify-center text-[rgb(0,175,240)]'>
                    <LoadingIcons.ThreeDots width={32} height={64} fill="rgb(0,175,240)"/>
                </div>:
                <>
                    <Menu user={currentUser} menus={menus} openMobileMenu={openMobileMenu} setOpenMobileMenu={setOpenMobileMenu} onLogin={onLogin} onLogout={onLogout}/>
                    <div style={{backgroundSize:304+'px',backgroundImage:'url(/images/home_bg.jpg)'}}
                        className='flex flex-col w-full h-full bg-white overflow-hidden'>
                        <div style={{transition:'height 1s ease-in-out'}} className={`w-full ${openMobileMenu?'h-full':'h-0'} overflow-hidden`}>
                            <MobileMenu user={currentUser} menus={menus} openMobileMenu={openMobileMenu} setOpenMobileMenu={setOpenMobileMenu} onLogin={onLogin} onLogout={onLogout}/>
                        </div>
                        <div style={{transition:'height 1s ease-in-out'}} 
                            className={`w-full ${!openMobileMenu?'h-full':'h-0'} overflow-hidden`}>
                            <Outlet/>
                        </div>
                    </div>
                </>
                }
        </div>
    </div>
  )
}

export default ManagementSystem