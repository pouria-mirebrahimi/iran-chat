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

  const getLocationData = async () => {
    const res = await axios.get('https://geolocation-db.com/json/')
    setIP(res.data.IPv4)
    setCountryCode(res.data.country_code)
    setCountryName(res.data.country_name)
    setLatitude(res.data.latitude)
    setLongitude(res.data.longitude)

    getDetailedData(res.data.latitude, res.data.longitude)
  }

  const getDetailedData = async (lat, lon) => {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    )

    setCity(res.data.address.city)
    setDistrict(res.data.address.district)
    setPostCode(res.data.address.postcode)
    setCounty(res.data.address.county)
    setState(res.data.address.state)
  }

  const [IP, setIP] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [countryName, setCountryName] = useState('')
  const [latitude, setLatitude] = useState(0.0)
  const [longitude, setLongitude] = useState(0.0)
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [postCode, setPostCode] = useState('')
  const [county, setCounty] = useState('')
  const [state, setState] = useState('')

  useEffect(() => {
    getLocationData()

    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    const unique_id = Cookies.get('unique_id', { path: '' }) ?? ''

    if (auth_token !== '') {
      checkActiveUser(auth_token)
    }

    return () => { }
  }, [])

  const history = useHistory()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showEraser, setShowEraser] = useState(false)
  const [showEye, setShowEye] = useState(false)
  const [hasErrorPass, setHasErrorPass] = useState(false)
  const [hasErrorUsername, setHasErrorUsername] = useState(false)
  const [loginButtonDisabled, setLoginButtonDisabled] = useState(false)
  const [bounce, setBounce] = useState(false)
  const [errorMessageUser, setErrorMessageUser] = useState('نام کاربری خود را وارد کنید')
  const [errorMessagePass, setErrorMessagePass] = useState('رمز عبور خود را وارد کنید')
  const [usernameRule, setUsernameRule] = useState(false)
  const [passwordRule, setPasswordRule] = useState(false)
  const [loginDateTime, setLoginDateTime] = useState('')

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

  async function checkActiveUser(auth_token) {
    axios.get('/api/users/user/active',
      {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      }
    )
      .then(response => {
        console.log(response.data)
      })
      .catch(error => {
        // Cookies.remove('auth_token', { path: '' })
        console.log(error.response.data)
      })
  }

  async function onLogin(e) {
    if (loginButtonDisabled) {
      return
    }

    let username_has_error = false,
      password_has_error = false

    const _username = PN.convertPeToEn(username)
    const _password = PN.convertPeToEn(password)

    if (_username.length === 0) {
      username_has_error = true
      setErrorMessageUser('نام کاربری خود را وارد کنید')
    } else if (!/^[A-Za-z][A-Za-z0-9_]{10,80}$/.test(_username)) {
      username_has_error = true
      setErrorMessageUser('نام کاربری شما مطابق الگوی مجاز نیست')
    }

    if (_password.length === 0) {
      password_has_error = true
      setErrorMessagePass('رمز عبور خود را وارد کنید')
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#^()%*?&])[A-Za-z\d@$!%*?&]/.test(_password)) {
      password_has_error = true
      setErrorMessagePass('رمز عبور شما مطابق الگوی مجاز نیست')
    }

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

      let data = {
        username: username,
        password: password,
      }

      axios.post(
        '/api/users/user/sign/in', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        Cookies.set('auth_token', response.data.auth_token, { expires: 1.0 / 24, path: '' })
        Cookies.set('unique_id', response.data.unique_id, { expires: 1.0 / 24, path: '' })


        if (response.data.showingname) {
          save_login_info('new user', response.data.auth_token)
          setTimeout(() => {
            history.replace('/your/name')
          }, 1000)
        } else {
          save_login_info('login', response.data.auth_token)
          setTimeout(() => {
            history.replace('/your/messages')
          }, 1000)
        }
      })
        .catch((error) => {
          setLoginButtonDisabled(false)
        })
    }
  }

  const save_login_info = async (stat, auth_token,) => {
    const userParameters = {
      isMobile: rdd.isMobileOnly,
      isTablet: rdd.isTablet,
      isDesktop: rdd.isDesktop,
      isSmartTV: rdd.isSmartTV,
      isWearable: rdd.isWearable,
      isConsole: rdd.isConsole,
      isEmbedded: rdd.isEmbedded,
      isAndroid: rdd.isAndroid,
      isWinPhone: rdd.isWinPhone,
      isIOS: rdd.isIOS,
      isChrome: rdd.isChrome,
      isFirefox: rdd.isFirefox,
      isSafari: rdd.isSafari,
      isOpera: rdd.isOpera,
      isIE: rdd.isIE,
      isEdge: rdd.isEdge,
      isYandex: rdd.isYandex,
      isChromium: rdd.isChromium,
      isMobileSafari: rdd.isMobileSafari,
      isSamsungBrowser: rdd.isSamsungBrowser,
      osVersion: rdd.osVersion,
      osName: rdd.osName,
      fullBrowserVersion: rdd.fullBrowserVersion,
      browserVersion: rdd.browserVersion,
      browserName: rdd.browserName,
      mobileVendor: rdd.mobileVendor,
      mobileModel: rdd.mobileModel,
      engineName: rdd.engineName,
      engineVersion: rdd.engineVersion,
      isWindows: rdd.isWindows,
      isMacOs: rdd.isMacOs,
      auth_token: auth_token,
      status: stat,
      ip: IP,
      latitude: latitude,
      longitude: longitude,
      countryCode: countryCode,
      countryName: countryName,
      city: city,
      district: district,
      postCode: postCode,
      county: county,
      state: state,
    }

    axios.post('/api/users/user/login/info', userParameters,
      {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      }
    )
      .then(response => {
        setLoginDateTime(response.data.datetime)
      })
      .catch(error => { })
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
            <input type="text" readOnly={loginButtonDisabled} name='username' placeholder='' autoComplete='off' className={`text-left ${hasErrorUsername && 'input-error'}`}
              onChange={onChange} value={username} onFocus={() => { setUsernameRule(true) }}
              onBlur={() => { setUsernameRule(false) }} />
            {showEraser && <IconContext.Provider value={{ size: 18, className: "btn-eraser" }}>
              <FaRegTimesCircle onClick={onErase} />
            </IconContext.Provider>}
          </div>
          {hasErrorUsername && <div id='error'>{errorMessageUser}</div>}
          <div className={`username_rules ${!usernameRule && "d-none"}`}>
            <h5>قوانین نام کاربری:</h5>
            <ul>
              <li>حروف باید انگلیسی باشند</li>
              <li>حروف کوچک مجاز است</li>
              <li>حروف بزرگ مجاز است</li>
              <li>علامت underline مجاز است</li>
              <li>شروع با عدد مجاز نیست</li>
              <li>تعداد کاراکتر بین ۱۰ تا ۸۰ باشد</li>
            </ul>
          </div>

          <div id='label'>رمز عبور</div>
          <div className='password'>
            <input id='login-password-id' readOnly={loginButtonDisabled} type={showEye ? 'text' : 'password'} name='password'
              className={`text-left ${hasErrorPass && 'input-error'}`} placeholder='' onChange={onChange}
              onKeyDown={checkEnterButton} onFocus={() => { setPasswordRule(true) }}
              onBlur={() => { setPasswordRule(false) }} />
            {showEye ? <IconContext.Provider value={{ size: 18, className: "btn-eye" }}>
              <FaEye onClick={onShowPass} />
            </IconContext.Provider> : <IconContext.Provider value={{ size: 18, className: "btn-eye" }}>
              <FaEyeSlash onClick={onShowPass} />
            </IconContext.Provider>}
          </div>
          {hasErrorPass && <div id='error'>{errorMessagePass}</div>}
          <div className={`password_rules ${!passwordRule && "d-none"}`}>
            <h5>قوانین رمز عبور:</h5>
            <ul>
              <li>حروف باید انگلیسی باشند</li>
              <li>شامل حداقل یک حرف کوچک باشد</li>
              <li>شامل حداقل یک حرف بزرگ باشد</li>
              <li>شامل حداقل یک عدد باشد</li>
              <li>شامل حداقل یکی از حروف !@#$%^&*()? باشد</li>
              <li>تعداد کاراکتر بیشتر از ۸ باشد</li>
            </ul>
          </div>

          <button type="submit" name='submit' className={`mt-40 ${bounce && "btn-bounce"} ${loginButtonDisabled && 'btn-disabled'}`} placeholder='' onClick={onLogin}>
            {loginButtonDisabled ? <ScaleLoader color={'#DD5353'} loading={true} height={24} width={2} radius={3} margin={2} /> : 'ورود / ثبت‌نام'}
          </button>

        </div>

      </div>
    </div>
  )
}

export default LoginView