import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import styles from '@/src/styles/AddSchool.module.css';

export default function AddSchoolPage() {
  const router = useRouter();
  const { id } = router.query || {};
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedState, setSelectedState] = useState('');

  // State and city data
  const stateCityData = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kadapa', 'Anantapur', 'Kakinada', 'Tirupati', 'Rajahmundry'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Bomdila', 'Tawang', 'Ziro', 'Along', 'Tezu', 'Roing', 'Khonsa'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Sivasagar', 'Tezpur', 'Nagaon', 'Tinsukia', 'Dhubri', 'Goalpara'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Bettiah', 'Katihar', 'Motihari'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Durg', 'Bilaspur', 'Korba', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Mahasamund', 'Dhamtari'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Mormugao', 'Sanquelim', 'Bicholim', 'Valpoi', 'Pernem'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Gandhinagar', 'Bharuch'],
    'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'],
    'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Kullu', 'Solan', 'Mandi', 'Palampur', 'Kangra', 'Chamba', 'Una'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Medininagar', 'Chatra'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary', 'Bijapur', 'Shimoga'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kannur', 'Kottayam', 'Pathanamthitta'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded'],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul', 'Senapati', 'Tamenglong', 'Chandel', 'Jiribam', 'Kakching'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Nongpoh', 'Williamnagar', 'Baghmara', 'Resubelpara', 'Mairang', 'Mawkyrwat'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Lawngtlai', 'Mamit', 'Saitual', 'Khawzawl'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Mon', 'Phek', 'Zunheboto', 'Longleng', 'Kiphire'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Mohali', 'Moga', 'Firozpur', 'Kapurthala'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Sikar', 'Sri Ganganagar'],
    'Sikkim': ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Singtam', 'Rangpo', 'Jorethang', 'Pelling', 'Lachung', 'Lachen'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Vellore', 'Erode', 'Tiruchirappalli', 'Thoothukkudi', 'Tiruppur', 'Dindigul'],
    'Telangana': ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Adilabad', 'Nalgonda', 'Mahbubnagar', 'Medak', 'Siddipet'],
    'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar', 'Belonia', 'Khowai', 'Ambassa', 'Sabroom', 'Teliamura', 'Kamalpur'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Mussoorie', 'Almora', 'Pithoragarh', 'Chamoli', 'Pauri', 'Tehri'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur']
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  // Prefill in edit mode
  useEffect(() => {
    async function prefill() {
      if (!id) return;
      try {
        const res = await axios.get(`/api/schools/${id}`);
        const s = res.data?.data;
        if (!s) return;
        setValue('name', s.name || '');
        setValue('email_id', s.email_id || '');
        setValue('contact', s.contact || '');
        setValue('state', s.state || '');
        setSelectedState(s.state || '');
        setValue('city', s.city || '');
        setValue('address', s.address || '');
        setValue('description', s.description || '');
      } catch (_e) {
        setMessage({ type: 'error', text: 'Failed to load school details for editing.' });
      }
    }
    prefill();
  }, [id, setValue]);

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setValue('city', ''); // Reset city when state changes
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setMessage(null);
      if (id) {
        await axios.put(`/api/schools/${id}`, {
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          contact: String(data.contact || ''),
          email_id: data.email_id,
          description: data.description || null,
        });
        setMessage({ type: 'success', text: 'School updated successfully!' });
      } else {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('address', data.address);
        formData.append('city', data.city);
        formData.append('state', data.state);
        formData.append('contact', data.contact);
        formData.append('email_id', data.email_id);
        if (data.description) {
          formData.append('description', data.description);
        }
        if (data.image && data.image[0]) {
          formData.append('image', data.image[0]);
        }
        await axios.post('/api/schools', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage({ type: 'success', text: 'School added successfully!' });
        reset();
        setSelectedState('');
      }
    } catch (err) {
      setMessage({ type: 'error', text: id ? 'Failed to update school. Please try again.' : 'Failed to add school. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>{id ? 'Edit School' : 'Add School'}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input
                className={styles.input}
                placeholder="ABC Public School"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className={styles.error}>{errors.name.message}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="contact@school.com"
                {...register('email_id', {
                  required: 'Email is required',
                  pattern: {
                    value: /[^\s@]+@[^\s@]+\.[^\s@]+/,
                    message: 'Enter a valid email',
                  },
                })}
              />
              {errors.email_id && <span className={styles.error}>{errors.email_id.message}</span>}
            </div>
          </div>


          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Contact</label>
              <input
                type="tel"
                className={styles.input}
                placeholder="9876543210"
                {...register('contact', {
                  required: 'Contact is required',
                  pattern: { value: /^\d{7,15}$/, message: 'Enter a valid number' },
                })}
              />
              {errors.contact && <span className={styles.error}>{errors.contact.message}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>State</label>
              <select
                className={styles.input}
                {...register('state', { required: 'State is required' })}
                onChange={handleStateChange}
                value={selectedState}
              >
                <option value="">Select State</option>
                {Object.keys(stateCityData).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && <span className={styles.error}>{errors.state.message}</span>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>City</label>
              <select
                className={styles.input}
                {...register('city', { required: 'City is required' })}
                disabled={!selectedState}
              >
                <option value="">{selectedState ? 'Select City' : 'Select State First'}</option>
                {selectedState && stateCityData[selectedState]?.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && <span className={styles.error}>{errors.city.message}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Address</label>
              <input
                className={styles.input}
                placeholder="123, Main Road"
                {...register('address', { required: 'Address is required' })}
              />
              {errors.address && <span className={styles.error}>{errors.address.message}</span>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.input}
                rows={4}
                placeholder="Briefly describe the school (optional)"
                {...register('description')}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Image</label>
              <div className={styles.fileInput}>
                <input type="file" accept="image/*" {...register('image')} />
                Choose Image
              </div>
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={submitting}>
            {submitting ? (id ? 'Saving...' : 'Submitting...') : (id ? 'Save Changes' : 'Add School')}
          </button>
          {message && (
            <p className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}




