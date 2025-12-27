import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header/Header';
import styles from './Login.module.css';
import { loginUserApi } from '../../services/auth.service';
import PharmacistLogin from '../Pharmacist/Login'; // ensure default export

const ROLE_MAP = {
  doctor: 'DOCTOR',
  pharmacist: 'PHARMACIST',
  nurse: 'NURSE',
  receptionist: 'RECEPTIONIST',
  patient: 'PATIENT',
};

const Login = () => {
  const { role } = useParams();
  const userRole = ROLE_MAP[role];
  const navigate = useNavigate();
  const { login } = useAuth();

  // If pharmacist, render the imported PharmacistLogin component
  if (role === 'pharmacist') {
    return <PharmacistLogin />;
  }

  // State for other roles
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUserApi(email, password, userRole);
      login(result.user, result.token);

      switch (result.user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor/dashboard');
          break;
        case 'NURSE':
          navigate('/nurse/dashboard');
          break;
        case 'RECEPTIONIST':
          navigate('/reception/dashboard');
          break;
        case 'PATIENT':
          navigate('/patient/dashboard');
          break;
        default:
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
                <label htmlFor="email">Official Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
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
