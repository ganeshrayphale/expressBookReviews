const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const BASE = "http://localhost:5000";

// Task 7: register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });
  if (users.some(u => u.username === username))
    return res.status(409).json({ message: "User already exists" });
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 2: all books
public_users.get('/', (req, res) => {
  res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 3: by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book)
              : res.status(404).json({ message: "Book not found" });
});

// Task 4: by author
public_users.get('/author/:author', (req, res) => {
  const result = Object.entries(books)
    .filter(([_, b]) => b.author.toLowerCase() === req.params.author.toLowerCase())
    .map(([isbn, b]) => ({ isbn, ...b }));
  return res.status(200).json({ booksbyauthor: result });
});

// Task 5: by title
public_users.get('/title/:title', (req, res) => {
  const result = Object.entries(books)
    .filter(([_, b]) => b.title.toLowerCase() === req.params.title.toLowerCase())
    .map(([isbn, b]) => ({ isbn, ...b }));
  return res.status(200).json({ booksbytitle: result });
});

// Task 6: reviews
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book.reviews)
              : res.status(404).json({ message: "Book not found" });
});

// ---- Axios clients (async/await and promise callbacks) ----
const getAllBooks = async () => {
  try { return (await axios.get(`${BASE}/`)).data; }
  catch (e) { console.error(e.message); }
};
const getBookByISBN = (isbn) =>
  axios.get(`${BASE}/isbn/${isbn}`)
    .then(r => r.data)
    .catch(e => console.error(e.message));
const getBooksByAuthor = async (author) => {
  try { return (await axios.get(`${BASE}/author/${encodeURIComponent(author)}`)).data; }
  catch (e) { console.error(e.message); }
};
const getBooksByTitle = async (title) => {
  try { return (await axios.get(`${BASE}/title/${encodeURIComponent(title)}`)).data; }
  catch (e) { console.error(e.message); }
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;