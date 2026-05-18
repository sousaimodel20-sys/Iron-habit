

const MilestoneBadge = ({ title, achieved }: { title: string; achieved: boolean }) => {
  return (
    <div
      className={`p-3 rounded-lg m-2 text-center w-32 shadow-md font-semibold text-white cursor-pointer select-none transition-colors duration-300 ${
        achieved ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'
      }`}
    >
      {title}
    </div>
  );
};

export default MilestoneBadge;
