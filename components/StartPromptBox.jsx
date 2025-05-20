import React, { useState } from 'react';

const StartPromptBox = ({ onStartWithAI, onStartBlank }) => {
    const [prompt, setPrompt] = useState('');

    const handleAIPrompt = () => {
        if (prompt.trim() !== '') {
            onStartWithAI(prompt);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">Ready to write?</h2>
            <div className="flex items-center justify-center flex-row flex-wrap space-y-2">
                <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                    placeholder="Prompt AI to start a story..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                    <div className='flex flex-row flex-wrap justify-center'>

                        <button
                            className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                            onClick={handleAIPrompt}
                        >
                            Start with AI Prompt
                        </button>
                        <button
                            className="mt-2 md:mt-0 bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 ml-2"
                            onClick={onStartBlank}
                        >
                            Start Blank Page
                        </button>
                    </div>
            </div>
        </div>
    );
};

export default StartPromptBox;