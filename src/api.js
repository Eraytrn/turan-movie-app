  export const searchData = async (query) => {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}&api_key=302083967326b88c8620c4f55dadc469`);
    const data = await response.json();
    console.log(data); 
    return data;
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
  };
  
  

  export const fetchMovieList = async (id) => {
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/${id}/list?/api_key=302083967326b88c8620c4f55dadc469`);
    const data = await response.json();
    return data;
  };

  export const fetchTVList = async (id) => {
    const response = await fetch(`https://api.themoviedb.org/3/genre/tv/${id}/list?/api_key=302083967326b88c8620c4f55dadc469`);
    const data = await response.json();
    return data;
  };

  export const fetchDetails = async (id) => {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=302083967326b88c8620c4f55dadc469`);
    const data = await response.json();
    return data;
  };
  
  export const fetchVideos = async (id) => {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=302083967326b88c8620c4f55dadc469`);
    const data = await response.json();
    return data;
  };



export const fetchTVDetails = async (id) => {

    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=302083967326b88c8620c4f55dadc469`);
    const data = await response.json();
    return data;
 
};


export const fetchTVVideos = async (id) => {
 
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}/videos?api_key=302083967326b88c8620c4f55dadc469`);
    const data = await response.json();
    return data;
 
};

  
  
  