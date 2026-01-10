import React from 'react';
import './Input.css';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  wrapperClassName = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className={`ui-input-group ${wrapperClassName}`}>
      {label && <label htmlFor={inputId} className="ui-label">{label}</label>}
      <div className={`ui-input-wrapper ${error ? 'has-error' : ''}`}>
        {Icon && <Icon className="ui-input-icon" size={20} />}
        <input
          id={inputId}
          type={type}
          className={`ui-input ${Icon ? 'with-icon' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="ui-input-error">{error}</span>}
    </div>
  );
}
