const MAX_NOTES = 20;
const STORAGE_KEY = 'notes_app_data';

// DOM Elements
const addHeader = document.getElementById('add-header');
const form = document.getElementById('note-form');
const titleInput = document.getElementById('note-title');
const contentInput = document.getElementById('note-content');
const tagsInput = document.getElementById('note-tags');
const cancelBtn = document.getElementById('cancel-btn');
const submitBtn = document.getElementById('submit-btn');
const notesContainer = document.getElementById('notes-container');
const searchInput = document.getElementById('search');
const tagFilter = document.getElementById('tag-filter');
const messageEl = document.getElementById('message');

let notes = [];
let editingId = null;
let activeTag = null;

// Load from localStorage
function loadNotes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  notes = stored ? JSON.parse(stored) : [];
}

// Save to localStorage
function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// Show message
function showMessage(text) {
  messageEl.textContent = text;
  messageEl.classList.add('show');
  setTimeout(() => messageEl.classList.remove('show'), 3000);
}

// Parse tags
function parseTags(tagString) {
  return tagString
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);
}

// Get all unique tags
function getAllTags() {
  const tags = new Set();
  notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}

// Format date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Render tag filter
function renderTagFilter() {
  const tags = getAllTags();
  if (!tags.length) {
    tagFilter.innerHTML = '';
    return;
  }

  tagFilter.innerHTML = `
    <span class="${activeTag === null ? 'active' : ''}" data-tag="">All</span>
    ${tags.map(tag => `<span class="${activeTag === tag ? 'active' : ''}" data-tag="${tag}">${escapeHtml(tag)}</span>`).join('')}
  `;
}

// Event delegation for tag clicks
tagFilter.addEventListener('click', function(e) {
  if (e.target.tagName === 'SPAN') {
    const tag = e.target.getAttribute('data-tag');
    activeTag = tag === '' ? null : tag;
    renderTagFilter();
    renderNotes();
  }
});

// Render notes
function renderNotes() {
  let filtered = notes;

  // Search filter
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
    );
  }

  // Tag filter
  if (activeTag) {
    filtered = filtered.filter(note => note.tags.includes(activeTag));
  }

  // Sort by newest first
  filtered.sort((a, b) => b.createdAt - a.createdAt);

  // Render notes
  if (filtered.length) {
    notesContainer.innerHTML = filtered.map(note => createNoteCard(note)).join('');
  } else {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <p>No notes yet. Click "Take a note..." to create one!</p>
      </div>
    `;
  }
}

// Create note card HTML
function createNoteCard(note) {
  return `
    <div class="note-card">
      <div class="note-title">${escapeHtml(note.title)}</div>
      <div class="note-content">${escapeHtml(note.content)}</div>
      ${note.tags.length ? `
        <div class="note-tags">
          ${note.tags.map(tag => `<span class="note-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
      <div class="note-footer">
        <span class="note-date">${formatDate(note.createdAt)}</span>
        <div class="note-actions">
          <button class="edit" onclick="editNote(${note.id})">Edit</button>
          <button class="delete" onclick="deleteNote(${note.id})">Delete</button>
        </div>
      </div>
    </div>
  `;
}

// Open form
function openForm() {
  addHeader.style.display = 'none';
  form.classList.add('active');
  titleInput.focus();
}

// Close form
function closeForm() {
  addHeader.style.display = 'block';
  form.classList.remove('active');
  form.reset();
  editingId = null;
  submitBtn.textContent = 'Save';
}

// Edit note
window.editNote = function(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  editingId = id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  tagsInput.value = note.tags.join(', ');

  openForm();
  submitBtn.textContent = 'Update';
};

// Delete note
window.deleteNote = function(id) {
  if (!confirm('Delete this note?')) return;

  notes = notes.filter(n => n.id !== id);
  saveNotes();
  renderNotes();
  renderTagFilter();
  showMessage('Note deleted');
};

// Form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const tags = parseTags(tagsInput.value);

  if (!title) {
    showMessage('Please enter a title');
    return;
  }

  if (!content) {
    showMessage('Please enter note content');
    return;
  }

  if (editingId) {
    // Update
    const index = notes.findIndex(n => n.id === editingId);
    if (index !== -1) {
      notes[index] = { ...notes[index], title, content, tags };
      showMessage('Note updated');
    }
    editingId = null;
    submitBtn.textContent = 'Save';
  } else {
    // Check limit
    if (notes.length >= MAX_NOTES) {
      showMessage(`Maximum ${MAX_NOTES} notes allowed. Delete some to add more.`);
      return;
    }

    // Add new
    notes.push({
      id: Date.now(),
      title,
      content,
      tags,
      createdAt: Date.now()
    });
    showMessage('Note saved');
  }

  saveNotes();
  closeForm();
  renderNotes();
  renderTagFilter();
});

// Cancel button
cancelBtn.addEventListener('click', closeForm);

// Click header to open form
addHeader.addEventListener('click', openForm);

// Search
searchInput.addEventListener('input', renderNotes);

// Init
loadNotes();
renderNotes();
renderTagFilter();
