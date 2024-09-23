import PropTypes from 'prop-types';

const SummaryCard = ({ title, value, icon, onClick, active = false }) => {
  return (
    <div 
      className={`p-4 bg-white rounded-lg shadow-md cursor-pointer ${active ? 'border-2 border-blue-500' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool
};

export default SummaryCard;