import React, { useState,useRef, useEffect } from 'react'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { useSelector } from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'

export default function CreateListing() {
    const fileInputRef = useRef(null);
    const { currentUser } = useSelector(state => state.user);
    const navigate = useNavigate();
    const params = useParams();

    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        imageUrls: [],
        name: '',
        description: '',
        address: '',
        type: 'rent',
        regularPrice: 500,
        discountPrice: 0,
        bathRooms: 1,
        badRooms: 1,
        furnished: false,
        parking: false,
        offer: false
    });
    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    // console.log(formData)

    useEffect(()=>{                       //This is for show the initial value
      const fetchListing = async () => {
         const listingId = params.listingId;
         const res = await fetch(`/api/listing/get/${listingId}`);
         const data = await res.json();

         if(data.success === false){
            console.log(data.message);
         }

         setFormData(data);
      }

      fetchListing();
    },[])

    const handleImageSubmit = (e) => {

        if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
            setUploading(true);
            setImageUploadError(false);
            setError(null);
            const promises = [];

            for (let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i]));
            }

            Promise.all(promises).then((urls) => {               //This is for wait to upload all files and set each to 
                setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) });   //This is for remain the exist image and add the new images

                setImageUploadError(false);
                setUploading(false);

                fileInputRef.current.value = '';

            }).catch((err) => {
                setImageUploadError('Image upload failed (2mb max image size)!');
                setUploading(false);
            })
        }
        else {
            setImageUploadError('You can only upload 6 image per listing');
            setUploading(false);
        }
    }

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Uploading ${progress} % is done.`)
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURl) => {
                        resolve(downloadURl);
                    });
                }
            )
        })
    }


    const handleRemoveImage = (index) => {
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((_, i) => i !== index)
        })
    }

    const handelChange = (e) => {

        if (e.target.id === 'sell' || e.target.id === 'rent') {
            setFormData({ ...formData, type: e.target.id });
        }

        if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
            setFormData({ ...formData, [e.target.id]: e.target.checked })
        }

        if (e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
            setFormData({ ...formData, [e.target.id]: e.target.value })
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (formData.imageUrls.length === 0) {
                return setError('Please upload at least one image');
            }

            if (+formData.regularPrice < +formData.discountPrice) {
                return setError('Discount price cannot be greater than regular price');
            }

            setLoading(true);
            setError(false);

            const response = await fetch(`/api/listing/update/${params.listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id,
                })
            })

            const data = await response.json();
            setLoading(false);

            if (data.success === false) {
                setError(data.message);
            }

            setFormData({
                imageUrls: [],
                name: '',
                description: '',
                address: '',
                type: 'rent',
                regularPrice: 500,
                discountPrice: 0,
                bathRooms: 1,
                badRooms: 1,
                furnished: false,
                parking: false,
                offer: false
            })

            navigate(`/listing/${data._id}`)

        } catch (error) {
            setError(error.message);
            setLoading(false);
        }

    }

    return (
        <main className='p-3 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-semibold text-center my-7'>Update a Listing</h1>
            <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
                {/* ********left Side ************** */}
                <div className='flex flex-col gap-4 flex-1'>
                    <input onChange={handelChange} value={formData.name} type="text" placeholder='Name' className='border p-3 rounded-lg' id='name' maxLength='62' minLength='5' required />
                    <textarea onChange={handelChange} value={formData.description} type="text" placeholder='Description' className='border p-3 rounded-lg' id='description' required />
                    <input onChange={handelChange} value={formData.address} type="text" placeholder='Address' className='border p-3 rounded-lg' id='address' required />
                    <div className='flex gap-6 flex-wrap'>
                        <div className='flex gap-2'>
                            <input onChange={handelChange} type='checkbox' id='sell' className='w-5' checked={formData.type === 'sell'} />
                            <span>Sell</span>
                        </div>
                        <div className='flex gap-2'>
                            <input onChange={handelChange} type='checkbox' id='rent' className='w-5' checked={formData.type === 'rent'} />
                            <span>Rent</span>
                        </div>
                        <div className='flex gap-2'>
                            <input onChange={handelChange} type='checkbox' id='parking' className='w-5' checked={formData.parking} />
                            <span>Parking spot</span>
                        </div>
                        <div className='flex gap-2'>
                            <input onChange={handelChange} type='checkbox' id='furnished' className='w-5' checked={formData.furnished} />
                            <span>Furnished</span>
                        </div>
                        <div className='flex gap-2'>
                            <input onChange={handelChange} type='checkbox' id='offer' className='w-5' checked={formData.offer} />
                            <span>Offer</span>
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-6'>
                        <div className='flex items-center gap-2'>
                            <input onChange={handelChange} value={formData.badRooms} type='number' id='badRooms' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg text-center' />
                            <p>Beds</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input onChange={handelChange} value={formData.bathRooms} type='number' id='bathRooms' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg text-center' />
                            <p>Baths</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input onChange={handelChange} value={formData.regularPrice} type='number' id='regularPrice' min='500' max='100000000' required className='p-3 border border-gray-300 rounded-lg text-center w-40' />
                            <div className='flex flex-col items-center'>
                                <p>Regular Price</p>
                                {formData.type==='rent'? <span className='text-xs'>(₹ / month)</span>:""}
                            </div>
                        </div>
                        {formData.offer ?
                            <div className='flex items-center gap-2'>
                                <input onChange={handelChange} value={formData.discountPrice} type='number' id='discountPrice' min='0' max='1000000' required className='p-3 border border-gray-300 rounded-lg text-center w-40' />
                                <div className='flex flex-col items-center'>
                                    <p>Discounted Price</p>
                                    {formData.type==='rent'? <span className='text-xs'>(₹ / month)</span>:""}
                                </div>
                            </div>
                            : ""
                        }
                    </div>
                </div>

                {/* **********Right Side *********** */}

                <div className='flex flex-col flex-1 gap-4'>
                    <p className='font-semibold'>Images:
                        <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
                    </p>

                    <div className='flex gap-4'>
                        <input ref={fileInputRef} onChange={(e) => setFiles(e.target.files)} className='p-3 border border-gray-300 w-full' type='file' id='images' accept='image/*' multiple />
                        <button disabled={uploading} type='button' onClick={handleImageSubmit} className='p-3 text-green-700 border border-green-700 rounded-lg uppercase hover:shadow-lg disabled:opacity-80'>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                    <p className='text-red-700 text-sm'>{imageUploadError && imageUploadError}</p>
                    {
                        formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
                            <div key={index} className='flex justify-between p-3 border items-center'>
                                <img src={url} alt='listing image' className='w-20 h-20 object-cover rounded-lg' />
                                <button type='button' onClick={() => handleRemoveImage(index)} className='p-3 text-red-700 rounded-lg uppercase border bg-slate-200 hover:bg-red-700 hover:text-white'>Delete</button>
                            </div>
                        ))
                    }
                    <button disabled={loading || uploading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
                        {loading ? 'Updating...' : 'Update Listing'}
                    </button>
                    {error && <p className='text-red-700 text-sm'>{error}</p>}
                </div>
            </form>
        </main>
    )
}
