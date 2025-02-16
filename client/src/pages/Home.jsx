import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import ListingCard from '../components/ListingCard';
import Footer from '../components/Footer';

export default function Home() {

  const [offerListings, setOfferListings] = useState([]);
  const [sellListings, setSellListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation]);

  useEffect(() => {

    const fetchOfferListings = async () => {
      try {

        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();

      } catch (error) {
        console.log(error);
      }

    }

    const fetchRentListings = async () => {
      try {

        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(data);
        fetchSellListings();

      } catch (error) {
        console.log(error);
      }
    }

    const fetchSellListings = async () => {
      try {

        const res = await fetch('/api/listing/get?type=sell&limit=4');
        const data = await res.json();
        setSellListings(data);

      } catch (error) {
        console.log(error);
      }
    }

    fetchOfferListings();

  }, [])

  return (
    <div>
      {/* Top */}
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto'>
        <h1 className='text-slate-700 font-bold text-3xl lg:text-6xl'>
          Find your next <span className='text-slate-500'>perfect</span> <br /> place with ease
        </h1>

        <div className='text-gray-400 text-xs  sm:text-sm'>
          DreamHome will help you to find your home fast,easy and comfortable.
          <br />We have a wide range of properties for you to choose from.
        </div>
        <Link to={'/search'} className='text-blue-800 text-xs sm:text-sm font-bold hover:underline'>Let's start now...</Link>
      </div>

      {/* Swiper */}

      <Swiper navigation>
        {
          offerListings && offerListings.length > 0 && offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div className='h-[500px]' style={{ background: `url(${listing.imageUrls[0]}) center no-repeat`, backgroundSize: 'cover' }}></div>
            </SwiperSlide>
          ))
        }
      </Swiper>

      {/* Middle */}

      <div className='max-w-7xl mx-auto p-3 flex flex-col gap-8 my-10'>
        {
          offerListings && offerListings.length > 0 && (
            <div>

              <div className='my-3'>
                <h2 className='text-2xl font-semibold text-slate-600'>Recent offer</h2>
                <Link className='text-sm text-blue-800 hover:underline' to={'/search?offer=true'}>
                  Show more offers
                </Link>
              </div>

              <div className='flex flex-wrap gap-4'>
                {
                  offerListings.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))
                }
              </div>

            </div>
          )
        }

        {
          rentListings && rentListings.length > 0 && (
            <div>

              <div className='my-3'>
                <h2 className='text-2xl font-semibold text-slate-600'>Recent places for rent</h2>
                <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=rent'}>
                  Show more places for rent
                </Link>
              </div>

              <div className='flex flex-wrap gap-4'>
                {
                  rentListings.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))
                }
              </div>

            </div>
          )
        }

        {
          sellListings && sellListings.length > 0 && (
            <div>

              <div className='my-3'>
                <h2 className='text-2xl font-semibold text-slate-600'>Recent places for sell</h2>
                <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=sell'}>
                  Show more places for sell
                </Link>
              </div>

              <div className='flex flex-wrap gap-4'>
                {
                  sellListings.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))
                }
              </div>

            </div>
          )
        }

      </div>

      {/* bottom */}
      <Footer/>

    </div>
  )
}
