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
const pinnedContainer = document.getElementById('pinned-container');
const pinnedSection = document.getElementById('pinned-section');
const searchInput = document.getElementById('search');
const tagFilter = document.getElementById('tag-filter');
const messageEl = document.getElementById('message');

let notes = [];
let editingId = null;
let activeTag = null;
let isFormOpen = false;

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

// Toggle pin
window.togglePin = function(id) {
  const note = notes.find(n => n.id === id);
  if (note) {
    note.pinned = !note.pinned;
    saveNotes();
    renderNotes();
  }
};

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

  tagFilter.querySelectorAll('span').forEach(el => {
    el.addEventListener('click', function() {
      const tag = this.getAttribute('data-tag');
      activeTag = tag === '' ? null : tag;
      renderTagFilter();
      renderNotes();
    });
  });
}

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

  // Separate pinned and unpinned
  const pinnedNotes = filtered.filter(n => n.pinned);
  const unpinnedNotes = filtered.filter(n => !n.pinned);

  // Sort: pinned first, then by newest
  const sortByDate = (a, b) => b.createdAt - a.createdAt;
  pinnedNotes.sort(sortByDate);
  unpinnedNotes.sort(sortByDate);

  // Render pinned
  if (pinnedNotes.length) {
    pinnedSection.style.display = 'block';
    pinnedContainer.innerHTML = pinnedNotes.map(note => createNoteCard(note)).join('');
  } else {
    pinnedSection.style.display = 'none';
  }

  // Render unpinned
  const othersLabel = document.getElementById('others-label');
  if (unpinnedNotes.length) {
    othersLabel.style.display = 'block';
    notesContainer.innerHTML = unpinnedNotes.map(note => createNoteCard(note)).join('');
  } else {
    othersLabel.style.display = 'none';
    if (!pinnedNotes.length) {
      notesContainer.innerHTML = `
        <div class="empty-state">
          <div class="icon">📝</div>
          <p>No notes yet. Click "Take a note..." to create one!</p>
        </div>
      `;
    }
  }
}

// Create note card HTML
function createNoteCard(note) {
  return `
    <div class="note-card ${note.pinned ? 'pinned' : ''}">
      <div class="pin-icon" onclick="togglePin(${note.id})" title="${note.pinned ? 'Unpin' : 'Pin'}">
        📌
      </div>
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
  isFormOpen = true;
  titleInput.focus();
}

// Close form
function closeForm() {
  addHeader.style.display = 'block';
  form.classList.remove('active');
  form.reset();
  isFormOpen = false;
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
      pinned: false,
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
