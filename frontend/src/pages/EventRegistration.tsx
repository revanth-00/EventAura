import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EventRegistration: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<any>({});
  const [uploadedFiles, setUploadedFiles] = useState<any>({});

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(response.data);
      
      // Initialize form data with default values
      const initialData: any = {};
      response.data.registrationFields?.forEach((field: any) => {
        initialData[field.fieldName] = '';
      });
      setFormData(initialData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event:', error);
      setLoading(false);
    }
  };

  const validateStep = (step: number) => {
    const stepErrors: any = {};
    const requiredFields = event.registrationFields?.filter((field: any) => field.isRequired) || [];
    
    requiredFields.forEach((field: any) => {
      if (!formData[field.fieldName] || formData[field.fieldName].toString().trim() === '') {
        stepErrors[field.fieldName] = `${field.fieldName} is required`;
      }
    });
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setSubmitting(true);

    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/events/${eventId}/register`, 
        { registrationData: { ...formData, ...uploadedFiles } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Registration successful!');
      navigate(`/event/${eventId}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const { fieldName, fieldType, isRequired, options, placeholder } = field;
    
    switch (fieldType) {
      case 'select':
        return (
          <select
            value={formData[fieldName] || ''}
            onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
            className="input-field"
            required={isRequired}
          >
            <option value="">Select {fieldName}</option>
            {options?.map((option: string, index: number) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={formData[fieldName] || ''}
            onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
            className="input-field"
            placeholder={placeholder || fieldName}
            rows={4}
            required={isRequired}
          />
        );
      
      case 'file':
        return (
          <div>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedFiles({ ...uploadedFiles, [fieldName]: file.name });
                  setFormData({ ...formData, [fieldName]: file.name });
                }
              }}
              className="input-field"
              required={isRequired}
            />
            {uploadedFiles[fieldName] && (
              <p style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '0.25rem' }}>
                ✓ {uploadedFiles[fieldName]}
              </p>
            )}
          </div>
        );
      
      default:
        return (
          <input
            type={fieldType}
            value={formData[fieldName] || ''}
            onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
            className="input-field"
            placeholder={placeholder || fieldName}
            required={isRequired}
          />
        );
    }
  };

  if (loading) return <div className="loading">Loading registration form...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <button onClick={() => navigate(`/event/${eventId}`)} className="btn-secondary" style={{ marginBottom: '2rem' }}>
        ← Back to Event
      </button>

      <div className="card-header">
        <h1>Register for {event.name}</h1>
        <p>Please fill out the registration form below</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="card">
          {/* Progress Indicator */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Step {currentStep} of 2</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {currentStep === 1 ? 'Registration Details' : 'Review & Submit'}
              </span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
              <div style={{ 
                width: `${(currentStep / 2) * 100}%`, 
                height: '100%', 
                backgroundColor: '#3b82f6', 
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {currentStep === 1 ? (
            <div>
              <h3>Registration Details</h3>
              
              {event.registrationFields?.length > 0 ? (
                event.registrationFields.map((field: any, index: number) => (
                  <div key={index} className="form-group">
                    <label>
                      {field.fieldName}
                      {field.isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    {renderField(field)}
                    {errors[field.fieldName] && (
                      <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {errors[field.fieldName]}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="form-group">
                  <p>No additional information required for registration.</p>
                </div>
              )}

              <button 
                type="button"
                onClick={handleNext}
                className="btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Continue to Review
              </button>
            </div>
          ) : (
            <div>
              <h3>Review Your Registration</h3>
              
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                {event.registrationFields?.map((field: any, index: number) => (
                  <div key={index} style={{ marginBottom: '0.5rem' }}>
                    <strong>{field.fieldName}:</strong> {formData[field.fieldName] || 'Not provided'}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Back to Edit
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  {submitting ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Event Summary */}
        <div className="card">
          <h3>Event Summary</h3>
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Theme:</strong> {event.theme}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {new Date(event.startDate).toLocaleTimeString()}</p>
            <p><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
          </div>

          {event.prizes?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <strong>Prizes:</strong>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {event.prizes.map((prize: any, index: number) => (
                  <span key={index} className="badge badge-active">
                    {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'} ₹{prize.amount}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              <strong>Note:</strong> Please ensure all information is accurate before submitting your registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;