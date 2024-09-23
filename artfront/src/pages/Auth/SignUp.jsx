import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, checkAuthState } from '../../store/slices/authSlice';
import ImageCarousel from '../../components/ImageCarousel';
import { debounce } from 'lodash';

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (!formData.password2) {
      errors.password2 = 'Please confirm your password';
    } else if (formData.password !== formData.password2) {
      errors.password2 = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
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
      // Include all form data, including password2
      const submitData = {
        ...formData,
        username: formData.email
      };
      const result = await dispatch(register(submitData));
      if (!result.error) {
        await dispatch(checkAuthState());
        navigate('/');
      }
    }
  };

  const passwordStrengthIndicator = useMemo(() => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const texts = ['Weak', 'Fair', 'Good', 'Strong'];
    return (
      <div className="mt-2">
        <div className="flex mb-1">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className={`h-2 w-1/4 ${index < passwordStrength ? colors[passwordStrength - 1] : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">
          Password strength: {texts[passwordStrength - 1] || 'Very Weak'}
        </p>
      </div>
    );
  }, [passwordStrength]);

  // Memoize the form inputs to prevent unnecessary re-renders
  const formInputs = useMemo(() => (
    <div className="rounded-md shadow-sm -space-y-px">
      <div>
        <label htmlFor="first_name" className="sr-only">First Name</label>
        <input
          id="first_name"
          type="text"
          name="first_name"
          required
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formErrors.first_name ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          onBlur={debouncedValidation}
          aria-invalid={formErrors.first_name ? "true" : "false"}
          aria-describedby="first_name-error"
        />
        {formErrors.first_name && <p id="first_name-error" className="mt-2 text-sm text-red-600">{formErrors.first_name}</p>}
      </div>
      <div>
        <label htmlFor="last_name" className="sr-only">Last Name</label>
        <input
          id="last_name"
          type="text"
          name="last_name"
          required
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formErrors.last_name ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          onBlur={debouncedValidation}
          aria-invalid={formErrors.last_name ? "true" : "false"}
          aria-describedby="last_name-error"
        />
        {formErrors.last_name && <p id="last_name-error" className="mt-2 text-sm text-red-600">{formErrors.last_name}</p>}
      </div>
      <div>
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          onBlur={debouncedValidation}
          aria-invalid={formErrors.email ? "true" : "false"}
          aria-describedby="email-error"
        />
        {formErrors.email && <p id="email-error" className="mt-2 text-sm text-red-600">{formErrors.email}</p>}
      </div>
      <div>
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          required
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          onBlur={debouncedValidation}
          aria-invalid={formErrors.password ? "true" : "false"}
          aria-describedby="password-error"
        />
        {formErrors.password && <p id="password-error" className="mt-2 text-sm text-red-600">{formErrors.password}</p>}
        {passwordStrengthIndicator}
      </div>
      <div>
        <label htmlFor="password2" className="sr-only">Confirm Password</label>
        <input
          id="password2"
          type="password"
          name="password2"
          required
          className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formErrors.password2 ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
          placeholder="Confirm Password"
          value={formData.password2}
          onChange={handleChange}
          onBlur={debouncedValidation}
          aria-invalid={formErrors.password2 ? "true" : "false"}
          aria-describedby="password2-error"
        />
        {formErrors.password2 && <p id="password2-error" className="mt-2 text-sm text-red-600">{formErrors.password2}</p>}
      </div>
    </div>
  ), [formData, formErrors, handleChange, debouncedValidation, passwordStrengthIndicator]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ImageCarousel />
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white bg-opacity-90 p-10 rounded-xl shadow-2xl">
          <div>
            <div className="bg-[#DDBEA9] p-4 rounded-lg mb-4">
              <h1 className="text-4xl font-extrabold text-center text-[#653239] font-inder">Artflow 360</h1>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Register</h2>
          </div>
          {error && <p role="alert" className="text-red-500 text-center">{error.message || JSON.stringify(error)}</p>}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {formInputs}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#653239] hover:bg-[#9A031E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={loading ? "true" : "false"}
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#9A031E] hover:text-[#653239]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SignUp);