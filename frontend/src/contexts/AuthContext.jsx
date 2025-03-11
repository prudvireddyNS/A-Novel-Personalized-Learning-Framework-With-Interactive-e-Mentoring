import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set the authorization header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data
          const response = await axios.get('/users/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  // At the top of the file, after imports
  axios.defaults.withCredentials = true;
  
  // Update the login function
  const login = async (email, password) => {
      try {
        const response = await axios.post('/token', 
          new URLSearchParams({
            'username': email,
            'password': password
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            withCredentials: true
          }
        );

        const { access_token, role } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', access_token);
        
        // Set the authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        // Get user data
        const userResponse = await axios.get('/users/me');
        setUser(userResponse.data);
        
        return { success: true, role };
      } catch (error) {
        console.error('Login failed:', error);
        return { 
          success: false, 
          error: error.response?.data?.detail || 'Login failed. Please try again.'
        };
      }
    };

    // Google login function
    const googleLogin = async (token) => {
      try {
        const response = await axios.post('/google-login', { token });
        const { access_token, role } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', access_token);
        
        // Set the authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        // Get user data
        const userResponse = await axios.get('/users/me');
        setUser(userResponse.data);
        
        return { success: true, role };
      } catch (error) {
        console.error('Google login failed:', error);
        return { 
          success: false, 
          error: error.response?.data?.detail || 'Google login failed. Please try again.'
        };
      }
    };

    // Register function
    const register = async (userData) => {
      try {
        await axios.post('/users/', userData);
        
        // Automatically log in after registration
        return await login(userData.email, userData.password);
      } catch (error) {
        console.error('Registration failed:', error);
        return { 
          success: false, 
          error: error.response?.data?.detail || 'Registration failed. Please try again.'
        };
      }
    };

    // Logout function
    const logout = () => {
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Remove authorization header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear user state
      setUser(null);
    };

    const value = {
      user,
      isLoading,
      login,
      googleLogin,
      register,
      logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
