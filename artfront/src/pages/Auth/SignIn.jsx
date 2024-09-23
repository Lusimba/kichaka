import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, checkAuthState } from '../../store/slices/authSlice';
import ImageCarousel from '../../components/ImageCarousel';
import { debounce } from 'lodash';

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.username) {
      errors.username = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.username)) {
      errors.username = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Debounce the validation function instead of the handleChange
  const debouncedValidation = useCallback(
    debounce(() => validateForm(), 300),
    [formData]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await dispatch(login({ ...formData, rememberMe }));
      if (!result.error) {
        await dispatch(checkAuthState());
        navigate('/');
      }
    }
  };

  // Memoize the form inputs to prevent unnecessary re-renders
  const formInputs = useMemo(() => (
    <div className="rounded-md shadow-sm -space-y-px">
      <div>
        <label htmlFor="username" className="sr-only">Email address</label>
        <input
          id="username"
          type="email"
          name="username"
          required
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
          placeholder="Email address"
          value={formData.username}
          onChange={handleChange}
          onBlur={debouncedValidation}
          aria-invalid={formErrors.username ? "true" : "false"}
          aria-describedby="username-error"
        />
        {formErrors.username && <p id="username-error" className="mt-2 text-sm text-red-600">{formErrors.username}</p>}
      </div>
      <div>
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          required
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          onBlur={debouncedValidation}
          aria-invalid={formErrors.password ? "true" : "false"}
          aria-describedby="password-error"
        />
        {formErrors.password && <p id="password-error" className="mt-2 text-sm text-red-600">{formErrors.password}</p>}
      </div>
    </div>
  ), [formData, formErrors, handleChange, debouncedValidation]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <ImageCarousel />
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white bg-opacity-90 p-10 rounded-xl shadow-2xl">
          <div>
            <div className="bg-[#DDBEA9] p-4 rounded-lg mb-4">
              <h1 className="text-4xl font-extrabold text-center text-[#653239] font-inder">Artflow 360</h1>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Sign In</h2>
          </div>
          {error && <p role="alert" className="text-red-500 text-center">{error.message || 'An error occurred'}</p>}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {formInputs}
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </Link>
              </div>
            </div> */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#653239] hover:bg-[#9A031E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={loading ? "true" : "false"}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#9A031E] hover:text-[#653239]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SignIn);