import styles from '@/src/styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>School Portal</h1>
        <p className={styles.subtitle}>
          Welcome to your comprehensive school management system
        </p>
        <p className={styles.description}>
          Manage your educational institutions with ease and efficiency
        </p>
      </div>
      
      <div className={styles.optionsContainer}>
        <a href="/addSchool" className={styles.optionCard}>
          <span className={styles.optionIcon}>🏫</span>
          <h2 className={styles.optionTitle}>Add School</h2>
          <p className={styles.optionDescription}>
            Register a new educational institution with complete details including contact information, location, and images.
          </p>
          <span className={styles.optionButton}>Get Started</span>
        </a>
        
        <a href="/showSchools" className={styles.optionCard}>
          <span className={styles.optionIcon}>📚</span>
          <h2 className={styles.optionTitle}>Show Schools</h2>
          <p className={styles.optionDescription}>
            View all registered schools in an organized, card-based layout with detailed information and images.
          </p>
          <span className={styles.optionButton}>View All</span>
        </a>
      </div>
    </div>
  );
}




