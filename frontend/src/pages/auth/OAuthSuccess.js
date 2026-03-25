import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchMe } from '../../redux/slices/authSlice';

const OAuthSuccess = () => {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('ss_token', token);
      dispatch(fetchMe()).then(() => navigate('/dashboard'));
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, []);

  return (
    <div className="page-loader">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#888' }}>Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
