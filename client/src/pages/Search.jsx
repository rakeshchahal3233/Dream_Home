import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListingCard from '../components/ListingCard';

export default function Search() {

    const navigate = useNavigate();
    const [sideBarData, setSideBarData] = useState({
        searchTerm: '',
        type: 'all',
        parking: false,
        offer: false,
        furnished: false,
        sort: 'created_at',
        order: 'desc'
    });
    const [loading,setLoading] = useState(false);
    const [listings,setListings] = useState([]);
    const [showMore,setShowMore] = useState(false);

    // console.log(listings)

    const handleChange = (e) => {

        if (e.target.id === 'all' || e.target.id === 'rent' || e.target.id === 'sell') {
            setSideBarData({ ...sideBarData, type: e.target.id })
        }

        if (e.target.id === 'searchTerm') {
            setSideBarData({ ...sideBarData, searchTerm: e.target.value })
        }

        if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
            setSideBarData({ ...sideBarData, [e.target.id]: e.target.checked || e.target.checked === 'true' ? true : false })
        }

        if (e.target.id === 'sort_order') {

            const sort = e.target.value.split('_')[0] || 'created_at';

            const order = e.target.value.split('_')[1] || 'desc';

            setSideBarData({ ...sideBarData, sort, order });
        }

    }

    useEffect(() => {

        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        const typeFromUrl = urlParams.get('type');
        const parkingFromUrl = urlParams.get('parking');
        const furnishedFromUrl = urlParams.get('furnished');
        const offerFromUrl = urlParams.get('offer');
        const sortFromUrl = urlParams.get('sort');
        const orderFromUrl = urlParams.get('order');

        if (searchTermFromUrl || typeFromUrl || parkingFromUrl || furnishedFromUrl || offerFromUrl || sortFromUrl || orderFromUrl) {
            setSideBarData({
                searchTerm: searchTermFromUrl || '',
                type: typeFromUrl || 'all',
                parking: parkingFromUrl === 'true' ? true : false,
                furnished: furnishedFromUrl === 'true' ? true : false,
                offer: offerFromUrl === 'true' ? true : false,
                sort: sortFromUrl || 'created_at',
                order: orderFromUrl || 'desc',
            })
        }

        const fetchListings = async () => {

            setLoading(true);
            setShowMore(false);

            const searchQuery = urlParams.toString();

            try {
                
                const res = await fetch(`/api/listing/get?${searchQuery}`);
                const data = await res.json();

                if(data.success === false){
                    console.log(data.message);
                    setLoading(false); 
                    return;
                }

                if(data.length > 8){
                    setShowMore(true);
                }
                else{
                    setShowMore(false)
                }

                setListings(data);
                setLoading(false);

            } catch (error) {
                console.log(error);
                setLoading(false);
            }
             
        }

        fetchListings();

    }, [location.search]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const urlParams = new URLSearchParams();
        urlParams.set('searchTerm', sideBarData.searchTerm);
        urlParams.set('type', sideBarData.type);
        urlParams.set('parking', sideBarData.parking);
        urlParams.set('furnished', sideBarData.furnished);
        urlParams.set('offer', sideBarData.offer);
        urlParams.set('sort', sideBarData.sort);
        urlParams.set('order', sideBarData.order);

        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
    }

    const onShowMoreClick = async()=>{
        const numberOfListings = listings.length;
        const startIndex = numberOfListings;
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('startIndex', startIndex);
        const searchQuery = urlParams.toString();

        const res = await fetch(`/api/listing/get?${searchQuery}`);
        const data = await res.json(); 

        if(data.length < 9){
            setShowMore(false);
        }

        setListings([...listings, ...data]);

    }

    return (
        <div className='flex flex-col md:flex-row'>
            <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen'>
                <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
                    <div className='flex items-center gap-2'>
                        <label className='whitespace-nowrap font-semibold'>Search Term:</label>
                        <input type="text" name="searchTerm" id='searchTerm' placeholder='Search..' className='border rounded-lg p-3 w-full' onChange={handleChange} value={sideBarData.searchTerm} />
                    </div>

                    <div className='flex gap-6 flex-wrap items-center'>
                        <div className='flex gap-2'>
                            <label className='font-semibold'>Type:</label>
                            <input type='checkbox' id='all' className='w-5' checked={sideBarData.type === 'all'} onChange={handleChange} />
                            <span >Rent & Sell</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox' id='rent' className='w-5' onChange={handleChange} checked={sideBarData.type === 'rent'} />
                            <span >Rent</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox' id='sell' className='w-5' onChange={handleChange} checked={sideBarData.type === 'sell'} />
                            <span >Sell</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox' id='offer' className='w-5' onChange={handleChange} checked={sideBarData.offer} />
                            <span >Offer</span>
                        </div>
                    </div>

                    <div className='flex gap-6 flex-wrap items-center'>
                        <div className='flex gap-2'>
                            <label className='font-semibold'>Amenities:</label>
                            <input type='checkbox' id='parking' className='w-5' onChange={handleChange} checked={sideBarData.parking} />
                            <span >Parking</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox' id='furnished' className='w-5' onChange={handleChange} checked={setSideBarData.furnished} />
                            <span >Furnished</span>
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <label className='font-semibold'>Sort:</label>
                        <select onChange={handleChange} defaultValue={'created_at_desc'} id='sort_order' className='border rounded-lg p-3'>
                            <option value='regularPrice_desc'>Price high to low</option>
                            <option value='regularPrice_asc'>Price low to high</option>
                            <option value='createdAt_desc'>Latest</option>
                            <option value='createdAt_asc'>Older</option>
                        </select>
                    </div>

                    <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>
                        Search
                    </button>

                </form>
            </div>

            <div className='flex-1'>
                <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>Listing results:</h1>
                <div className='p-7 flex flex-wrap gap-4'>
                    {!loading && listings.length === 0 && (
                        <p className='text-xl text-slate-700 '>No listing found!</p>
                    )}

                    {loading && (
                        <p className='text-xl text-slate-700 text-center w-full'>Loading...</p>
                    )}

                    { !loading && listings && 
                        listings.map((listing) => (
                          <ListingCard key={listing._id} listing={listing} />
                        ))
                    }

                  {showMore && (
                    <button onClick={onShowMoreClick} className='text-green-700 hover:underline p-7 text-center w-full'>Show more</button>
                  )}

                </div>
            </div>
        </div>
    )
}
