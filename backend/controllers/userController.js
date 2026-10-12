import mongoose from 'mongoose';
import User from '../models/User.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

function validateInput(body) {
  const { name, email, age } = body;
  if (typeof name !== 'string' || !name.trim()) return 'Name is required';
  if (typeof email !== 'string' || !email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please provide a valid email';
  if (age === undefined || age === null || age === '') return 'Age is required';
  const parsedAge = Number(age);
  if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
    return 'Age must be a whole number between 1 and 120';
  }
  return null;
}

function handleDatabaseError(error, res) {
  if (error.code === 11000) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
}

export async function createUser(req, res) {
  try {
    const validationError = validateInput(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const user = await User.create({
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      age: Number(req.body.age)
    });
    return res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
}

export async function getUsers(_req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
}

export async function getUserById(req, res) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ user });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
}

export async function updateUser(req, res) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID' });
    const validationError = validateInput(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name.trim(),
        email: req.body.email.trim().toLowerCase(),
        age: Number(req.body.age)
      },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
}

export async function deleteUser(req, res) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
}
