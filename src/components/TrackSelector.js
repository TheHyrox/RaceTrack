import React from 'react';

const TrackSelector = ({ tracks, onTrackSelect }) => {
  const handleChange = (event) => {
    onTrackSelect(event.target.value);
  };

  return (
    <select id="track-select" onChange={handleChange}>
      <option value="">Select a track...</option>
      {Object.entries(tracks).map(([category, trackList]) =>
        trackList.map((track) => (
          <option key={`${category}-${track.id}`} value={`${category}-${track.id}`}>
            {track.name}
          </option>
        ))
      )}
    </select>
  );
};

export default TrackSelector;