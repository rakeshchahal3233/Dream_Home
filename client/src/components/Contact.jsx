import React, { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'

export default function Contact({listing}) {

  const [owner,setOwner] = useState(null);
  const [message,setMessage] = useState('');

  useEffect(()=>{
    const fetchOwner = async () => {
       try {
        
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();

        if(data.success === false){
          console.log(data.message);
          return;
        }

        setOwner(data);

       } catch (error) {
          console.log(error);
       }
    }

    fetchOwner();

  },[listing.userRef]);

  const handleChange = (e)=>{
    setMessage(e.target.value)
  }

  return (
    <>
    {
      owner && (
        <div className='flex flex-col gap-2'>
          <p>
            Contact to <span className='font-semibold'>{owner.username}</span>for <span className='font-semibold'>{listing.name.toLowerCase()}</span>
          </p>

          <textarea 
          name='message' 
          id='message' 
          rows='2' 
          value={message} 
          onChange={handleChange}
          placeholder='Enter your message here...'
          // className='w-full border-2 border-gray-300 p-2 rounded-md focus:outline-none focus:border-gray-500'
          className='w-full border p-3 rounded-lg'
          >
          </textarea>

          <Link to={`mailto:${owner.email}?subject=Regarding ${listing.name}&body=${encodeURIComponent(message)}`}
          className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95'>Send message</Link>

        </div>
      )
    }
    </>
  )
}
