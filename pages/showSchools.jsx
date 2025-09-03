import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '@/src/styles/ShowSchools.module.css';

export default function ShowSchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [submittingRatingFor, setSubmittingRatingFor] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/schools');
        const sortedSchools = (res.data.data || []).sort((a, b) => a.id - b.id);
        setSchools(sortedSchools);
        setFilteredSchools(sortedSchools);
      } catch (e) {
        setError('Failed to load schools');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSchools(schools);
    } else {
      const filtered = schools.filter((school) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          school.name?.toLowerCase().includes(searchLower) ||
          school.city?.toLowerCase().includes(searchLower) ||
          school.state?.toLowerCase().includes(searchLower) ||
          school.address?.toLowerCase().includes(searchLower) ||
          school.email_id?.toLowerCase().includes(searchLower) ||
          school.contact?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredSchools(filtered);
    }
  }, [searchTerm, schools]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleSchoolSelection = (schoolId) => {
    setSelectedSchools(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      } else {
        if (prev.length < 4) { // Limit to 4 schools for comparison
          return [...prev, schoolId];
        }
        return prev;
      }
    });
  };

  const clearSelection = () => {
    setSelectedSchools([]);
  };

  const openCompareModal = () => {
    if (selectedSchools.length >= 2) {
      setShowCompareModal(true);
    }
  };

  const closeCompareModal = () => {
    setShowCompareModal(false);
  };

  const getSelectedSchoolsData = () => {
    return selectedSchools.map(id => schools.find(school => school.id === id)).filter(Boolean);
  };

  const submitRating = async (schoolId, rating) => {
    try {
      setSubmittingRatingFor(schoolId);
      // Optimistic update
      setSchools(prev => prev.map(s => {
        if (s.id !== schoolId) return s;
        const prevCount = Number(s.rating_count || 0);
        const prevAvg = Number(s.avg_rating || 0);
        const newCount = prevCount + 1;
        const newAvg = ((prevAvg * prevCount) + rating) / newCount;
        return { ...s, rating_count: newCount, avg_rating: Number(newAvg.toFixed(2)) };
      }));
      setFilteredSchools(prev => prev.map(s => {
        if (s.id !== schoolId) return s;
        const prevCount = Number(s.rating_count || 0);
        const prevAvg = Number(s.avg_rating || 0);
        const newCount = prevCount + 1;
        const newAvg = ((prevAvg * prevCount) + rating) / newCount;
        return { ...s, rating_count: newCount, avg_rating: Number(newAvg.toFixed(2)) };
      }));

      await axios.post(`/api/schools/${schoolId}`, { rating });
    } catch (_e) {
      // Re-fetch on error to sync
      try {
        const res = await axios.get('/api/schools');
        const sortedSchools = (res.data.data || []).sort((a, b) => a.id - b.id);
        setSchools(sortedSchools);
        setFilteredSchools(sortedSchools);
      } catch (err) {
        console.error(err);
        setError('Failed to submit rating');
      }
    } finally {
      setSubmittingRatingFor(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Schools</h1>
        <div className={styles.loading}>Loading schools...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Schools</h1>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Schools</h1>
      
      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search schools by name, city, state, address, email, or contact..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={clearSearch} className={styles.clearButton}>
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <div className={styles.searchInfo}>
            <span>
              Showing {filteredSchools.length} of {schools.length} schools
              {searchTerm && ` for "${searchTerm}"`}
            </span>
          </div>
        )}
      </div>

      {/* Compare Section */}
      {selectedSchools.length > 0 && (
        <div className={styles.compareSection}>
          <div className={styles.compareInfo}>
            <span>{selectedSchools.length} school(s) selected</span>
            <span className={styles.compareLimit}>
              {selectedSchools.length < 4 ? `Select up to ${4 - selectedSchools.length} more` : 'Maximum 4 schools selected'}
            </span>
          </div>
          <div className={styles.compareActions}>
            <button 
              onClick={openCompareModal} 
              className={styles.compareButton}
              disabled={selectedSchools.length < 2}
              title={`Compare ${selectedSchools.length} schools`}
            >
              ⚖️
            </button>
            <button onClick={clearSelection} className={styles.clearSelectionButton}>
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {filteredSchools.length === 0 ? (
        <div className={styles.emptyState}>
          {searchTerm ? (
            <>
              <h3>No Schools Found</h3>
              <p>No schools match your search for "{searchTerm}"</p>
              <button onClick={clearSearch} className={styles.clearSearchButton}>
                Clear Search
              </button>
            </>
          ) : (
            <>
              <h3>No Schools Found</h3>
              <p>Start by adding your first school to the database</p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredSchools.map((s) => (
            <div key={s.id} className={styles.cardWrapper}>
              <div className={styles.cardCheckbox}>
                <input
                  type="checkbox"
                  id={`school-${s.id}`}
                  checked={selectedSchools.includes(s.id)}
                  onChange={() => handleSchoolSelection(s.id)}
                  className={styles.checkbox}
                />
                <label htmlFor={`school-${s.id}`} className={styles.checkboxLabel}>
                  Select for comparison
                </label>
              </div>
              <Link href={`/school/${s.id}`} className={styles.cardLink}>
                <div className={styles.card}>
                  <div className={styles.imageWrap}>
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image} alt={s.name} className={styles.image} />
                    ) : (
                      <div className={styles.placeholder}></div>
                    )}
                  </div>
                  <div className={styles.content}> 
                    <h3 className={styles.name}>{s.name}</h3>
                    <p className={styles.address}>{s.address}</p>
                    <p className={styles.city}>{s.city}</p>
                    <div className={styles.ratingRow} onClick={(e) => e.preventDefault()}>
                      <div className={styles.stars} aria-label={`Average rating ${s.avg_rating || 0} out of 5`}>
                        {[1,2,3,4,5].map((star) => (
                          <button
                            key={star}
                            className={`${styles.star} ${(s.avg_rating || 0) >= star ? styles.filled : ''}`}
                            title={`Rate ${star} star${star>1?'s':''}`}
                            disabled={submittingRatingFor === s.id}
                            onClick={(e) => { e.stopPropagation(); submitRating(s.id, star); }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <span className={styles.ratingMeta}>
                        {s.avg_rating ? `${s.avg_rating} (${s.rating_count || 0})` : 'No ratings'}
                      </span>
                    </div>
                    <div className={styles.viewDetails}>
                      <span>Click to view details →</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className={styles.modalOverlay} onClick={closeCompareModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Compare Schools</h2>
              <button onClick={closeCompareModal} className={styles.closeModalButton}>
                ✕
              </button>
            </div>
            <div className={styles.comparisonTable}>
              <div className={styles.comparisonHeader}>
                <div className={styles.comparisonCell}>Features</div>
                {getSelectedSchoolsData().map((school) => (
                  <div key={school.id} className={styles.comparisonCell}>
                    <div className={styles.schoolName}>{school.name}</div>
                    <div className={styles.schoolImage}>
                      {school.image ? (
                        <img src={school.image} alt={school.name} />
                      ) : (
                        <div className={styles.placeholder}></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonCell}>Location</div>
                {getSelectedSchoolsData().map((school) => (
                  <div key={school.id} className={styles.comparisonCell}>
                    <div>{school.address}</div>
                    <div>{school.city}, {school.state}</div>
                  </div>
                ))}
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonCell}>Contact</div>
                {getSelectedSchoolsData().map((school) => (
                  <div key={school.id} className={styles.comparisonCell}>
                    <div>{school.contact}</div>
                    <div>{school.email_id}</div>
                  </div>
                ))}
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonCell}>Actions</div>
                {getSelectedSchoolsData().map((school) => (
                  <div key={school.id} className={styles.comparisonCell}>
                    <Link href={`/school/${school.id}`} className={styles.viewSchoolButton}>
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




