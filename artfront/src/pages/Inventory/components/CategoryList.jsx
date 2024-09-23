import PropTypes from 'prop-types';

function CategoryList({ categories }) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return <p className="text-gray-500 text-center py-4">No categories available.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {categories.map((category) => (
        <li key={category.id} className="py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900">{category.name}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default CategoryList;