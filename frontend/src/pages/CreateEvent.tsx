import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { communityId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: '',
    attendanceProvided: false,
    certificatesProvided: false,
    theme: '',
    description: ''
  });
  const [prizes, setPrizes] = useState<{ position: number; amount: number }[]>([]);
  const [registrationFields, setRegistrationFields] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const addPrize = () => {
    if (prizes.length < 3) {
      setPrizes([...prizes, { position: prizes.length + 1, amount: 0 }]);
    }
  };

  const removePrize = (index: number) => {
    const newPrizes = prizes.filter((_, i) => i !== index);
    // Reorder positions
    const reorderedPrizes = newPrizes.map((prize, i) => ({ ...prize, position: i + 1 }));
    setPrizes(reorderedPrizes);
  };

  const updatePrizeAmount = (index: number, amount: number) => {
    const newPrizes = [...prizes];
    newPrizes[index].amount = amount;
    setPrizes(newPrizes);
  };

  const addRegistrationField = () => {
    setRegistrationFields([...registrationFields, {
      fieldName: '',
      fieldType: 'text',
      isRequired: false,
      options: [],
      placeholder: ''
    }]);
  };

  const removeRegistrationField = (index: number) => {
    setRegistrationFields(registrationFields.filter((_, i) => i !== index));
  };

  const updateRegistrationField = (index: number, field: string, value: any) => {
    const newFields = [...registrationFields];
    newFields[index][field] = value;
    setRegistrationFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validation
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const deadline = new Date(formData.registrationDeadline);

      if (end <= start) {
        setError('End date must be after start date');
        return;
      }

      if (deadline >= start) {
        setError('Registration deadline must be before start date');
        return;
      }

      // Validate prizes
      for (let prize of prizes) {
        if (prize.amount <= 0) {
          setError('Prize amount must be greater than 0');
          return;
        }
      }

      const token = getToken();
      await axios.post(`${API_BASE_URL}/events`, {
        ...formData,
        prizes,
        registrationFields,
        communityId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Event created successfully!');
      navigate(`/community/${communityId}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create event');
    }
  };

  const themes = [
    'Artificial Intelligence',
    'Web Development',
    'Data Science',
    'Cybersecurity',
    'Mobile Development',
    'Cloud Computing',
    'Blockchain',
    'Machine Learning',
    'DevOps',
    'UI/UX Design',
    'Other'
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card-header">
        <h1>Create New Event</h1>
        <p>Fill in the details to create an event for your community</p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Basic Event Info */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Event Information</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., AI Workshop 2024"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Theme *
              </label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select a theme</option>
                {themes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Main Auditorium or https://zoom.us/..."
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="input-field"
                rows={4}
                placeholder="Event guidelines, agenda, and other important information..."
              />
            </div>
          </div>

          {/* Date & Time */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Date & Time</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Event Options</h3>
            
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="attendanceProvided"
                  checked={formData.attendanceProvided}
                  onChange={handleChange}
                />
                <span>Attendance Tracking</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="certificatesProvided"
                  checked={formData.certificatesProvided}
                  onChange={handleChange}
                />
                <span>Certificates Provided</span>
              </label>
            </div>
          </div>

          {/* Prize Money */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3>Prize Money (Optional)</h3>
              {prizes.length < 3 && (
                <button
                  type="button"
                  onClick={addPrize}
                  className="btn-secondary"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  Add Prize
                </button>
              )}
            </div>

            {prizes.map((prize, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '0.5rem'
              }}>
                <span style={{ minWidth: '60px', fontWeight: '500' }}>
                  {prize.position === 1 ? '1st' : prize.position === 2 ? '2nd' : '3rd'} Prize:
                </span>
                <input
                  type="number"
                  value={prize.amount}
                  onChange={(e) => updatePrizeAmount(index, Number(e.target.value))}
                  placeholder="Amount"
                  className="input-field"
                  style={{ flex: 1 }}
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => removePrize(index)}
                  className="btn-danger"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Registration Form Fields */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3>Registration Form Fields</h3>
              <button
                type="button"
                onClick={addRegistrationField}
                className="btn-secondary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                Add Field
              </button>
            </div>

            {registrationFields.map((field, index) => (
              <div key={index} style={{ 
                padding: '1rem',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Field Name</label>
                    <input
                      type="text"
                      value={field.fieldName}
                      onChange={(e) => updateRegistrationField(index, 'fieldName', e.target.value)}
                      className="input-field"
                      placeholder="e.g., Phone Number"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Field Type</label>
                    <select
                      value={field.fieldType}
                      onChange={(e) => updateRegistrationField(index, 'fieldType', e.target.value)}
                      className="input-field"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="select">Dropdown</option>
                      <option value="textarea">Textarea</option>
                      <option value="file">File Upload</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRegistrationField(index)}
                    className="btn-danger"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    Remove
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) => updateRegistrationField(index, 'placeholder', e.target.value)}
                      className="input-field"
                      placeholder="Enter placeholder text"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={(e) => updateRegistrationField(index, 'isRequired', e.target.checked)}
                    />
                    <span>Required Field</span>
                  </div>
                </div>

                {field.fieldType === 'select' && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Options (comma separated)</label>
                    <input
                      type="text"
                      value={field.options.join(', ')}
                      onChange={(e) => updateRegistrationField(index, 'options', e.target.value.split(', ').filter(opt => opt.trim()))}
                      className="input-field"
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate(`/community/${communityId}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;