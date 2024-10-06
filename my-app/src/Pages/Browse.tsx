import React, { useState } from 'react'
import MovieboxScroll from '../../Components/Scrollables/MovieBoxScroll'
import ShowBoxScroll from '../../Components/Scrollables/ShowBoxScroll'

type Screen = "MOVIE" | "SHOW"

const BrowsePage = () => {
    const [screen, setScreen] = useState<Screen>("MOVIE")

   return (
    <body className='overflow-x-hidden'>
      
    
    <div className="min-h-screen w-screen ">

        <div className='flex justify-center items-center space-x-4 py-2 cursor-pointer'>
          
            <div onClick={() => setScreen("MOVIE")} className=''>Movies</div>
            <div> | </div>
            <div onClick={() => setScreen("SHOW")}>Shows</div>
        </div>
        <div>
            {screen === "MOVIE" && <MovieboxScroll />}
            {screen === "SHOW" && <ShowBoxScroll />}
        </div>
    </div>
    </body>
  )
}

export default BrowsePage