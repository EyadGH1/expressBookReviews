const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username, password) => {
    // Look for a user that matches BOTH username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers; // Returns an array of matches
}

const authenticatedUser = (username, password) => {
    let validusers = isValid(username, password);
    // If the array has at least one match, the user is authenticated
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
 const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Extract review from query string
  const username = req.session.authorization['username']; // Extract username from session

  if (!review) {
    return res.status(400).json({ message: "Review content is missing" });
  }

  // Check if the book exists in our database
  if (books[isbn]) {
    let book = books[isbn];
    
    // Add or Update the review for the specific user
    // Format: reviews: { "user1": "great book", "user2": "not bad" }
    book.reviews[username] = review;

    return res.status(200).json({ 
      message: `The review for book with ISBN ${isbn} has been added/updated.`,
      reviews: book.reviews 
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username']; // Extract username from session
  // Check if the book exists in our database
  if (books[isbn]) {
    let book = books[isbn];
    // Check if the user has a review to delete
    if (book.reviews[username]) {
      delete book.reviews[username]; // Delete the user's review
      return res.status(200).json({ 
        message: `The review for book with ISBN ${isbn} has been deleted.`,
        reviews: book.reviews 
      });
    } else {
      return res.status(404).json({ message: "Review by this user not found" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
