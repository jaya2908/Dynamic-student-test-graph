import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { saveAs } from "file-saver";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// FileUpload Component
const FileUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload(response.data); // Pass uploaded data to parent component
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

// StudentGraph Component
const StudentGraph = ({ student }) => {
  const data = {
    labels: student.tests.map((_, index) => `Test ${index + 1}`),
    datasets: [
      {
        label: "Test Scores",
        data: student.tests,
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      y: { beginAtZero: true },
    },
  };

  const handleExport = () => {
    const canvas = document.getElementById(`chart-${student.id}`);
    canvas.toBlob((blob) => {
      saveAs(blob, `${student.name}_${student.id}.png`);
    });
  };

  return (
    <div>
      <h3>{student.name} (ID: {student.id})</h3>
      <Line id={`chart-${student.id}`} data={data} options={options} />
      <button onClick={handleExport}>Export as Image</button>
    </div>
  );
};

// SearchBar Component
const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or ID"
        value={query}
        onChange={handleSearch}
      />
    </div>
  );
};

// Main App Component
const App = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const handleUpload = (data) => {
    setStudents(data);
    setFilteredStudents(data);
  };

  const handleSearch = (query) => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.id.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  return (
    <div>
      <h1>Dynamic Student Test Graphs</h1>
      <FileUpload onUpload={handleUpload} />
      <SearchBar onSearch={handleSearch} />
      {filteredStudents.map((student) => (
        <StudentGraph key={student.id} student={student} />
      ))}
    </div>
  );
};

export default App;
