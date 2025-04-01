const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const notesFilePath = path.join(__dirname, '../notes.json');

function readNotesFromFile() {
  return fs.existsSync(notesFilePath)
    ? JSON.parse(fs.readFileSync(notesFilePath, 'utf-8'))
    : [];
}

function writeNotesToFile(notes) {
  fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
}

router.get('/', (req, res) => {
  const searchQuery = req.query.search || ''; 
  const message = req.query.message || '';
  const notes = readNotesFromFile();

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  res.render('index', {
    title: 'Notes App',
    notes: filteredNotes,
    searchQuery,
    message,
    currentDate: new Date().toLocaleDateString(),
  });
});

router.get('/notes/new', (req, res) => {
  res.render('new-note', { title: 'Create a New Note', currentDate: new Date().toLocaleString() });
});

router.post('/notes', (req, res) => {
  const { title, body, color, starred } = req.body;
  const notes = readNotesFromFile();

  const nextId = notes.length > 0 ? Math.max(...notes.map((note) => parseInt(note.id))) + 1 : 1;

  const newNote = {
    id: nextId.toString(),
    title: title.trim(),
    body: body.trim(),
    color,
    starred: !!starred,
    createdAt: new Date().toLocaleString(), 
    updatedAt: new Date().toLocaleString(),
  };

  notes.push(newNote);
  writeNotesToFile(notes);
  res.status(201).send('Note created successfully.');
});

router.get('/notes/:id/edit', (req, res) => {
  const noteId = req.params.id;
  const notes = readNotesFromFile();
  const note = notes.find((n) => n.id.toString() === noteId);
  if (!note) {
    return res.redirect('/?message=Note not found.');
  }

  res.render('edit-note', {
    title: 'Edit Note',
    note,
  });
});

router.post('/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const { title, body, color, starred } = req.body;
  const notes = readNotesFromFile();
  const noteIndex = notes.findIndex((n) => n.id.toString() === noteId);

  if (noteIndex === -1) {
    return res.redirect('/?message=Note not found.');
  }

  notes[noteIndex] = {
    ...notes[noteIndex],
    title: title.trim(),
    body: body.trim(),
    color,
    starred: starred === 'on',
    updatedAt: new Date().toLocaleString(),
  };

  writeNotesToFile(notes);
  res.redirect('/?message=Note updated successfully.');
});

router.delete('/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const notes = readNotesFromFile();
  const noteIndex = notes.findIndex((n) => n.id.toString() === noteId);

  if (noteIndex === -1) {
    return res.status(404).send('Note not found.');
  }

  if (notes[noteIndex].starred) {
    return res.status(403).send('Starred notes cannot be deleted.');
  }

  const filteredNotes = notes.filter((n) => n.id.toString() !== noteId);
  writeNotesToFile(filteredNotes);
  res.status(200).send('Note deleted successfully.');
});

router.post('/notes/:id/star', (req, res) => {
  const noteId = req.params.id; 
  const notes = readNotesFromFile();
  const noteIndex = notes.findIndex((n) => n.id.toString() === noteId); 

  if (noteIndex === -1) {
    return res.redirect('/?message=Note not found.');
  }

  notes[noteIndex].starred = !notes[noteIndex].starred;
  notes[noteIndex].updatedAt = new Date().toLocaleString();

  writeNotesToFile(notes);
  res.redirect('/?message=Star status toggled successfully.');
});

module.exports = router;