import React, { useState, useEffect, useCallback, useRef, useContext } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import ScaleLoader from 'react-spinners/ScaleLoader'
import Cookies from 'js-cookie'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import InfiniteScroll from 'react-infinite-scroll-component'

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
  FiArrowRight
} from 'react-icons/fi'

import {
  FaAngleRight,
  FaRegTimesCircle
} from 'react-icons/fa'

import { IconContext } from 'react-icons/lib'

const MSGShow = () => {

  const history = useHistory()
  const location = useLocation()

  const { id: threa_id } = useParams()

  const [fileDataURL, setFileDataURL] = useState(null)
  const [files, setFiles] = useState([])

  const [lockUI, setLockUI] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)

  const [msgBlockRefs, setRefs] = useState([])

  const deleteAttachment = () => {
    setFiles([])
  }

  const msgRef = useRef('')

  const [loading, setloading] = useState(true)
  const [messages, setmessages] = useState([])

  const [lastMessageID, setlastMessageID] = useState(null)

  const [skip, setSkip] = useState(0)
  const [isMoreData, setisMoreData] = useState(true)
  const [heigthTop, setheigthTop] = useState(0)

  const [customHeight, setCustomHeight] = useState('56px')

  const [message_id, setMessageID] = useState('')
  const [contact_id, setcontactID] = useState('')
  const [threadName, setThreadName] = useState('')

  useEffect(() => {

    const contact_id = location.state.contact_id
    const thread_name = location.state.name

    setMessageID(threa_id)
    setcontactID(contact_id)
    setThreadName(thread_name)

    if (threa_id) {
      fetchMessages(threa_id, 0, true)
    }

    return () => { }
  }, [])

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
          let message_div = document.getElementById("messages-insider");
          message_div.scrollTop = message_div.scrollHeight;
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
              {/* png, jpg, jpeg, pdf, doc, docx, txt, mov, mp4, mp3, wav */}
            </div>
          </div>
        </div>
    )
  }

  const fetchMessages = (id, skip = 0, _scrollHeight = false) => {
    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    const unique_id = Cookies.get('unique_id', { path: '' }) ?? ''

    if (auth_token != '') {
      axios.get(`/api/threads/thread/${id}?page=${skip}`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (response.status === 200) {
            if (_scrollHeight) {
              setmessages(response.data)
            } else {
              if (response.data.length > 0) {
                setTimeout(() => {
                  setmessages(
                    [
                      ...response.data,
                      ...messages,
                    ]
                  )
                  let message_div = document.getElementById("messages-insider")
                  message_div.scrollTo({ top: heigthTop - 200 })
                }, 100)
              } else {
                setisMoreData(false)
              }
            }

            // scroll to messaging height
            if (_scrollHeight) {
              let message_div = document.getElementById("messages-insider")
              message_div.scrollTop = message_div.scrollHeight
            }
          }

          setTimeout(() => {
            setloading(false)
          }, 1500)
        })
        .catch(error => {
          setTimeout(() => {
            history.replace('/')
          }, 1000)
        })
    }
  }

  const fetchMessagesByUserUID = (cid) => {
    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    const unique_id = Cookies.get('unique_id', { path: '' }) ?? ''

    if (auth_token != '') {
      axios.get(`/api/threads/contact/${cid}`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (response.status === 200) {
            setmessages(response.data)

            setTimeout(() => {
              let message_div = document.getElementById("messages-insider")
              message_div.scrollTop = message_div.scrollHeight
            }, 50)
          }
        })
        .catch(error => {
          setTimeout(() => {
            history.replace('/')
          }, 1000)
        })
    }
  }

  const onMessageChange = (e) => {
    const lines = (e.target.value)?.split('\n')
    const words_mod = ((e.target.value).length / 250).toFixed()

    if (lines.length < 5 && words_mod < 5) {
      const height_for_lines = (lines.length - 1) * 25 + 56
      const height_for_words = (words_mod) * 25 + 56
      const max_height = Math.max(height_for_lines, height_for_words)
      setCustomHeight(max_height.toString() + 'px')
    }

    let message_div = document.getElementById("messages-insider")
    message_div.scrollTop = message_div.scrollHeight
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
      let url = ''
      if (message_id != undefined && message_id != '') {
        url = `/api/threads/thread/message/reply/${message_id}`
      } else if (contact_id != undefined && contact_id != '') {
        url = `/api/threads/thread/contact/reply/${contact_id}`
      }

      axios.post(url, data,
        {
          headers: {
            Authorization: `Bearer ${auth_token}`,
            'Content-Type': 'application/json'
          }
        }
      )
        .then(response => {
          setMessageID(response.data.uid)

          setTimeout(() => {
            setLockUI(false)
          }, 100)

          // ! here we need fetch messages update
          // fetchMessages(response.data.uid)

          setFiles([])
          msgRef.current.value = ''
          setCustomHeight('56px')

        })
        .catch(error => {
          setTimeout(() => {
            history.replace('/')
          }, 100)
        })
    }
  }

  const download_attachments = (id) => {

    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    if (auth_token != '') {
      const url = `/api/threads/attachments/${id}`
      axios.get(url,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${auth_token}`,
            'Content-type': 'application/zip'
          }
        }
      )
        .then(response => {
          let blob = new Blob([response.data], { type: 'application/zip' })
          // let blob = response.blob()
          const url = window.URL.createObjectURL(
            // new Blob([blob]),
            blob
          )
          const link = document.createElement('a')
          link.href = url
          link.setAttribute(
            'download',
            `${id}.zip`,
          )

          // append to html link element page
          document.body.appendChild(link)

          // start download
          link.click()

          // Clean up and remove the link
          link.parentNode.removeChild(link)
        })
        .catch(error => { })
    }
  }

  const onScroll = (event) => {
    setheigthTop(event.target.scrollTop)
  }

  const fetchData = () => {
    if (message_id != undefined && message_id != '') {
      setTimeout(() => {
        fetchMessages(message_id, skip + 1)
      }, 1)
    }
    setSkip(skip + 1)
  }

  return (
    <div>
      {
        loading &&
        <div className="main-loading">
          <ScaleLoader color={'#DD5353'} loading={true} height={48} width={5} radius={4} margin={3} />
          <h4>در حال دریافت پیام‌ها...</h4>
        </div>
      }
      <div className="msg-container">
        <Helmet defer={false}>
          <title>ایران‌چت | {threadName}</title>
        </Helmet>
        <div id="msg-header" onClick={() => { history.goBack() }}>
          <IconContext.Provider value={{ className: "back-icon" }}>
            <FiArrowRight />
          </IconContext.Provider>
          <h4>{threadName}</h4>
        </div>
        <div id="messages-insider">
          <InfiniteScroll
            dataLength={messages.length}
            next={fetchData}
            onScroll={onScroll}
            scrollThreshold={0.5}
            inverse={true}
            hasMore={isMoreData}
            scrollableTarget="messages-insider"
          >
            {
              messages.map((item, index) => {
                return <div key={index} className={`message-box ${item.sender && 'sender'}`}
                  ref={msgBlockRefs[item['id']]} >
                  <div className='col'>
                    <div className="row">
                      <p>{item.message}</p>
                      {
                        item['hasAttachments'] && <div id='attachments' onClick={() => download_attachments(item['uid'])}>
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
                        (item['status'] == 'RECV') && <IconContext.Provider value={{ size: 8, className: "status-icon" }}>
                          {
                            <RiCheckboxBlankCircleFill />
                          }
                        </IconContext.Provider>
                      }

                      {
                        (item['status'] == 'SENT') && <IconContext.Provider value={{ size: 18, className: "status-icon" }}>
                          {
                            <BsCheck />
                          }
                        </IconContext.Provider>
                      }

                      {
                        (item['status'] == 'SEEN') && <IconContext.Provider value={{ size: 18, className: "status-icon" }}>
                          {
                            <BsCheckAll />
                          }
                        </IconContext.Provider>
                      }
                    </div>
                  </div>
                </div>
              })
            }
          </InfiniteScroll>
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
    </div>
  )
}

export default MSGShow
