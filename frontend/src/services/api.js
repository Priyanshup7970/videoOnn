import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await axios.post(`${API_BASE_URL}/users/refresh-token`, {}, { withCredentials: true });
        return api(error.config);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Videos ───────────────────────────────────────────────
export const getVideos = (params) => api.get('/videos', { params });
export const getVideoById = (videoId) => api.get(`/videos/${videoId}`);
export const publishVideo = (formData) =>
  api.post('/videos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateVideo = (videoId, formData) =>
  api.patch(`/videos/${videoId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteVideo = (videoId) => api.delete(`/videos/${videoId}`);
export const togglePublishStatus = (videoId) => api.patch(`/videos/toggle/publish/${videoId}`);

// ── Users ────────────────────────────────────────────────
export const getCurrentUser = () => api.get('/users/current-user');
export const getUserChannelProfile = (username) => api.get(`/users/c/${username}`);
export const getWatchHistory = () => api.get('/users/history');
export const updateAccountDetails = (data) => api.patch('/users/update-account', data);
export const updateAvatar = (formData) =>
  api.patch('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const changePassword = (data) => api.post('/users/change-password', data);
export const logout = () => api.post('/users/logout');

// ── Comments ─────────────────────────────────────────────
export const getVideoComments = (videoId, params) => api.get(`/comments/${videoId}`, { params });
export const addComment = (videoId, content) => api.post(`/comments/${videoId}`, { content });
export const deleteComment = (commentId) => api.delete(`/comments/c/${commentId}`);

// ── Likes ─────────────────────────────────────────────────
export const toggleVideoLike = (videoId) => api.post(`/likes/toggle/v/${videoId}`);
export const toggleCommentLike = (commentId) => api.post(`/likes/toggle/c/${commentId}`);
export const toggleTweetLike = (tweetId) => api.post(`/likes/toggle/t/${tweetId}`);
export const getLikedVideos = () => api.get('/likes/videos');

// ── Subscriptions ─────────────────────────────────────────
export const toggleSubscription = (channelId) => api.post(`/subscriptions/c/${channelId}`);
export const getSubscribedChannels = (subscriberId) => api.get(`/subscriptions/u/${subscriberId}`);
export const getChannelSubscribers = (channelId) => api.get(`/subscriptions/c/${channelId}`);

// ── Playlists ─────────────────────────────────────────────
export const createPlaylist = (data) => api.post('/playlists', data);
export const getUserPlaylists = (userId) => api.get(`/playlists/user/${userId}`);
export const getPlaylistById = (playlistId) => api.get(`/playlists/${playlistId}`);
export const addVideoToPlaylist = (videoId, playlistId) => api.patch(`/playlists/add/${videoId}/${playlistId}`);
export const removeVideoFromPlaylist = (videoId, playlistId) => api.patch(`/playlists/remove/${videoId}/${playlistId}`);
export const deletePlaylist = (playlistId) => api.delete(`/playlists/${playlistId}`);

// ── Tweets ────────────────────────────────────────────────
export const createTweet = (content) => api.post('/tweets', { content });
export const getUserTweets = (userId) => api.get(`/tweets/user/${userId}`);
export const updateTweet = (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content });
export const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`);

// ── Dashboard ─────────────────────────────────────────────
export const getChannelStats = () => api.get('/dashboard/stats');
export const getChannelVideos = () => api.get('/dashboard/videos');
