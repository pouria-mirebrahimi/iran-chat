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

  const submitForm = () => { }

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
          }
        })
        .catch(error => {
          console.log(error.response.data)
        })
    }
  }

  const onMessageChange = (e) => {
    let lines = (e.target.value)?.split('\n')
    if (lines.length < 8) {
      const height = ((lines.length - 1) * 25 + 56).toString() + 'px'
      setCustomHeight(height)
    }
  }


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
        <div id="messages-panel">
          <div id="messages">
            {
              messages.map((item, index) => {
                return <div className={`message-box ${item.sender && 'sender'}`
                }>
                  <div className='col'>
                    {item.message}
                    <div className='row'>
                      <div className='datetime'>
                        <div>{item.datetime}</div>
                        <div>{item.time}</div>
                      </div>
                      <IconContext.Provider value={{ size: 8, className: "status-icon" }}>
                        {
                          item['status'] == 'READ' && <BsCheckAll /> ||
                          item['status'] == 'SENT' && <BsCheck />
                        }
                      </IconContext.Provider>
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
            <div id='send-button-container'>
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
      </div >
    )
}

export default MSGContainer
