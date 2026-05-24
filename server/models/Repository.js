const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  githubUrl: { type: String, required: true },
  owner: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  language: { type: String, default: 'Unknown' },
  languages: { type: Object, default: {} },
  fileCount: { type: Number, default: 0 },
  size: { type: Number, default: 0 },
  topics: [{ type: String }],
  contributors: { type: Number, default: 0 },
  isAnalyzed: { type: Boolean, default: false },
  isIndexed: { type: Boolean, default: false },
  qualityScore: { type: Number, default: 0 },
  securityIssues: [{ type: String }],
  analyzedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Repository', repositorySchema);