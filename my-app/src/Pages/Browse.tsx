type Screen = "MOVIE" | "SHOW";

const BrowsePage = ({ type }: { type: Screen }) => {
  return (
    <div>
      <div>{type}</div>
    </div>
  );
};

export default BrowsePage;
