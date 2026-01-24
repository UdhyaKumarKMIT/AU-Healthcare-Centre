import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header/Header';
import styles from './Login.module.css';
import { loginUserApi } from '../../services/auth.service'; 

const ROLE_MAP = {
  admin: 'ADMIN',
  doctor: 'DOCTOR',
  pharmacist: 'PHARMACIST',
  nurse: 'NURSE_RECEPTIONIST',
  receptionist: 'NURSE_RECEPTIONIST',
  clerical: 'CLERICAL_ASSISTANT',
  patient: 'PATIENT',
  labtech: 'LAB_TECHNICIAN'
};

// Role-specific roles that use shared credentials
const ROLE_SPECIFIC_ROLES = ['NURSE_RECEPTIONIST', 'PHARMACIST'];
 
const Login = () => {
  const { role } = useParams();
  const userRole = ROLE_MAP[role];
  const navigate = useNavigate();
  const { login } = useAuth(); 

  // State for other roles
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRoleSpecific = ROLE_SPECIFIC_ROLES.includes(userRole); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUserApi(username, password, userRole);
      console.log('Login API result:', result);
      login(result.user, result.token);
      console.log('Logged in user:', result.user);
      console.log('User role:', result.user.role);
      console.log('Role type:', typeof result.user.role);
      
      switch (result.user.role) {
        case 'ADMIN':
          console.log('Navigating to admin dashboard');
          navigate('/admin/dashboard');
          break;
        case 'DOCTOR':
          console.log('Navigating to doctor dashboard');
          navigate('/doctor/dashboard');
          break;
        case 'NURSE_RECEPTIONIST':
          console.log('Navigating to reception dashboard');
          navigate('/reception/dashboard');
          break;
        case 'PATIENT':
          console.log('Navigating to patient dashboard');
          navigate('/patient/dashboard');
          break;
        case 'PHARMACIST':
          console.log('Navigating to pharmacist dashboard');
          navigate('/pharmacist/dashboard');
          break;
        case 'LAB_TECHNICIAN':
          console.log('Navigating to labtech dashboard');
          navigate('/labtech/dashboard');
          break;
        case 'CLERICAL_ASSISTANT':
          console.log('User role:', result.user.role);
          console.log('Token exists:', !!result.token);
          console.log('Navigating to clerical assistant dashboard');
          navigate('/clerical_assistant/dashboard');
          break;  
        default:
          console.log('Unknown role, redirecting to home');
          navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <Header />

      <main className={styles.mainContent}>
        <section className={styles.loginContainer}>
          <div className={styles.loginCard}>
            {/* Header */}
            <header className={styles.loginHeader}>
              <h1 className={styles.logo}>MIT Health Centre</h1>
              <h2 className={styles.title}>
                {role?.charAt(0).toUpperCase() + role?.slice(1)} Login
              </h2>
              <p className={styles.subtitle}>Authorized personnel access only</p>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.loginForm}>
              {error && (
                <div className={styles.errorAlert} role="alert">
                  ⚠️ {error}
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="username">
                  {isRoleSpecific ? 'Role Username' : 'Username'}
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  placeholder={isRoleSpecific ? 'Enter shared role username' : 'Enter your username'}
                  required
                  autoComplete="username"
                />
                {isRoleSpecific && (
                  <small className={styles.helpText}>
                    Use shared{' '}
                    {role === 'nurse'
                      ? 'Nurse/Receptionist'
                      : role === 'clerical'
                      ? 'Clerical Assistant'
                      : 'Pharmacist'} account credentials
                  </small>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className={styles.loginButton}
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Footer */}
            <footer className={styles.footer}>
              <p>Anna University • HealthCare Portal</p>
              <p className={styles.footerNote}>
                Unauthorized access is prohibited
              </p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
