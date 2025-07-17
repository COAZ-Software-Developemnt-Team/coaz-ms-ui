
import { Routes,Route, useNavigate } from 'react-router-dom';
import React, {useState, useEffect,useRef} from 'react';
import './App.css';
import { GlobalContext } from './contexts/GlobalContext';
import Popup from './components/Popup';
import Home from './components/Home';
import ActivityQuestions from './components/ActivityQuestions';
import EnrollmentAttempt from './components/EnrollmentAttempt';
import Topic from './components/Topic';
import Program from './components/Program';
import Courses from './components/Courses';
import Course from './components/Course';
import CourseClass from './components/CourseClass';
import Enrollment from './components/Enrollment';
import Attempts from './components/Attempts';
import MyStatistics from './components/MyStatistics';
import Programs from './components/Programs';
import EnrollmentCourse from './components/EnrollmentCourse';
import EnrollmentTopic from './components/EnrollmentTopic';
import EnrollmentMaterial from './components/EnrollmentMaterial';
import ManagementSystem from './components/ManagementSystem';
import Users from './components/Users';
import User from './components/User';
import UserTypes from './components/UserTypes';
import UserType from './components/UserType';
import Roles from './components/Roles';
import Role from './components/Role';
import UserGroups from './components/UserGroups';
import { PiXLight } from 'react-icons/pi';
import CriteriaPathItems from './components/CriteriaPathItems';
import CriteriaPath from './components/CriteriaPath';
import Resource from './components/Resource';
import Event from './components/Event';
import Events from './components/Events';
import Accounts from './components/Accounts';
import Account from './components/Account';
import Transactions from './components/Transactions';
import Transaction from './components/Transaction';
import MyTransactions from './components/MyTransactions';
import File from './components/File';
import { useData } from './data';
const convertToId = (value) => {
  return value.replace(/ /g,'_').toLowerCase();
}

/* const hasAuthority = (user,authority) => {
  if(!user) {
    return false;
  }
  for(let i = 0; i < user.authorities.length; i++) {
      if(user.authorities[i].authority === authority) {
        return true
      }
    }
  return false;
}  */

const getTextWidth = (text,font,fontSize) => { 
  let span = document.createElement("span"); 
  document.body.appendChild(span); 
  span.style.fontFamily = font; 
  span.style.fontSize = fontSize + "px"; 
  span.style.height = 'auto'; 
  span.style.width = 'auto'; 
  span.style.position = 'absolute'; 
  span.style.whiteSpace = 'no-wrap'; 
  span.innerHTML = text; 

  let width = Math.ceil(span.clientWidth);   
  document.body.removeChild(span); 
  return width;
} 

