const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
 const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject("No books available");
        }
    });
  };
    const allBooks = await getBooks();
    res.status(200).json(allBooks);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async (req, res) => {
  const isbn = req.params.isbn;
  try { 
    const getBookByISBN = (isbn) => {
      return new Promise((resolve, reject) => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject("Book not found");
        }
      });
    }
    const book = await getBookByISBN(isbn);
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: error });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorName = req.params.author;
  
  // 1. Get all the book objects as an array
  const allBooks = Object.values(books);
  
  // 2. Filter books where the author matches the URL parameter
  const filteredBooks = allBooks.filter(book => book.author === authorName);

  if (filteredBooks.length > 0) {
    res.status(200).json(filteredBooks);
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const getBooksByTitle = new Promise((resolve, reject) => {
      const allBooks = Object.values(books);
      const filteredBooks = allBooks.filter(book => book.title === title);

      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found for this title");
      }
    });

    const results = await getBooksByTitle;
    res.status(200).json(results);

  } catch (error) {
    res.status(404).json({ message: error });
  }
});

module.exports.general = public_users;
