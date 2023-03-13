import React, { useState } from 'react';

const SpeechToText = () => {
  const [transcription, setTranscription] = useState('');

  // Copy and paste the rest of the JavaScript code from your example here

  return (
    <div className='container'>
      <h1>Speech to text Demo</h1>
      <button type='button' id='btn-transcribe' className='btn btn-primary btn-lg my-3'>
        Transcribe
      </button>
      <select id='cmb-lang' className='custom-select' style={{ width: '120px' }}>
        <option value='th-TH'>Thai</option>
        <option value='en-US'>English</option>
      </select>
      <span id='info'></span>
      <blockquote className='blockquote'>
        <div id='results'>
          <span className='final' id='final_span'></span>
          <span className='interim' id='interim_span'></span>
        </div>
      </blockquote>
      <input
        type='text'
        value={transcription}
        onChange={(e) => setTranscription(e.target.value)}
        placeholder='Speak into your microphone...'
      />
    </div>
  );
};

export default SpeechToText;
