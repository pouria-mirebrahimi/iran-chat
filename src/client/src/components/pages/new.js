import React, { useState, useRef, useEffect } from 'react'
import { link, useHistory, useLocation } from 'react-router-dom'
import ScaleLoader from 'react-spinners/ScaleLoader'
import Cookies from 'js-cookie'
import PropTypes from 'prop-types'
import axios from 'axios'

const NewUser = (props) => {

  const nameRef = useRef('')
  const surnameRef = useRef('')
  const aliasRef = useRef('')

  const [submitButtonDisabled, setsubmitButtonDisabled] = useState(false)
  const [hasErrorAlias, setHasErrorAlias] = useState(false)
  const [alias, setAlias] = useState('')

  const [bounce, setbounce] = useState(false)

  const [aliasError, setaliasError] = useState('')

  const history = useHistory()
  const location = useLocation()

  useEffect(() => {
    // get the token from cookies
    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    const unique_id = Cookies.get('unique_id', { path: '' }) ?? ''

    if (auth_token == '') {
      history.replace('/')
    }

    if (location.state == undefined || location.state == '') {
      Cookies.remove('auth_token', { path: '' })
      Cookies.remove('unique_id', { path: '' })

      history.replace(
        {
          pathname: '/'
        }
      )
    } else {
      // todo: check the hash if it's valid
      const hash = location.state.hash
      if (auth_token != '') {
        setsubmitButtonDisabled(false)
        axios.get(`/api/users/user/hash/${hash}`, {
          headers: {
            Authorization: `Bearer ${auth_token}`,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            // # do nothing, pass
          })
          .catch(error => {
            Cookies.remove('auth_token', { path: '' })
            Cookies.remove('unique_id', { path: '' })
            setTimeout(() => {
              history.replace('/')
            }, 100)
          })
      }
    }

    return () => { }
  }, [])

  const onSubmit = () => {
    if (submitButtonDisabled) {
      return
    }

    const alias_tmp = aliasRef.current.value
    if (alias_tmp.length < 1) {
      setbounce(true)
      setTimeout(() => {
        setbounce(false)
      }, 300)
      setaliasError('?????? ???????? ?????????? ???????? ?????? ?????????????? ???????? ?????? ?????? ???????? ???? ???? ?????? ?????????????????')
    } else if (alias_tmp.length < 4) {
      setbounce(true)
      setTimeout(() => {
        setbounce(false)
      }, 300)
      setaliasError('?????????? ???? ?????????? ??????????????????? ???????? ???????? ???? ???????? ?????????? ???????? ???????? ?????? ????????')
    } else {
      const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
      if (auth_token != '') {
        setsubmitButtonDisabled(true)
        axios.put('/api/users/user/', {
          'firstname': nameRef.current.value,
          'lastname': surnameRef.current.value,
          'alias': aliasRef.current.value,
        }, {
          headers: {
            Authorization: `Bearer ${auth_token}`,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (response.status === 200) {
              setTimeout(() => {
                history.replace('/your/messages')
              }, 2000)
            }
          })
          .catch(error => {
            if (error.response.status === 400) {
              setaliasError('?????????? ???????????? ?????? ???????? ?????????? ?? ?????????????? ?? ???????????? ???? ?????????????? ????????')
              setbounce(true)
              setTimeout(() => {
                setsubmitButtonDisabled(false)
                setbounce(false)
              }, 300)
            }
          })
      }
      else {
        setTimeout(() => {
          history.replace('/')
        }, 2000)
      }
    }
  }

  const onChange = (e) => {
    setaliasError('')
  }

  const handleKeyDown = (e) => {
    if (e.key == 'Enter') {
      onSubmit()
    }
  }

  return (
    <div className='window'>
      <div className="layout wide-600px">
        <div className="new-user-panel">
          <h1>?????????????? ??????</h1>
          <h3>???????? ???????? ???? ???????? ???? ?????????????? ?????????? ?????? ?????????????? ????????.</h3>
          <h3>?????? ???????? ?????????????? ????????????????? ???????? ?????? ?????????????? ???? ???? ?????? ?????????? ??????????.</h3>

          <div className='two-col'>
            <div>
              <div className='mt-30' id='label'>??????</div>
              <div className='alias'>
                <input type="text" readOnly={submitButtonDisabled} name='alias'
                  placeholder='?????? ?????? ???? ???????? ????????' autoComplete='off'
                  className={`${hasErrorAlias && 'input-error'}`} ref={nameRef}
                  onKeyDown={handleKeyDown} />
              </div>
            </div>

            <div>
              <div className='mt-30' id='label'>?????? ????????????????</div>
              <div className='alias'>
                <input type="text" readOnly={submitButtonDisabled} name='surname'
                  placeholder='?????? ???????????????? ?????? ???? ???????? ????????' autoComplete='off'
                  className={`${hasErrorAlias && 'input-error'}`} ref={surnameRef}
                  onKeyDown={handleKeyDown} />
              </div>
            </div>
          </div>

          <div className='mt-30' id='label'>????????/?????? ???????????? <span id='required'>*</span></div>
          <div className='alias'>
            <input type="text" readOnly={submitButtonDisabled} name='alias'
              placeholder='???? ???????? ???? ?????? ???????????? ???????? ?????? ???????????? ????????' autoComplete='off'
              className={`${hasErrorAlias && 'input-error'}`} ref={aliasRef} onChange={onChange}
              onKeyDown={handleKeyDown} />
          </div>
          {(aliasError.length > 0) && <div id='error'>{aliasError}</div>}

          <button type="submit" name='submit' className={`mt-40 ${bounce && "btn-bounce"} 
            ${submitButtonDisabled && 'btn-disabled'}`} placeholder='' onClick={onSubmit}>
            {submitButtonDisabled ? <ScaleLoader color={'#DD5353'} loading={true} height={24} width={2} radius={3} margin={2} /> : '?????? ??????????????'}
          </button>

        </div>
      </div>
    </div>
  )
}

export default NewUser
