import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '@/hooks/useBreadcrumb';

const Breadcrumb = () => {
  const paths = useBreadcrumbs();

  // Do not render if there are no breadcrumbs (e.g. login page)
  if (!paths.length) return null;

  return (
    <nav
      className="flex items-center text-sm text-gray-500 mb-4"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1">
        {paths.map((path, index) => (
          <li
            key={`${path.href}-${index}`}   // ✅ UNIQUE KEY (Step 4)
            className="inline-flex items-center"
          >
            {index !== 0 && (
              <span className="mx-2 text-gray-400">/</span>
            )}

            {index < paths.length - 1 ? (
              <Link
                to={path.href}
                className="hover:text-blue-600 transition-colors"
              >
                {path.name}
              </Link>
            ) : (
              <span className="font-semibold text-gray-700">
                {path.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
