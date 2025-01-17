import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
  const {
    mutate,
    isPending: isPendingEditting,
    isError: isErrorEditting,
    error: editError,
  } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent=data.event
      queryClient.cancelQueries({queryKey:['events' ,params.id]})
      const previousEvent=queryClient.getQueryData(["events", params.id]);
      queryClient.setQueryData(
        ["events", params.id],
         newEvent
      );
      return {previousEvent}
    },
    onError:(error , data , context )=>{
      queryClient.setQueryData(
        ["events", params.id],
         context.previousEvent
      );
    },
   onSettled:()=>{
    queryClient.invalidateQueries({queryKey:['events' , params.id]})
   }
  });
  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate("../");

  }

  function handleClose() {
    navigate("../");
  }
  let content;
  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }
  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            "Failed to load event, Please try again later."
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
       { !isPendingEditting && <>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
       </>}
       {isPendingEditting && <p>updating....</p>}
       {isErrorEditting && <ErrorBlock
        title="Failed to updating event"
        message={
          error.info?.message ||
          "Failed to update event, Please try again later."}
       />}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
