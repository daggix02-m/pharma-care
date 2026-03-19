import React from 'react';

export function PharmacyList({ pharmacies, selectedPharmacyId, onSelect }) {
  return (
    <div>
      <h3 className="text-md font-semibold mb-2">Pharmacies</h3>
      <ul>
        {pharmacies.map((pharmacy) => (
          <li
            key={pharmacy.id}
            className={`cursor-pointer p-2 rounded ${selectedPharmacyId === pharmacy.id ? 'bg-green-100' : ''}`}
            onClick={() => onSelect(pharmacy.id)}
          >
            {pharmacy.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
