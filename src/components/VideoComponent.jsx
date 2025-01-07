const VideoComponent = ({ id }) => {
    return (
      <iframe
        width="100%"
        height="500"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video player"
        allowFullScreen
      ></iframe>
    );
  };
  
  export default VideoComponent;
  