import React from 'react';

const CustomNode = ({ data, id, deleteNode }) => {
  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el nodo "${data.label}"?`)) {
      deleteNode(id);
    }
  };

  return (
    <div style={{ position: 'relative', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#fff' }}>
      {/* Contenido del nodo */}
      <div>
        <strong>{data.label}</strong>
        {data.attributes && data.attributes.length > 0 && (
          <ul style={{ padding: '0', margin: '10px 0', listStyleType: 'none' }}>
            {data.attributes.map((attr, index) => (
              <li key={index}>{attr.name}: {attr.type}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CustomNode;
