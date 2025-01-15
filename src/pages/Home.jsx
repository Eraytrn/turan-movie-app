import React from 'react'
import Row from '../components/Row'
import requests from '../Requests'

const Home = () => {
  return (
    <div className='pt-20'>
      <Row rowID='1' title='Up Coming Films' fetchURL={requests.requestUpcoming} />
      <Row rowID='2' title='IMDB Top Rated Films' fetchURL={requests.requestTopRated} />
      <Row rowID='3' title='Trending Films' fetchURL={requests.requestTrending} />
      <Row rowID='4' title='Popular Films' fetchURL={requests.requestPopular} />     
      <Row rowID='5' title='Horror Films' fetchURL={requests.requestHorror} />
    </div>
  )
}

export default Home
