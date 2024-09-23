import PropTypes from 'prop-types';

const SpecializationsComponent = ({ specializations }) => {
  if (!specializations || (Array.isArray(specializations) && specializations.length === 0)) {
    return <div>Loading...</div>;
  }

  const specializationsArray = Array.isArray(specializations) ? specializations : specializations.results || [];

  return (
    <ul className="bg-white rounded-lg border border-gray-200 w-full text-gray-900">
      {specializationsArray.length === 0 ? (
        <li className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg">
          No specializations found.
        </li>
      ) : (
        specializationsArray.map((spec) => (
          <li key={spec.id} className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg">
            <div className="flex justify-between items-center">
              <span>{`${spec.name[0].toUpperCase()}${spec.name.slice(1)}`}</span>
            </div>
          </li>
        ))
      )}
    </ul>
  );
};

SpecializationsComponent.propTypes = {
  specializations: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.shape({
      results: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }))
    })
  ])
};

export default SpecializationsComponent;