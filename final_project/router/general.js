const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => user.username === username);
    return userswithsamename.length > 0;
}

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(409).json({ message: "User already exists!" });
        }
    }
    return res.status(400).json({ message: "Unable to register user. Provide username and password." });
});

// Task 10: Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
    try {
        // Fix: Use capitalized 'Promise'
        const allBooks = await Promise.resolve(books);
        res.status(200).json(allBooks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books" });
    }
});

// Task 11: Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await Promise.resolve(books[isbn]);
        // Fix: Send response if book exists, error if it doesn't
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Task 12: Get book details based on author using async/await
public_users.get('/author/:author', async (req, res) => {
    const authorName = req.params.author;
    try {
        const allBooks = Object.values(books);
        const filteredBooks = await Promise.resolve(allBooks.filter(book => book.author === authorName));

        if (filteredBooks.length > 0) {
            res.status(200).json(filteredBooks);
        } else {
            res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error searching by author" });
    }
});

// Task 13: Get all books based on title using async/await
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const allBooks = Object.values(books);
        const filteredBooks = await Promise.resolve(allBooks.filter(book => book.title === title));

        if (filteredBooks.length > 0) {
            res.status(200).json(filteredBooks);
        } else {
            res.status(404).json({ message: "No books found for this title" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error searching by title" });
    }
});

// Get book review (Bonus)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;