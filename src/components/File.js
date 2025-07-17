import React, {useEffect,useState,useContext,useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams,NavLink } from 'react-router-dom';
import { PiDownload, PiDownloadSimple, PiFileDocLight, PiFileLight, PiFilePdfLight, PiFolderFill, PiFolderLight } from 'react-icons/pi';
import {useData} from '../data';
import Detail from './Detail';
import ContentContainer from './ContentContainer';

const File = () => {
    const [currentUser,setCurrentUser] = useState(null);
    const [loading,setLoading] = useState(false);
    const [parent,setParent] = useState('');
    const location = useLocation();
    const pathname = useLocation().pathname;
    const {path} = useParams();
    const [file,setFile] = useState(null);
    const {request} = useData();
    const { state } = location;

    const getFile = async (user) => {
        if(user) {
            await request('GET','file',null,{path:path?path:user.id},true)
            .then((response) => {
                if(response.content) {
                    console.log(response.content)
                    setFile(response.content);
                }  else {
                    setFile(null);
                }
            })
            .catch((error) => {
                setFile(null);
            })
        }
    }

    const load = async () => {
        let user = null
        await request('GET','current',null,null,true)
        .then(async (currentResponse) => {
            if(currentResponse.status && currentResponse.status === 'SUCCESSFUL' && currentResponse.content && currentResponse.content.user && currentResponse.content.user.status === 'ACTIVE') {
                currentResponse.content.user.dateOfBirth = currentResponse.content.user.dateOfBirth?new Date(currentResponse.content.user.dateOfBirth):new Date();
                user = currentResponse.content.user;
                setCurrentUser(currentResponse.content.user);
            } else {
                setCurrentUser(false);
            }
        })
        .catch((error) => {
            console.error(error);
        })
        setLoading(true);
        getFile(user);
        setParent(pathname.replace(/^(.*)\-.*$/,'$1')) // Remove last string after '-'
        setLoading(false);
    }

    useEffect(() => {
        load()
    },[path])

  return (
    <ContentContainer previous={parent && parent != pathname?parent:''} Icon={PiFolderFill} text={currentUser && file && currentUser.id == file.name?'My Files':file?file.name:''} loading={loading}>
        {file &&
            <div className='flex flex-col w-full h-fit space-y-4'>
                <div className='flex flex-col w-full h-auto space-y-2'>
                    {file.children && file.children.length > 0 && 
                        file.children.map((child,i) => <FileItem key={i} file={child}/>)
                    }
                </div>
            </div>
        }
    </ContentContainer>
  )
}

export default File

const FileItem = ({file}) => {
    const [highlighted,setHighlighted] = useState(false);
    const {download} = useData();

    const onDownload = (e) => {
        e.preventDefault();
        if(file) {
            download('/file/download',{path:file.path},true)
            .then((response) => {
                if(response instanceof Blob) {
                    const href = URL.createObjectURL(response);
                    // create "a" HTML element with href to file & click
                    const link = document.createElement('a');
                    link.href = href;
                    link.setAttribute('download', file.path); //or any other extension
                    document.body.appendChild(link);
                    link.click();

                    // clean up "a" element & remove ObjectURL
                    document.body.removeChild(link);
                    URL.revokeObjectURL(href);
                }
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {file &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                {file.children && file.children.length > 0? 
                <NavLink to={`/file/${file.path}`}>
                    <div className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                        <FileIcon filename={file.name} size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                        <div className='flex flex-col w-full h-fit items-start'>
                            <span className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis`}>
                                {file.name}
                            </span>
                        </div>
                    </div>
                </NavLink>
                :
                <>
                <div className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                    <FileIcon filename={file.name} size={40}/>
                    <div className='flex flex-col w-full h-fit items-start'>
                        <span className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis`}>
                            {file.name}
                        </span>
                    </div>
                    
                </div>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && 
                        <button 
                            onClick={onDownload}
                            className='flex w-10 h-10 items-center justify-center shrink-0 hover:bg-[rgba(0,0,0,.06)] rounded-full'>
                            <PiDownloadSimple size={20} className='flex shrink-0'/>
                        </button>
                    }
                </div>
                </>
                }
            </div>}
        </div>
    )
}

const FileIcon = ({filename,size}) => {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) {
        return <PiFolderLight size={size} className='text-[rgb(0,175,240)]'/>;
    }
    let ext = filename.substring(lastDotIndex + 1)                                                                
    if(ext === 'pdf') {
        return <PiFilePdfLight size={size} className='text-[rgb(0,175,240)]'/>
    } else if(ext === 'doc' || ext === 'docx') {
        return <PiFileDocLight size={size} className='text-[rgb(0,175,240)]'/>
    } else {
        return <PiFileLight size={size} className='text-[rgb(0,175,240)]'/>
    }
}



