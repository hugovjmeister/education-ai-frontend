// src/App.js
import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import axios from 'axios';

const nodeTypes = {
  custom: CustomNode,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newNode, setNewNode] = useState({ label: '', attributes: [] });
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [editNodeData, setEditNodeData] = useState({ label: '', attributes: [] });

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // Obtener nodos del backend al cargar el componente
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/nodes/");
        const fetchedNodes = response.data.map((node) => ({
          id: node.id.toString(),
          position: { x: Math.random() * 400, y: Math.random() * 400 }, // Ajusta la posición
          type: "custom",
          data: {
            label: node.label,
            attributes: node.attributes, // Aquí deben estar los atributos
          },
        }));
        setNodes(fetchedNodes);
      } catch (error) {
        console.error("Error al obtener nodos:", error.message);
      }
    };
    fetchNodes();
  }, [setNodes]);

  // Manejar cambios en los inputs de creación de nodos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNode((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en los atributos del nodo nuevo
  const handleAttributeChange = (e, index) => {
    const { name, value } = e.target;
    setNewNode((prev) => {
      const attributes = [...prev.attributes];
      attributes[index] = { ...attributes[index], [name]: value };
      return { ...prev, attributes };
    });
  };

  // Agregar un nuevo atributo al nodo en creación
  const addAttribute = () => {
    setNewNode((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { label: '', type: 'Texto' }],
    }));
  };

  // Agregar un nuevo nodo al flujo y al backend
  const addNode = async () => {
    try {
      const response = await axios.post('/api/nodes/', newNode); // Ajusta la URL según tu configuración
      const createdNode = response.data;
      setNodes((nds) => [
        ...nds,
        {
          id: createdNode.id.toString(),
          position: { x: Math.random() * 400, y: Math.random() * 400 },
          type: 'custom',
          data: {
            label: createdNode.label,
            attributes: createdNode.attributes,
          },
        },
      ]);
      setIsAddingNode(false);
      setNewNode({ label: '', attributes: [] });
    } catch (error) {
      console.error('Error al agregar nodo:', error);
    }
  };

  // Eliminar un nodo del flujo y del backend
  const deleteNode = async (id) => {
    try {
      await axios.delete(`/api/nodes/${id}`); // Ajusta la URL según tu configuración
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    } catch (error) {
      console.error('Error al eliminar nodo:', error);
    }
  };

  // Manejar doble clic para editar nodo
  const handleNodeDoubleClick = (event, node) => {
    console.log("Nodo seleccionado:", node); // Verifica los datos del nodo
    setEditNodeData({
      label: node.data.label,
      attributes: [...node.data.attributes], // Copia los atributos
    });
    setSelectedNode(node);
    setIsEditingNode(true);
  };

  const handleNodeClick = (event, node) => {
    console.log("Nodo seleccionado:", node.data); // Para depuración
    alert(
      `Nombre del nodo: ${node.data.label}\nAtributos:\n` +
        node.data.attributes.map(attr => `- ${attr.name}: ${attr.type}`).join("\n")
    );
  };

  // Manejar cambios en los inputs de edición de nodos
  const handleEditInputChange = (e, index) => {
    const { name, value } = e.target;
    setEditNodeData((prev) => {
      const updatedAttributes = [...prev.attributes];
      updatedAttributes[index] = {
        ...updatedAttributes[index],
        [name]: value, // Actualiza el campo correcto (name o type)
      };
      return { ...prev, attributes: updatedAttributes };
    });
  };

  // Agregar un nuevo atributo al nodo en edición
  const addEditAttribute = () => {
    setEditNodeData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { label: '', type: 'Texto' }],
    }));
  };

  // Guardar los cambios del nodo editado en el backend y el flujo
  const saveEditNode = async () => {
    try {
      console.log("Guardando nodo editado:", editNodeData);
  
      // Realiza la solicitud PUT al backend
      await axios.put(`http://127.0.0.1:8000/nodes/${selectedNode.id}`, editNodeData);
  
      // Actualiza el estado de los nodos en el frontend
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  label: editNodeData.label,
                  attributes: [...editNodeData.attributes], // Asegura la copia correcta
                },
              }
            : node
        )
      );
  
      // Cierra el modal de edición
      setIsEditingNode(false);
      setSelectedNode(null);
    } catch (error) {
      console.error("Error al guardar nodo editado:", error.message);
      alert("No se pudo guardar el nodo. Intenta nuevamente.");
    }
  };

  return (
    <div style={{ width: '97vw', height: '48vw', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        onNodeDoubleClick={handleNodeDoubleClick}
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.data.type) {
              case 'Texto':
                return 'lightblue';
              case 'Numero':
                return 'green';
              case 'Fecha':
                return 'orange';
              case 'Booleano':
                return 'purple';
              default:
                return '#eee';
            }
          }}
        />
        <Background variant="dots" gap={16} size={0.5} />
      </ReactFlow>

      {/* Botón para agregar nodo */}
      <button
        onClick={() => setIsAddingNode(true)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          padding: '10px 15px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Agregar Nodo
      </button>

      {/* Modal para configurar nuevo nodo */}
      {isAddingNode && (
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            background: 'white',
            padding: '20px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: 10,
            borderRadius: '8px',
            width: '300px',
          }}
        >
          <h4>Nuevo Nodo</h4>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Nombre del Nodo:
            <input
              type="text"
              name="label"
              value={newNode.label}
              onChange={handleInputChange}
              style={{ marginLeft: '10px', width: '80%' }}
            />
          </label>
          <h5>Atributos</h5>
          {newNode.attributes.map((attr, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <input
                type="text"
                name="name"
                value={attr.label}
                placeholder="Nombre del Atributo"
                onChange={(e) => handleAttributeChange(e, index)}
                style={{ marginRight: '10px', width: '40%' }}
              />
              <select
                name="type"
                value={attr.type}
                onChange={(e) => handleAttributeChange(e, index)}
                style={{ width: '50%' }}
              >
                <option value="Texto">Texto</option>
                <option value="Numero">Número</option>
                <option value="Fecha">Fecha</option>
                <option value="Booleano">Booleano</option>
              </select>
            </div>
          ))}
          <button onClick={addAttribute} style={{ marginTop: '10px', marginRight: '10px' }}>
            Agregar Atributo
          </button>
          <br />
          <button onClick={addNode} style={{ marginTop: '10px', marginRight: '10px' }}>
            Guardar
          </button>
          <button onClick={() => setIsAddingNode(false)} style={{ marginTop: '10px' }}>
            Cancelar
          </button>
        </div>
      )}

      {/* Modal para editar nodo */}
      {isEditingNode && (
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            background: 'white',
            padding: '20px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: 10,
            borderRadius: '8px',
            width: '300px',
          }}
        >
          <h4>Editar Nodo</h4>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Nombre del Nodo:
            <input
              type="text"
              name="label"
              value={editNodeData.label}
              onChange={(e) => setEditNodeData((prev) => ({ ...prev, label: e.target.value }))}
              style={{ marginLeft: '10px', width: '80%' }}
            />
          </label>
          <h5>Atributos</h5>
          {editNodeData.attributes && editNodeData.attributes.length > 0 ? (
            editNodeData.attributes.map((attr, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <input
                  type="text"
                  name="name"
                  value={attr.name}
                  placeholder="Nombre del Atributo"
                  onChange={(e) => handleEditInputChange(e, index)}
                  style={{ marginRight: "10px", width: "40%" }}
                />
                <select
                  name="type"
                  value={attr.type}
                  onChange={(e) => handleEditInputChange(e, index)}
                  style={{ width: "50%" }}
                >
                  <option value="Texto">Texto</option>
                  <option value="Numero">Número</option>
                  <option value="Fecha">Fecha</option>
                  <option value="Booleano">Booleano</option>
                </select>
              </div>
            ))
          ) : (
            <p>No hay atributos para editar</p>
          )}
          <button onClick={addEditAttribute} style={{ marginTop: '10px', marginRight: '10px' }}>
            Agregar Atributo
          </button>
          <br />
          <button onClick={saveEditNode} style={{ marginTop: '10px', marginRight: '10px' }}>
            Guardar
          </button>
          <button onClick={() => setIsEditingNode(false)} style={{ marginTop: '10px' }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
