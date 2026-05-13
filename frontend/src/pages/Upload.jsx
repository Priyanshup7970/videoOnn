import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiFilm, FiImage } from 'react-icons/fi';
import { publishVideo } from '../services/api';

export const Upload = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const thumbRef = useRef(null);

  const [form, setForm] = useState({ title: '', description: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleThumbnailChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnail(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) { setError('Please select a video file.'); return; }
    if (!thumbnail) { setError('Please select a thumbnail.'); return; }

    setUploading(true);
    setError('');
    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('videoFile', videoFile);
    data.append('thumbnail', thumbnail);

    try {
      await publishVideo(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <FiUpload className="text-purple-500" /> Upload Video
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError('')}><FiX size={16} /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Video drop zone */}
        <div
          onClick={() => videoRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all ${
            videoFile ? 'border-purple-500 bg-purple-500/5' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900'
          }`}
        >
          <input type="file" accept="video/*" ref={videoRef} className="hidden"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
          <FiFilm size={36} className={videoFile ? 'text-purple-400' : 'text-zinc-500'} />
          {videoFile ? (
            <div className="text-center">
              <p className="text-white font-medium">{videoFile.name}</p>
              <p className="text-zinc-500 text-sm">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-zinc-300 font-medium">Click to select a video</p>
              <p className="text-zinc-500 text-sm mt-1">MP4, MOV, AVI up to 1GB</p>
            </div>
          )}
        </div>

        {/* Thumbnail */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">Thumbnail</label>
          <div className="flex gap-4 items-start">
            <div
              onClick={() => thumbRef.current?.click()}
              className={`w-48 aspect-video rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                thumbnail ? 'border-purple-500' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900'
              }`}
            >
              <input type="file" accept="image/*" ref={thumbRef} className="hidden"
                onChange={handleThumbnailChange} />
              {thumbPreview ? (
                <img src={thumbPreview} alt="thumbnail" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-500">
                  <FiImage size={24} />
                  <span className="text-xs">Click to upload</span>
                </div>
              )}
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed mt-2">
              Upload a thumbnail that accurately represents your video.<br />
              Recommended: 1280×720 (16:9).
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title <span className="text-red-400">*</span></label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="Enter a descriptive title..."
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="Tell viewers about your video..."
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        <button type="submit" disabled={uploading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2">
          <FiUpload size={18} />
          {uploading ? 'Uploading...' : 'Publish Video'}
        </button>
      </form>
    </div>
  );
};
