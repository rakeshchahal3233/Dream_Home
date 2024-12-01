import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice.js'
import OAuth from '../components/OAuth.jsx';

export default function SignIn() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const {loading,error} = useSelector((state)=>state.user)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(signInStart());            // setLoading(true);

      const response = await fetch('/api/auth/signIn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json();
      console.log(data);

      if (data.success === false) {
                                // setError(data.message);
        dispatch(signInFailure(data.message));                // setLoading(false);
        return;
      }

      dispatch(signInSuccess(data));
      setFormData({
        email: '',
        password: ''
      });

      navigate('/')

    } catch (error) {
      dispatch(signInFailure(error.message));                
    }

  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Login</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type='text' placeholder='email' className='border p-3 rounded-lg' id='email' onChange={handleChange} value={formData.email} />
        <input type='password' placeholder='password' className='border p-3 rounded-lg' id='password' onChange={handleChange} value={formData.password} />
        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
          {loading ? "Loading..." : "Login"}
        </button>
        <OAuth/>
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Don't have an account?</p>
        <Link to='/signUp'>
          <span className='text-blue-700'>Sign Up</span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  )
}
