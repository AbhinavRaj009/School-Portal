import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '@/src/styles/SchoolDetail.module.css';

export default function SchoolDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchSchool() {
      try {
        const res = await axios.get('/api/schools');
        const schools = res.data.data || [];
        const foundSchool = schools.find(s => s.id == id);
        
        if (foundSchool) {
          setSchool(foundSchool);
        } else {
          setError('School not found');
        }
      } catch (e) {
        setError('Failed to load school details');
      } finally {
        setLoading(false);
      }
    }

    fetchSchool();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading school details...</div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>School Not Found</h1>
          <p className={styles.errorMessage}>{error || 'The requested school could not be found.'}</p>
          <Link href="/showSchools" className={styles.backButton}>
            ← Back to Schools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/showSchools" className={styles.backLink}>
          ← Back to Schools
        </Link>
        <h1 className={styles.title}>{school.name}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          {school.image ? (
            <img src={school.image} alt={school.name} className={styles.schoolImage} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderIcon}>🏫</span>
              <p>No Image Available</p>
            </div>
          )}
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📍</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>Address</h3>
                <p className={styles.infoValue}>{school.address}</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🏙️</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>City</h3>
                <p className={styles.infoValue}>{school.city}</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🗺️</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>State</h3>
                <p className={styles.infoValue}>{school.state}</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📞</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>Contact</h3>
                <p className={styles.infoValue}>{school.contact}</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>✉️</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>Email</h3>
                <p className={styles.infoValue}>
                  <a href={`mailto:${school.email_id}`} className={styles.emailLink}>
                    {school.email_id}
                  </a>
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🆔</div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>School ID</h3>
                <p className={styles.infoValue}>#{school.id}</p>
              </div>
            </div>
          </div>

          <div className={styles.actionsSection}>
            <Link href={`/editSchool/${school.id}`} className={styles.editButton}>
              ✏️ Edit School
            </Link>
            <button className={styles.deleteButton} onClick={() => handleDelete(school.id)}>
              🗑️ Delete School
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function handleDelete(schoolId) {
  if (confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
    try {
      await axios.delete(`/api/schools/${schoolId}`);
      router.push('/showSchools');
    } catch (error) {
      alert('Failed to delete school. Please try again.');
    }
  }
}

