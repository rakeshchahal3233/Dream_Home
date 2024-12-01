import { useDispatch, useSelector } from 'react-redux'
import { useRef, useState, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signOutUserStart, signOutUserSuccess, signOutUserFailure } from '../redux/user/userSlice.js'
import { Link } from 'react-router-dom'

export default function Profile() {

  const dispatch = useDispatch();

  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [checkChange, setCheckChange] = useState(true)
  const [showListingError, setShowListingError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  // console.log(formData)
  // console.log(fileUploadError)

  //firebase storage
  // allow read;
  // allow write:if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')


  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);                   //This is for make a refrence of stroage and name that storage
    const uploadTask = uploadBytesResumable(storageRef, file);   //This is for upload the file on that storage

    setCheckChange(false);

    uploadTask.on('state_changed',                      //This is for show the uploading status
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log("upload is " + progress + " % done");
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },

      () => {
        getDownloadURL(uploadTask.snapshot.ref).then
          ((downloadURL) => {
            setFormData({ ...formData, avatar: downloadURL });
          })
      }
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
    setCheckChange(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      dispatch(updateUserStart());

      const response = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        setCheckChange(true);
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);

    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setCheckChange(true);
    }

    setCheckChange(true);
  }

  const handleDeleteUser = async () => {
    try {

      dispatch(deleteUserStart());
      const response = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));

    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignOut = async () => {

    try {
      dispatch(signOutUserStart());

      const response = await fetch('/api/auth/signOut');

      const data = response.json();

      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }

      dispatch(signOutUserSuccess(data));

    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }

  }

  const handleShowListing = async () => {
    try {
      setShowListingError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);

      const data = await res.json();

      if (data.success === false) {
        setShowListingError(true);
        return;
      }

      setUserListings(data);

    } catch (error) {
      setShowListingError(true);

    }
  }

  const handleListingDelete = async (listingId) => {
    try {

      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId))

    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />

        <img
          onClick={() => fileRef.current.click()}
          className='rounded-full h-24 w-24 object-cover self-center mt-2 cursor-pointer'
          src={formData.avatar || currentUser.avatar}
        />

        {/* <span className='text-center text-sm border w-10 mx-auto bg-slate-300' style={{marginTop:'-37px',borderRadius:'50px'}}>edit</span> */}

        <p className='text-sm self-center'>
          {fileUploadError ?
            (<span className='text-red-700'>Error image upload</span>)
            :
            filePerc > 0 && filePerc < 100
              ? (
                <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
              )
              :
              filePerc === 100 && !fileUploadError ? (
                <span className='text-green-700'>Image successfully uploaded!</span>
              ) : ""
          }
        </p>

        <input
          className='border p-3 rounded-lg'
          type='text' placeholder='username'
          id='username'
          defaultValue={currentUser.username}
          onChange={handleChange}
        />

        <input
          className='border p-3 rounded-lg'
          type='email'
          placeholder='email'
          id='email'
          defaultValue={currentUser.email}
          onChange={handleChange}
        />

        <input
          className='border p-3 rounded-lg'
          type='password'
          placeholder='password'
          id='password'
          onChange={handleChange}
        />

        <button disabled={loading || checkChange} className='border p-3 rounded-lg bg-slate-700 text-white uppercase hover:opacity-95 disabled:opacity-70'>
          {loading ? 'Loading...' : 'Update'}
        </button>

        <Link to={'/create-Listing'} className='bg-green-700 text-white p-3 rounded-lg text-center uppercase hover:opacity-95'>
          cretae Listing
        </Link>

      </form>

      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer' onClick={handleDeleteUser}>Delete account</span>
        <span className='text-red-700 cursor-pointer' onClick={handleSignOut}>Logout</span>
      </div>

      <p className='text-red-700 mt-5'>{error ? error : ""}</p>
      <p className='text-green-700 mt-5'>{updateSuccess ? 'User is updated successfully!' : ''}</p>

      <button onClick={handleShowListing} className='text-green-700 w-full'>Show listings</button>
      <p className='text-red-700 mt-5'>{showListingError ? 'Error showing listing' : ''}</p>

      {userListings && userListings.length > 0 &&
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 font-semibold text-2xl'>Your Listing</h1>
          {
            userListings.map((listing) => (
              <div key={listing._id} className='border p-3 rounded-lg mt-5 flex items-center justify-between gap-4'>

                <Link to={`/listing/${listing._id}`}>
                  <img className='w-20 h-20 object-cover' src={listing.imageUrls[0]} alt='listing image' />
                </Link>

                <Link to={`/listing/${listing._id}`} className='text-slate-700 font-semibold truncate hover:underline flex-1'>
                  <p>{listing.name}</p>
                </Link>

                <div className='flex flex-col items-center'>
                  <button onClick={() => handleListingDelete(listing._id)} className='text-red-700 uppercase'>Delete</button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className='text-green-700 uppercase'>Edit</button>
                  </Link>
                </div>

              </div>
            ))}
        </div>
      }

    </div>
  )
}
