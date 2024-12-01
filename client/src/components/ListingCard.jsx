import React from 'react'
import { Link } from 'react-router-dom'
import { MdLocationOn } from 'react-icons/md'

export default function ListingCard({ listing }) {
    return (
        <div className='bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[300px]'>
            <Link to={`/listing/${listing._id}`}>
                <img src={listing.imageUrls[0]} alt='listing image' className='h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300' />

                <div className='p-3 flex flex-col gap-2 mt-3'>
                    <p className='truncate text-lg font-semibold text-slate-700'>{listing.name}</p>

                    <div className='flex items-center gap-1 w-full'>
                        <MdLocationOn className='h-4 w-4 text-green-700' />
                        <p className='text-sm truncate text-gray-600 w-full'>{listing.address}</p>
                    </div>

                    <p className='text-sm text-gray-600 text-justify mx-[5px] line-clamp-2'>{listing.description}</p>
                    <p className='text-slate-500 mt-2 font-semibold mx-[6px]'>₹{' '}{listing.regularPrice.toLocaleString('en-US')}
                      {listing.type === 'rent' &&  ' / month'}
                    </p>

                    <div className='flex gap-4 mx-2 text-gray-700'>
                         <div className='font-bold text-xs'>
                            {listing.badRooms}
                            {listing.badRooms > 1 ? ' beds':'bed'}
                         </div>

                         <div className='font-bold text-xs'>
                            {listing.bathRooms}
                            {listing.bathRooms > 1 ? ' baths':'bath'}
                         </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}
