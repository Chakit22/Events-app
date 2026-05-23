interface EventCard {
  title: string;
  description: string;
  date: string;
  location: string;
  time: string;
}

export const EventCard = ({ title, description, date, location, time }) => {
  return (
    <div className="flex flex-col justify-center items-start gap-4 p-8 border-solid border-4 border-black rounded-lg">
      <h2>{title}</h2>
      <div>{description}</div>
      <div className="flex justify-center items-center gap-4">
        <div>{date}</div>
        <div>{location}</div>
        <div>{time}</div>
      </div>
    </div>
  );
};
