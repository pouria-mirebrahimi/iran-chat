import React, { useContext, Fragment, useEffect, useState } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import ScaleLoader from 'react-spinners/ScaleLoader'
import PN from "persian-number"
import QRCode from 'qrcode'
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import { hasPersian } from '@persian-tools/persian-tools'
import * as rdd from 'react-device-detect'
import {
  FaRegTimesCircle,
  FaEyeSlash,
  FaEye,
  FaLock,
  FaRegCopyright,
  FaAngleRight,
} from 'react-icons/fa';
import { IconContext } from 'react-icons/lib'

const LoginView = (props) => {

  useEffect(() => {
    return () => {
    }
  }, [])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showEraser, setShowEraser] = useState(false)
  const [showEye, setShowEye] = useState(false)
  const [hasErrorPass, setHasErrorPass] = useState(false)
  const [hasErrorUsername, setHasErrorUsername] = useState(false)
  const [loginButtonDisabled, setLoginButtonDisabled] = useState(false)
  const [bounce, setBounce] = useState(false)
  const [errorMessage, setErrorMessage] = useState('نام کاربری خود را وارد کنید')

  const checkEnterButton = (e) => {
    if (e.key == 'Enter') {
      onLogin()
    }
  }

  const resetPassword = () => { }

  const onErase = () => {
    if (!loginButtonDisabled) {
      setUsername('')
      setHasErrorUsername(false)
      setShowEraser(false)
    }
  }

  async function onLogin(e) {
    if (loginButtonDisabled) {
      return
    }

    let username_has_error = username.length === 0
    let password_has_error = password.length === 0

    if (username_has_error && password_has_error) {
      setHasErrorUsername(true)
      setHasErrorPass(true)
      setBounce(true)
      setTimeout(() => {
        setBounce(false)
      }, 300);
    } else if (username_has_error) {
      setHasErrorUsername(true)
      setBounce(true)
      setTimeout(() => {
        setBounce(false)
      }, 300);
    } else if (password_has_error) {
      setHasErrorPass(true)
      setBounce(true)
      setTimeout(() => {
        setBounce(false)
      }, 300);
    } else {
      setLoginButtonDisabled(true)
      const _username = PN.convertPeToEn(username)
      const _password = PN.convertPeToEn(password)
    }
  }

  const onShowPass = () => {
    if (!loginButtonDisabled)
      setShowEye(!showEye)
  }

  const onChange = (e) => {
    if (e.target.name === 'username') {
      setUsername(PN.convertPeToEn(e.target.value))
      setHasErrorUsername(false)
      setShowEraser(e.target.value.length > 0 ? true : false)
    } else if (e.target.name === 'password') {
      if (hasPersian(e.target.value)) {
        setHasErrorPass(true)
      }
      setHasErrorPass(false)
      setPassword(e.target.value)
    }
  }

  return (
    <div className='window'>
      <div className="layout">

        <div className='login-panel'>
          <h1>ورود به پیام‌ها</h1>
          <h3>برای ورود باید از نام کاربری خود استفاده کنید.</h3>
          <h3>اگر حساب کاربری ندارید، برای شما ساخته خواهد شد.</h3>

          <div className='mt-30' id='label'>نام کاربری (به انگلیسی)</div>
          <div className='username'>
            <input type="text" name='username' placeholder='' autoComplete='off' className={`text-left ${hasErrorUsername && 'input-error'}`} onChange={onChange} value={username} />
            {showEraser && <IconContext.Provider value={{ size: 18, className: "btn-eraser" }}>
              <FaRegTimesCircle onClick={onErase} />
            </IconContext.Provider>}
          </div>
          {hasErrorUsername && <div id='error'>{errorMessage}</div>}

          <div id='label'>رمز عبور</div>
          <div className='password'>
            <input id='login-password-id' type={showEye ? 'text' : 'password'} name='password' className={`text-left ${hasErrorPass && 'input-error'}`} placeholder='' onChange={onChange} onKeyDown={checkEnterButton} />
            {showEye ? <IconContext.Provider value={{ size: 18, className: "btn-eye" }}>
              <FaEye onClick={onShowPass} />
            </IconContext.Provider> : <IconContext.Provider value={{ size: 18, className: "btn-eye" }}>
              <FaEyeSlash onClick={onShowPass} />
            </IconContext.Provider>}
          </div>
          {hasErrorPass && <div id='error'>رمز عبور را به صورت صحیح وارد کنید</div>}

          <button type="submit" name='submit' className={`mt-40 ${bounce && "btn-bounce"} ${loginButtonDisabled && 'btn-disabled'}`} placeholder='' onClick={onLogin}>
            {loginButtonDisabled ? <ScaleLoader color={'#DD5353'} loading={true} height={24} width={2} radius={3} margin={2} /> : 'ورود / ثبت‌نام'}
          </button>

        </div>

      </div>
    </div>
  )
}

export default LoginView