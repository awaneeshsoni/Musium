'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const WritingSidebar = ({ onNewWriting, currentWritingId }) => {
  const [writings, setWritings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWritings = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/writings');
        if (!response.ok) {
          throw new Error('Failed to fetch writings');
        }
        const data = await response.json(); 
        setWritings(data);
      } catch (error) {
        console.error('Error fetching writings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWritings();
  }, []); 

  return (
    <div className=" p-4 ">
      <h2 className="text-lg font-semibold mb-4">Past Writings</h2>
      <button onClick={onNewWriting} className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 block">
        New Writing
      </button>
      {loading ? (
        <p>Loading writings...</p>
      ) : writings.length > 0 ? (
        <ul>
          {writings.map((writing) => (
            <li key={writing._id} className="mb-2">
              <Link
                href={`/editor/${writing._id}`}
                className={`block hover:bg-gray-100 p-2 rounded-md ${
                  currentWritingId === writing._id ? 'bg-gray-200' : ''
                }`}
              >
                {writing.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No past writings.</p>
      )}
    </div>
  );
};

export default WritingSidebar;