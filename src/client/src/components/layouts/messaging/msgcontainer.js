import React, { useState, useEffect, useCallback, useRef, useContext } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import ScaleLoader from 'react-spinners/ScaleLoader'
import Cookies from 'js-cookie'
import PropTypes from 'prop-types'
import axios from 'axios'

import { numberToWords } from '@persian-tools/persian-tools'

import {
  BsCheck,
  BsCheckAll,
  BsClock,
  BsInfoCircle
} from 'react-icons/bs'

import {
  RiCheckboxBlankCircleFill,
  RiAttachment2,
} from 'react-icons/ri'

import {
  IoSend
} from 'react-icons/io5'

import {
  MdAttachFile, MdSettingsInputAntenna
} from 'react-icons/md'

import {
  HiOutlineDocumentDownload
} from 'react-icons/hi'

import {
  FaAngleRight,
  FaRegTimesCircle
} from 'react-icons/fa'

import { IconContext } from 'react-icons/lib'

import MessagingContext from '../../../context/messaging/context'

const MSGContainer = () => {

  const messagingContext = useContext(MessagingContext)

  const [fileDataURL, setFileDataURL] = useState(null)
  const [files, setFiles] = useState([])

  const [lockUI, setLockUI] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)

  const [msgBlockRefs, setRefs] = useState([])

  const deleteAttachment = () => {
    setFiles([])
  }

  const msgRef = useRef('')

  const {
    id,
    setMessageID,
  } = messagingContext

  const [loading, setloading] = useState(true)
  const [messages, setmessages] = useState([])

  const [lastMessageID, setlastMessageID] = useState(null)

  const [customHeight, setCustomHeight] = useState('56px')

  useEffect(() => {
    if (id != undefined) {
      fetchMessages(id)
    } else {
      setTimeout(() => {
        setloading(false)
      }, 1000)
    }
    return () => { }
  }, [id])

  function MyDropzone() {
    const onDrop = useCallback((acceptedFiles) => {
      setFiles(acceptedFiles)

      acceptedFiles.forEach((file) => {
        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => {
          const binaryStr = reader.result
          setFileDataURL(binaryStr)
        }
        reader.readAsDataURL(file)
      })



    }, [])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    return (
      files.length > 0 ?
        <div className="drag-and-drop c-default">
          <div className='container'>
            <div onClick={deleteAttachment} className={`${lockUI && 'disabled'}`}>
              <IconContext.Provider value={{ className: "icon" }}>
                <FaRegTimesCircle />
              </IconContext.Provider>
            </div>
          </div>
        </div>
        :
        <div {...getRootProps()} className={`drag-and-drop ${lockUI && 'disabled'}`}>
          <input {...getInputProps()} />
          <div className='container'>

            <IconContext.Provider value={{ className: "icon" }}>
              <RiAttachment2 />
            </IconContext.Provider>
            {/* <p>کلیک کنید، یا فایل‌های ضمیمه خود را به این قسمت بکشید.</p> */}

            <div>
              {/* png, jpg, jpeg, pdf, doc, docx, txt */}
            </div>
          </div>
        </div>
    )
  }

  const fetchMessages = (_id) => {
    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    const unique_id = Cookies.get('unique_id', { path: '' }) ?? ''

    if (auth_token != '') {
      axios.get(`/api/messages/${_id}`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (response.status === 200) {
            setmessages(response.data)
            let tempMsgs = response.data
            const refs = tempMsgs.reduce((res, inp) => {
              res[inp.id] = React.createRef()
              return res
            }, {})
            setRefs(refs)

            setTimeout(() => {
              let msg_id = tempMsgs[tempMsgs.length - 1]['id']
              setlastMessageID(msg_id)
              refs[msg_id].current.scrollIntoView({
                behavior: 'smooth',
                duration: 100,
                block: 'end',
              })
            }, 100)
          }
        })
        .catch(error => {
          console.log(error.response.data)
        })
    }
  }

  const onMessageChange = (e) => {
    let lines = (e.target.value)?.split('\n')
    if (lines.length < 5) {
      const height = ((lines.length - 1) * 25 + 56).toString() + 'px'
      setCustomHeight(height)
    }

    let tempMsgs = messages
    const refs = tempMsgs.reduce((res, inp) => {
      res[inp.id] = React.createRef()
      return res
    }, {})
    setRefs(refs)

    setTimeout(() => {
      let msg_id = tempMsgs[tempMsgs.length - 1]['id']
      setlastMessageID(msg_id)
      refs[msg_id].current.scrollIntoView({
        behavior: 'smooth',
        duration: 100,
        block: 'end',
      })
    }, 100)
  }

  const sendMessage = () => {
    let errorForMsg = false

    let msg = msgRef.current.value.trim()
    if (msg == '' && files.length == 0) {
      return
    }

    setLockUI(true)

    let data = new FormData()
    files.forEach(element => {
      data.append('file', element)
    })

    let otherData = {
      message: msgRef.current.value,
    }

    data.append('documents', JSON.stringify(otherData))

    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    if (auth_token != '') {
      axios.post(`/api/messages/reply/${id}`, data,
        {
          headers: {
            Authorization: `Bearer ${auth_token}`,
            'Content-Type': 'application/json'
          }
        }
      )
        .then(response => {
          console.log(response.data)

          setTimeout(() => {
            setLockUI(false)
          }, 100)

          // ! here we need fetch messages update
          fetchMessages(id)

          setFiles([])
          msgRef.current.value = ''

        })
        .catch(error => {
          console.log(error.response.data)
          setTimeout(() => {
            setLockUI(false)
          }, 100)
        })
    }
  }

  const download_attachments = () => { }


  if (loading)
    return (
      <div className="main-loading">
        <ScaleLoader color={'#DD5353'} loading={true} height={48} width={5} radius={4} margin={3} />
        <h4>در حال دریافت پیام‌ها...</h4>
      </div>
    )
  else if (id == undefined)
    return (
      <div className="window msg-container">
        <div id="no-message">
          <h4>هیچ پیامی انتخاب نشده است!</h4>
        </div>
      </div>
    )
  else
    return (
      <div className="msg-container">
        <div id="messages-insider">
          {
            messages.map((item, index) => {
              return <div key={index} className={`message-box ${item.sender && 'sender'}`}
                ref={msgBlockRefs[item['id']]} >
                <div className='col'>
                  <div className="row">
                    <p>{item.message}</p>
                    {
                      item['hasAttachments'] && <div id='attachments' onClick={() => download_attachments(item['id'])}>
                        <IconContext.Provider value={{ className: "download-icon" }}>
                          <HiOutlineDocumentDownload />
                        </IconContext.Provider>
                      </div>
                    }
                  </div>
                  <div className='row'>
                    <div className='datetime'>
                      <div>{item.datetime}</div>
                      <div>{item.time}</div>
                    </div>
                    {
                      item['status'] == 'RECV' && <IconContext.Provider value={{ size: 8, className: "status-icon" }}>
                        {
                          <RiCheckboxBlankCircleFill />
                        }
                      </IconContext.Provider>
                    }
                    {
                      (item['status'] == 'SEEN' && item['sender']) && <IconContext.Provider value={{ size: 18, className: "status-icon" }}>
                        {
                          <BsCheckAll />
                        }
                      </IconContext.Provider>
                    }
                    {
                      (item['status'] == 'SENT' && item['sender']) && <IconContext.Provider value={{ size: 18, className: "status-icon" }}>
                        {
                          <BsCheck />
                        }
                      </IconContext.Provider>
                    }
                  </div>
                </div>
              </div>
            })
          }
        </div>
        <div id="send-message">
          <MyDropzone />
          <textarea type='text' rows={1} name='message' style={{ height: customHeight }}
            ref={msgRef} placeholder='متن پیام...'
            onChange={onMessageChange}
          />
          <div id='send-button-container' onClick={sendMessage}>
            <IconContext.Provider value={{ size: 24, className: "send-button" }}>
              <IoSend />
            </IconContext.Provider>
          </div>
        </div>
        {
          files.length > 0 &&
          <div id='attachments-details'>
            <IconContext.Provider value={{ size: 12, className: "info-icon" }}>
              <BsInfoCircle />
            </IconContext.Provider>
            {numberToWords(files.length)} فایل ضمیمه شده است:
            <span>{
              files.map((item, i) => {
                return <span id='attach-files' key={i}>
                  {
                    (item.name.length > 15) ?
                      `${item.name.substring(0, 10)}~${item.name.substring(item.name.length - 8, item.name.length)}` :
                      item.name
                  }
                </span>
              })
            }</span>
          </div>
        }
      </div>
    )
}

export default MSGContainer
