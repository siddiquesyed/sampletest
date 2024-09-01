const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User'); // Import the User model
const MainModel = require('./models/Request'); // Import the User model
const Bill = require('./models/bill');
const app = express();


// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://siddusyed99:tile%40123456@tilecluster.v7i64.mongodb.net/Tails?retryWrites=true&w=majority').then(() => {
  console.log('Connected to MongoDB!');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Route to handle user registration
app.post('/submit-form', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Check if the email or mobile number already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      if (existingUser.email === email && existingUser.mobile === mobile) {
        return res.status(400).json({ error: { email: "Email already registered", mobile: "Mobile number already registered" } });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({ error: 'Mobile number already registered' });
      }
    }
    const newUser = new User({ name, email, password, mobile });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!', user: newUser });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
});
app.get("/", (req, res) => {
  res.send("hello")
})
// Route to handle user login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });




    // Check if the email exists
    if (!user) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Check if the provided password matches the stored password
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // If the credentials are correct
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});
app.post('/request-status', async (req, res) => {
  try {

    let email = req.body.email
    const user = await User.findOne({ email });


    if (user) {
      const newDocument = new MainModel({
        name: user.name,
        email: email,
        mobile: user.mobile,
        data: req.body.item,
        status: req.body.status,
        totalItems: req.body.totalItems,
        totalPrice: req.body.totalPrice,
        timestamp: req.body.timestamp
      });

      // Save the document to MongoDB
      await newDocument.save();

      res.status(200).json({ message: 'Document saved successfully' });
    }
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'An error occurred during the request.' });
  }

});
app.get('/bill-req', async (req, res) => {
  try {

    const users = await MainModel.find();

    if (users) {
      res.status(200).json(users);
    }
    else {
      res.status(401).json({ message: 'No requests found in customer bills.' })
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'An error occurred during the request.' });
  }
})
app.post('/bill-req', async (req, res) => {
  let { name,email,mobile, data,status,totalItems,totalPrice,timestamp } = req.body
  try {

    const request =  new MainModel({name,email,mobile, data,status,totalItems,totalPrice,timestamp });
    let result = await request.save();
    res.status(201).json(result._id);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'An error occurred while requesting.' });
  }
})
app.put('/confirm', async (req, res) => {
  console.log(req.body);

  const { email, status, timestamp } = req.body;

  try {
    // Find the resource by email and timestamp, and update status if found
    const result = await MainModel.findOneAndUpdate(
      { email, timestamp }, // Query by both email and timestamp
      { status }, // Update the status field
      { new: true } // Return the updated document
    );

    if (result) {
      // Return the updated document if successfully updated
      res.status(200).json(result);
    } else {
      // Return error if no matching document is found
      res.status(404).json({ error: 'Resource not found or timestamp mismatch' });
    }
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && (String(new mongoose.Types.ObjectId(id)) === id);

app.get('/bill-req/:id', async (req, res) => {
  try {
    let billId = req.params.id.trim(); // Trim any extra whitespace or newline characters

    if (!isValidObjectId(billId)) {
      return res.status(400).json({ message: 'Invalid ObjectId format' });
    }

    const bill = await MainModel.findById(billId).exec();

    if (bill) {
      res.json(bill);
    } else {
      res.status(404).json({ message: 'Bill not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/bills', async (req, res) => {
  try {
    const {
      billno, name, email, mobile, cart, date, time, totalprice, totalitems
    } = req.body;

    // Create and save a new bill
    const bill = new Bill({
      billno, name, email, mobile, cart, date, time, totalprice, totalitems
    });
    await bill.save();

    res.status(201).json({ message: "Bill is saves Successfully..." }); // Respond with the created bill
  } catch (error) {
    console.error('Error storing bill:', error);
    res.status(500).json({ message: 'Failed to store bill', error: error.message });
  }
});

app.get('/bills/:id', async (req, res) => {
  try {
    let timestamp = req.params.id; // Trim any extra whitespace or newline characters
    console.log(`Timestamp: ${timestamp}`);
    
    // Query the database
    const bill = await Bill.find({date:timestamp }); // Use findOne to get a single document
    console.log(`Bill: ${bill}`);
    
    if (bill) {
      res.json(bill);
    } else {
      res.status(404).json({ message: 'Bill not found' });
    }
  } catch (error) {
    console.error(`Server error: ${error.message}`); // Log the error to the server console
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/change-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
      // Find user by email
      const user = await User.findOne({ email: email });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Check if current password matches
      if (user.password !== currentPassword) {
          return res.status(400).json({ error: 'Incorrect current password' });
      }

      // Update user password
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
});
let company= require('./models/company') 
app.post('/company-login', async (req, res) => {
  try {
    console.log(req.body)
    const { email, password } = req.body;
    console.log('email',email)
    // Find the user by email
    const admin = await company.find({ email: email }, { password: 1 });
    console.log(admin)

    // Check if the email exists
    if (admin.length === 0) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Check if the provided password matches the stored password
    if (admin[0].password !== req.body.password) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // If the credentials are correct
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error:', err); // Log error for debugging
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});
app.listen(4000, () => {
  console.log(`Server is running on http://localhost:4000`);
});


