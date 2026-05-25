import { useForm, type SubmitHandler } from "react-hook-form";

interface EventFormInputs {
  title: string;
  description: string;
  location: string;
  time: string;
  date: string;
}

export const EventForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<EventFormInputs>();

  const createEvent = (data: EventFormInputs) => {
    console.log("Event created : ", data);
    reset();
  };

  const onSubmit: SubmitHandler<EventFormInputs> = (data) => createEvent(data);

  return (
    <div className="min-w-md flex flex-col justify-center items-center gap-4 border-solid border-4 p-8">
      <h1>Event Form</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center items-center gap-4"
      >
        <input
          className="border-solid border-2 p-2"
          placeholder="Event Title"
          {...register("title", { required: true })}
        />
        {errors.title && <span>Event Title is required</span>}

        <input
          className="border-solid border-2 p-2"
          placeholder="Event Description"
          {...register("description", { required: true })}
        />
        {errors.description && <span>Event description is required</span>}

        <input
          className="border-solid border-2 p-2"
          placeholder="YYYY-MM-DD"
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
          placeholder="HH:MM"
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
          placeholder="Location"
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
