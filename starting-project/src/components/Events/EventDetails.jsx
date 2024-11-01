import { Link, Outlet } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "../Header.jsx";
import { fetchEvent, deleteEvent } from "../../util/http.js";
import { useParams } from "react-router-dom";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../util/http.js";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";
export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id;
  const [isDeleteing, setIsDeleting] = useState(false);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });
  const { mutate  , isPending:isPendingDeleting , isError:isErrorDeleting , error:deleteError} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });
  const handleStartDelete = () => {
    setIsDeleting(true);
  };
  const handleStopDelete = () => {
    setIsDeleting(false);
  };
  const handleDeleteEvent = () => {
    mutate({ id: id });
  };

  const formatedDate = new Date(data?.date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <>
      {isDeleteing && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action cannot be
            undone!
          </p>
          {isPendingDeleting && <p>Deleteing, please wait...</p>}
          {!isPendingDeleting && <div className="form-actions">
            <button onClick={handleStopDelete} className="button-text">
              Cancel
            </button>
            <button onClick={handleDeleteEvent} className="button">
              Delete
            </button>
          </div>}
          {isErrorDeleting && <ErrorBlock
          title='Failed to dlete event '
          message={deleteError.info?.message || 'Failed to delete event, Please try again later.'}
          />}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && (
        <div div id="event-details-content" className="center">
          <LoadingIndicator />
        </div>
      )}
      {isError && (
        <ErrorBlock
          title="Failed to load selectable event"
          message={error.info?.message || "Please try again later."}
        />
      )}
      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={handleStartDelete}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {formatedDate} @ {data.time}
                </time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
