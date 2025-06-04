// src/components/ui/Card.js
import React from 'react';
import './Card.css'; // Assuming Card.css is defined

function Card({ title, value, color }) {
  return (
    <div className={`card ${color}`}> {/* */}
      <h3>{title}</h3> {/* */}
      <p>{value}</p> {/* */}
    </div>
  );
}

export default Card;