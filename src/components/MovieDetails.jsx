import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDetails, fetchVideos } from "../api";
import VideoComponent from "./VideoComponent";

const MovieDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const detailsData = await fetchDetails(id);
        const videosData = await fetchVideos(id);
        setDetails(detailsData);
        const trailer = videosData?.results?.find((vid) => vid.type === "Trailer");
        setVideo(trailer);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div>
      {loading ? (
        <p>Loading movie details...</p>
      ) : (
        <div>
          <h1>{details.title || details.name}</h1>
          <p>{details.overview}</p>
          {video && <VideoComponent id={video.key} />}
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
