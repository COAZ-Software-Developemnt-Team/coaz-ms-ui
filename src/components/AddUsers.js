import React, {useState,useEffect,useContext,useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { BiSolidCloudUpload } from "react-icons/bi";
import AddUsersTable from './AddUsersTable';
import AddUsersResultsTable from './AddUsersResultsTable';
import FormDialog from './FormDialog';
import { usePapaParse } from 'react-papaparse';
import { sex } from '../constants';
import { useData } from '../App';

const AddUsers = ({reload}) => {
    const {setDialog} = useContext(GlobalContext);
    const [pages,setPages] = useState([]);
    const [totalElements,setTotalElements] = useState(0);
    const [resultsPages,setResultsPages] = useState([]);
    const [message,setMessage] = useState({content:'',success:false});
    const [showResults,setShowResults] = useState(false);
    const [districts,setDistricts] = useState([]);
    const [nationalities,setNationalities] = useState([]);
    const [professionalCategories,setProfessionalCategories] = useState([]);
    const [request] = useData();
    const mainContainerRef = useRef(null);

    const { readString } = usePapaParse();
    const pageSize = 10;
    let fileReader;
    
    const handleFileRead = (e) => {
        const content = fileReader.result;
        readString(content, {
            header: true,
            worker: true,
            complete: (results) => {
                let newPages = [];
                let count = 0;
                for(let i = 0;i < results.data.length;) {
                    let page = [];
                    for(let j = 0;j < pageSize;j++) {
                        if(i < results.data.length) {
                            let gendar = null;
                            let nationality = null;
                            let professionalCategory = null;
                            let district = null;

                            if(results.data[i].sex && sex && sex.length > 0) {
                                gendar = sex.find((sx) => {return sx.trim().toLowerCase() == results.data[i].sex.trim().toLowerCase()});
                            } else {
                                gendar = null;
                            }
                            
                            if(results.data[i].nationality && nationalities && nationalities.length > 0) {
                                nationality = nationalities.find((nation) => {return nation.trim().toLowerCase() == results.data[i].nationality.trim().toLowerCase()});
                            } else {
                                nationality = null;
                            }

                            if(results.data[i].professionalCategory && professionalCategories && professionalCategories.length > 0) {
                                professionalCategory = professionalCategories.find((category) => {return category.trim().toLowerCase() == results.data[i].professionalCategory.trim().toLowerCase()});
                            } else {
                                professionalCategory = null;
                            }
                                
                            if(results.data[i].district && districts && districts.length > 0) {
                                district = districts.find((dist) => {return dist.name.trim().toLowerCase() == results.data[i].district.trim().toLowerCase()});
                            } else {
                                district = null;
                            }
                            
                            let user = {
                                username:results.data[i].username?results.data[i].username:'',
                                email:results.data[i].email?results.data[i].email:'',
                                firstname:results.data[i].firstname?results.data[i].firstname:'',
                                lastname:results.data[i].lastname?results.data[i].lastname:'',
                                middlename:results.data[i].middlename?results.data[i].middlename:'',
                                sex:gendar,
                                dateOfBirth: new Date(Date.UTC(results.data[i].dobYear?results.data[i].dobYear:0,results.data[i].dobMonth?results.data[i].dobMonth - 1:0,results.data[i].dobDay?results.data[i].dobDay:0)),
                                idType:results.data[i].idType?results.data[i].idType.toUpperCase():null,
                                idNumber:results.data[i].idNumber?results.data[i].idNumber:'',
                                nationality:nationality,
                                phone1:results.data[i].phone1?results.data[i].phone1:'',
                                phone2:results.data[i].phone2?results.data[i].phone2:'',
                                physicalAddress:results.data[i].physicalAddress?results.data[i].physicalAddress:'',
                                postalAddress:results.data[i].postalAddress?results.data[i].postalAddress:'',
                                district:district,	
                                program:results.data[i].program?results.data[i].program:'',
                                institution:results.data[i].institution?results.data[i].institution:'',
                                professionalCategory:professionalCategory,
                                employed:results.data[i].employed?results.data[i].employed:'',
                                employer:results.data[i].employer?results.data[i].employer:'',
                                organizationalUnit:results.data[i].organizationalUnit?results.data[i].organizationalUnit:'',
                                currentPosition:results.data[i].currentPosition?results.data[i].currentPosition:'',
                                facility:results.data[i].facility?results.data[i].facility:''
                            }
                            count++;
                            page.push(user);
                        }
                        i++;
                    }
                    newPages.push(page);
                }
                setTotalElements(count);
                setPages(newPages);
            },
        });
    }

    const handleFileChosen = (file) => {
        let type = file.name.split('.').pop();
        if(type === 'csv') {
            fileReader = new FileReader();
            fileReader.onload = handleFileRead;
            fileReader.readAsText(file);
        }
    }

    const setResults = (results,msg) => {
        let newPages = [];
        let count = 0;
        for(let i = 0;i < results.length;) {
            let page = [];
            for(let j = 0;j < pageSize;j++) {
                if(i < results.length) {
                    let userResult = results[i];
                    if(userResult) {
                        let user = {
                            username:userResult.username?userResult.username:'',
                            firstname:userResult.firstname?userResult.firstname:'',
                            lastname:userResult.lastname?userResult.lastname:'',
                            middlename:userResult.middlename?userResult.middlename:'',
                            sex:userResult.sex?userResult.sex.toUpperCase():'',
                            dateOfBirth: new Date(userResult.dateOfBirth?userResult.dateOfBirth:0),
                            idType:userResult.idType?userResult.idType.toUpperCase():'',
                            idNumber:userResult.idNumber?userResult.idNumber:'',
                            nationality:userResult.nationality?userResult.nationality:'',
                            email:userResult.email?userResult.email:'',
                            phone1:userResult.phone1?userResult.phone1:'',
                            phone2:userResult.phone2?userResult.phone2:'',
                            physicalAddress:userResult.physicalAddress?userResult.physicalAddress:'',
                            postalAddress:userResult.postalAddress?userResult.postalAddress:'',
                            district:userResult.district?userResult.district:'',	
                            program:userResult.program?userResult.program:'',
                            institution:userResult.institution?userResult.institution:'',
                            professionalCategory:userResult.professionalCategory?userResult.professionalCategory:'',
                            employed:userResult.employed?userResult.employed:'',
                            employer:userResult.employer?userResult.employer:'',
                            organizationalUnit:userResult.organizationalUnit?userResult.organizationalUnit:'',
                            currentPosition:userResult.currentPosition?userResult.currentPosition:'',
                            facility:userResult.facility?userResult.facility:'',
                            selfRegistration:userResult.selfRegistration?userResult.selfRegistration:'',
                            createdOnDay:new Date(userResult.createdOnDay?userResult.createdOnDay:0),
                            status:userResult.status?userResult.status:''
                        }
                        page.push(user);
                        count++;
                    }
                    i++;
                } 
                else {
                    break;
                }
            }
            newPages.push(page);
        }
        setTotalElements(count);
        setResultsPages(newPages);
        setMessage(msg)
        setShowResults(true);
    }

    useEffect(() => {
        request('GET','districts',null,null,false)
        .then((response) => {
            if(response.content && response.content.length > 0) {
                setDistricts(response.content);
            }  else {
                setDistricts([]);
            }
        })
        .catch((error) => {
            setDistricts([]);
        })

        request('GET','nationalities',null,null,false)
        .then((response) => {
            if(response.content && response.content.length > 0) {
                setNationalities(response.content);
            }  else {
                setNationalities([]);
            }
        })
        .catch((error) => {
            setNationalities([]);
        })

        request('GET','professionalcategories',null,null,false)
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

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                let height = entry.target.getBoundingClientRect().height;
            }
        });

        if(mainContainerRef.current) {
            observer.observe(mainContainerRef.current)
        }
        return () => {
            observer.disconnect();
        }
    },[]);

  return (
    <FormDialog title='Add Users'>
        <div className='flex w-[90vw] lg:w-[800px]  h-[90vh]'>
         {(pages.length > 0?
            showResults?
                <AddUsersResultsTable pages={resultsPages} pageSize={pageSize} totalElements={totalElements} setResults={setResults} message={message}/>
            :
                <AddUsersTable pages={pages} pageSize={pageSize} totalElements={totalElements} setResults={setResults} reload={reload}/>
            :
            <div className='flex w-full h-full p-8'>
                <div id="drop_zone" 
                    onDrop={(e) => {
                        e.preventDefault();
                        handleFileChosen(e.dataTransfer.files[0]);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                    }}
                    className='flex flex-col w-full h-full items-center justify-center font-jostBook text-[rgb(93,93,93)] bg-[rgb(247,247,247)] border border-[rgb(200,200,200)] border-dashed rounded-lg'>
                    <BiSolidCloudUpload size={64} className='text-[rgb(0,175,240)]'/>
                    <p className='text-xl'>Drag and drop csv files here</p>
                    <p className=''>-or-</p>
                    <input
                        type='file'
                        id='img'
                        name='userImage'
                        accept='.csv'
                        className='hidden'
                        onChange={(e) => {
                            handleFileChosen(e.target.files[0]);
                        }}
                    />
                    <label 
                        htmlFor='img' 
                        className='flex shrink-0 w-auto h-10 items-center justify-center text-xl hover:text-[rgb(0,175,240)]'
                    >
                        Browse
                    </label>
                </div>
            </div>
        )}
        </div>
    </FormDialog>
  )
}

export default AddUsers