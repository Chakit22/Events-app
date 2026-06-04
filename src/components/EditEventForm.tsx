import { useForm, type SubmitHandler } from "react-hook-form";
import { type Event } from "../types/Event";

interface EventFormInputs {
  title: string;
  description: string;
  location: string;
  time: string;
  date: string;
}

interface EditEventProps {
  event: Event | undefined;
  onEdit: (id: string | undefined, data: Omit<Event, "id">) => void;
}

// MISTAKE I MADE: wrote `(event: Event | undefined)` as the parameter, treating
// the first arg as the event itself. React passes ONE props OBJECT to every
// component, so that made the whole props bag get typed as Event — and the
// parent's `event={...}` had nowhere to bind ("Property 'event' does not exist").
// CONCEPT — destructure named props out of the single props object: ({ event, onEdit }).
export const EditEventForm = ({ event, onEdit }: EditEventProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormInputs>();

  const onSubmit: SubmitHandler<EventFormInputs> = (data) =>
    onEdit(event?.id, data);

  return (
    <div className="min-w-md flex flex-col justify-center items-center gap-4 border-solid border-4 p-8">
      <h1>Event Form</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center items-center gap-4"
      >
        <input
          className="border-solid border-2 p-2"
          defaultValue={event?.title}
          {...register("title", { required: true })}
        />
        {errors.title && <span>Event Title is required</span>}

        <input
          className="border-solid border-2 p-2"
          defaultValue={event?.description}
          {...register("description", { required: true })}
        />
        {errors.description && <span>Event description is required</span>}

        <input
          className="border-solid border-2 p-2"
          defaultValue={event?.date}
          {...register("date", {
            required: true,
            pattern: {
              value: /^\d{4}-\d{2}-\d{2}$/,
              message: "Use YYYY-MM-DD",
            },
          })}
        />
        {errors.date && <span>{errors.date.message}</span>}

        <input
          className="border-solid border-2 p-2"
          defaultValue={event?.time}
          {...register("time", {
            required: true,
            pattern: {
              value: /^([01]\d|2[0-3]):[0-5]\d$/,
              message: "Use HH:MM (24h)",
            },
          })}
        />
        {errors.time && <span>{errors.time.message}</span>}

        <input
          className="border-solid border-2 p-2"
          defaultValue={event?.location}
          {...register("location", { required: true })}
        />
        {errors.location && <span>Event location is required</span>}

        <input
          className="border-solid border-4 rounded-lg bg-blue-500 p-2"
          type="submit"
        />
      </form>
    </div>
  );
};