function App() { 
//  const [setCurrentUser] = useState(null);
  const [userFilter,setUserFilter] = useState({});
  const [transactionFilter,setTransactionFilter] = useState({});
  const [dialog,setDialog] = useState(null);
  const [screenSize,setScreenSize] = useState('lg');
  const [dropMainMenuIndex,setDropMainMenuIndex] = useState(0);
  const [dropMainMenuIndexs,setDropMainMenuIndexs] = useState([0]);
  const [showDropMainMenu,setShowDropMainMenu] = useState(false);
  const [popupData,setPopupData] = useState({});
  const [access,setAccess] = useState(null);
  const [loading,setLoading] = useState(false);
  const {request,login,logout} = useData();

  const mainElementRef = useRef(null);
  const menuRef = useRef(null);
  const menusParentRef = useRef(null);
  const leftMenusRef = useRef(null);
  const rightMenusRef = useRef(null);

  /* const createFileRoute = (file,key) => {
      let route = null;
      if(file) {
          route = <Route key={key} path={file.name} element={<File/>}>
              {file.children && file.children.map((subFile,i) =>
                  createFileRoute(subFile,key+i)
              )}
          </Route>
      }
      return <Route key={key} path={currentUser?currentUser.id:'file'} element={() => <></>}/>;
  } */

  useEffect(() => { 
      /* request('GET','current',null,null,true)
      .then(async (currentResponse) => {
          if(currentResponse.status && currentResponse.status === 'SUCCESSFUL' && currentResponse.content && currentResponse.content.user && currentResponse.content.user.status === 'ACTIVE') {
            currentResponse.content.user.dateOfBirth = currentResponse.content.user.dateOfBirth?new Date(currentResponse.content.user.dateOfBirth):new Date();
            setCurrentUser(currentResponse.content.user);
          } else {
            setCurrentUser(false);
          }
      })
      .catch((error) => {
          console.error(error);
      }) */
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
            let rect = entry.target.getBoundingClientRect();
            if (rect.width > 1024) {
              setScreenSize('lg');
            } else if(rect.width > 640) {
              setScreenSize('sm');
            } else {
              setScreenSize('xs');
            }
        }
      });
      observer.observe(document.documentElement)
      return () => {
        observer.disconnect();
      };
  }, []);

  return (
		<div 
			onClick={(e) => {
				setPopupData(null);
			}} 
			className='flex bg-white bg-cover bg-center w-screen h-screen'>
			<GlobalContext.Provider value={{login,logout,mainElementRef,menuRef,menusParentRef,leftMenusRef,rightMenusRef,
				screenSize,convertToId,dialog,setDialog,loading,setLoading,
				dropMainMenuIndex,setDropMainMenuIndex,showDropMainMenu,setShowDropMainMenu,
				dropMainMenuIndexs,setDropMainMenuIndexs,getTextWidth,
				popupData,setPopupData,userFilter,setUserFilter,transactionFilter,setTransactionFilter
        ,access,setAccess,request}}>
        <Routes>
          <Route path='/' element={<ManagementSystem/>}>
            <Route path='home/' element={<Home/>}/>
            <Route path='profile' element={<User/>}/>
            <Route path='my_transactions' element={<MyTransactions/>}/>
            <Route path='file/:path?' element={<File/>}/>
            <Route path='users' element={<Users/>}>
              <Route path=':userId' element={<User/>}/>
            </Route>
            <Route path='usertypes' element={<UserTypes/>}>
              <Route path=':userTypeId' element={<UserType/>}/>
            </Route>
            <Route path='usergroups' element={<UserGroups/>}/>
            <Route path='roles' element={<Roles/>}>
              <Route path=':roleId' element={<Role/>}/>
            </Route>
            <Route path='statistics/' element={<MyStatistics/>}/>
            <Route path='programs' element={<Programs/>}>
              <Route path=':programId' element={<Program/>}>
                <Route path=':courseId' element={<Course/>}/>
              </Route>
              <Route path='enrollment/:programId' element={<Enrollment/>}>
                <Route path='class/:studentId/:courseId' element={<EnrollmentCourse/>}>
                  <Route path=':teacherId/:topicId' element={<EnrollmentTopic/>}>
                    <Route path='resource/:resourceId' element={<Resource/>}/>
                    <Route path='attempts/:activityId' element={<EnrollmentMaterial/>}>
                      <Route path=':attemptId' element={<EnrollmentAttempt/>}/>
                    </Route>
                  </Route>
                </Route>
                <Route path=':courseId' element={<Course/>}/>
              </Route>
            </Route>
            <Route path='courses' element={<Courses/>}>
              <Route path=':courseId' element={<Course/>}/>
              <Route path='class/:courseId/:teacherId' element={<CourseClass/>}>
                <Route path=':topicId' element={<Topic/>}>
                  <Route path='resource/:resourceId' element={<Resource/>}/>
                  <Route path='questions/:activityId' element={<ActivityQuestions/>}/>
                  <Route path='attempts/:activityId' element={<Attempts/>}>
                    <Route path=':attemptId' element={<EnrollmentAttempt/>}/>
                  </Route>
                </Route>
              </Route>
            </Route>
            <Route path='events' element={<Events/>}>
              <Route path=':eventId' element={<Event/>}/>
            </Route>
            <Route path='paths' element={<CriteriaPathItems/>}>
              <Route path=':pathId' element={<CriteriaPath/>}/>
            </Route>
            <Route path='accounts' element={<Accounts/>}>
              <Route path=':accountId' element={<Account/>}/>
            </Route>
            <Route path='transactions' element={<Transactions/>}>
              <Route path=':transactionId' element={<Transaction/>}/>
            </Route>
          </Route>
				</Routes>
				{dialog && dialog.show && dialog.Component && 
				<div className='fixed flex items-center justify-center p-4 w-full h-full overflow-hidden  z-40 bg-[rgba(0,0,0,.5)]'>
						<dialog.Component/>
				</div>
				}
				{access && access.Component &&
				<div style={{backdropFilter:'blur(64px)'}}
            className='fixed flex flex-col w-screen h-screen z-30 bg-[rgba(255,255,255,.2)] overflow-hidden'>
            <div className='flex flex-row-reverse w-full h-16 items-center shrink-0 text-[rgb(68,71,70)]'>
              <button onClick={e => 
                  {
                    setAccess(null);
                  }
                } className='flex w-10 h-10 mr-4 items-center justify-center bg-white rounded-full shadow-md'>
                <PiXLight size={20}/>
              </button>
            </div>
            <div className='flex w-full h-full no-scrollbar overflow-auto items-center justify-center'>
              <access.Component/>
            </div>
				</div>
				}
				{popupData && popupData.show && 
					<Popup/>
				}
			</GlobalContext.Provider>
    </div>
  )
}

export default App;
